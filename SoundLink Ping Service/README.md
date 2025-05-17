# SoundLink Ping Service

A dedicated service to keep the SoundLink Backend alive on Render's free tier by sending periodic pings.

## How It Works

This service is designed to be deployed on Vercel and uses Vercel's Cron Jobs feature to send a ping to your Render-hosted SoundLink Backend every 14 minutes, preventing it from becoming inactive.

## Features

- Sends HTTP requests to your backend's health endpoint every 14 minutes
- Uses Vercel's Cron Jobs for reliable scheduling
- Provides API endpoints for manual pinging and health checks
- Easy to deploy with minimal configuration

## Deployment Instructions

### 1. Clone this repository

```bash
git clone https://your-repo-url.git
cd SoundLink-Ping-Service
```

### 2. Deploy to Vercel

#### Using Vercel CLI

1. Install Vercel CLI if you haven't already:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the service:
   ```bash
   vercel
   ```

4. Set the environment variable:
   ```bash
   vercel env add TARGET_URL
   ```
   Enter your Render app URL when prompted (e.g., https://soundlink-backend.onrender.com)

5. Deploy to production:
   ```bash
   vercel --prod
   ```

#### Using Vercel Dashboard

1. Push this code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Add the environment variable:
   - `TARGET_URL`: Your Render app URL (e.g., https://soundlink-backend.onrender.com)
6. Deploy the project

### 3. Verify the Deployment

1. Visit your Vercel deployment URL to see the service information
2. Test the ping manually by visiting `your-vercel-url.com/ping`
3. Check the Vercel logs to confirm that the cron job is running

## API Endpoints

- `GET /` - Service information
- `GET /ping` - Manually trigger a ping to your backend
- `GET /health` - Check the health of the ping service

## Environment Variables

- `TARGET_URL` - The URL of your Render app to keep alive (required)

## Local Development

1. Create a `.env` file based on `env.example`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Notes

- The cron job is configured to run every 14 minutes, which is just under Render's 15-minute inactivity threshold
- This service is specifically designed for Vercel deployment to take advantage of their reliable cron job feature 