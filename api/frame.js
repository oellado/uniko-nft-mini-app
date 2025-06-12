export default function handler(req, res) {
  // Handle POST requests from Farcaster
  if (req.method === 'POST') {
    // Return Frame response
    res.status(200).json({
      type: 'frame',
      frameUrl: 'https://uniko-nft-mini-app.vercel.app',
      version: 'vNext'
    });
  } else {
    // Handle GET requests - redirect to main app
    res.redirect(302, 'https://uniko-nft-mini-app.vercel.app');
  }
} 