import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

export default function App() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [frameContext, setFrameContext] = useState<any>(null);
  const [isFrameEnvironment, setIsFrameEnvironment] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const {
    writeContract,
    data: hash,
    isPending,
    error
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  // Initialize Frame SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Check if we're in a frame environment
        const isFrame = window.parent !== window;
        setIsFrameEnvironment(isFrame);
        
        if (isFrame) {
          // Try to load Frame SDK
          const { sdk } = await import('@farcaster/frame-sdk');
          
          // Get frame context
          const context = sdk.context;
          setFrameContext(context);
          
          // Signal that the app is ready
          await sdk.actions.ready();
          console.log('Frame SDK initialized successfully');
        } else {
          console.log('Running in standalone mode (not in frame)');
        }
        
        setIsSDKLoaded(true);
      } catch (error) {
        console.error('Frame SDK initialization error:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown error');
        setIsSDKLoaded(true); // Continue anyway in standalone mode
      }
    };

    // Add a small delay to ensure DOM is ready
    setTimeout(initializeSDK, 100);
  }, []);

  const mintNFT = async () => {
    if (!isConnected) {
      // Connect to first available connector
      connect({ connector: connectors[0] });
      return;
    }

    try {
      writeContract({
        address: '0xa4b86C09C97e744CA0b9C80BA2B2e0c38Dd6fB1e',
        abi: [{
          name: 'mint',
          type: 'function',
          stateMutability: 'payable',
          inputs: [],
          outputs: []
        }],
        functionName: 'mint',
        value: parseEther('0.001')
      });
    } catch (error) {
      console.error('Minting failed:', error);
    }
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #BFDBFE 0%, #DDD6FE 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '400px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E5E7EB'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: '800',
            background: 'linear-gradient(45deg, #9333ea, #ec4899, #3b82f6, #10b981, #f59e0b)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px'
          }}>
            Unikō
          </div>
          <div style={{ 
            color: '#374151', 
            fontSize: '13px', 
            lineHeight: '1.4',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
            fontWeight: '600'
          }}>
            <p style={{ margin: '0 0 3px 0' }}>Your cute onchain companions</p>
            <p style={{ margin: '0 0 3px 0' }}>generative project</p>
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



        {/* Uniko NFT Preview */}
        <div style={{
          background: '#F9FAFB',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '20px',
          border: '2px solid #E5E7EB'
        }}>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '10px',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }}>
            • ᴗ •
          </div>
          <div style={{ 
            color: '#6B7280', 
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Your Unikō will appear here after minting
          </div>
        </div>

        {/* Connection Status */}
        {isConnected ? (
          <div style={{
            background: '#ECFDF5',
            border: '1px solid #D1FAE5',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ color: '#065F46', fontSize: '14px', fontWeight: '500' }}>
              ✅ Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
          </div>
        ) : (
          <div style={{
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ color: '#92400E', fontSize: '14px', fontWeight: '500' }}>
              ⚠️ Wallet not connected
            </div>
          </div>
        )}

        {/* Mint Button */}
        <button
          onClick={mintNFT}
          disabled={isPending || isConfirming}
          style={{
            width: '100%',
            padding: '16px',
            background: isPending || isConfirming 
              ? '#9CA3AF' 
              : 'linear-gradient(45deg, #8B5CF6, #EC4899)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isPending || isConfirming ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '12px'
          }}
        >
          {isPending 
            ? 'Confirming...' 
            : isConfirming 
            ? 'Minting...' 
            : isConnected 
            ? 'Mint Unikō (0.001 ETH)' 
            : 'Connect Wallet'}
        </button>

        {/* Status Messages */}
        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '12px'
          }}>
            <div style={{ color: '#991B1B', fontSize: '14px' }}>
              Error: {error.message}
            </div>
          </div>
        )}

        {isConfirmed && (
          <div style={{
            background: '#ECFDF5',
            border: '1px solid #D1FAE5',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '12px'
          }}>
            <div style={{ color: '#065F46', fontSize: '14px', fontWeight: '500' }}>
              🎉 Unikō minted successfully!
            </div>
          </div>
        )}

        {/* Disconnect Button */}
        {isConnected && (
          <button
            onClick={() => disconnect()}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: '#6B7280',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Disconnect Wallet
          </button>
        )}


      </div>
    </div>
  );
} 