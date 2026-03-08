# TxFort MetaMask Snap

A MetaMask Snap that provides real-time transaction analysis and security insights before you sign transactions.

## Features

- **Transaction Analysis**: Get detailed analysis of transactions before signing
- **Parameter Decoding**: View decoded function parameters in human-readable format
- **Security Warnings**: Receive alerts about potential security risks
- **Human-Readable Descriptions**: Understand what a transaction does before signing

## Installation

Visit [txfort.com](https://txfort.com) and click "Connect with MetaMask" to install the snap.

## Usage

Once installed, the snap automatically analyzes transactions when you initiate them in MetaMask:

1. Initiate any transaction in MetaMask
2. The snap analyzes the transaction in real-time
3. View insights in the confirmation dialog:
   - Method name and signature
   - Decoded parameters
   - Security warnings
   - Risk level indicator

## Security

### What the Snap Does

- ✅ Reads transaction data to provide insights
- ✅ Stores your API key encrypted
- ✅ Makes requests only to TxFort API

### What the Snap Does NOT Do

- ❌ Cannot access your private keys
- ❌ Cannot modify transactions
- ❌ Cannot sign transactions on your behalf
- ❌ Cannot access other websites or data

### Permissions

The snap requests the following permissions:

| Permission | Purpose |
|------------|---------|
| `endowment:transaction-insight` | Analyze transactions before signing |
| `endowment:rpc` | Allow dapps to communicate with the snap |
| `snap_manageState` | Store API key securely |
| `snap_dialog` | Show dialogs for insights and authentication |
| `endowment:network-access` | Connect to TxFort API |

## Support

If you encounter any issues or need help, please visit [txfort.com](https://txfort.com) or contact our support team.