export default function handler(req, res) {
  // Set CORS headers for Farcaster
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    // Handle Frame button click - return Mini App HTML
    const miniAppHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UnikoNFT Mini App</title>
    <script src="https://unpkg.com/@farcaster/frame-sdk@latest/dist/index.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        .container {
            max-width: 400px;
            margin: 0 auto;
            text-align: center;
        }
        .nft-preview {
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 30px;
            margin: 20px 0;
            backdrop-filter: blur(10px);
        }
        .character {
            width: 120px;
            height: 120px;
            margin: 0 auto 20px;
            background: #FFE4B5;
            border-radius: 50%;
            position: relative;
            border: 3px solid #DEB887;
        }
        .eyes {
            position: absolute;
            top: 35px;
            left: 50%;
            transform: translateX(-50%);
        }
        .eye {
            width: 12px;
            height: 12px;
            background: black;
            border-radius: 50%;
            display: inline-block;
            margin: 0 8px;
            position: relative;
        }
        .eye::after {
            content: '';
            width: 4px;
            height: 4px;
            background: white;
            border-radius: 50%;
            position: absolute;
            top: 2px;
            left: 2px;
        }
        .mouth {
            position: absolute;
            bottom: 35px;
            left: 50%;
            transform: translateX(-50%);
            width: 30px;
            height: 15px;
            border: 2px solid black;
            border-top: none;
            border-radius: 0 0 30px 30px;
        }
        .cheeks {
            position: absolute;
            top: 50px;
            width: 15px;
            height: 15px;
            background: #FFB6C1;
            border-radius: 50%;
            opacity: 0.6;
        }
        .cheek-left { left: 15px; }
        .cheek-right { right: 15px; }
        .mint-button {
            background: linear-gradient(45deg, #ff6b6b, #feca57);
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            color: white;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
            margin: 20px 0;
            width: 100%;
        }
        .mint-button:hover {
            transform: scale(1.05);
        }
        .price {
            font-size: 24px;
            font-weight: bold;
            color: #FFD700;
            margin: 15px 0;
        }
        .features {
            font-size: 14px;
            opacity: 0.9;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🦄 UnikoNFT</h1>
        <p>Mint Your Unique Companion</p>
        
        <div class="nft-preview">
            <div class="character">
                <div class="eyes">
                    <div class="eye"></div>
                    <div class="eye"></div>
                </div>
                <div class="mouth"></div>
                <div class="cheeks cheek-left"></div>
                <div class="cheeks cheek-right"></div>
            </div>
            
            <div class="price">0.001 ETH</div>
            <div class="features">✨ 100% On-Chain ✨ Randomized Traits ✨</div>
            
            <button class="mint-button" onclick="mintNFT()">
                Mint UnikoNFT
            </button>
        </div>
        
        <p style="font-size: 12px; opacity: 0.7;">
            Connect your wallet to mint on Base network
        </p>
    </div>

    <script>
        // Initialize Farcaster Frame SDK
        window.addEventListener('load', () => {
            if (window.FrameSDK) {
                window.FrameSDK.init();
            }
        });

        function mintNFT() {
            // In a real implementation, this would connect to your smart contract
            alert('🎉 Minting functionality will be connected to your smart contract!\\n\\nNext steps:\\n1. Deploy your UnikoNFT contract\\n2. Connect Web3 wallet integration\\n3. Implement minting logic');
            
            // For now, simulate success
            document.querySelector('.mint-button').innerHTML = '✅ Minted!';
            document.querySelector('.mint-button').style.background = '#27ae60';
        }
    </script>
</body>
</html>`;

    // Return the Mini App HTML
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(miniAppHtml);
  } else {
    // Handle GET requests - return Frame metadata
    const frameHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="https://uniko-nft-mini-app.vercel.app/og-image.svg" />
    <meta property="fc:frame:button:1" content="Launch Mini App" />
    <meta property="fc:frame:button:1:action" content="post" />
    <meta property="fc:frame:post_url" content="https://uniko-nft-mini-app.vercel.app/api/frame" />
    <meta property="fc:frame:state" content="{}" />
</head>
<body>
    <h1>UnikoNFT Frame</h1>
    <p>Click the button to launch the Mini App!</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(frameHtml);
  }
} 