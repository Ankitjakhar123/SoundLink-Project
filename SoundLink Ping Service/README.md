# SoundLink Ping Service

A dedicated service to keep the SoundLink Backend alive on Render's free tier by sending periodic pings.

## How It Works

This service is designed to be deployed on Fly.io and sends a ping to your Render-hosted SoundLink Backend every 14 minutes, preventing it from becoming inactive.

## Features

- Sends HTTP requests to your backend's health endpoint every 14 minutes
- Runs continuously without sleep periods
- Provides API endpoints for manual pinging and health checks
- Easy to deploy with minimal configuration

## Deployment Instructions

### 1. Install Fly.io CLI

```bash
# For Windows PowerShell
iwr https://fly.io/install.ps1 -useb | iex

# For Linux/macOS
curl -L https://fly.io/install.sh | sh
```

### 2. Sign Up and Login

```bash
fly auth signup
# Or if you already have an account
fly auth login
```

### 3. Deploy to Fly.io

1. Navigate to the project directory:
   ```bash
   cd SoundLink-Ping-Service
   ```

2. Initialize your Fly.io app:
   ```bash
   fly launch
   ```
   - Choose a unique app name when prompted
   - Select a region close to your users
   - Say no to PostgreSQL and Redis
   - Say yes to deploying now

   **For monorepo deployment (if your code is in a subdirectory):**
   ```bash
   fly launch --path ./path/to/your/service
   ```

3. Set the environment variable for your Render backend URL:
   ```bash
   fly secrets set TARGET_URL=https://your-soundlink-backend.onrender.com
   ```

4. For subsequent deployments:
   ```bash
   fly deploy
   ```

   **For monorepo deployment:**
   ```bash
   fly deploy --config ./path/to/your/service/fly.toml
   ```

### 4. Verify the Deployment

1. Check your app status:
   ```bash
   fly status
   ```

2. View the logs:
   ```bash
   fly logs
   ```

3. Open your app in the browser:
   ```bash
   fly open
   ```

## API Endpoints

- `GET /` - Service information
- `GET /ping` - Manually trigger a ping to your backend
- `GET /health` - Check the health of the ping service

## Environment Variables

- `TARGET_URL` - The URL of your Render app to keep alive (required)
- `PORT` - The port to run the service on (defaults to 3000)

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

- The ping interval is set to 14 minutes, which is just under Render's 15-minute inactivity threshold
- Fly.io's free tier includes 3 shared-cpu-1x 256MB VMs, which is more than enough for this ping service
- Unlike other free hosting providers, Fly.io does not put your app to sleep after periods of inactivity 