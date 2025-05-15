# SoundLink Ping Service

This service helps keep your Render.com free tier application alive by sending periodic requests to prevent it from becoming inactive and experiencing cold starts.

## How It Works

The ping service works in two ways:

1. **Internal Keep-Alive**: Added directly to your main server.js to ping itself.
2. **External Ping Service**: A standalone service that can be deployed to another free hosting provider to ping your Render app.

## Setup Instructions

### 1. Internal Keep-Alive (Already Implemented)

The internal keep-alive functionality has been added to your server.js file. It will automatically ping the `/api/health` endpoint every 14 minutes.

To make it work properly in production:

1. Set the `NODE_ENV` environment variable to "production" in your Render dashboard.
2. Add `SERVER_URL` environment variable with your Render app's URL (e.g., https://your-app.onrender.com).

### 2. External Ping Service

The external ping service (ping-service.js) can be deployed to another free hosting provider like:
- [Railway](https://railway.app)
- [Fly.io](https://fly.io)
- [Cyclic.sh](https://cyclic.sh)
- Another Render instance

#### Deployment Steps:

1. Deploy the ping-service.js to your chosen platform.
2. Set the `TARGET_URL` environment variable to your main Render app's URL.

#### Environment Variables:

- `PORT`: The port for the ping service (defaults to 3000)
- `TARGET_URL`: The URL of your Render app to keep alive

## Third-Party Services

Alternatively, you can use these free services to ping your app:
- [UptimeRobot](https://uptimerobot.com/) - Free plan allows 50 monitors with 5-minute interval
- [Pingdom](https://www.pingdom.com/) - Limited free plan available
- [Kaffeine](https://kaffeine.herokuapp.com/) - For Heroku apps, but can be adapted
- [Cron-job.org](https://cron-job.org/) - Free service for scheduled HTTP requests

## Testing

You can manually test the ping service by visiting:
- `/ping` - Triggers a manual ping to your main app
- `/health` - Checks if the ping service itself is running

---

Remember that while this solution helps mitigate cold starts, upgrading to a paid plan is the most reliable solution for production applications that require consistent performance. 