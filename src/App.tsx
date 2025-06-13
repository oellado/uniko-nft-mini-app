import { useState, useEffect, useRef } from 'react';
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { generatePreviewNFT, generateUnikoNFT, CONTRACT_ABI, CONTRACT_ADDRESS } from './config';
import { config } from './wagmi';
import { parseEther } from 'viem';
import { farcasterFrame } from '@farcaster/frame-wagmi-connector';
import { sdk } from '@farcaster/frame-sdk';

export default function App() {
  // State variables
  const [showCollection, setShowCollection] = useState(false);
  const [displayNFT, setDisplayNFT] = useState(() => generatePreviewNFT());
  const [mintedNFTs, setMintedNFTs] = useState<any[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<any | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hash, setHash] = useState<`0x${string}`>();
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  
  const itemsPerPage = 16;
  const mintButtonRef = useRef<HTMLButtonElement>(null);

  // Wagmi hooks
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isPending = isWriting || isConfirming;
  const successHandled = useRef(false);

  // Initialize Farcaster SDK and show add frame prompt
  useEffect(() => {
    const initSDK = async () => {
      try {
        await sdk.actions.ready();
        
        // Show add frame prompt for new users
        const context = await sdk.context;
        if (context?.user && !localStorage.getItem('uniko-frame-prompted')) {
          setTimeout(() => {
            sdk.actions.addFrame();
            localStorage.setItem('uniko-frame-prompted', 'true');
          }, 2000);
        }
      } catch (error) {
        console.error('Failed to initialize SDK:', error);
      }
    };
    initSDK();
  }, []);

  // Fetch user's NFTs when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      fetchUserNFTs();
    } else {
      setMintedNFTs([]);
    }
  }, [isConnected, address]);

  // Read user's NFT balance
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Read total supply to know which tokens exist
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalSupply',
    query: { enabled: true }
  });

  // Fetch user's NFTs from blockchain
  const fetchUserNFTs = async () => {
    if (!address || !balance || !totalSupply) return;
    
    setIsLoadingNFTs(true);
    try {
      const userNFTs = [];
      const supply = Number(totalSupply);
      
      // Check each token to see if user owns it
      for (let tokenId = 1; tokenId <= supply; tokenId++) {
        try {
          // Check if user owns this token
          const owner = await readContract(config, {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'ownerOf',
            args: [BigInt(tokenId)]
          });
          
          if (owner.toLowerCase() === address.toLowerCase()) {
            // Get metadata for this token
            const metadata = await readContract(config, {
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'getTokenMetadata',
              args: [BigInt(tokenId)]
            });
            
            const isUltraRare = await readContract(config, {
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'isUltraRare',
              args: [BigInt(tokenId)]
            });
            
                          // Parse metadata and create NFT object
              try {
                const parsedMetadata = JSON.parse(metadata);
                
                // Decode base64 SVG
                let svgContent = '';
                if (parsedMetadata.image && parsedMetadata.image.includes('data:image/svg+xml;base64,')) {
                  const base64Data = parsedMetadata.image.replace('data:image/svg+xml;base64,', '');
                  try {
                    svgContent = atob(base64Data);
                  } catch (decodeError) {
                    console.error(`Error decoding SVG for token ${tokenId}:`, decodeError);
                    svgContent = parsedMetadata.image; // fallback to original
                  }
                } else {
                  svgContent = parsedMetadata.image || '';
                }
                
                const nft = {
                  tokenId,
                  name: parsedMetadata.name,
                  svg: svgContent,
                  isUltraRare,
                  traits: {} as Record<string, any>
                };
                
                // Extract traits from attributes
                if (parsedMetadata.attributes) {
                  parsedMetadata.attributes.forEach((attr: any) => {
                    const traitKey = attr.trait_type.toLowerCase().replace(/\s+/g, '');
                    nft.traits[traitKey] = attr.value;
                  });
                }
                
                userNFTs.push(nft);
              } catch (parseError) {
                console.error(`Error parsing metadata for token ${tokenId}:`, parseError);
              }
          }
        } catch (error) {
          // Token might not exist or other error, continue
          continue;
        }
      }
      
      setMintedNFTs(userNFTs);
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
    } finally {
      setIsLoadingNFTs(false);
    }
  };

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && !successHandled.current) {
      successHandled.current = true;
      
      // Generate NFT for display
      const newNFT = generateUnikoNFT(`seed-${Date.now()}-${Math.random()}`);
      setMintedNFTs(prev => [...prev, newNFT]);
      setDisplayNFT(newNFT);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Refresh user's NFTs after successful mint
      setTimeout(() => fetchUserNFTs(), 5000);
      
      setHash(undefined);
      successHandled.current = false;
    }
  }, [isSuccess]);

  const handleMint = async () => {
    try {
      setHash(undefined);
      successHandled.current = false;

      if (!isConnected || !address) {
        connect({ connector: farcasterFrame() });
        return;
      }

      // Generate NFT metadata
      const newNFT = generateUnikoNFT(`seed-${Date.now()}-${Math.random()}`);
      
      // Create metadata JSON string
      const metadata = JSON.stringify({
        name: newNFT.name,
        description: "A cute on-chain companion, 100% on-chain generative Unicode NFT",
        image: `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(newNFT.svg)))}`,
        attributes: [
          { trait_type: "Eyes", value: newNFT.traits.eyes },
          { trait_type: "Mouth", value: newNFT.traits.mouth },
          { trait_type: "Left Cheek", value: newNFT.traits.leftCheek },
          { trait_type: "Right Cheek", value: newNFT.traits.rightCheek },
          { trait_type: "Accessory", value: newNFT.traits.accessory },
          { trait_type: "Background", value: newNFT.traits.background },
          { trait_type: "Face Color", value: newNFT.traits.face },
          { trait_type: "Rarity", value: newNFT.isUltraRare ? "Ultra Rare" : "Regular" }
        ]
      });

      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'mint',
        args: [address, metadata],
        value: parseEther('0.001'), // 0.001 ETH
      });

      setHash(txHash);
    } catch (error) {
      console.error('Mint failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Mint failed: ${errorMessage}`);
      setHash(undefined);
      successHandled.current = false;
    }
  };

  const handleViewCollection = () => {
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

  const handleShare = async () => {
    try {
      if (sdk && sdk.actions && sdk.actions.openUrl) {
        const shareText = "Mint your Unikō onchain companions!";
        const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(window.location.href)}`;
        await sdk.actions.openUrl(shareUrl);
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback: copy to clipboard
      const shareText = "Mint your Unikō onchain companions! " + window.location.href;
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {
        alert('Unable to share. Please copy the link manually.');
      });
    }
  };

  // Remove loading screen - let the app show even when not connected

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
          {isLoadingNFTs ? (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1F2937', 
                marginBottom: '6px', 
                margin: '0 0 6px 0',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
              }}>Loading Collection...</h2>
              <p style={{ 
                color: '#4B5563', 
                fontSize: '14px', 
                margin: '0',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
              }}>Fetching your Unikō NFTs from the blockchain...</p>
            </div>
          ) : mintedNFTs.length === 0 ? (
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
          onClick={handleViewCollection}
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
          {displayNFT.pfpUrl && displayNFT.pfpUrl !== 'https://i.imgur.com/placeholder.jpg' ? (
            <img 
              src={displayNFT.pfpUrl} 
              alt="Profile"
              style={{ 
                width: '28px', 
                height: '28px', 
                borderRadius: '50%', 
                border: '2px solid white', 
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                objectFit: 'cover'
              }}
            />
          ) : (
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
              {displayNFT.displayName?.[0] || '?'}
            </div>
          )}
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
          ref={mintButtonRef}
          onMouseDown={handleMint}
          onTouchStart={handleMint}
          onClick={handleMint}
          disabled={isPending}
          style={{ 
            backgroundColor: isPending ? '#60A5FA' : '#2563EB', 
            color: 'white', 
            fontWeight: '600', 
            padding: '12px 24px', 
            borderRadius: '8px', 
            border: 'none',
            fontSize: '16px', 
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)', 
            cursor: isPending ? 'not-allowed' : 'pointer',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
            marginBottom: '8px',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          {isPending ? "Minting..." : "Mint • 0.001 ETH"}
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          style={{ 
            backgroundColor: '#60A5FA', 
            color: 'white', 
            fontWeight: '600', 
            padding: '12px 24px', 
            borderRadius: '8px', 
            border: 'none',
            fontSize: '16px', 
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)', 
            cursor: 'pointer',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
            marginBottom: '8px',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            justifyContent: 'center'
          }}
        >
          Share
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
            •ᴗ• Successfully minted!
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