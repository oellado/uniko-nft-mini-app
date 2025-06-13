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

  const [currentPage, setCurrentPage] = useState(1);
  const [hash, setHash] = useState<`0x${string}`>();
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [lastMintedTokenId, setLastMintedTokenId] = useState<number | null>(null);
  
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

  // Handle successful minting - fetch the actual minted NFT
  useEffect(() => {
    if (isSuccess && hash && !successHandled.current) {
      successHandled.current = true;
      setSuccessToast('NFT minted successfully! 🎉');
      
      // Fetch the newly minted NFT after a short delay
      setTimeout(async () => {
        await fetchLatestMintedNFT();
      }, 2000);
    }
  }, [isSuccess, hash]);

  // Auto-hide success toast after 3 seconds
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => {
        setSuccessToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Auto-hide error toast after 3 seconds
  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => {
        setErrorToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

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

  // Fetch user's NFTs when wallet connects or when balance/supply changes
  useEffect(() => {
    if (isConnected && address && balance !== undefined && totalSupply !== undefined) {
      fetchUserNFTs();
      
      // Also try again after a short delay to ensure we catch everything
      setTimeout(() => {
        fetchUserNFTs();
      }, 2000);
    } else if (!isConnected) {
      setMintedNFTs([]);
      // Always show preview NFT when disconnected
      setDisplayNFT(generatePreviewNFT());
      setLastMintedTokenId(null);
    }
  }, [isConnected, address, balance, totalSupply]);

  // Fetch the latest minted NFT (called after successful mint)
  const fetchLatestMintedNFT = async () => {
    if (!address || !totalSupply) return;
    
    try {
      const supply = Number(totalSupply);
      
      // Check the latest token to see if user owns it
      for (let tokenId = supply; tokenId >= 1; tokenId--) {
        try {
          const owner = await readContract(config, {
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'ownerOf',
            args: [BigInt(tokenId)]
          });
          
          if (owner.toLowerCase() === address.toLowerCase()) {
            // This is the user's latest NFT
            const nft = await fetchNFTData(tokenId);
            if (nft) {
              setDisplayNFT(nft);
              setLastMintedTokenId(tokenId);
              
              // Also refresh the full collection
              await fetchUserNFTs();
            }
            break;
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      console.error('Error fetching latest minted NFT:', error);
    }
  };

  // Helper function to fetch NFT data for a specific token ID
  const fetchNFTData = async (tokenId: number) => {
    try {
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
        
        // Decode base64 SVG with proper UTF-8 handling
        let svgContent = '';
        if (parsedMetadata.image && parsedMetadata.image.includes('data:image/svg+xml;base64,')) {
          const base64Data = parsedMetadata.image.replace('data:image/svg+xml;base64,', '');
          try {
            // Proper UTF-8 decoding for Unicode characters
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            svgContent = new TextDecoder('utf-8').decode(bytes);
          } catch (decodeError) {
            console.error(`Error decoding SVG for token ${tokenId}:`, decodeError);
            // Fallback: try simple atob
            try {
              svgContent = atob(base64Data);
            } catch {
              svgContent = parsedMetadata.image; // final fallback
            }
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
        
        return nft;
      } catch (parseError) {
        console.error(`Error parsing metadata for token ${tokenId}:`, parseError);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching NFT data for token ${tokenId}:`, error);
      return null;
    }
  };

  // Fetch user's NFTs from blockchain
  const fetchUserNFTs = async () => {
    if (!address || !balance || !totalSupply) {
      return;
    }
    
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
            const nft = await fetchNFTData(tokenId);
            if (nft) {
              userNFTs.push(nft);
            }
          }
        } catch (error) {
          // Token might not exist or other error, continue
          continue;
        }
      }
      
      // Sort NFTs by tokenId (newest first)
      userNFTs.sort((a, b) => b.tokenId - a.tokenId);
      
      setMintedNFTs(userNFTs);
      
      // If user has NFTs and we're not showing collection, show their newest one
      if (userNFTs.length > 0 && !showCollection && !lastMintedTokenId) {
        setDisplayNFT(userNFTs[0]);
      }
      
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      setErrorToast('Failed to load your NFTs');
    } finally {
      setIsLoadingNFTs(false);
    }
  };

  const handleMint = async () => {
    try {
      setHash(undefined);
      successHandled.current = false;

      if (!isConnected || !address) {
        connect({ connector: farcasterFrame() });
        return;
      }

      // Generate NFT with deterministic randomness based on user address and current time
      // This ensures the NFT is generated consistently but uniquely per mint
      const seed = `${address}-${Date.now()}-${Math.random()}`;
      const newNFT = generateUnikoNFT(seed);
      
      // Create complete metadata JSON string
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
      
      // Show small toast for user cancellation
      if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected') || errorMessage.includes('cancelled') || errorMessage.includes('canceled')) {
        setErrorToast('Transaction cancelled');
      } else {
        setErrorToast(`Mint failed: ${errorMessage}`);
      }
      
      setHash(undefined);
      successHandled.current = false;
    }
  };

  const handleViewCollection = () => {
    setShowCollection(true);
    // Immediately fetch NFTs when viewing collection
    if (isConnected && address) {
      fetchUserNFTs();
    }
  };

  const handleBackToMint = () => {
    setShowCollection(false);
    // Show the latest minted NFT if available, otherwise show preview
    if (lastMintedTokenId && mintedNFTs.length > 0) {
      const latestNFT = mintedNFTs.find(nft => nft.tokenId === lastMintedTokenId);
      if (latestNFT) {
        setDisplayNFT(latestNFT);
      } else if (mintedNFTs.length > 0) {
        setDisplayNFT(mintedNFTs[0]);
      } else {
        setDisplayNFT(generatePreviewNFT());
      }
    } else if (mintedNFTs.length > 0) {
      setDisplayNFT(mintedNFTs[0]);
    } else {
      setDisplayNFT(generatePreviewNFT());
    }
  };

  const handleNFTClick = (nft: any) => {
    setSelectedNFT(nft);
  };

  const handleCloseModal = () => {
    setSelectedNFT(null);
  };

  // Reset to preview when user disconnects
  const handleNewPreview = () => {
    if (!isConnected) {
      setDisplayNFT(generatePreviewNFT());
      setLastMintedTokenId(null);
    }
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
        setSuccessToast('Link copied to clipboard!');
      }).catch(() => {
        setErrorToast('Unable to share. Please copy the link manually.');
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
          
          {/* New Preview Button - only show when not connected and showing preview */}
          {!isConnected && displayNFT.type === 'Preview' && (
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <button
                onClick={handleNewPreview}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  color: '#374151',
                  fontWeight: '500',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                New Preview
              </button>
            </div>
          )}
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
        {isSuccess && (
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

      {/* Error Toast */}
      {errorToast && (
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#DC2626',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxWidth: '300px',
          textAlign: 'center',
          animation: 'slideInFromTop 0.3s ease-out'
        }}>
          {errorToast}
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#F3F4F6',
          border: '1px solid #E5E7EB',
          color: '#1F2937',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxWidth: '300px',
          textAlign: 'center',
          animation: 'slideInFromTop 0.3s ease-out'
        }}>
          {successToast}
        </div>
      )}

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
        
        @keyframes slideInFromTop {
          0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
} 