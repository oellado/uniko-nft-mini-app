import { useState } from 'react';
import { generateUnikoNFT, generatePreviewNFT } from './config';

export default function App() {
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayNFT, setDisplayNFT] = useState(() => generatePreviewNFT());

  const handleMint = async () => {
    try {
      setIsMinting(true);
      setError(null);
      
      // Simulate minting delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const nft = generateUnikoNFT(`mint${Date.now()}`);
      setDisplayNFT(nft); // Only update the main display, no separate success sheet
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full"
      style={{ 
        backgroundColor: '#BFDBFE',
        paddingTop: '80px'
      }}
    >
      <div className="w-full max-w-sm" style={{ marginLeft: '50%', transform: 'translateX(-50%)' }}>
        {/* Title and Description - Centered */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 gradient-text">
            Unikō
          </h1>
          <div className="text-gray-700 text-lg">
            <p>A cute on-chain companion</p>
            <p>100% onchain generative project</p>
            <p>
              by{' '}
              <a 
                href="https://farcaster.xyz/miguelgarest.eth" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                @miguelgarest.eth
              </a>
            </p>
          </div>
        </div>

        {/* NFT Display - Centered */}
        <div className="mb-8" style={{ marginLeft: '50%', transform: 'translateX(-50%)', width: '280px' }}>
          <div className="w-[280px] h-[280px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div 
              className="w-full h-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: displayNFT.svg }}
            />
          </div>
        </div>

        {/* Mint Button - Centered */}
        <div style={{ marginLeft: '50%', transform: 'translateX(-50%)', width: 'fit-content' }}>
          <button
            onClick={handleMint}
            disabled={isMinting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg shadow-lg"
          >
            {isMinting ? "Minting..." : "Mint • 0.001 ETH"}
          </button>
        </div>

        {/* Error Message - Only if error */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-center" style={{ marginLeft: '20px', marginRight: '20px' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 