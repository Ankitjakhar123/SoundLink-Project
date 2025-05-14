import https from 'https';
import http from 'http';
import express from 'express';

// Create an Express app for the ping service
const app = express();
const port = process.env.PORT || 3000;

// The URL of your Render app that needs to be kept alive
const targetUrl = process.env.TARGET_URL || 'https://your-render-app-url.onrender.com';
const pingInterval = 14 * 60 * 1000; // 14 minutes in milliseconds

// Function to ping the target URL
const pingServer = () => {
  console.log(`Pinging ${targetUrl} at ${new Date().toISOString()}`);
  
  const useHttps = targetUrl.includes('https');
  const lib = useHttps ? https : http;
  
  const req = lib.get(`${targetUrl}/api/health`, (res) => {
    const { statusCode } = res;
    console.log(`Ping response: ${statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Response body: ${data}`);
    });
  });
  
  req.on('error', (err) => {
    console.error(`Ping failed: ${err.message}`);
  });
  
  req.end();
};

// Route to manually trigger a ping
app.get('/ping', (req, res) => {
  pingServer();
  res.json({ status: 'Ping sent', timestamp: new Date().toISOString() });
});

// Health check for the ping service itself
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ping-service' });
});

// Start the service
app.listen(port, () => {
  console.log(`Ping service running on port ${port}`);
  
  // Initial ping
  pingServer();
  
  // Set up the interval
  setInterval(pingServer, pingInterval);
}); 