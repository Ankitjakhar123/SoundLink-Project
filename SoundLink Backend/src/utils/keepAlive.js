import https from 'https';
import http from 'http';

/**
 * Utility to keep Render.com free tier services awake
 * by pinging the server at regular intervals
 */
const keepAlive = (url, interval = 14) => {
  // Parse URL to determine http or https
  const useHttps = url.includes('https');
  const pingInterval = interval * 60 * 1000; // Convert minutes to milliseconds
  
  const ping = () => {
    console.log(`Pinging ${url} to keep the service alive`);
    
    const lib = useHttps ? https : http;
    const req = lib.get(url, (res) => {
      console.log(`Ping successful, status code: ${res.statusCode}`);
      res.on('data', () => {});
      res.on('end', () => {});
    });
    
    req.on('error', (err) => {
      console.error(`Ping failed: ${err.message}`);
    });
    
    req.end();
  };
  
  // Initial ping
  ping();
  
  // Set up interval
  const intervalId = setInterval(ping, pingInterval);
  
  return {
    stop: () => clearInterval(intervalId)
  };
};

export default keepAlive; 