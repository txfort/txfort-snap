/**
 * Transaction Handler
 * Handles the onTransaction entry point for transaction insights
 */

import type { OnTransactionHandler } from '@metamask/snaps-sdk';
import { serializeTransaction, parseGwei } from 'viem';

import { analysisApi } from '../api/client';
import { getApiKey, updateLastUsed, isAuthenticated } from '../state/storage';
import { caip2ToChainName } from '../utils/chains';
import {
  buildInsightsPanel,
  buildErrorPanel,
  buildNotAuthPanel
} from '../ui/components';

/**
 * Encode transaction data to hex format for API
 * Uses viem for proper transaction serialization
 */
function encodeTransactionHex(transaction: Record<string, unknown>, caip2ChainId: string): string {
  // Get transaction fields
  const to = transaction.to as string | undefined;
  const value = transaction.value;
  const data = (transaction.data as string) || '0x';
  const gas = transaction.gas || transaction.gasLimit;
  const gasPrice = transaction.gasPrice;
  const maxFeePerGas = transaction.maxFeePerGas;
  const maxPriorityFeePerGas = transaction.maxPriorityFeePerGas;
  const nonce = transaction.nonce;
  const txChainId = transaction.chainId;

  // Parse chainId - prefer context chainId if transaction.chainId is missing or doesn't match
  let chainIdNum = 1;
  const contextChainIdPart = caip2ChainId.split(':').length > 1 ? caip2ChainId.split(':')[1] : '';

  if (txChainId !== undefined && txChainId !== null) {
    chainIdNum = Number(String(txChainId));
  } else if (contextChainIdPart) {
    const parsedContextId = Number(contextChainIdPart);
    if (!isNaN(parsedContextId)) {
      chainIdNum = parsedContextId;
    }
  }

  // Parse nonce
  const nonceNum = nonce !== undefined && nonce !== null
    ? Number(String(nonce))
    : 0;

  // Parse gas
  const gasLimit = gas !== undefined && gas !== null
    ? BigInt(String(gas))
    : BigInt(21000);

  // Parse value - handle both hex and decimal strings
  let valueBigInt: bigint;
  if (value === undefined || value === null || value === '') {
    valueBigInt = BigInt(0);
  } else if (typeof value === 'string') {
    if (value.startsWith('0x')) {
      valueBigInt = BigInt(value);
    } else {
      try {
        valueBigInt = BigInt(value);
      } catch {
        valueBigInt = BigInt(0);
      }
    }
  } else if (typeof value === 'number') {
    valueBigInt = BigInt(Math.round(value));
  } else {
    valueBigInt = BigInt(0);
  }

  // Determine transaction type
  const isEIP1559 = maxFeePerGas !== undefined && maxFeePerGas !== null;

  try {
    if (isEIP1559) {
      // EIP-1559 transaction
      const maxFeePerGasBigInt = maxFeePerGas !== undefined && maxFeePerGas !== null
        ? BigInt(String(maxFeePerGas))
        : BigInt(0);
      const maxPriorityFeePerGasBigInt = maxPriorityFeePerGas !== undefined && maxPriorityFeePerGas !== null
        ? BigInt(String(maxPriorityFeePerGas))
        : BigInt(0);

      // We add a dummy signature (v, r, s) so the backend's Transaction::decode 
      // can successfully parse it into a Transaction object.
      // The backend doesn't care if the signature is valid, only that the RLP structure is correct.
      return serializeTransaction({
        chainId: chainIdNum,
        nonce: nonceNum,
        maxFeePerGas: maxFeePerGasBigInt,
        maxPriorityFeePerGas: maxPriorityFeePerGasBigInt,
        gas: gasLimit,
        to: to as `0x${string}` | undefined,
        value: valueBigInt,
        data: (data || '0x') as `0x${string}`,
        accessList: [], // Empty access list
        v: 0n, // Dummy Y parity
        r: '0x0000000000000000000000000000000000000000000000000000000000000000',
        s: '0x0000000000000000000000000000000000000000000000000000000000000000',
      });
    } else {
      // Legacy transaction
      const gasPriceBigInt = gasPrice !== undefined && gasPrice !== null
        ? BigInt(String(gasPrice))
        : BigInt(0);

      // Add dummy signature for legacy transactions too
      return serializeTransaction({
        chainId: chainIdNum,
        nonce: nonceNum,
        gasPrice: gasPriceBigInt,
        gas: gasLimit,
        to: to as `0x${string}` | undefined,
        value: valueBigInt,
        data: (data || '0x') as `0x${string}`,
        v: BigInt(chainIdNum * 2 + 35), // EIP-155 placeholder V
        r: '0x0000000000000000000000000000000000000000000000000000000000000000',
        s: '0x0000000000000000000000000000000000000000000000000000000000000000',
      });
    }
  } catch (error) {
    console.error('TxFort: Transaction serialization error:', error);
    throw new Error(`Failed to serialize transaction: ${error}`);
  }
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const randomStr = Array.from(bytes)
    .map((b) => b.toString(36).padStart(2, '0'))
    .join('');
  return `snap_${Date.now()}_${randomStr}`;
}

