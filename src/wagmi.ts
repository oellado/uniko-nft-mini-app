import { createConfig, http } from 'wagmi'
import { baseSepolia, base } from 'viem/chains'
import { farcasterFrame } from '@farcaster/frame-wagmi-connector'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    farcasterFrame(),
    injected(), // Fallback connector
  ],
  transports: {
    [baseSepolia.id]: http('https://base-sepolia.g.alchemy.com/v2/cF8oLr7QPxVm3si3zcy2m3-Y63D088hy'),
    [base.id]: http(), // Add your mainnet Alchemy URL here when ready
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
} 