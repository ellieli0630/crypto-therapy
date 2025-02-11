import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmiConfig';
import '@rainbow-me/rainbowkit/styles.css';

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider theme={darkTheme({
        accentColor: '#ff0000',
        accentColorForeground: 'white',
        borderRadius: 'none',
        fontStack: 'system',
      })}>
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}