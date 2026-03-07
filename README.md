# TxFort MetaMask Snap

A MetaMask Snap that provides real-time transaction analysis and security insights before you sign transactions.

## Features

- **Transaction Analysis**: Get detailed analysis of transactions before signing
- **Parameter Decoding**: View decoded function parameters in human-readable format
- **Security Warnings**: Receive alerts about potential security risks
- **Multi-Chain Support**: Works with Ethereum, Polygon, and BSC
- **Human-Readable Descriptions**: Understand what a transaction does before signing

## Installation

### From npm (Recommended)

The snap can be installed from any dapp that supports MetaMask Snaps:

```javascript
await ethereum.request({
  method: 'wallet_requestSnaps',
  params: {
    'npm:@txfort/snap': {}
  }
});
```

### From TxFort Website

Visit [txfort.com](https://txfort.com) and click "Connect with MetaMask" to install the snap.

## Usage

### Automatic Transaction Insights

Once installed, the snap automatically analyzes transactions when you initiate them in MetaMask:

1. Initiate any transaction in MetaMask
2. The snap analyzes the transaction in real-time
3. View insights in the confirmation dialog:
   - Method name and signature
   - Decoded parameters
   - Security warnings
   - Risk level indicator

### Authentication

First-time users need to sign in:

1. When you initiate your first transaction, you'll see a prompt to sign in
2. Enter your TxFort credentials (or sign up at txfort.com)
3. The snap automatically creates an API key for you
4. You're ready to analyze transactions!

### RPC Methods

The snap exposes the following RPC methods for dapps:

#### `login`

Sign in to your TxFort account.

```javascript
const result = await ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:@txfort/snap',
    request: { method: 'login' }
  }
});
```

#### `logout`

Sign out of your TxFort account.

```javascript
await ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:@txfort/snap',
    request: { method: 'logout' }
  }
});
```

#### `isAuthenticated`

Check if you're signed in.

```javascript
const { isAuthenticated } = await ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:@txfort/snap',
    request: { method: 'isAuthenticated' }
  }
});
```

#### `getState`

Get your current authentication state.

```javascript
const state = await ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:@txfort/snap',
    request: { method: 'getState' }
  }
});
// Returns: { userId, userEmail, createdAt, lastUsed, isAuthenticated }
```

## Supported Chains

| Chain | Mainnet | Testnets |
|-------|---------|----------|
| Ethereum | ✅ | Goerli, Sepolia |
| Polygon | ✅ | Mumbai, Amoy |
| BSC | ✅ | BSC Testnet |
| Tron | ✅ | Shasta |

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

The snap requests these permissions:

| Permission | Purpose |
|------------|---------|
| `endowment:transaction-insight` | Analyze transactions before signing |
| `endowment:ethereum-provider` | Interact with Ethereum network |
| `snap_manageState` | Store API key securely |
| `snap_dialog` | Show dialogs for authentication |
| `endowment:network-access` | Connect to TxFort API |

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask Flask (for testing)

### Setup

```bash
# Clone the repository
git clone https://github.com/txfort/txfort-snap.git
cd txfort-snap

# Install dependencies
yarn install

# Build the snap
yarn build

# Run tests
yarn test

# Start development server
yarn serve
```

### Testing Locally

1. Install MetaMask Flask
2. Go to `http://localhost:8080`
3. Click "Connect" to install the snap
4. Initiate a transaction to see insights

### Project Structure

```
snap/
├── src/
│   ├── index.ts              # Main entry point
│   ├── api/
│   │   └── client.ts         # TxFort API client
│   ├── handlers/
│   │   ├── onTransaction.ts  # Transaction handler
│   │   └── onRpcRequest.ts   # RPC method handler
│   ├── state/
│   │   └── storage.ts        # State management
│   ├── ui/
│   │   ├── components.ts     # UI components
│   │   └── dialogs.ts        # Dialog components
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── utils/
│       ├── chains.ts         # Chain utilities
│       └── formatting.ts     # Formatting utilities
├── test/
│   └── index.test.ts         # Tests
├── package.json
├── snap.manifest.json
└── tsconfig.json
```

## Troubleshooting

### "Authentication Required" Error

Your API key may be invalid or expired. Try signing out and back in:

```javascript
await ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:@txfort/snap',
    request: { method: 'logout' }
  }
});
```

### "Insufficient Credits" Error

You've run out of credits. Visit [txfort.com](https://txfort.com) to purchase more or upgrade your plan.

### "Rate Limit Exceeded" Error

You've made too many requests. Wait a few minutes before trying again.

### Snap Not Showing Insights

1. Make sure you're signed in
2. Check that the transaction is on a supported chain
3. Try refreshing MetaMask

## Support

- **Documentation**: [docs.txfort.com](https://docs.txfort.com)
- **Email**: support@txfort.com
- **Discord**: [discord.gg/txfort](https://discord.gg/txfort)
- **Twitter**: [@txfort](https://twitter.com/txfort)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.