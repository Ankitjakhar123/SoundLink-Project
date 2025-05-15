// Simple serverless function for testing
export default function handler(req, res) {
  try {
    // Return simple JSON response
    res.status(200).json({
      message: 'Hello from SoundLink API',
      time: new Date().toISOString(),
      query: req.query,
      vercel: true
    });
  } catch (error) {
    console.error('Error in hello handler:', error);
    res.status(500).json({
      error: 'Failed to process request',
      message: error.message
    });
  }
} 