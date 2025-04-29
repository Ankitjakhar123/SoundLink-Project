# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# SoundLink Frontend

A modern music streaming platform built with React.

## Setup Instructions

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Start the development server
   ```
   npm run dev
   ```

## Environment Configuration

The application uses environment variables to connect to the backend API. 

For local development:
1. Create a `.env` file in the root directory
2. Add the following variables:
   ```
   VITE_BACKEND_URL=http://localhost:4000
   ```

For production deployment:
1. When deploying to platforms like Netlify or Vercel, set the `VITE_BACKEND_URL` environment variable to your deployed backend URL
2. Example: `VITE_BACKEND_URL=https://your-soundlink-backend.com`

## Important Note for Deployment

When deploying to Netlify or other hosting platforms, you must:
1. Deploy your backend to a hosting service (Heroku, Render, Railway, etc.)
2. Configure your frontend to use the deployed backend URL
3. Set the `VITE_BACKEND_URL` environment variable in your hosting platform's dashboard

If you see "Failed to load resource: net::ERR_CONNECTION_REFUSED" or "Loading songs..." message that never resolves, it means your frontend cannot connect to your backend API.

## Build for Production
```
npm run build
```

## Educational Purpose Disclaimer

This SoundLink application is created solely for educational and portfolio purposes. All media content, including songs, images, and albums featured in this application are used without explicit permission from the copyright holders and are not intended for commercial use or distribution.
