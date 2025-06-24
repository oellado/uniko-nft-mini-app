import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useBalance } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { CONTRACT_ABI, config } from './config';
import { config as wagmiConfig } from './wagmi';
import { parseEther, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import { sdk } from '@farcaster/frame-sdk';

// Simple placeholder SVG - transparent/blank to avoid glitchy transitions
const placeholderSVG = `<svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="220" height="220" fill="transparent"/></svg>`;

const defaultNFT = {
  name: 'Unikō',
  svg: placeholderSVG,
  svgDataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(placeholderSVG)}`,
  isUltraRare: false,
  traits: {},
  tokenId: 0
};

export default function App() {
  // State management
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
  const [userPfp, setUserPfp] = useState<string | null>(null);
  const [pfpError, setPfpError] = useState(false);
  const [isFrameReady, setIsFrameReady] = useState(false);
  
  // Add reveal state tracking
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealProgress, setRevealProgress] = useState({ current: 0, total: 0 });
  const [lastMintQuantity, setLastMintQuantity] = useState(0);
  
  // Add state to control whether to show GIF or actual NFT
  const [showGif, setShowGif] = useState(true);
  
  // Add state for disclaimer modal
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Add state to prevent race conditions and duplicate mints
  const [isMintInProgress, setIsMintInProgress] = useState(false);

  // Wagmi hooks for blockchain interaction
  const { isConnected, address } = useAccount();
  const { writeContractAsync, isPending: isWriting, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isConfirmError } = useWaitForTransactionReceipt({ hash });

  // Contract data fetching
  const { data: totalSupply, refetch: refetchSupply, isLoading: totalSupplyLoading } = useReadContract({
    address: config.contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: isFrameReady,
      refetchInterval: 30000,
      staleTime: 15000
    }
  });

  // Balance checking
  const { data: ethBalance, refetch: refetchBalance } = useBalance({
    address: address,
    query: { 
      enabled: !!address && isFrameReady,
      refetchInterval: 10000
    }
  });

  // Dynamic price fetching from contract
  const { data: currentPrice } = useReadContract({
    address: config.contractAddress,
    abi: CONTRACT_ABI,
    functionName: 'getCurrentPrice',
    query: {
      enabled: isFrameReady,
      refetchInterval: 10000,
      staleTime: 5000
    }
  });

  const isPending = isConfirming || isWriting;

  // Helper functions
  const hasEnoughETH = (quantity: number) => {
    if (!ethBalance || !currentPrice) return false;
    const requiredETH = (currentPrice as bigint) * BigInt(quantity);
    // Increased gas buffer for complex onchain generation: ~$0.05 USD at current ETH prices
    // This covers gas spikes and the contract's 100-attempt trait generation loop
    const gasBuffer = parseEther('0.000015'); // ~$0.05 USD buffer for gas costs
    return ethBalance.value >= (requiredETH + gasBuffer);
  };
  
  const getFormattedBalance = () => {
    if (!ethBalance) return '0';
    return parseFloat(formatEther(ethBalance.value)).toFixed(4);
  };

  // Safe base64 decode function
  const safeBase64Decode = (str: string): string => {
    try {
      return decodeURIComponent(escape(atob(str)));
    } catch (error) {
      console.error('Base64 decode error:', error);
      return '';
    }
  };

  // SDK initialization
  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        // 1. Check if we are in a Farcaster Mini App environment
        let inMiniApp = false;
        try {
          // Race against a 1-second timeout to prevent indefinite hanging
          inMiniApp = await Promise.race([
            sdk.isInMiniApp(),
            new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1000))
          ]);
        } catch (e) {
          console.error("Farcaster SDK check failed:", e);
          // Assume not in mini app if check fails
          inMiniApp = false;
        }

        if (inMiniApp && mounted) {
          // 2. Try to get user context (e.g., profile picture)
          try {
            const context = await sdk.context;
            if (context?.user?.pfpUrl && mounted) {
              setUserPfp(context.user.pfpUrl);
            }
          } catch (e) {
            console.error("Could not get Farcaster user context:", e);
            if (mounted) setPfpError(true); // Set error state for PFP
          }

          // 3. Inform the Farcaster client that the app is ready
          try {
            await sdk.actions.ready();
            console.log("Farcaster SDK ready signal sent.");
          } catch (e) {
            console.error("Farcaster SDK ready() call failed:", e);
          }
        }
      } catch (error) {
        console.error('General initialization error:', error);
      } finally {
        // 4. THIS IS THE FAILSAFE: Always mark the app as ready to unblock the UI
        if (mounted) {
          setIsFrameReady(true);
        }
      }
    };

    initializeApp();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle successful minting with sequential reveal
  useEffect(() => {
    if (isSuccess && hash) {
      setSuccessToast('Minted successfully!');
      setIsLoadingMintedNFT(true);
      
      // Clear mint in progress state on success
      setIsMintInProgress(false);
      
      setTimeout(async () => {
        // Use sequential reveal for multiple NFTs, single fetch for single NFT
        await startSequentialReveal(lastMintQuantity);
        setIsLoadingMintedNFT(false);
        // Note: showGif is already set to false by startSequentialReveal
        refetchSupply();
        if (refetchBalance) refetchBalance();
      }, 2000); // Wait 2 seconds for indexer to catch up
    }
  }, [isSuccess, hash, lastMintQuantity]);

  // Handle transaction errors with proper race condition management
  useEffect(() => {
    if (writeError) {
      console.error('Write contract error:', writeError);
      
      // Only reset hash if not already set by a successful transaction
      if (!isSuccess) {
        setHash(undefined);
      }
      
      // Reset mint in progress state on error
      setIsMintInProgress(false);
      
      // Handle specific error types
      if (writeError.message?.includes('User rejected')) {
        setErrorToast('Transaction was rejected by user.');
      } else if (writeError.message?.includes('insufficient funds')) {
        setErrorToast('Insufficient funds for this transaction.');
      } else if (writeError.message?.includes('gas')) {
        setErrorToast('Transaction failed due to gas issues. Please try again.');
      } else {
        const errorMessage = (writeError as any).shortMessage || writeError.message || 'Transaction failed.';
        setErrorToast(errorMessage);
      }
    }
  }, [writeError, isSuccess]);

  useEffect(() => {
    if (isConfirmError && hash) {
      console.error('Transaction confirmation error');
      
      // Reset hash only if transaction truly failed
      setHash(undefined);
      
      // Reset mint in progress state on confirmation error
      setIsMintInProgress(false);
      
      setErrorToast('Transaction failed to confirm. Please try again.');
    }
  }, [isConfirmError, hash]);

  // Auto-hide toasts
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  // Sequential reveal function that fetches NFTs one by one
  const startSequentialReveal = async (quantity: number) => {
    if (!address || quantity === 0) return;

    if (quantity <= 1) {
      // For single mints, fetch NFT data first, then switch from GIF
      await fetchLatestNFT();
      setShowGif(false); // Switch from GIF to show the minted NFT
      return;
    }

    try {
      setIsRevealing(true);
      setRevealProgress({ current: 0, total: quantity });
      // Don't switch from GIF yet - wait until we have first NFT data

      // Get user's current balance to determine starting token IDs
      const balance = await readContract(wagmiConfig, {
        address: config.contractAddress,
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
            address: config.contractAddress,
            abi: CONTRACT_ABI,
            functionName: 'tokenOfOwnerByIndex',
            args: [address, BigInt(tokenIndex)],
            chainId: baseSepolia.id,
          });

          // Get token metadata
          const tokenURI = await readContract(wagmiConfig, {
            address: config.contractAddress,
            abi: CONTRACT_ABI,
            functionName: 'tokenURI',
            args: [tokenId],
            chainId: baseSepolia.id,
          }) as string;

          // Parse metadata from base64 JSON
          if (tokenURI && tokenURI.startsWith('data:application/json;base64,')) {
            const base64Data = tokenURI.split(',')[1];
            const jsonString = safeBase64Decode(base64Data);
            
            if (jsonString) {
              try {
                const metadata = JSON.parse(jsonString);
                
                // Extract SVG from image data URL
                let svg = '';
                let svgDataUrl = '';
                
                if (metadata.image && metadata.image.startsWith('data:image/svg+xml;base64,')) {
                  const svgBase64 = metadata.image.split(',')[1];
                  svg = safeBase64Decode(svgBase64);
                  if (svg) {
                    svgDataUrl = metadata.image;
                  }
                }

                const nftData = {
                  tokenId: Number(tokenId),
                  name: metadata.name || `Unikō #${tokenId}`,
                  svg: svg || placeholderSVG,
                  svgDataUrl: svgDataUrl || defaultNFT.svgDataUrl,
                  isUltraRare: false,
                  traits: metadata.attributes || {},
                  metadata: metadata
                };

                setRevealProgress({ current: i + 1, total: quantity });
                
                // Update the display with the current NFT
                setDisplayNFT(nftData);
                
                // Switch from GIF to NFT display after first NFT is loaded
                if (i === 0) {
                  setShowGif(false);
                }

                // Add delay between reveals (except for the last one)
                if (i < quantity - 1) {
                  await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay
                }
              } catch (parseError) {
                console.error('JSON parse error:', parseError);
              }
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

  // Fetch latest minted NFT
  const fetchLatestNFT = async () => {
    if (!address) return;

    try {
      const balance = await readContract(wagmiConfig, {
        address: config.contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'balanceOf',
        args: [address],
        chainId: baseSepolia.id,
      });

      const userBalance = Number(balance);
      
      if (userBalance > 0) {
        const tokenIndex = userBalance - 1;
        
        const tokenId = await readContract(wagmiConfig, {
          address: config.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'tokenOfOwnerByIndex',
          args: [address, BigInt(tokenIndex)],
          chainId: baseSepolia.id,
        });

        const tokenURI = await readContract(wagmiConfig, {
          address: config.contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'tokenURI',
          args: [tokenId],
          chainId: baseSepolia.id,
        }) as string;

        if (tokenURI && tokenURI.startsWith('data:application/json;base64,')) {
          const base64Data = tokenURI.split(',')[1];
          const jsonString = safeBase64Decode(base64Data);
          
          if (jsonString) {
            try {
              const metadata = JSON.parse(jsonString);
              
              let svg = '';
              let svgDataUrl = '';
              
              if (metadata.image && metadata.image.startsWith('data:image/svg+xml;base64,')) {
                const svgBase64 = metadata.image.split(',')[1];
                svg = safeBase64Decode(svgBase64);
                if (svg) {
                  svgDataUrl = metadata.image;
                }
              }

              const nftData = {
                tokenId: Number(tokenId),
                name: metadata.name || `Unikō #${tokenId}`,
                svg: svg || placeholderSVG,
                svgDataUrl: svgDataUrl || defaultNFT.svgDataUrl,
                isUltraRare: false,
                traits: metadata.attributes || {},
                metadata: metadata
              };

              setDisplayNFT(nftData);
            } catch (parseError) {
              console.error('JSON parse error:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching latest NFT:', error);
    }
  };

  // Fetch user's NFTs for collection
  const fetchUserNFTs = async () => {
    if (!address) {
      setErrorToast("Please connect your wallet first.");
      return;
    }
    
    setIsLoadingNFTs(true);
    
    try {
      const balance = await readContract(wagmiConfig, {
        address: config.contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'balanceOf',
        args: [address],
        chainId: baseSepolia.id,
      });

      const userBalance = Number(balance);
      
      if (userBalance === 0) {
        setMintedNFTs([]);
        setIsLoadingNFTs(false);
        return;
      }
      
      const tokenPromises: Promise<any>[] = [];

      for (let i = 0; i < userBalance; i++) {
        tokenPromises.push(
          (async () => {
            try {
              const tokenId = await readContract(wagmiConfig, {
                address: config.contractAddress,
                abi: CONTRACT_ABI,
                functionName: 'tokenOfOwnerByIndex',
                args: [address, BigInt(i)],
                chainId: baseSepolia.id,
              });

              const tokenURI = await readContract(wagmiConfig, {
                address: config.contractAddress,
                abi: CONTRACT_ABI,
                functionName: 'tokenURI',
                args: [tokenId],
                chainId: baseSepolia.id,
              }) as string;

              if (tokenURI && tokenURI.startsWith('data:application/json;base64,')) {
                const base64Data = tokenURI.split(',')[1];
                const jsonString = safeBase64Decode(base64Data);
                
                if (jsonString) {
                  try {
                    const metadata = JSON.parse(jsonString);

                    let svg = '';
                    let svgDataUrl = '';
                    
                    if (metadata.image && metadata.image.startsWith('data:image/svg+xml;base64,')) {
                      const svgBase64 = metadata.image.split(',')[1];
                      svg = safeBase64Decode(svgBase64);
                      if (svg) {
                        svgDataUrl = metadata.image;
                      }
                    }

                    return {
                      tokenId: Number(tokenId),
                      name: metadata.name || `Unikō #${tokenId}`,
                      svg: svg || placeholderSVG,
                      svgDataUrl: svgDataUrl || defaultNFT.svgDataUrl,
                      isUltraRare: false,
                      traits: metadata.attributes || {},
                    };
                  } catch (parseError) {
                    console.error('JSON parse error for token:', tokenId, parseError);
                    return null;
                  }
                }
              }
            } catch (e) {
              console.error(`Failed to fetch token at index ${i}:`, e);
              return null;
            }
          })()
        );
      }

      const settledNFTs = await Promise.all(tokenPromises);
      const validNFTs: any[] = settledNFTs.filter(nft => nft !== null);

      validNFTs.sort((a, b) => b.tokenId - a.tokenId);
      setMintedNFTs(validNFTs);

    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      setErrorToast('There was an error fetching your collection.');
    } finally {
      setIsLoadingNFTs(false);
    }
  };

  // Mint function with race condition prevention and gas estimation
  const handleMint = async (quantity: number) => {
    // Prevent race conditions - only allow one mint at a time
    if (isMintInProgress) {
      setErrorToast('Mint already in progress. Please wait.');
      return;
    }

    if (!isConnected || !address) {
      setErrorToast('Please connect your wallet first.');
      return;
    }

    if (!currentPrice) {
        setErrorToast('Unable to fetch current price. Please try again.');
        return;
    }

    if (!hasEnoughETH(quantity)) {
        setErrorToast("You don't have enough ETH for this transaction.");
        return;
    }

    // Set mint in progress to prevent duplicates
    setIsMintInProgress(true);

    try {
      // Clear previous transaction state only if no transaction is pending
      if (!hash) {
        setHash(undefined);
      }
      
      // Reset any previous reveal state
      setIsRevealing(false);
      setRevealProgress({ current: 0, total: 0 });
      
      // Clear previous mint quantity to prevent premature reveals
      setLastMintQuantity(0);

      // Get current mint price - use the already fetched currentPrice to avoid connector issues
      const mintPrice = currentPrice as bigint;

      // Use a high gas limit for complex onchain generation (no estimation needed)
      // Your contract's trait generation can take 100+ attempts with complex operations
      const gasEstimate = BigInt(500000 * quantity); // 500k gas per mint

      // Execute mint with gas estimation - removed chainId to avoid connector getChainId call
      const txHash = await writeContractAsync({
        address: config.contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'mint',
        args: [BigInt(quantity)],
        value: mintPrice * BigInt(quantity),
        gas: typeof gasEstimate === 'bigint' ? gasEstimate : BigInt(500000 * quantity),
      });
      
      setHash(txHash);
      setSuccessToast('Mint transaction sent!');
      
      // Set quantity ONLY after transaction is successfully sent
      setLastMintQuantity(quantity);
    } catch (err: any) {
      console.error('Mint error:', err);
      
      // Reset states on immediate error only
      if (!hash) {
        setHash(undefined);
      }
      setIsRevealing(false);
      setRevealProgress({ current: 0, total: 0 });
      setLastMintQuantity(0);
      
      // Handle specific error types
      if (err.message?.includes('User rejected') || err.message?.includes('user rejected')) {
        setErrorToast('Transaction was rejected.');
      } else if (err.message?.includes('insufficient funds')) {
        setErrorToast('Insufficient funds for this transaction.');
      } else if (err.message?.includes('gas')) {
        setErrorToast('Transaction failed due to gas issues. Please try again.');
      } else {
        const errorMessage = err.shortMessage || err.message || 'An unknown error occurred during minting.';
        setErrorToast(errorMessage);
      }
    } finally {
      // Always reset mint in progress state
      setIsMintInProgress(false);
    }
  };

  // Collection handlers
  const handleViewCollection = async () => {
    if (!address) {
      setErrorToast('Please connect your wallet to view your collection.');
      return;
    }
    setShowCollection(true);
    await fetchUserNFTs();
  };

  const handleBackToMint = () => {
    setShowCollection(false);
    setSelectedNFT(null);
    setSelectedNFTIndex(0);
    setCurrentPage(1);
    
    // Reset reveal state
    setIsRevealing(false);
    setRevealProgress({ current: 0, total: 0 });
  };

  const handleNFTClick = async (nft: any) => {
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
    
    const prevIndex = selectedNFTIndex > 0 ? selectedNFTIndex - 1 : mintedNFTs.length - 1;
    setSelectedNFTIndex(prevIndex);
    setSelectedNFT(mintedNFTs[prevIndex]);
  };

  const handleNextNFT = async () => {
    if (mintedNFTs.length === 0) return;
    
    const nextIndex = selectedNFTIndex < mintedNFTs.length - 1 ? selectedNFTIndex + 1 : 0;
    setSelectedNFTIndex(nextIndex);
    setSelectedNFT(mintedNFTs[nextIndex]);
  };

  const handleShare = async () => {
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

  // Pagination
  const itemsPerPage = 9;
  const totalPages = Math.ceil(mintedNFTs.length / itemsPerPage);
  const currentPageNFTs = mintedNFTs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const showPagination = mintedNFTs.length > itemsPerPage;

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Touch events for modal swipe navigation
  useEffect(() => {
    if (!selectedNFT || !isFrameReady) return;

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

    window.addEventListener('keydown', handleKeyPress, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedNFT, selectedNFTIndex, mintedNFTs, isFrameReady]);

  useEffect(() => {
    if (!selectedNFT || !isFrameReady) return;

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

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [selectedNFT, selectedNFTIndex, mintedNFTs, isFrameReady]);

  // Collection view
  if (showCollection) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#BFDBFE',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif'
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
              fontSize: '14px'
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
            backgroundClip: 'text'
          }}>
            My Unikō Collection
          </h1>
          
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
                fontSize: '12px',
                fontWeight: '600',
                color: 'white'
              }}>
                U
              </div>
            )}
          </button>
        </div>

        {/* Collection Content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          padding: '20px'
        }}>
          {isLoadingNFTs ? (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', marginBottom: '6px' }}>
                Loading Collection...
              </h2>
              <p style={{ color: '#4B5563', fontSize: '14px' }}>Fetching your Unikō...</p>
            </div>
          ) : mintedNFTs.length === 0 ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', marginBottom: '6px' }}>
                  No Unikō Yet
                </h2>
                <p style={{ color: '#4B5563', fontSize: '14px' }}>
                  Mint your first Unikō to start your collection!
                </p>
              </div>

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
                    <span style={{ color: '#9CA3AF', fontSize: '12px' }}>•ᴗ•</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <p style={{ color: '#4B5563', fontSize: '14px' }}>
                  {mintedNFTs.length} Unikō collected
                </p>
              </div>

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
                        cursor: hasNFT ? 'pointer' : 'default'
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
                        <span style={{ color: '#9CA3AF', fontSize: '12px' }}>•ᴗ•</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {showPagination && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '20px'
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

        {/* Enhanced NFT Modal - No white frame, blur background, swipe navigation */}
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
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: '700',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
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
                  maxHeight: '80vh',
                  marginBottom: '16px'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div 
                  style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  dangerouslySetInnerHTML={{ __html: selectedNFT.svg }}
                />
              </div>

              {/* Screenshot encouragement */}
              <div style={{
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                maxWidth: '280px',
                lineHeight: '1.4',
                opacity: '0.9'
              }}>
                📸 Take a screenshot of your Unikō and share on Farcaster!
              </div>
            </div>
          </div>
        )}

        {/* Help Button - Bottom Right Corner */}
        <button
          onClick={() => setShowDisclaimer(true)}
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(107, 114, 128, 0.8)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            zIndex: 100
          }}
          title="About this project"
        >
          ?
        </button>

        {/* Disclaimer Modal */}
        {showDisclaimer && (
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
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              zIndex: 1001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setShowDisclaimer(false)}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '320px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                border: '1px solid #E5E7EB'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1F2937',
                marginBottom: '12px',
                textAlign: 'center',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                About Unikō
              </h3>
              <p style={{
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#4B5563',
                textAlign: 'center',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                This is a fun, experimental project, vibe coded by a solo creator. It's been tested, but it still might have bugs or quirks. Please use at your own discretion, and enjoy it as a creative exploration. Thanks for checking it out!
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main screen
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#BFDBFE',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
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
        justifyContent: 'space-between',
        height: '48px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          color: '#374151',
          fontSize: '13px',
          fontWeight: '600',
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
              fontSize: '12px',
              fontWeight: '600',
              color: 'white'
            }}>
              U
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
          flex: 1,
          padding: '12px 16px',
          paddingTop: '24px',
          paddingBottom: '60px',
          position: 'relative',
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
        </div>
        
        <p style={{
          color: '#374151',
          fontSize: '14px',
          marginBottom: '4px',
          textAlign: 'center',
          fontWeight: '700',
          margin: '0 0 4px 0'
        }}>
          your cute onchain companions
        </p>

        <p style={{
          color: '#374151',
          fontSize: '14px',
          marginBottom: '4px',
          textAlign: 'center',
          fontWeight: '700',
          margin: '0 0 4px 0'
        }}>
          a generative project
        </p>

        <p style={{
          color: '#374151',
          fontSize: '14px',
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: '700',
          margin: '0 0 20px 0'
        }}>
          by <a 
            href="https://farcaster.xyz/miguelgarest.eth" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#374151', 
              textDecoration: 'underline',
              fontWeight: '700'
            }}
          >
            @miguelgarest.eth
          </a>
        </p>

        {/* NFT Display */}
        <div style={{
          width: '220px',
          height: '220px',
          backgroundColor: 'white',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {showGif ? (
            <img 
              src="/example_340px.gif" 
              alt="Animated Unikō Preview" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '12px'
              }}
              onError={(e) => {
                console.log('GIF failed to load, falling back to SVG');
                // Fallback to SVG if GIF fails to load
                e.currentTarget.style.display = 'none';
                setShowGif(false);
              }}
            />
          ) : (
            <div 
              style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              dangerouslySetInnerHTML={{ __html: displayNFT.svg }}
            />
          )}
          
          {/* Reset button removed - no longer needed */}
                </div>

        {/* Loading Spinner for Minted NFT */}
        {isLoadingMintedNFT && !isRevealing && (
          <div style={{
            textAlign: 'center',
            marginBottom: '16px',
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
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              Loading your NFT...
            </span>
          </div>
        )}
        
        {/* Reveal Progress */}
        {isRevealing && revealProgress.total > 1 && (
          <div style={{
            textAlign: 'center',
            marginBottom: '16px',
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
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              {revealProgress.current} of {revealProgress.total} NFT{revealProgress.total > 1 ? 's' : ''} revealed
            </span>
          </div>
        )}

        {/* Mint Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px'
        }}>
          {[1, 3, 6].map((quantity) => {
            const totalPrice = currentPrice ? (currentPrice as bigint) * BigInt(quantity) : BigInt(0);
            const priceInEth = currentPrice ? formatEther(totalPrice) : '0.000001';
            return (
            <button
              key={quantity}
              onClick={() => handleMint(quantity)}
              disabled={isPending || isMintInProgress || (isConnected && !hasEnoughETH(quantity))}
              style={{
                width: '80px',
                height: '65px',
                backgroundColor: (isPending || isMintInProgress) ? '#9CA3AF' : (isConnected && !hasEnoughETH(quantity)) ? '#9CA3AF' : '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: (isPending || isMintInProgress || (isConnected && !hasEnoughETH(quantity))) ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                lineHeight: '1.2',
                opacity: (isPending || isMintInProgress || (isConnected && !hasEnoughETH(quantity))) ? 0.6 : 1
              }}
            >
              {(isPending || isMintInProgress) ? (
                <div style={{ fontSize: '9px', textAlign: 'center' }}>
                  {isMintInProgress ? 'Processing...' : 'Minting...'}
                </div>
              ) : (isConnected && !hasEnoughETH(quantity)) ? (
                <div style={{ fontSize: '9px', textAlign: 'center' }}>
                  Need more ETH
                </div>
              ) : (
                <>
                  <div>Mint</div>
                  <div style={{ fontSize: '16px', fontWeight: '700' }}>x{quantity}</div>
                  <div style={{ fontSize: '8px', opacity: '0.9' }}>{priceInEth} ETH</div>
                </>
              )}
            </button>
            );
          })}
        </div>

        {/* Share and Collection Buttons - Side by Side */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <button
            onClick={handleShare}
            style={{
              backgroundColor: '#3B82F6',
              color: 'white',
              fontWeight: '600',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              flex: 1
            }}
          >
            Share
          </button>

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
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(96, 165, 250, 0.3)',
              flex: 1
            }}
          >
            Collection
          </button>
        </div>

        {/* Wallet Status */}
        {!isConnected ? (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#6B7280',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            Connect wallet to mint
          </div>
        ) : (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#6B7280',
            fontSize: '11px',
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
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxWidth: '300px',
          textAlign: 'center'
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
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          color: '#16A34A',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxWidth: '300px',
          textAlign: 'center'
        }}>
          {successToast}
        </div>
      )}

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 