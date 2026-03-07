/**
 * TxFort Snap Type Definitions
 */

// API Configuration
export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
}

// Snap State - stored encrypted
export interface SnapState {
  apiKey?: string;
  userId?: string;
  userEmail?: string;
  createdAt?: string;
  lastUsed?: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  membership?: MembershipResponse;
}

export interface MembershipResponse {
  tier_name: string;
  monthly_request_limit: number;
  is_active: boolean;
  expires_at?: string;
}

export interface ApiKeyResponse {
  id: string;
  api_key: string;
  name?: string;
  created_at: string;
  expires_at?: string;
}

// Transaction Analysis Types
export interface AnalyzeRequest {
  tx_hex: string;
  chain: string;
  request_id?: string;
  generate_description?: boolean;
}

export interface TransactionAnalysis {
  contract_analysis?: ContractAnalysis;
  security_analysis: SecurityWarning[];
  description?: string;
  raw_tx: Record<string, unknown>;
}

export interface ContractAnalysis {
  method_signature?: string;
  method_name?: string;
  decoded_parameters: Record<string, string>;
  description: string;
  inner_contract_analysis?: ContractAnalysis;
  batched_calls?: ContractAnalysis[];
}

export interface SecurityWarning {
  severity: SecuritySeverity;
  warning_type: string;
  description: string;
  attack_vector?: string;
}

export type SecuritySeverity = 'Unknown' | 'Info' | 'Warning' | 'Critical' | 'Emergency';

// Chain Mapping
export type SupportedChain = 'ethereum' | 'polygon' | 'bsc' | 'tron';

export interface ChainMapping {
  [caip2Id: string]: SupportedChain;
}

// Error Types
export interface ApiError {
  status: number;
  code: string;
  message: string;
}

export type SnapErrorCode = 
  | 'NO_API_KEY'
  | 'AUTHENTICATION_FAILED'
  | 'INSUFFICIENT_CREDITS'
  | 'RATE_LIMIT_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'INVALID_TRANSACTION'
  | 'ANALYSIS_FAILED';

export interface SnapError {
  code: SnapErrorCode;
  message: string;
  details?: string;
}

// UI Component Types
export interface InsightPanelData {
  methodName?: string;
  contractAddress?: string;
  chain: string;
  parameters: Array<{ key: string; value: string }>;
  securityWarnings: SecurityWarning[];
  description?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Transaction Types from MetaMask
export interface TransactionPayload {
  from: string;
  to?: string;
  data?: string;
  value?: string;
  gas?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: string;
  chainId?: string;
}

export interface OnTransactionContext {
  transaction: TransactionPayload;
  chainId: string;
  transactionOrigin?: string;
}
