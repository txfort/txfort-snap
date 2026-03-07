import type { SnapConfig } from '@metamask/snaps-cli';

const config: SnapConfig = {
  input: 'src/index.ts',
  output: {
    path: 'dist',
    filename: 'bundle.js',
  },
  server: {
    port: 8080,
  },
  environment: {
    API_URL: process.env.TXFORT_API_URL || 'https://api.txfort.com',
  },
  polyfills: {
    buffer: true,
  },
};

export default config;