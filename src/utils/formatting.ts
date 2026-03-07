/**
 * Formatting Utilities
 * Helper functions for formatting addresses, values, and other data
 */

/**
 * Truncate an Ethereum address for display
 */
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address) return '';
  if (address.length <= start + end) return address;
  
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Format a large number with commas
 */
export function formatNumber(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  
  return n.toLocaleString('en-US');
}

/**
 * Format Wei to ETH
 */
export function formatWeiToEth(wei: string | number): string {
  const weiNum = typeof wei === 'string' ? BigInt(wei) : BigInt(wei);
  const eth = Number(weiNum) / 1e18;
  
  if (eth === 0) return '0 ETH';
  if (eth < 0.000001) return '< 0.000001 ETH';
  
  return `${eth.toFixed(6)} ETH`;
}

/**
 * Format hex value to readable string
 */
export function formatHexValue(hex: string): string {
  if (!hex || hex === '0x') return '0';
  
  // Try to convert to number if it's a numeric hex
  if (/^0x[0-9a-fA-F]+$/.test(hex)) {
    try {
      const num = BigInt(hex);
      // If it's a reasonable number, show it
      if (num < BigInt(1e15)) {
        return num.toString();
      }
    } catch {
      // Fall through
    }
  }
  
  // Return full hex string
  return hex;
}

/**
 * Format a parameter value based on type hints
 */
export function formatParameterValue(value: string, key?: string): string {
  if (!value) return 'N/A';
  
  // Check if it's a numeric hex
  if (value.startsWith('0x') && /^0x[0-9a-fA-F]+$/.test(value)) {
    try {
      // Don't convert addresses (42 chars) or large hexes to numbers
      if (value.length < 20) {
        const num = BigInt(value);
        if (num < BigInt(1e12)) {
          return num.toString();
        }
      }
    } catch {
      // Fall through
    }
  }
  
  // Return as-is for other values (including full addresses and long hexes)
  return value;
}

/**
 * Get severity color for display
 */
export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    Unknown: '⚪',
    Info: '🔵',
    Warning: '🟡',
    Critical: '🔴',
    Emergency: '🚨',
  };
  
  return colors[severity] || '⚪';
}

/**
 * Get risk level from security warnings
 */
export function calculateRiskLevel(
  warnings: Array<{ severity: string }>
): 'low' | 'medium' | 'high' | 'critical' {
  if (!warnings || warnings.length === 0) {
    return 'low';
  }
  
  const severities = warnings.map(w => w.severity);
  
  if (severities.includes('Emergency') || severities.includes('Critical')) {
    return 'critical';
  }
  
  if (severities.includes('Warning')) {
    return 'high';
  }
  
  if (severities.includes('Info')) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format method name for display
 */
export function formatMethodName(methodName?: string): string {
  if (!methodName) return 'Unknown Method';
  
  // Convert snake_case or camelCase to Title Case
  return methodName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(capitalize)
    .join(' ')
    .trim();
}