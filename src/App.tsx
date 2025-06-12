import { useState, useEffect } from 'react';
import { generatePreviewNFT, generateUnikoNFT } from './config';

export default function App() {
  const [showCollection, setShowCollection] = useState(false);
  const [displayNFT, setDisplayNFT] = useState(() => generatePreviewNFT());
  const [isMinting, setIsMinting] = useState(false);
  const [mintedNFTs, setMintedNFTs] = useState<any[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<any | null>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  // Mock user data
  const mockUser = {
    fid: 12345,
    username: 'testuser',
    displayName: 'Test User',
    profileImageUrl: 'https://images.farcaster.xyz/profile_image?fid=12345'
  };

  // Initialize Frame SDK
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

  const mintUnikoNFT = () => {
    setIsMinting(true);
    
    setTimeout(() => {
      const newNFT = generateUnikoNFT();
      setMintedNFTs(prev => [...prev, newNFT]);
      setDisplayNFT(newNFT);
      setIsMinting(false);
    }, 2000);
  };

  const generateNewPreview = () => {
    setDisplayNFT(generatePreviewNFT());
  };

  // Show loading screen
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

  if (showCollection) {
    return (
      <>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #BFDBFE 0%, #DDD6FE 100%)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
        }}>
          {/* Top Bar */}
          <div style={{
            height: '56px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            <button
              onClick={() => setShowCollection(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                color: '#6B7280',
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              ← Back
            </button>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <img
                src={mockUser.profileImageUrl}
                alt="Profile"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                @{mockUser.username}
              </span>
            </div>
          </div>

          {/* Collection Content */}
          <div style={{ padding: '20px' }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '800',
                background: 'linear-gradient(45deg, #9333ea, #ec4899, #3b82f6, #10b981, #f59e0b)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: '0 0 8px 0'
              }}>
                Your Unikō Collection
              </h1>
              <p style={{
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.6)',
                margin: 0
              }}>
                {mintedNFTs.length} {mintedNFTs.length === 1 ? 'Unikō' : 'Unikōs'} collected
              </p>
            </div>

            {mintedNFTs.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  marginBottom: '24px',
                  maxWidth: '240px',
                  margin: '0 auto 24px auto'
                }}>
                  {Array.from({ length: 16 }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        aspectRatio: '1',
                        background: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        color: 'rgba(0, 0, 0, 0.4)'
                      }}
                    >
                      • ᴗ •
                    </div>
                  ))}
                </div>
                <p style={{
                  fontSize: '16px',
                  color: 'rgba(0, 0, 0, 0.6)',
                  margin: '0 0 16px 0'
                }}>
                  Your collection is empty
                </p>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(0, 0, 0, 0.5)',
                  margin: 0
                }}>
                  Mint your first Unikō to get started!
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '16px',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                {mintedNFTs.map((nft, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedNFT(nft)}
                    style={{
                      aspectRatio: '1',
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <div style={{
                      fontSize: '32px',
                      marginBottom: '8px'
                    }}>
                      {nft.face}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: '#6B7280',
                      textAlign: 'center'
                    }}>
                      #{nft.tokenId}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* NFT Detail Modal */}
        {selectedNFT && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
            onClick={() => setSelectedNFT(null)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                maxWidth: '300px',
                width: '100%',
                textAlign: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                fontSize: '64px',
                marginBottom: '16px'
              }}>
                {selectedNFT.face}
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: '0 0 8px 0'
              }}>
                Unikō #{selectedNFT.tokenId}
              </h3>
              <div style={{
                fontSize: '14px',
                color: '#6B7280',
                marginBottom: '16px'
              }}>
                <div>Rarity: {selectedNFT.rarity}</div>
                <div>Body: {selectedNFT.body}</div>
                <div>Eyes: {selectedNFT.eyes}</div>
                <div>Mouth: {selectedNFT.mouth}</div>
              </div>
              <button
                onClick={() => setSelectedNFT(null)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#6366F1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #BFDBFE 0%, #DDD6FE 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Top Bar */}
      <div style={{
        height: '56px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: '700',
          background: 'linear-gradient(45deg, #9333ea, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Unikō
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            onClick={() => setShowCollection(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              color: '#374151',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            Collection ({mintedNFTs.length})
          </button>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <img
              src={mockUser.profileImageUrl}
              alt="Profile"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              @{mockUser.username}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 56px)',
        padding: '20px',
        textAlign: 'center'
      }}>
        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            background: 'linear-gradient(45deg, #9333ea, #ec4899, #3b82f6, #10b981, #f59e0b)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 8px 0'
          }}>
            Unikō
          </h1>
          <div style={{ 
            color: 'rgba(0, 0, 0, 0.7)', 
            fontSize: '14px', 
            lineHeight: '1.4',
            fontWeight: '500'
          }}>
            <p style={{ margin: '0 0 2px 0' }}>Your cute onchain companions</p>
            <p style={{ margin: '0 0 2px 0' }}>generative project</p>
            <p style={{ margin: '0' }}>
              by{' '}
              <a 
                href="https://farcaster.xyz/miguelgarest.eth" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: 'rgba(0, 0, 0, 0.7)', 
                  textDecoration: 'underline',
                  fontWeight: '600'
                }}
              >
                @miguelgarest.eth
              </a>
            </p>
          </div>
        </div>

        {/* NFT Display */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '24px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          minWidth: '200px'
        }}>
          <div style={{
            fontSize: '72px',
            marginBottom: '16px',
            lineHeight: '1'
          }}>
            {displayNFT.face}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6B7280',
            marginBottom: '8px'
          }}>
            {displayNFT.isMinted ? `#${displayNFT.tokenId}` : 'Preview'}
          </div>
          {displayNFT.isMinted && (
            <div style={{
              fontSize: '10px',
              color: '#6B7280'
            }}>
              {displayNFT.rarity} • {displayNFT.body} • {displayNFT.eyes} • {displayNFT.mouth}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            onClick={generateNewPreview}
            disabled={isMinting}
            style={{
              padding: '12px 20px',
              background: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              cursor: isMinting ? 'not-allowed' : 'pointer',
              backdropFilter: 'blur(10px)',
              opacity: isMinting ? 0.5 : 1
            }}
          >
            🎲 Randomize
          </button>
          
          <button
            onClick={mintUnikoNFT}
            disabled={isMinting}
            style={{
              padding: '12px 20px',
              background: isMinting 
                ? 'rgba(156, 163, 175, 0.7)' 
                : 'linear-gradient(45deg, #8B5CF6, #EC4899)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isMinting ? 'not-allowed' : 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            {isMinting ? '⏳ Minting...' : '✨ Mint Unikō'}
          </button>
        </div>

        {/* Minted Success Message */}
        {mintedNFTs.length > 0 && displayNFT.isMinted && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '12px',
            color: '#065F46',
            backdropFilter: 'blur(10px)'
          }}>
            🎉 Unikō #{displayNFT.tokenId} minted successfully!
          </div>
        )}
      </div>
    </div>
  );
} 