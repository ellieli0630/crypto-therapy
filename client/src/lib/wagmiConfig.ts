import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import { mainnet, optimism, arbitrum, base } from 'viem/chains';

export const config = getDefaultConfig({
  appName: 'Crypto Therapy',
  projectId: 'YOUR_WALLET_CONNECT_PROJECT_ID',
  chains: [mainnet, optimism, arbitrum, base],
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
});

export const { chains } = config;