/**
 * onTransaction Handler
 * Called by MetaMask when a user initiates a transaction
 */
export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
  transactionOrigin,
}) => {
  try {
    // Check if user is authenticated
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      // Show message to go to txfort.com/metamask
      return {
        content: buildErrorPanel(
          'Account Required',
          'Connect your MetaMask at txfort.com/metamask to enable transaction insights.',
        ),
      };
    }

    // Get API key
    const apiKey = await getApiKey();

    if (!apiKey) {
      return {
        content: buildNotAuthPanel(),
      };
    }

    // Convert chain ID to TxFort chain name
    const chain = caip2ToChainName(chainId);

    // Encode transaction for API
    const txHex = encodeTransactionHex(transaction as Record<string, unknown>, chainId);

    // Generate request ID
    const requestId = generateRequestId();

    // Call TxFort API for analysis
    let analysis;
    try {
      analysis = await analysisApi.analyze(apiKey, {
        tx_hex: txHex,
        chain,
        request_id: requestId,
        generate_description: false,
      });
    } catch (apiError: any) {
      console.error('TxFort: API call failed:', apiError?.message);

      if (apiError.status === 401) {
        return {
          content: buildErrorPanel(
            'Authentication Required',
            'Your API key is invalid or expired. Please sign in at txfort.com to refresh your connection.',
          ),
        };
      }

      if (apiError.status === 402) {
        return {
          content: buildErrorPanel(
            'Insufficient Credits',
            'You don\'t have enough credits to analyze this transaction. Please visit txfort.com to top up your balance.',
          ),
        };
      }

      if (apiError.status >= 500) {
        return {
          content: buildErrorPanel(
            'Server Error',
            'TxFort servers are currently experiencing issues. Our team has been notified. Please try again later.',
          ),
        };
      }

      if (apiError.code === 'NETWORK_ERROR' || apiError.message?.includes('fetch')) {
        return {
          content: buildErrorPanel(
            'Connection Error',
            'Unable to connect to TxFort. The service might be down or you may have network issues. Please check txfort.com for status updates.',
          ),
        };
      }

      return {
        content: buildErrorPanel(
          'Analysis Failed',
          apiError?.message || 'An unexpected error occurred while analyzing the transaction.',
        ),
      };
    }

    if (!analysis) {
      console.error('TxFort: No analysis returned from API');
      return {
        content: buildErrorPanel(
          'Analysis Failed',
          'No analysis returned from server',
        ),
      };
    }

    // Update last used timestamp
    await updateLastUsed();

    // Build and return insights panel - wrap in try-catch
    try {
      return {
        content: buildInsightsPanel(analysis, chainId),
      };
    } catch (uiError: any) {
      console.error('TxFort: UI build error:', uiError?.message);
      return {
        content: buildErrorPanel(
          'Display Error',
          'Failed to build analysis display',
        ),
      };
    }
  } catch (error) {
    console.error('TxFort: Transaction analysis error', error);

    const apiError = error as {
      status?: number;
      code?: string;
      message?: string
    };

    // Handle specific error cases
    if (apiError.status === 401 || apiError.code === 'UNAUTHORIZED') {
      // API key invalid - show auth prompt
      return {
        content: buildErrorPanel(
          'Authentication Required',
          'Your API key is invalid or expired. Please sign in again.',
        ),
      };
    }

    if (apiError.status === 402 || apiError.code === 'INSUFFICIENT_CREDITS') {
      // Insufficient credits
      return {
        content: buildErrorPanel(
          'Insufficient Credits',
          'You don\'t have enough credits to analyze this transaction. Visit txfort.com to purchase more.',
        ),
      };
    }

    if (apiError.status === 429 || apiError.code === 'RATE_LIMIT_EXCEEDED') {
      // Rate limited
      return {
        content: buildErrorPanel(
          'Rate Limit Exceeded',
          'You\'ve made too many requests. Please wait a moment and try again.',
        ),
      };
    }

    if (apiError.code === 'NETWORK_ERROR') {
      // Network error
      return {
        content: buildErrorPanel(
          'Connection Error',
          'Unable to connect to TxFort servers. Please check your connection.',
        ),
      };
    }

    // Generic error
    return {
      content: buildErrorPanel(
        'Analysis Failed',
        apiError.message || 'An unexpected error occurred during analysis.',
      ),
    };
  }
};
