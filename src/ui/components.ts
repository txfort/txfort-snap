/**
 * UI Components for Transaction Insights
 * Builds panel content using MetaMask Snap UI components
 */

import {
  panel,
  heading,
  text,
  row,
  divider,
  copyable,
  button,
  type Component
} from '@metamask/snaps-sdk';

import type {
  TransactionAnalysis,
  SecurityWarning,
  ContractAnalysis,
  InsightPanelData
} from '../types';

import {
  truncateAddress,
  formatParameterValue,
  getSeverityColor,
  calculateRiskLevel,
  formatMethodName,
  capitalize
} from '../utils/formatting';

import { getChainDisplayName, getChainInfo } from '../utils/chains';

/**
 * Build the main insights panel
 */
export function buildInsightsPanel(
  analysis: unknown,
  chainId: string
): Component {
  // Validate analysis object
  if (!analysis || typeof analysis !== 'object') {
    console.error('TxFort Components: Invalid analysis response:', analysis);
    return buildErrorPanel('Analysis Failed', 'Invalid analysis response');
  }

  try {
    const typedAnalysis = analysis as TransactionAnalysis;
    const { contract_analysis, security_analysis, description } = typedAnalysis;

    // Use getChainInfo for proper type-safe chain display
    const chainInfo = getChainInfo(chainId);
    const chainName = chainInfo.displayName;

    // Ensure security_analysis is an array
    const securityArray = Array.isArray(security_analysis) ? security_analysis : [];
    const riskLevel = calculateRiskLevel(securityArray);
    const riskEmoji = getRiskEmoji(riskLevel);

    const components: Component[] = [
      text(`${riskEmoji} Risk Level: **${capitalize(riskLevel)}**`),
    ];

    // 1. Transaction Description Section (Immediately after risk)
    if (description && typeof description === 'string') {
      components.push(text(description));
    }

    // 2. Contract Analysis Section (Detailed data)
    if (contract_analysis && typeof contract_analysis === 'object') {
      components.push(divider());
      components.push(...buildContractSection(contract_analysis));
    }

    return panel(components);
  } catch (error: any) {
    console.error('TxFort Components: Error building panel:', error?.message, error);
    return buildErrorPanel('Display Error', error?.message || 'Failed to build analysis display');
  }
}

/**
 * Build contract analysis section
 */
function buildContractSection(analysis: ContractAnalysis, isInternal = false): Component[] {
  const components: Component[] = [
    heading(isInternal ? '🔗 Internal Call' : '📊 Interaction Data'),
  ];

  // Validate analysis is an object
  if (!analysis || typeof analysis !== 'object') {
    return components;
  }

  // Method name
  if (analysis.method_name) {
    components.push(
      text(`**Method:** ${formatMethodName(analysis.method_name)}`)
    );
  }

  // Decoded parameters - ensure it's an object
  if (analysis.decoded_parameters && typeof analysis.decoded_parameters === 'object') {
    const params = analysis.decoded_parameters as Record<string, unknown>;
    const keys = Object.keys(params).filter(k => k !== 'to' && k !== 'data'); // Skip redundant fields

    if (keys.length > 0) {
      components.push(text(''));
      components.push(text('**Parameters:**'));

      for (const key of keys) {
        const value = params[key];
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        const formattedValue = formatParameterValue(stringValue, key);
        components.push(
          text(`• **${key}:** ${formattedValue}`)
        );
      }
    }
  }

  // Recursive call for internal contract analysis
  if (analysis.inner_contract_analysis) {
    components.push(divider());
    components.push(...buildContractSection(analysis.inner_contract_analysis, true));
  }

  // Handle batched calls (EIP-7702)
  if (analysis.batched_calls && Array.isArray(analysis.batched_calls) && analysis.batched_calls.length > 0) {
    components.push(text(''));
    components.push(text(`**📦 Batched Calls (${analysis.batched_calls.length}):**`));

    analysis.batched_calls.forEach((call, index) => {
      components.push(
        text(`  ${index + 1}. ${formatMethodName(call?.method_name || 'Unknown')}`)
      );
      
      // If batched calls have nested analysis, we could show them too, but keeping it simple for now
    });
  }

  return components;
}

/**
 * Build security warnings section
 */
function buildSecuritySection(warnings: SecurityWarning[]): Component[] {
  const components: Component[] = [];

  // Ensure warnings is an array
  if (!Array.isArray(warnings) || warnings.length === 0) {
    return components;
  }

  // Group by severity
  const critical = warnings.filter(w =>
    w.severity === 'Critical' || w.severity === 'Emergency'
  );
  const warning = warnings.filter(w => w.severity === 'Warning');
  const info = warnings.filter(w =>
    w.severity === 'Info' || w.severity === 'Unknown'
  );

  // Show critical first
  if (critical.length > 0) {
    components.push(text('**🚨 Critical Warnings:**'));
    critical.forEach(w => {
      components.push(text(`• ${w.description}`));
      if (w.attack_vector) {
        components.push(text(`  _Attack Vector: ${w.attack_vector}_`));
      }
    });
  }

  // Then warnings
  if (warning.length > 0) {
    if (critical.length > 0) components.push(text(''));
    components.push(text('**⚠️ Warnings:**'));
    warning.forEach(w => {
      components.push(text(`• ${w.description}`));
    });
  }

  // Then info
  if (info.length > 0) {
    if (critical.length > 0 || warning.length > 0) components.push(text(''));
    components.push(text('**ℹ️ Notes:**'));
    info.forEach(w => {
      components.push(text(`• ${w.description}`));
    });
  }

  return components;
}

/**
 * Build error panel
 */
export function buildErrorPanel(
  title: string,
  message: string,
  details?: string
): Component {
  const components: Component[] = [
    heading(`❌ ${title}`),
    text(message),
  ];

  if (details) {
    components.push(text(''));
    components.push(text(`Details: ${details}`));
  }

  return panel(components);
}

/**
 * Build loading panel
 */
export function buildLoadingPanel(): Component {
  return panel([
    heading('🔄 TxFort Analysis'),
    text('Analyzing transaction...'),
  ]);
}

/**
 * Build "not authenticated" panel
 */
export function buildNotAuthPanel(): Component {
  return panel([
    heading('🔐 TxFort'),
    text('Sign in to get transaction insights'),
    text(''),
    text('Use the TxFort dapp to connect your account and enable transaction analysis.'),
  ]);
}

/**
 * Get risk emoji based on level
 */
function getRiskEmoji(level: 'low' | 'medium' | 'high' | 'critical'): string {
  const emojis = {
    low: '✅',
    medium: '⚠️',
    high: '🔶',
    critical: '🚨',
  };
  return emojis[level];
}

/**
 * Build a simple insight data object for external use
 */
export function extractInsightData(
  analysis: TransactionAnalysis,
  chainId: string
): InsightPanelData {
  const { contract_analysis, security_analysis, description } = analysis;

  const parameters = contract_analysis?.decoded_parameters
    ? Object.entries(contract_analysis.decoded_parameters).map(([key, value]) => ({
      key,
      value: formatParameterValue(value, key),
    }))
    : [];

  return {
    methodName: contract_analysis?.method_name,
    contractAddress: contract_analysis?.decoded_parameters?.to,
    chain: chainId,
    parameters,
    securityWarnings: security_analysis,
    description,
    riskLevel: calculateRiskLevel(security_analysis),
  };
}
