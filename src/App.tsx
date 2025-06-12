import { useState, useEffect } from 'react';
import { generateUnikoNFT, generatePreviewNFT } from './config';

// Mini App SDK types
declare global {
  interface Window {
    sdk?: {
      context?: {
        user?: {
          fid: number;
          username?: string;
          displayName?: string;
          pfpUrl?: string;
        };
        client?: {
          clientFid: number;
          added: boolean;
          safeAreaInsets?: {
            top: number;
            bottom: number;
            left: number;
            right: number;
          };
        };
      };
      actions?: {
        ready: () => Promise<void>;
        close: (options?: { toast?: { message: string } }) => Promise<void>;
      };
    };
  }
}

export default function App() {
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayNFT, setDisplayNFT] = useState(() => generatePreviewNFT());
  const [isReady, setIsReady] = useState(false);
  const [sdk, setSdk] = useState<any>(null);
  const [userContext, setUserContext] = useState<any>(null);
  const [showCollection, setShowCollection] = useState(false);
  const [mintedNFTs, setMintedNFTs] = useState<any[]>([]);

  useEffect(() => {
    // Initialize Mini App SDK
    const initSDK = async () => {
      try {
        // Import the SDK dynamically
        const { default: frameSDK } = await import('@farcaster/frame-sdk');
        
        // Set up the SDK
        setSdk(frameSDK);
        
        // Get user context
        if (frameSDK.context) {
          const context = await frameSDK.context;
          setUserContext(context);
        }
        
        // Signal that the Mini App is ready
        await frameSDK.actions.ready();
        setIsReady(true);
      } catch (error) {
        console.log('SDK not available, running in browser mode');
        setIsReady(true);
        // Mock user for browser testing
        setUserContext({
          user: {
            fid: 12345,
            username: 'testuser',
            displayName: 'Test User',
            pfpUrl: 'https://i.imgur.com/placeholder.jpg'
          }
        });
      }
    };

    initSDK();
  }, []);

  const handleMint = async () => {
    try {
      setIsMinting(true);
      setError(null);
      
      // Simulate minting delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const nft = generateUnikoNFT(`mint${Date.now()}`);
      setDisplayNFT(nft);
      
      // Add to minted collection
      setMintedNFTs(prev => [...prev, nft]);
      
      // Show success toast if in Mini App context
      if (sdk?.actions?.close) {
        await sdk.actions.close({
          toast: { message: "NFT minted successfully!" }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
    } finally {
      setIsMinting(false);
    }
  };

  // Get safe area insets for proper spacing
  const getSafeAreaInsets = async () => {
    if (sdk?.context) {
      try {
        const context = await sdk.context;
        return context.client?.safeAreaInsets || {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        };
      } catch {
        return { top: 0, bottom: 0, left: 0, right: 0 };
      }
    }
    return { top: 0, bottom: 0, left: 0, right: 0 };
  };

  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  useEffect(() => {
    if (sdk) {
      getSafeAreaInsets().then(setSafeAreaInsets);
    }
  }, [sdk]);

  const handleProfileClick = () => {
    setShowCollection(true);
  };

  const handleBackToMint = () => {
    setShowCollection(false);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: '#BFDBFE' }}>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-700">Loading UnikoNFT...</div>
        </div>
      </div>
    );
  }

  // Collection View
  if (showCollection) {
    return (
      <div 
        className="min-h-screen w-full"
        style={{ 
          backgroundColor: '#BFDBFE',
          paddingTop: `${safeAreaInsets.top}px`,
          paddingBottom: `${safeAreaInsets.bottom}px`,
          paddingLeft: `${safeAreaInsets.left}px`,
          paddingRight: `${safeAreaInsets.right}px`
        }}
      >
        {/* Top Bar */}
        <div className="w-full bg-white/20 backdrop-blur-sm border-b border-white/30 px-4 py-2 flex items-center justify-between" style={{ height: '56px' }}>
          <button
            onClick={handleBackToMint}
            className="flex items-center text-gray-700 hover:text-gray-900 transition-colors p-1"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-800 gradient-text">My Unikō Collection</h1>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>

        {/* Collection Grid */}
        <div className="flex-1 p-6">
          {mintedNFTs.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-120px)]">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">No Unikō Yet</h2>
                <p className="text-gray-600 mb-8">Mint your first Unikō to start your collection!</p>
              </div>
              
              {/* Empty Collection Grid */}
              <div className="grid grid-cols-4 gap-3 mb-8 max-w-xs mx-auto">
                {Array.from({ length: 16 }).map((_, index) => (
                  <div key={index} className="w-16 h-16 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">• ᴗ •</span>
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleBackToMint}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Start Minting
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {mintedNFTs.map((nft, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div 
                    className="w-full aspect-square flex items-center justify-center p-2"
                    dangerouslySetInnerHTML={{ __html: nft.svg }}
                  />
                  <div className="p-3 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">Unikō #{index + 1}</p>
                    <p className="text-xs text-gray-500">{nft.traits.eyes} • {nft.traits.mouth}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Mint View
  return (
    <div 
      className="min-h-screen w-full"
      style={{ 
        backgroundColor: '#BFDBFE',
        paddingTop: `${safeAreaInsets.top}px`,
        paddingBottom: `${safeAreaInsets.bottom}px`,
        paddingLeft: `${safeAreaInsets.left}px`,
        paddingRight: `${safeAreaInsets.right}px`
      }}
    >
      {/* Top Bar */}
      <div className="w-full bg-white/20 backdrop-blur-sm border-b border-white/30 px-4 py-2 flex items-center justify-end" style={{ height: '56px' }}>
        {userContext?.user && (
          <button
            onClick={handleProfileClick}
            className="flex items-center hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
              {userContext.user.pfpUrl ? (
                <img 
                  src={userContext.user.pfpUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span>{userContext.user.displayName?.[0] || userContext.user.username?.[0] || '?'}</span>
              )}
            </div>
          </button>
        )}
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">
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
          <div className="flex justify-center mb-8">
            <div className="w-[280px] h-[280px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div 
                className="w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: displayNFT.svg }}
              />
            </div>
          </div>

          {/* Mint Button - Centered */}
          <div className="flex justify-center">
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
            <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 