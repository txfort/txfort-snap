/**
 * TxFort Snap Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the snap global
const mockSnap = {
  request: vi.fn(),
};

// @ts-expect-error - snap is a global in MetaMask
globalThis.snap = mockSnap;

// Mock fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Import after mocking
import { caip2ToChainName, isChainSupported, getChainDisplayName } from '../src/utils/chains';
import { 
  truncateAddress, 
  formatNumber, 
  formatWeiToEth,
  calculateRiskLevel 
} from '../src/utils/formatting';

describe('Chain Utilities', () => {
  describe('caip2ToChainName', () => {
    it('should convert Ethereum mainnet CAIP-2 ID', () => {
      expect(caip2ToChainName('eip155:1')).toBe('ethereum');
    });

    it('should convert Polygon mainnet CAIP-2 ID', () => {
      expect(caip2ToChainName('eip155:137')).toBe('polygon');
    });

    it('should convert BSC mainnet CAIP-2 ID', () => {
      expect(caip2ToChainName('eip155:56')).toBe('bsc');
    });

    it('should default to ethereum for unknown chains', () => {
      expect(caip2ToChainName('eip155:999')).toBe('ethereum');
    });

    it('should handle case-insensitive input', () => {
      expect(caip2ToChainName('EIP155:1')).toBe('ethereum');
    });
  });

  describe('isChainSupported', () => {
    it('should return true for supported chains', () => {
      expect(isChainSupported('eip155:1')).toBe(true);
      expect(isChainSupported('eip155:137')).toBe(true);
    });

    it('should return false for unsupported chains', () => {
      expect(isChainSupported('eip155:999')).toBe(false);
    });
  });

  describe('getChainDisplayName', () => {
    it('should return display name for Ethereum', () => {
      expect(getChainDisplayName('ethereum')).toBe('Ethereum');
    });

    it('should return display name for BSC', () => {
      expect(getChainDisplayName('bsc')).toBe('BNB Smart Chain');
    });
  });
});

describe('Formatting Utilities', () => {
  describe('truncateAddress', () => {
    it('should truncate long addresses', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      expect(truncateAddress(address)).toBe('0x1234...5678');
    });

    it('should not truncate short strings', () => {
      expect(truncateAddress('short')).toBe('short');
    });

    it('should handle empty strings', () => {
      expect(truncateAddress('')).toBe('');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('should handle string input', () => {
      expect(formatNumber('1000000')).toBe('1,000,000');
    });
  });

  describe('formatWeiToEth', () => {
    it('should convert wei to ETH', () => {
      const wei = '1000000000000000000'; // 1 ETH
      expect(formatWeiToEth(wei)).toBe('1.000000 ETH');
    });

    it('should handle zero', () => {
      expect(formatWeiToEth('0')).toBe('0 ETH');
    });

    it('should handle very small amounts', () => {
      const wei = '1'; // 1 wei
      expect(formatWeiToEth(wei)).toBe('< 0.000001 ETH');
    });
  });

  describe('calculateRiskLevel', () => {
    it('should return low for no warnings', () => {
      expect(calculateRiskLevel([])).toBe('low');
    });

    it('should return critical for critical severity', () => {
      expect(calculateRiskLevel([{ severity: 'Critical' } as any])).toBe('critical');
    });

    it('should return critical for emergency severity', () => {
      expect(calculateRiskLevel([{ severity: 'Emergency' } as any])).toBe('critical');
    });

    it('should return high for warning severity', () => {
      expect(calculateRiskLevel([{ severity: 'Warning' } as any])).toBe('high');
    });

    it('should return medium for info severity', () => {
      expect(calculateRiskLevel([{ severity: 'Info' } as any])).toBe('medium');
    });
  });
});

describe('State Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get state from snap', async () => {
    mockSnap.request.mockResolvedValueOnce({
      txfort_state: {
        apiKey: 'test-key',
        userId: 'test-user',
      },
    });

    const { getState } = await import('../src/state/storage');
    const state = await getState();
    
    expect(state.apiKey).toBe('test-key');
    expect(mockSnap.request).toHaveBeenCalledWith({
      method: 'snap_manageState',
      params: {
        operation: 'get',
        encrypted: true,
      },
    });
  });

  it('should return empty object when no state exists', async () => {
    mockSnap.request.mockResolvedValueOnce(null);

    const { getState } = await import('../src/state/storage');
    const state = await getState();
    
    expect(state).toEqual({});
  });
});

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should make successful API request', async () => {
    const mockResponse = { token: 'test-token', user: { id: '1', email: 'test@test.com' } };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { authApi } = await import('../src/api/client');
    const result = await authApi.login({ email: 'test@test.com', password: 'password' });
    
    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.txfort.com/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should handle API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ code: 'UNAUTHORIZED', message: 'Invalid credentials' }),
    });

    const { authApi } = await import('../src/api/client');
    
    await expect(authApi.login({ email: 'test@test.com', password: 'wrong' }))
      .rejects.toMatchObject({
        status: 401,
        code: 'UNAUTHORIZED',
      });
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { authApi } = await import('../src/api/client');
    
    await expect(authApi.login({ email: 'test@test.com', password: 'password' }))
      .rejects.toMatchObject({
        code: 'NETWORK_ERROR',
      });
  });
});