// Simple webhook endpoint for Farcaster Mini App events
export default function handler(req, res) {
  if (req.method === 'POST') {
    // Handle webhook events from Farcaster
    console.log('Webhook received:', req.body);
    
    // For now, just acknowledge receipt
    res.status(200).json({ 
      success: true,
      message: 'Webhook received' 
    });
  } else {
    res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }
} 