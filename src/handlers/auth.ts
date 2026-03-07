/**
 * Authentication Handler
 * Handles user state and authentication
 */

import { getApiKey, clearState, isAuthenticated, getState, updateState } from '../state/storage';

import type { SnapState } from '../types';

/**
 * Set API key directly (for connecting MetaMask from website)
 */
export async function handleSetApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey || apiKey.trim().length === 0) {
    return false;
  }

  // Store the API key
  await updateState({
    apiKey: apiKey.trim(),
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
  });

  return true;
}

/**
 * Ensure user is authenticated
 */
export async function ensureAuthenticated(): Promise<string | null> {
  const authenticated = await isAuthenticated();
  
  if (authenticated) {
    const apiKey = await getApiKey();
    return apiKey;
  }
  
  return null;
}

/**
 * Get current user state
 */
export async function getUserState(): Promise<SnapState> {
  return await getState();
}

/**
 * Check if user has valid API key
 */
export async function hasValidApiKey(): Promise<boolean> {
  const apiKey = await getApiKey();
  return !!apiKey;
}
