import { useState, useEffect } from 'react';
import { generatePreviewNFT, generateUnikoNFT } from './config';

export default function App() {
  const [showCollection, setShowCollection] = useState(false);
  const [displayNFT, setDisplayNFT] = useState(() => generatePreviewNFT());
  const [isMinting, setIsMinting] = useState(false);
  const [mintedNFTs, setMintedNFTs] = useState<any[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<any | null>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const isFrame = window.parent !== window;
        
        if (isFrame) {
          const { sdk } = await import('@farcaster/frame-sdk');
          await sdk.actions.ready();
          console.log('Frame SDK initialized successfully');
        }
        
        setIsSDKLoaded(true);
      } catch (error) {
        console.error('Frame SDK initialization error:', error);
        setIsSDKLoaded(true);
      }
    };

    setTimeout(initializeSDK, 100);
  }, []);

  // Loading screen while SDK initializes
  if (!isSDKLoaded) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #BFDBFE 0%, #DDD6FE 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '16px',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
        }}>
          • ᴗ •
        </div>
        <div style={{ fontSize: '16px', color: '#6B7280' }}>Loading Unikō...</div>
      </div>
    );
  }

  // Mock user data
  const mockUser = {
    fid: 12345,
    username: 'testuser',
    displayName: 'Test User',
    pfpUrl: 'https://i.imgur.com/placeholder.jpg'
  };

  const handleMint = async () => {
    setIsMinting(true);
    // Simulate minting process
    setTimeout(() => {
      const newNFT = generateUnikoNFT(`seed-${Date.now()}-${Math.random()}`);
      setMintedNFTs(prev => [...prev, newNFT]);
      setDisplayNFT(newNFT); // Show the minted NFT on the main screen
      setIsMinting(false);
      alert('NFT Minted Successfully!');
    }, 2000);
  };

  const handleProfileClick = () => {
    setShowCollection(true);
  };

  const handleBackToMint = () => {
    setShowCollection(false);
  };

  const handleNFTClick = (nft: any) => {
    setSelectedNFT(nft);
  };

  const handleCloseModal = () => {
    setSelectedNFT(null);
  };

  if (showCollection) {
    return (
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #BFDBFE 0%, #DDD6FE 100%)',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Blur overlay when modal is open */}
        {selectedNFT && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
            onClick={handleCloseModal}
          >
            <div 
              style={{
                width: '260px',
                height: '260px',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                border: '2px solid #E5E7EB',
                overflow: 'hidden',
                position: 'relative',
                maxWidth: '80vw',
                maxHeight: '80vh'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                dangerouslySetInnerHTML={{ __html: selectedNFT.svg }}
              />
              {selectedNFT.isUltraRare && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  ✨ ULTRA RARE ✨
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top Bar */}
        <div style={{ 
          width: '100%', 
          backgroundColor: 'rgba(255, 255, 255, 0.2)', 
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)', 
          padding: '8px 12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          height: '48px',
          boxSizing: 'border-box'
        }}>
          <button
            onClick={handleBackToMint}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: '#374151', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
            }}
          >
            <svg style={{ width: '16px', height: '16px', marginRight: '6px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            background: 'linear-gradient(45deg, #9333ea, #ec4899, #3b82f6, #10b981, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
          }}>My Unikō Collection</h1>
          <div style={{ width: '48px' }}></div>
        </div>

        {/* Collection Content */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: 'calc(100% - 48px)', 
          padding: '16px',
          boxSizing: 'border-box'
        }}>
          {mintedNFTs.length === 0 ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#1F2937', 
                  marginBottom: '6px', 
                  margin: '0 0 6px 0',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
                }}>No Unikō Yet</h2>
                <p style={{ 
                  color: '#4B5563', 
                  fontSize: '14px', 
                  margin: '0',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
                }}>Mint your first Unikō to start your collection!</p>
              </div>

              {/* 4x4 Grid - Empty */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '8px', 
                width: '240px',
                height: '240px'
              }}>
                {Array.from({ length: 16 }).map((_, index) => (
                  <div key={index} style={{ 
                    width: '56px', 
                    height: '56px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.5)', 
                    borderRadius: '6px', 
                    border: '1px solid #D1D5DB', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <span style={{ 
                      color: '#9CA3AF', 
                      fontSize: '12px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
                    }}>• ᴗ •</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#1F2937', 
                  marginBottom: '6px', 
                  margin: '0 0 6px 0',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
                }}>My Unikō Collection</h2>
                <p style={{ 
                  color: '#4B5563', 
                  fontSize: '14px', 
                  margin: '0',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
                }}>{mintedNFTs.length} Unikō{mintedNFTs.length !== 1 ? 's' : ''} collected</p>
              </div>

              {/* 4x4 Grid - With NFTs */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '8px', 
                width: '240px',
                height: '240px'
              }}>
                {Array.from({ length: 16 }).map((_, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      width: '56px', 
                      height: '56px', 
                      backgroundColor: index < mintedNFTs.length ? 'white' : 'rgba(255, 255, 255, 0.5)', 
                      borderRadius: '6px', 
                      border: '1px solid #D1D5DB', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: index < mintedNFTs.length ? 'pointer' : 'default',
                      transition: 'transform 0.1s ease',
                    }}
                    onClick={() => index < mintedNFTs.length && handleNFTClick(mintedNFTs[index])}
                    onMouseDown={(e) => {
                      if (index < mintedNFTs.length) {
                        e.currentTarget.style.transform = 'scale(0.95)';
                      }
                    }}
                    onMouseUp={(e) => {
                      if (index < mintedNFTs.length) {
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (index < mintedNFTs.length) {
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {index < mintedNFTs.length ? (
                      <div 
                        style={{ 
                          width: '250px', 
                          height: '250px', 
                          transform: 'scale(0.22)',
                          transformOrigin: 'center center',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          marginTop: '-125px',
                          marginLeft: '-125px'
                        }}
                        dangerouslySetInnerHTML={{ __html: mintedNFTs[index].svg }}
                      />
                    ) : (
                      <span style={{ 
                        color: '#9CA3AF', 
                        fontSize: '12px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
                      }}>• ᴗ •</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #BFDBFE 0%, #DDD6FE 100%)',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Top Bar */}
      <div style={{ 
        width: '100%', 
        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)', 
        padding: '8px 12px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-end',
        height: '48px',
        boxSizing: 'border-box'
      }}>
        <button
          onClick={handleProfileClick}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'none', 
            border: 'none', 
            borderRadius: '50%', 
            padding: '2px', 
            cursor: 'pointer' 
          }}
        >
          <div style={{ 
            width: '28px', 
            height: '28px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #60A5FA 0%, #A855F7 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white', 
            fontSize: '11px', 
            fontWeight: 'bold', 
            border: '2px solid white', 
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
          }}>
            {mockUser.displayName?.[0] || '?'}
          </div>
        </button>
      </div>

      {/* Main Content */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'flex-start', 
        height: 'calc(100% - 48px)', 
        padding: '12px 16px',
        paddingTop: '24px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '800', 
            marginBottom: '8px',
            margin: '0 0 8px 0',
            background: 'linear-gradient(45deg, #9333ea, #ec4899, #3b82f6, #10b981, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
          }}>Unikō</h1>
          <div style={{ 
            color: '#374151', 
            fontSize: '13px', 
            lineHeight: '1.4',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
            fontWeight: '600'
          }}>
            <p style={{ margin: '0 0 3px 0' }}>A cute on-chain companion</p>
            <p style={{ margin: '0 0 3px 0' }}>100% onchain generative project</p>
            <p style={{ margin: '0' }}>
              by{' '}
              <a 
                href="https://farcaster.xyz/miguelgarest.eth" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: '#374151', 
                  textDecoration: 'underline',
                  fontWeight: '600'
                }}
              >
                @miguelgarest.eth
              </a>
            </p>
          </div>
        </div>

        {/* NFT Card */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            width: '220px', 
            height: '220px', 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)', 
            border: '1px solid #E5E7EB', 
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div 
              style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              dangerouslySetInnerHTML={{ __html: displayNFT.svg }}
            />
            {displayNFT.isUltraRare && (
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '700'
              }}>
                ✨ ULTRA RARE ✨
              </div>
            )}
          </div>
        </div>

        {/* Mint Button */}
        <button
          onClick={handleMint}
          disabled={isMinting}
          style={{ 
            backgroundColor: isMinting ? '#60A5FA' : '#2563EB', 
            color: 'white', 
            fontWeight: '600', 
            padding: '12px 24px', 
            borderRadius: '8px', 
            border: 'none', 
            fontSize: '16px', 
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)', 
            cursor: isMinting ? 'not-allowed' : 'pointer',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
          }}
        >
          {isMinting ? "Minting..." : "Mint • 0.001 ETH"}
        </button>
      </div>
    </div>
  );
} 