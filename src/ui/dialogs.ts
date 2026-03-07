/**
 * Dialog Utilities
 * UI components for snap dialogs
 */

import { 
  panel, 
  heading, 
  text, 
  type Component 
} from '@metamask/snaps-sdk';

/**
 * Show success message
 */
export async function showSuccess(message: string): Promise<void> {
  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: panel([
        heading('✅ Success'),
        text(message),
      ]),
    },
  });
}

/**
 * Show error message
 */
export async function showError(message: string, title = 'Error'): Promise<void> {
  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: panel([
        heading(`❌ ${title}`),
        text(message),
      ]),
    },
  });
}

/**
 * Show insufficient credits dialog
 */
export async function showInsufficientCreditsDialog(): Promise<void> {
  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: panel([
        heading('💳 Insufficient Credits'),
        text("You don't have enough credits to analyze this transaction."),
        text(''),
        text('Visit txfort.com to:'),
        text('• Purchase more credits'),
        text('• Upgrade your membership tier'),
      ]),
    },
  });
}

/**
 * Show rate limit dialog
 */
export async function showRateLimitDialog(retryAfter?: number): Promise<void> {
  const retryText = retryAfter 
    ? `Try again in ${Math.ceil(retryAfter / 60)} minutes.`
    : 'Please try again later.';
  
  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: panel([
        heading('⏳ Rate Limit Exceeded'),
        text("You've made too many requests."),
        text(retryText),
        text(''),
        text('Consider upgrading your plan for higher limits.'),
      ]),
    },
  });
}

/**
 * Show network error dialog
 */
export async function showNetworkErrorDialog(): Promise<void> {
  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: panel([
        heading('🌐 Connection Error'),
        text('Unable to connect to TxFort servers.'),
        text(''),
        text('Please check your internet connection and try again.'),
      ]),
    },
  });
}
