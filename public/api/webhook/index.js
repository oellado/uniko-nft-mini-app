export default function handler(req, res) {
  if (req.method === 'POST') {
    res.status(200).json({ message: 'Webhook received' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 