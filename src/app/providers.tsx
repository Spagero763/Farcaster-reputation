'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";

const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  // You need to get a WalletConnect Project ID from https://cloud.walletconnect.com
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || 'd8161c927380a43385b546d149c47040';

  const { connectors } = getDefaultWallets({
    appName: 'Farcaster Reputation Claimer',
    projectId,
    chains: [baseSepolia],
  });

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    chains: [baseSepolia],
    transports: {
      [baseSepolia.id]: http(),
    },
    ssr: true,
  });

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          chains={[baseSepolia]}
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
      </QueryClientProvider>
    </WagmiProvider>
  );
}