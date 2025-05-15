# Vercel Deployment Guide for SoundLink Backend

This guide explains how to deploy the SoundLink Backend to Vercel.

## Configuration Files

The repository includes the following Vercel-specific files:

- `vercel.json`: Configuration file that tells Vercel how to build and deploy the application.

## Environment Variables

Make sure to set the following environment variables in your Vercel project settings:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
- `NODE_ENV`: Set to "production"

## Deployment Steps

1. Install the Vercel CLI (if you haven't already):
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy from the project directory:
   ```
   vercel
   ```

4. For subsequent deployments:
   ```
   vercel --prod
   ```

## Important Notes

- Vercel uses a serverless architecture, so long-running processes may not work as expected.
- The keepAlive service is automatically disabled when running on Vercel.
- Static file serving from the `uploads` directory will work, but files will not persist between deployments.
- For file storage, it's recommended to use Cloudinary or another cloud storage solution.

## Troubleshooting

- If you encounter deployment errors, check the Vercel logs for details.
- Make sure all environment variables are correctly set in the Vercel project settings.
- Ensure your MongoDB instance is accessible from Vercel's network.