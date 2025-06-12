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
    try {
      const { event, data } = req.body;
      
      console.log('Webhook received:', { event, data });
      
      // Handle different Mini App events
      switch (event) {
        case 'frame_added':
          console.log('Mini App was added to user\'s Farcaster');
          break;
        case 'frame_removed':
          console.log('Mini App was removed from user\'s Farcaster');
          break;
        case 'notifications_enabled':
          console.log('User enabled notifications for Mini App');
          break;
        case 'notifications_disabled':
          console.log('User disabled notifications for Mini App');
          break;
        default:
          console.log('Unknown event:', event);
      }
      
      res.status(200).json({ 
        success: true, 
        message: 'Webhook processed successfully' 
      });
      
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 