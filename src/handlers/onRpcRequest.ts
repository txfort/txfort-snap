/**
 * RPC Request Handler
 * Handles custom JSON-RPC methods from dapps
 */

import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';

import { getUserState, hasValidApiKey, handleSetApiKey } from './auth';

/**
 * Supported RPC methods
 */
const METHODS = {
  GET_STATE: 'getState',
  IS_AUTHENTICATED: 'isAuthenticated',
  SET_API_KEY: 'setApiKey',
} as const;

/**
 * onRpcRequest Handler
 * Handles custom JSON-RPC requests from connected dapps
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case METHODS.GET_STATE: {
      const state = await getUserState();
      return {
        isAuthenticated: !!state.apiKey,
      };
    }
    
    case METHODS.IS_AUTHENTICATED: {
      const hasKey = await hasValidApiKey();
      return { isAuthenticated: hasKey };
    }
    
    case METHODS.SET_API_KEY: {
      const apiKey = (request.params as { apiKey: string }).apiKey;
      if (!apiKey) {
        throw new Error('API key is required');
      }
      const success = await handleSetApiKey(apiKey);
      return { success: success };
    }
    
    default: {
      throw new Error(`Method not found: ${request.method}`);
    }
  }
};
