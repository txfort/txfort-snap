/**
 * TxFort: Security Shield
 * 
 * This snap provides transaction analysis and security insights
 * for blockchain transactions before users sign them.
 * 
 * @packageDocumentation
 */

import { onTransaction } from './handlers/onTransaction';
import { onRpcRequest } from './handlers/onRpcRequest';

// Export handlers for MetaMask
export { onTransaction, onRpcRequest };