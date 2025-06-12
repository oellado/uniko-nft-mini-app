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
    // Return Frame v2 response that opens the Mini App
    const frameResponse = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Farcaster Frame v2 Response -->
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="https://uniko-nft-mini-app.vercel.app/og-image.svg" />
    <meta property="fc:frame:button:1" content="Open Mini App" />
    <meta property="fc:frame:button:1:action" content="link" />
    <meta property="fc:frame:button:1:target" content="https://uniko-nft-mini-app.vercel.app" />
    
    <title>UnikoNFT - Opening Mini App</title>
</head>
<body>
    <script>
        // Redirect to the main app
        window.location.href = 'https://uniko-nft-mini-app.vercel.app';
    </script>
    <p>Opening UnikoNFT Mini App...</p>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(frameResponse);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 