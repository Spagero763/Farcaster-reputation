'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiProvider } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { Toaster } from "@/components/ui/toaster";

const { chains, publicClient } = configureChains(
  [baseSepolia],
  [publicProvider()]
);

// You need to get a WalletConnect Project ID from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || 'YOUR_PROJECT_ID';

const { connectors } = getDefaultWallets({
  appName: 'Farcaster Reputation Claimer',
  projectId,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider 
        chains={chains}
        theme={{
          lightMode: lightTheme({
            accentColor: 'hsl(197 76% 53%)',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          }),
          darkMode: darkTheme({
            accentColor: 'hsl(197 76% 53%)',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          }),
        }}
      >
        {children}
        <Toaster />
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
