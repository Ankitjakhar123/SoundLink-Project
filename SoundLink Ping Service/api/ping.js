import fetch from 'node-fetch';
import 'dotenv/config';

// The URL of the Render app that needs to be kept alive
const targetUrl = process.env.TARGET_URL || 'https://your-render-app-url.onrender.com';

// Function to ping the target URL
const pingServer = async () => {
  const timestamp = new Date().toISOString();
  console.log(`Cron: Pinging ${targetUrl} at ${timestamp}`);
  
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

export default async function handler(req, res) {
  const result = await pingServer();
  
  res.status(200).json({
    status: 'Ping sent',
    timestamp: new Date().toISOString(),
    result
  });
} 