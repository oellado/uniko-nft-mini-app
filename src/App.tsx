import { useState, useEffect, useRef } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useBalance } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { CONTRACT_ABI, config } from './config';
import { config as wagmiConfig } from './wagmi';
import { parseEther, formatEther } from 'viem';
import { mintQueue } from './utils/mintQueue';
import { baseSepolia } from 'viem/chains';

import { sdk } from '@farcaster/frame-sdk';

const placeholderSVG = `
<svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="220" height="220" fill="white"/>
</svg>
`;

const defaultNFT = {
  name: 'Unikō',
  svg: placeholderSVG,
  svgDataUrl: `data:image/svg+xml;base64,${btoa(placeholderSVG)}`,
  isUltraRare: false,
  traits: {},
  tokenId: 0
};

export default function App() {
  // State variables
  const [showCollection, setShowCollection] = useState(false);
  const [displayNFT, setDisplayNFT] = useState(defaultNFT);
  const [mintedNFTs, setMintedNFTs] = useState<any[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<any | null>(null);
  const [selectedNFTIndex, setSelectedNFTIndex] = useState<number>(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [hash, setHash] = useState<`0x${string}`>();
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const [isLoadingMintedNFT, setIsLoadingMintedNFT] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [queueStatus, setQueueStatus] = useState({ queueLength: 0, processing: false, nextPosition: 1 });

  // Add reveal state tracking
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealProgress, setRevealProgress] = useState({ current: 0, total: 0 });
  const [lastMintQuantity, setLastMintQuantity] = useState(0);

  // Farcaster user context
  const [userPfp, setUserPfp] = useState<string | null>(null);
  const [pfpError, setPfpError] = useState(false);
  
  const itemsPerPage = 9;
  const mintButtonRef = useRef<HTMLButtonElement>(null);

  // Wagmi hooks
  const { isConnected, address } = useAccount();

  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  // Add balance checking with refetch capability
  const { data: ethBalance, refetch: refetchBalance } = useBalance({
    address: address,
    query: { enabled: !!address }
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isPending = isConfirming || isWriting;
  const successHandled = useRef(false);

  // Helper function to check if user has enough ETH
  const hasEnoughETH = (quantity: number) => {
    if (!ethBalance) return false;
    const requiredETH = parseEther((0.000001 * quantity).toString());
    const gasBuffer = parseEther('0.0005'); // Buffer for gas fees
    return ethBalance.value >= (requiredETH + gasBuffer);
  };

  // Helper function to get formatted balance
  const getFormattedBalance = () => {
    if (!ethBalance) return '0';
    return parseFloat(formatEther(ethBalance.value)).toFixed(4);
  };

  // Initialize Farcaster SDK and show add frame prompt
  useEffect(() => {
    const initSDK = async () => {
      try {
        await sdk.actions.ready();
        
        // Get user context and PFP
        const context = await sdk.context;
        if (context?.user) {
          // Set user PFP if available
          if (context.user.pfpUrl) {
            setUserPfp(context.user.pfpUrl);
          }
          
          // Show add frame prompt for new users
          if (!localStorage.getItem('uniko-frame-prompted')) {
            setTimeout(() => {
              sdk.actions.addFrame();
              localStorage.setItem('uniko-frame-prompted', 'true');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Failed to initialize SDK:', error);
      }
    };
    initSDK();
  }, []);

  // Handle successful minting
  useEffect(() => {
    if (isSuccess && hash && !successHandled.current) {
      successHandled.current = true;
      setSuccessToast('Minted successfully!');
      setIsLoadingMintedNFT(true);
      
      setTimeout(async () => {
        // Use sequential reveal for multiple NFTs, single fetch for single NFT
        await startSequentialReveal(lastMintQuantity);
        setIsLoadingMintedNFT(false);
        refetchSupply();
        if (refetchBalance) refetchBalance();
      }, 2000); // Wait 2 seconds for indexer to catch up
    }
  }, [isSuccess, hash, lastMintQuantity]);

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

  // Reset effect: Ensure app always starts with preview NFT
  useEffect(() => {
    // On app load, always show preview NFT
    setDisplayNFT(defaultNFT);
  }, []);

  // Update queue status periodically
  useEffect(() => {
    const updateQueueStatus = () => {
      const status = mintQueue.getQueueStatus();
      setQueueStatus(status);
    };

    // Update immediately
    updateQueueStatus();

    // Update every 2 seconds
    const interval = setInterval(updateQueueStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // Note: We fetch balance directly in functions to avoid dependency issues

  // Read total supply to know which tokens exist
  const { data: totalSupply, refetch: refetchSupply, error: totalSupplyError, isLoading: totalSupplyLoading } = useReadContract({
    address: config.address,
    abi: CONTRACT_ABI,
    functionName: 'totalSupply',
    chainId: baseSepolia.id,
  });

  // Debug logging for totalSupply
  console.log('🔍 TotalSupply Debug:', {
    totalSupply,
    totalSupplyError,
    totalSupplyLoading,
    contractAddress: config.address,
    chainId: baseSepolia.id,
    chainName: baseSepolia.name
  });

  // [DEBUG] Add comprehensive logging for startup state
  useEffect(() => {
    console.log('[Debug Startup State]', {
      isConnected: isConnected,
      address: address,
      totalSupply: totalSupply?.toString(),
      totalSupplyLoading: totalSupplyLoading,
      showCollection: showCollection
    });
  }, [isConnected, address, totalSupply, totalSupplyLoading, showCollection]);

  // Force refresh totalSupply every 5 seconds to ensure it updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetchSupply();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetchSupply]);

  // Clear NFT data when wallet disconnects (no automatic fetching)
  useEffect(() => {
    if (!isConnected) {
      setMintedNFTs([]);
      // Always show preview NFT when disconnected
      setDisplayNFT(defaultNFT);
    }
  }, [isConnected]);

  // Fetch latest minted NFT for display after minting
  const fetchSingleMintedNFT = async () => {
    if (!address) return;

    try {
      // Get user's current balance to determine the latest token
      const balance = await readContract(wagmiConfig, {
        address: config.address,
        abi: CONTRACT_ABI,
        functionName: 'balanceOf',
        args: [address],
        chainId: baseSepolia.id,
      });

      const userBalance = Number(balance);
      
      if (userBalance > 0) {
        // Get the most recent token (last index)
        const tokenIndex = userBalance - 1;
        
        const tokenId = await readContract(wagmiConfig, {
          address: config.address,
          abi: CONTRACT_ABI,
          functionName: 'tokenOfOwnerByIndex',
          args: [address, BigInt(tokenIndex)],
          chainId: baseSepolia.id,
        });

        // Get token metadata
        const tokenURI = await readContract(wagmiConfig, {
          address: config.address,
          abi: CONTRACT_ABI,
          functionName: 'tokenURI',
          args: [tokenId],
          chainId: baseSepolia.id,
        }) as string;

        // Parse metadata from base64 JSON
        if (tokenURI.startsWith('data:application/json;base64,')) {
          const base64Data = tokenURI.split(',')[1];
          const jsonString = decodeURIComponent(escape(atob(base64Data)));
          const metadata = JSON.parse(jsonString);
          
          // Extract SVG from image data URL
          let svg = '';
          if (metadata.image && metadata.image.startsWith('data:image/svg+xml;base64,')) {
            const svgBase64 = metadata.image.split(',')[1];
            svg = decodeURIComponent(escape(atob(svgBase64)));
          }

          const nftData = {
            tokenId: Number(tokenId),
            name: metadata.name || `Unikō #${tokenId}`,
            svg: svg,
            svgDataUrl: metadata.image || '',
            isUltraRare: false, // We'll check this separately if needed
            traits: metadata.attributes || {},
            metadata: metadata
          };

          // Update the display with the newly minted NFT
          setDisplayNFT(nftData);
        }
      } else {
        // No NFTs found for this user
        setDisplayNFT(defaultNFT);
      }
    } catch (error) {
      console.error('Error fetching latest minted NFT:', error);
      setErrorToast('Could not fetch your latest Unikō.');
    }
  };

  // Sequential reveal function that fetches NFTs one by one
  const startSequentialReveal = async (quantity: number) => {
    if (!address || quantity === 0) return;

    if (quantity <= 1) {
      // For single mints, use the same reliable method but without reveal UI
      await fetchSingleMintedNFT();
      return;
    }

    try {
      setIsRevealing(true);
      setRevealProgress({ current: 0, total: quantity });

      // Get user's current balance to determine starting token IDs
      const balance = await readContract(wagmiConfig, {
        address: config.address,
        abi: CONTRACT_ABI,
        functionName: 'balanceOf',
        args: [address],
        chainId: baseSepolia.id,
      });

      const userBalance = Number(balance);

      for (let i = 0; i < quantity; i++) {
        try {
          // Get token ID at index (userBalance - quantity + i)
          const tokenIndex = userBalance - quantity + i;
          
          const tokenId = await readContract(wagmiConfig, {
            address: config.address,
            abi: CONTRACT_ABI,
            functionName: 'tokenOfOwnerByIndex',
            args: [address, BigInt(tokenIndex)],
            chainId: baseSepolia.id,
          });

          // Get token metadata
          const tokenURI = await readContract(wagmiConfig, {
            address: config.address,
            abi: CONTRACT_ABI,
            functionName: 'tokenURI',
            args: [tokenId],
            chainId: baseSepolia.id,
          }) as string;

          // Parse metadata from base64 JSON
          if (tokenURI.startsWith('data:application/json;base64,')) {
            const base64Data = tokenURI.split(',')[1];
            const jsonString = decodeURIComponent(escape(atob(base64Data)));
            const metadata = JSON.parse(jsonString);
            
            // Extract SVG from image data URL
            let svg = '';
            if (metadata.image && metadata.image.startsWith('data:image/svg+xml;base64,')) {
              const svgBase64 = metadata.image.split(',')[1];
              svg = decodeURIComponent(escape(atob(svgBase64)));
            }

            const nftData = {
              tokenId: Number(tokenId),
              name: metadata.name || `Unikō #${tokenId}`,
              svg: svg,
              svgDataUrl: metadata.image || '',
              isUltraRare: false, // We'll check this separately if needed
              traits: metadata.attributes || {},
              metadata: metadata
            };

            setRevealProgress({ current: i + 1, total: quantity });
            
            // Update the display with the current NFT
            setDisplayNFT(nftData);

            // Add delay between reveals (except for the last one)
            if (i < quantity - 1) {
              await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay
            }
          }
        } catch (tokenError) {
          console.error(`Error fetching token at reveal index ${i}:`, tokenError);
        }
      }

      // Complete the reveal process
      setTimeout(() => {
        setIsRevealing(false);
        setRevealProgress({ current: 0, total: 0 });
      }, 2000); // Show final reveal for 2 seconds

    } catch (error) {
      console.error('Error during sequential reveal:', error);
      setIsRevealing(false);
      setRevealProgress({ current: 0, total: 0 });
      setErrorToast('Could not reveal your new Unikō NFTs.');
    }
  };

    // fetchNFTData function removed - incompatible with UnikoOnchain contract

  // Fetch user's NFTs with improved performance and error handling
  const fetchUserNFTs = async () => {
    if (!address) {
      setErrorToast("Please connect your wallet first.");
      return;
    }
    setIsLoadingNFTs(true);
    console.log(`[Debug Collection] Starting fetch for address: ${address}`);
    try {
      const balance = await readContract(wagmiConfig, {
        address: config.address,
        abi: CONTRACT_ABI,
        functionName: 'balanceOf',
        args: [address],
        chainId: baseSepolia.id,
      });

      const userBalance = Number(balance);
      console.log(`[Debug Collection] User balance: ${userBalance}`);
      
      if (userBalance === 0) {
        setMintedNFTs([]);
        setIsLoadingNFTs(false);
        console.log('[Debug Collection] No NFTs found for this user.');
        return;
      }
      
      const tokenPromises: Promise<any>[] = [];

      for (let i = 0; i < userBalance; i++) {
        tokenPromises.push(
          (async () => {
            try {
              const tokenId = await readContract(wagmiConfig, {
                address: config.address,
                abi: CONTRACT_ABI,
                functionName: 'tokenOfOwnerByIndex',
                args: [address, BigInt(i)],
                chainId: baseSepolia.id,
              });
              console.log(`[Debug Collection] Fetched tokenId: ${tokenId} for index ${i}`);

              const tokenURI = await readContract(wagmiConfig, {
                address: config.address,
                abi: CONTRACT_ABI,
                functionName: 'tokenURI',
                args: [tokenId],
                chainId: baseSepolia.id,
              }) as string;

              if (tokenURI) {
                const base64Data = tokenURI.split(',')[1];
                const jsonString = decodeURIComponent(escape(atob(base64Data)));
                const metadata = JSON.parse(jsonString);

                let svg = '';
                if (metadata.image && metadata.image.startsWith('data:image/svg+xml;base64,')) {
                    const svgBase64 = metadata.image.split(',')[1];
                    svg = decodeURIComponent(escape(atob(svgBase64)));
                }

                return {
                  tokenId: Number(tokenId),
                  name: metadata.name || `Unikō #${tokenId}`,
                  svg: svg,
                  svgDataUrl: metadata.image || '',
                  isUltraRare: false,
                  traits: metadata.attributes || {},
                };
              }
            } catch (e) {
              console.error(`[Debug Collection] Failed to fetch token at index ${i}:`, e);
              // Return null or a placeholder for the failed token
              return null;
            }
          })()
        );
      }

      const settledNFTs = await Promise.all(tokenPromises);
      // Filter out any nulls from failed fetches
      const validNFTs: any[] = settledNFTs.filter(nft => nft !== null);

      console.log(`[Debug Collection] Successfully fetched ${validNFTs.length}/${userBalance} NFTs.`);

      // Sort NFTs by tokenId in descending order (newest first)
      validNFTs.sort((a, b) => b.tokenId - a.tokenId);
      
      setMintedNFTs(validNFTs);

    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      setErrorToast('There was an error fetching your collection.');
    } finally {
      // Ensure loading is always stopped
      setIsLoadingNFTs(false);
      console.log('[Debug Collection] Fetch process finished.');
    }
  };

  const handleMint = async (quantity: number) => {
    if (!isConnected || !address) {
      setErrorToast('Please connect your wallet first.');
      return;
    }

    if (!hasEnoughETH(quantity)) {
        setErrorToast("You don't have enough ETH for this transaction.");
        return;
    }

    try {
      setHash(undefined);
      successHandled.current = false;
      
      // Reset any previous reveal state
      setIsRevealing(false);
      setRevealProgress({ current: 0, total: 0 });
      
      // Track the quantity being minted for reveal process
      setLastMintQuantity(quantity);

      const mintPrice = await readContract(wagmiConfig, {
        address: config.address,
        abi: CONTRACT_ABI,
        functionName: 'MINT_PRICE',
        chainId: baseSepolia.id,
      }) as bigint;

      const txHash = await writeContractAsync({
        address: config.address,
        abi: CONTRACT_ABI,
        functionName: 'mint',
        args: [BigInt(quantity)],
        value: mintPrice * BigInt(quantity),
        chainId: baseSepolia.id,
      });
      setHash(txHash);
      setSuccessToast('Mint transaction sent!');
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.shortMessage || 'An unknown error occurred during minting.';
      setErrorToast(errorMessage);
    }
  };

  const handleViewCollection = async () => {
    if (!address) {
      setErrorToast('Please connect your wallet to view your collection.');
      return;
    }

    // Haptic feedback for button press
    try {
      await sdk.haptics.impactOccurred('light');
    } catch (error) {
      // Haptics not supported, continue silently
    }

    // Switch to collection view and fetch NFTs (will handle empty collection inside fetchUserNFTs)
    setShowCollection(true);
    await fetchUserNFTs();
  };

  const handleBackToMint = () => {
    setShowCollection(false);
    setSelectedNFT(null);
    setCurrentPage(1);
    
    // Reset reveal state
    setIsRevealing(false);
    setRevealProgress({ current: 0, total: 0 });
    
    // ALWAYS reset to basic preview when returning to main screen
    setDisplayNFT(defaultNFT);
  };

  const handleNFTClick = async (nft: any) => {
    // Haptic feedback for grid tap
    try {
      await sdk.haptics.impactOccurred('light');
    } catch (error) {
      // Haptics not supported, continue silently
    }

    const index = mintedNFTs.findIndex(n => n.tokenId === nft.tokenId);
    setSelectedNFT(nft);
    setSelectedNFTIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedNFT(null);
    setSelectedNFTIndex(0);
  };

  // Navigation functions for NFT modal
  const handlePrevNFT = async () => {
    if (mintedNFTs.length === 0) return;
    
    // Haptic feedback for arrow tap
    try {
      await sdk.haptics.impactOccurred('light');
    } catch (error) {
      // Haptics not supported, continue silently
    }

    const prevIndex = selectedNFTIndex > 0 ? selectedNFTIndex - 1 : mintedNFTs.length - 1;
    setSelectedNFTIndex(prevIndex);
    setSelectedNFT(mintedNFTs[prevIndex]);
  };

  const handleNextNFT = async () => {
    if (mintedNFTs.length === 0) return;
    
    // Haptic feedback for arrow tap
    try {
      await sdk.haptics.impactOccurred('light');
    } catch (error) {
      // Haptics not supported, continue silently
    }

    const nextIndex = selectedNFTIndex < mintedNFTs.length - 1 ? selectedNFTIndex + 1 : 0;
    setSelectedNFTIndex(nextIndex);
    setSelectedNFT(mintedNFTs[nextIndex]);
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
    // Haptic feedback for button press
    try {
      await sdk.haptics.impactOccurred('light');
    } catch (error) {
      // Haptics not supported, continue silently
    }

    try {
      if (sdk && sdk.actions && sdk.actions.openUrl) {
        const shareText = "Mint Unikō, your onchain companions";
        const appUrl = "https://farcaster.xyz/miniapps/14yt1rZKE3h6/unik";
        const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(appUrl)}`;
        await sdk.actions.openUrl(shareUrl);
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback: copy to clipboard
      const shareText = "Mint Unikō, your onchain companions https://farcaster.xyz/miniapps/14yt1rZKE3h6/unik";
      navigator.clipboard.writeText(shareText).then(() => {
        setSuccessToast('Link copied to clipboard!');
      }).catch(() => {
        setErrorToast('Unable to share. Please copy the link manually.');
      });
    }
  };

  // Keyboard navigation for NFT modal
  useEffect(() => {
    if (!selectedNFT) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevNFT();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextNFT();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedNFT, selectedNFTIndex, mintedNFTs]);

  // Touch swipe support for NFT modal
  useEffect(() => {
    if (!selectedNFT) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !startY) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const diffX = startX - endX;
      const diffY = startY - endY;

      // Only trigger swipe if horizontal movement is greater than vertical
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Swiped left - go to next NFT
          handleNextNFT();
        } else {
          // Swiped right - go to previous NFT
          handlePrevNFT();
        }
      }

      startX = 0;
      startY = 0;
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [selectedNFT, selectedNFTIndex, mintedNFTs]);

  // [REVERTED] Simple loading guard to prevent startup "blink" 
  if (totalSupplyLoading && !totalSupply) {
    return (
      <div className="flex items-center justify-center w-full min-h-screen bg-[#1A1A1A] text-white">
        <div className="text-2xl font-medium">Loading Unikō...</div>
      </div>
    );
  }

  if (showCollection) {
    return (
      <>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        
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


              <div style={{ textAlign: 'center' }}>
                {/* Token Number Display */}
                <div style={{
                  marginBottom: '8px',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
                }}>
                  #{selectedNFT.tokenId}
                </div>

                <div 
                  style={{
                    width: '280px',
                    height: '280px',
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
                </div>


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
            
            {/* Profile Picture in Collection */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              borderRadius: '50%', 
              padding: '2px'
            }}>
              {userPfp && !pfpError ? (
                <img 
                  src={userPfp} 
                  alt="Profile"
                  onError={() => setPfpError(true)}
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
                  ?
                </div>
              )}
            </div>
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
                }}>Fetching your Unikō...</p>
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

                {/* 3x3 Grid - Empty - CONSISTENT */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  width: '340px',
                  height: '340px'
                }}>
                  {Array.from({ length: 9 }).map((_, index) => (
                    <div key={index} style={{ 
                      width: '108px', 
                      height: '108px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.5)', 
                      borderRadius: '12px', 
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

                {/* 3x3 Grid - With NFTs - LARGER */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  width: '340px',
                  height: '340px',
                  marginBottom: showPagination ? '16px' : '0'
                }}>
                  {Array.from({ length: 9 }).map((_, index) => {
                    const hasNFT = index < currentPageNFTs.length;
                    const nft = hasNFT ? currentPageNFTs[index] : null;
                    return (
                      <div 
                        key={index} 
                        style={{ 
                          width: '108px',
                          height: '108px',
                          backgroundColor: hasNFT ? 'transparent' : 'rgba(255, 255, 255, 0.5)', 
                          borderRadius: '12px',
                          border: hasNFT ? 'none' : '1px solid #D1D5DB', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          overflow: 'hidden',
                          position: 'relative',
                          cursor: hasNFT ? 'pointer' : 'default',
                          transition: 'transform 0.1s ease',
                        }}
                        onClick={() => hasNFT && handleNFTClick(nft)}
                      >
                        {hasNFT ? (
                          <img 
                            src={nft.svgDataUrl} 
                            alt={nft.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
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
                    marginTop: '20px',
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
      </>
    );
  }

  return (
    <div className={`w-full min-h-screen font-sans text-white bg-[#1A1A1A] transition-colors duration-300 ${showCollection ? 'bg-black' : 'bg-[#1A1A1A]'}`}>
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
        {/* Mint Counter */}
        <div style={{
          color: '#374151',
          fontSize: '13px',
          fontWeight: '600',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
          opacity: 0.8
        }}>
          {totalSupplyLoading ? '•••' : totalSupply !== undefined ? `${Number(totalSupply)}/10,000 minted` : 'Loading...'}
        </div>
        
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
          {userPfp && !pfpError ? (
            <img 
              src={userPfp} 
              alt="Profile"
              onError={() => setPfpError(true)}
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
              ?
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
            background: 'linear-gradient(45deg, #9333ea, #ec4899, #3b82f6, #10b981, #f59e0b)',
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
            <p style={{ margin: '0 0 3px 0' }}>your cute onchain companions</p>
            <p style={{ margin: '0 0 3px 0' }}>a generative project</p>
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
          </div>
          
          {/* Inline Success Message */}
          {successToast && (
            <div style={{
              textAlign: 'center',
              marginTop: '8px',
              color: '#059669',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
            }}>
              {successToast}
              {queueStatus.queueLength > 0 && (
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                  Queue: {queueStatus.queueLength} waiting
                </div>
              )}
            </div>
          )}
          
          {/* Loading Spinner for Minted NFT */}
          {isLoadingMintedNFT && !isRevealing && (
            <div style={{
              textAlign: 'center',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #E5E7EB',
                borderTop: '2px solid #2563EB',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span style={{
                color: '#6B7280',
                fontSize: '12px',
                fontWeight: '500',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
              }}>
                Loading your NFT...
              </span>
            </div>
          )}
          
          {/* Reveal Progress */}
          {isRevealing && revealProgress.total > 1 && (
            <div style={{
              textAlign: 'center',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #E5E7EB',
                borderTop: '2px solid #10B981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span style={{
                color: '#10B981',
                fontSize: '12px',
                fontWeight: '600',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
              }}>
                {revealProgress.current} of {revealProgress.total} NFT{revealProgress.total > 1 ? 's' : ''} revealed
              </span>
            </div>
          )}
        </div>

        {/* Mint Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '8px',
          justifyContent: 'center'
        }}>
          <button
            ref={mintButtonRef}
            onClick={() => handleMint(1)}
            disabled={isPending || (isConnected && !hasEnoughETH(1))}
            style={{ 
              backgroundColor: isPending ? '#9CA3AF' : (isConnected && !hasEnoughETH(1)) ? '#9CA3AF' : '#000000', 
              color: 'white', 
              fontWeight: '600', 
              padding: '8px', 
              borderRadius: '8px', 
              border: 'none',
              fontSize: '12px', 
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)', 
              cursor: (isPending || (isConnected && !hasEnoughETH(1))) ? 'not-allowed' : 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              width: '65px',
              height: '65px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1.2',
              opacity: (isPending || (isConnected && !hasEnoughETH(1))) ? 0.6 : 1
            }}
          >
            {isPending ? (
              <div style={{ fontSize: '9px', textAlign: 'center' }}>
                Minting...
              </div>
            ) : (isConnected && !hasEnoughETH(1)) ? (
              <div style={{ fontSize: '9px', textAlign: 'center' }}>
                Need more ETH
              </div>
            ) : (
              <>
                <div>Mint</div>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>x1</div>
                <div style={{ fontSize: '8px', opacity: '0.9' }}>0.000001 ETH</div>
              </>
            )}
          </button>
          
          <button
            onClick={() => handleMint(3)}
            disabled={isPending || (isConnected && !hasEnoughETH(3))}
            style={{ 
              backgroundColor: isPending ? '#9CA3AF' : (isConnected && !hasEnoughETH(3)) ? '#9CA3AF' : '#000000', 
              color: 'white', 
              fontWeight: '600', 
              padding: '8px', 
              borderRadius: '8px', 
              border: 'none',
              fontSize: '12px', 
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)', 
              cursor: (isPending || (isConnected && !hasEnoughETH(3))) ? 'not-allowed' : 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              width: '65px',
              height: '65px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1.2',
              opacity: (isPending || (isConnected && !hasEnoughETH(3))) ? 0.6 : 1
            }}
          >
            {isPending ? (
              <div style={{ fontSize: '9px', textAlign: 'center' }}>
                Minting...
              </div>
            ) : (isConnected && !hasEnoughETH(3)) ? (
              <div style={{ fontSize: '9px', textAlign: 'center' }}>
                Need more ETH
              </div>
            ) : (
              <>
                <div>Mint</div>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>x3</div>
                <div style={{ fontSize: '8px', opacity: '0.9' }}>0.000003 ETH</div>
              </>
            )}
          </button>
          
          <button
            onClick={() => handleMint(6)}
            disabled={isPending || (isConnected && !hasEnoughETH(6))}
            style={{ 
              backgroundColor: isPending ? '#9CA3AF' : (isConnected && !hasEnoughETH(6)) ? '#9CA3AF' : '#000000', 
              color: 'white', 
              fontWeight: '600', 
              padding: '8px', 
              borderRadius: '8px', 
              border: 'none',
              fontSize: '12px', 
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)', 
              cursor: (isPending || (isConnected && !hasEnoughETH(6))) ? 'not-allowed' : 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              width: '65px',
              height: '65px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1.2',
              opacity: (isPending || (isConnected && !hasEnoughETH(6))) ? 0.6 : 1
            }}
          >
            {isPending ? (
              <div style={{ fontSize: '9px', textAlign: 'center' }}>
                Minting...
              </div>
            ) : (isConnected && !hasEnoughETH(6)) ? (
              <div style={{ fontSize: '9px', textAlign: 'center' }}>
                Need more ETH
              </div>
            ) : (
              <>
                <div>Mint</div>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>x6</div>
                <div style={{ fontSize: '8px', opacity: '0.9' }}>0.000006 ETH</div>
              </>
            )}
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          style={{ 
            backgroundColor: '#1E40AF', 
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

        {/* Collection Button */}
        <button
          onClick={handleViewCollection}
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
          Collection
        </button>

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

        {/* Balance Display */}
        {isConnected && address && ethBalance && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#6B7280',
            fontSize: '11px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
            textAlign: 'center'
          }}>
            <div>Balance: {getFormattedBalance()} ETH</div>
            {!hasEnoughETH(1) && (
              <div style={{ color: '#DC2626', marginTop: '2px' }}>
                ⚠️ Insufficient funds for minting
              </div>
            )}
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