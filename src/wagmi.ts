import { createConfig, http } from 'wagmi'
import { baseSepolia, base } from 'viem/chains'
import { farcasterFrame } from '@farcaster/frame-wagmi-connector'


export const config = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    farcasterFrame(),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
} 