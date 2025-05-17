import express from 'express';
import fetch from 'node-fetch';
import 'dotenv/config';

// Create an Express app for the ping service
const app = express();
const port = process.env.PORT || 3000;

// The URL of the Render app that needs to be kept alive
const targetUrl = process.env.TARGET_URL || 'https://your-render-app-url.onrender.com';
const pingInterval = 14 * 60 * 1000; // 14 minutes in milliseconds

// Function to ping the target URL
const pingServer = async () => {
  const timestamp = new Date().toISOString();
  console.log(`Pinging ${targetUrl} at ${timestamp}`);
  
  try {
    const response = await fetch(`${targetUrl}/api/health`);
    const data = await response.text();
    console.log(`Ping response: ${response.status}`);
    console.log(`Response body: ${data}`);
    return { status: response.status, data };
  } catch (error) {
    console.error(`Ping failed: ${error.message}`);
    return { error: error.message };
  }
};

// Route to manually trigger a ping
app.get('/ping', async (req, res) => {
  const result = await pingServer();
  res.json({ 
    status: 'Ping sent', 
    timestamp: new Date().toISOString(),
    result
  });
});

// Health check for the ping service itself
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ping-service',
    timestamp: new Date().toISOString()
  });
});

// Root route for easy verification
app.get('/', (req, res) => {
  res.json({
    service: 'SoundLink Ping Service',
    description: 'Service to keep SoundLink Backend alive on Render',
    endpoints: {
      '/': 'This information',
      '/ping': 'Manually trigger a ping to the backend',
      '/health': 'Check the health of this ping service'
    },
    timestamp: new Date().toISOString()
  });
});

// Start the service
app.listen(port, () => {
  console.log(`Ping service running on port ${port}`);
  
  // Initial ping
  pingServer();
  
  // Set up the interval
  setInterval(pingServer, pingInterval);
}); 