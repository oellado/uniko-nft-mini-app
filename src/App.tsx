import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { generatePreviewNFT, generateUnikoNFT } from './config';

export default function App() {
  const [showCollection, setShowCollection] = useState(false);
  const [displayNFT, setDisplayNFT] = useState(() => generatePreviewNFT());
  const [isMinting, setIsMinting] = useState(false);
  const [mintedNFTs, setMintedNFTs] = useState<any[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<any | null>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

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

  // Auto-connect to Farcaster wallet if available
  useEffect(() => {
    if (isSDKLoaded && !isConnected && connectors.length > 0) {
      const farcasterConnector = connectors.find(c => c.id === 'farcasterFrame');
      if (farcasterConnector) {
        connect({ connector: farcasterConnector });
      }
    }
  }, [isSDKLoaded, isConnected, connectors, connect]);

  // Mock user data - use wallet address if connected
  const mockUser = {
    fid: 12345,
    username: 'testuser',
    displayName: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Test User',
    pfpUrl: 'https://i.imgur.com/placeholder.jpg'
  };

  const handleMint = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    setIsMinting(true);
    setShowSuccess(false);
    
    // Simulate minting process
    setTimeout(() => {
      const newNFT = generateUnikoNFT(`seed-${Date.now()}-${Math.random()}`);
      setMintedNFTs(prev => [...prev, newNFT]);
      setDisplayNFT(newNFT);
      setIsMinting(false);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2000);
  };

  const handleProfileClick = () => {
    setShowCollection(true);
    setCurrentPage(1);
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

  // Pagination logic
  const totalPages = Math.ceil(mintedNFTs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageNFTs = mintedNFTs.slice(startIndex, endIndex);
  const showPagination = mintedNFTs.length > itemsPerPage;

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

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
                }}>{mintedNFTs.length} Unikō collected</p>
              </div>

              {/* 4x4 Grid - With NFTs */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '8px', 
                width: '240px',
                height: '240px',
                marginBottom: showPagination ? '16px' : '0'
              }}>
                {Array.from({ length: 16 }).map((_, index) => {
                  const hasNFT = index < currentPageNFTs.length;
                  return (
                    <div 
                      key={index} 
                      style={{ 
                        width: '56px', 
                        height: '56px', 
                        backgroundColor: hasNFT ? 'white' : 'rgba(255, 255, 255, 0.5)', 
                        borderRadius: '6px', 
                        border: '1px solid #D1D5DB', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: hasNFT ? 'pointer' : 'default',
                        transition: 'transform 0.1s ease',
                      }}
                      onClick={() => hasNFT && handleNFTClick(currentPageNFTs[index])}
                      onMouseDown={(e) => {
                        if (hasNFT) {
                          e.currentTarget.style.transform = 'scale(0.95)';
                        }
                      }}
                      onMouseUp={(e) => {
                        if (hasNFT) {
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (hasNFT) {
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      {hasNFT ? (
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
                          dangerouslySetInnerHTML={{ __html: currentPageNFTs[index].svg }}
                        />
                      ) : (
                        <span style={{ 
                          color: '#9CA3AF', 
                          fontSize: '12px',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
                        }}>• ᴗ •</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {showPagination && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
                }}>
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: currentPage === 1 ? 'rgba(255, 255, 255, 0.5)' : 'white',
                      color: currentPage === 1 ? '#9CA3AF' : '#374151',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Previous
                  </button>
                  
                  <span style={{
                    fontSize: '14px',
                    color: '#4B5563',
                    fontWeight: '500'
                  }}>
                    {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: currentPage === totalPages ? 'rgba(255, 255, 255, 0.5)' : 'white',
                      color: currentPage === totalPages ? '#9CA3AF' : '#374151',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
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
        {/* Title with Animated Gradient */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '800', 
            marginBottom: '8px',
            margin: '0 0 8px 0',
            background: 'linear-gradient(45deg, #9333ea, #ec4899, #3b82f6, #10b981, #f59e0b, #9333ea)',
            backgroundSize: '300% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradientShift 3s ease-in-out infinite',
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
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
            marginBottom: '8px'
          }}
        >
          {isMinting ? "Minting..." : "Mint • 0.001 ETH"}
        </button>

        {/* Success Message */}
        {showSuccess && (
          <div style={{
            color: '#059669',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
            textAlign: 'center',
            animation: 'fadeInOut 3s ease-in-out'
          }}>
            ✨ Successfully minted!
          </div>
        )}

        {/* Wallet Connection Status */}
        {!isConnected && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#6B7280',
            fontSize: '12px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
          }}>
            Connect wallet to mint
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
} 