export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'SoundLink API is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'not set',
    vercel: Boolean(process.env.VERCEL),
    region: process.env.VERCEL_REGION || 'unknown',
  });
} 