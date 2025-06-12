import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    farcasterFrame(),
  ],
  transports: {
    [base.id]: http(),
  },
}); 