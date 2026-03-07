/**
 * Snap State Management
 * Handles encrypted storage of API keys and user data
 */

import type { SnapState } from '../types';

const STATE_KEY = 'txfort_state';

/**
 * Get the current snap state
 */
export async function getState(): Promise<SnapState> {
  try {
    const state = await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'get',
        encrypted: true,
      },
    });

    if (state && typeof state === 'object' && STATE_KEY in state) {
      return (state as Record<string, SnapState>)[STATE_KEY] as SnapState;
    }

    return {};
  } catch (error) {
    console.error('Failed to get state:', error);
    return {};
  }
}

/**
 * Update the snap state
 */
export async function updateState(newState: Partial<SnapState>): Promise<void> {
  try {
    const currentState = await getState();
    const updatedState: SnapState = {
      ...currentState,
      ...newState,
    };

    await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'update',
        encrypted: true,
        newState: {
          [STATE_KEY]: updatedState,
        },
      },
    });
  } catch (error) {
    console.error('Failed to update state:', error);
    throw new Error('Failed to save state');
  }
}

/**
 * Clear the snap state (logout)
 */
export async function clearState(): Promise<void> {
  try {
    await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'clear',
        encrypted: true,
      },
    });
  } catch (error) {
    console.error('Failed to clear state:', error);
    throw new Error('Failed to clear state');
  }
}

/**
 * Check if user is authenticated (has API key)
 */
export async function isAuthenticated(): Promise<boolean> {
  const state = await getState();
  return !!state.apiKey;
}

/**
 * Get the stored API key
 */
export async function getApiKey(): Promise<string | null> {
  const state = await getState();
  return state.apiKey || null;
}

/**
 * Store API key and user info after authentication
 */
export async function storeAuthData(
  apiKey: string,
  userId: string,
  userEmail: string
): Promise<void> {
  await updateState({
    apiKey,
    userId,
    userEmail,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
  });
}

/**
 * Update last used timestamp
 */
export async function updateLastUsed(): Promise<void> {
  await updateState({
    lastUsed: new Date().toISOString(),
  });
}
