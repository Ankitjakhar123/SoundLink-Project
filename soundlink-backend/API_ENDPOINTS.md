# SoundLink API Endpoints

## Base URL
For production, use:
```
https://sound-link-project.vercel.app
```

Note: Do NOT include a trailing slash after the base URL when configuring your frontend.

## Available Endpoints

### Songs
- **List all songs**: `GET /api/song/list?all=true`
- **List songs with pagination**: `GET /api/song/list?page=1&limit=20`

### Albums
- **List all albums**: `GET /api/album/list`
- **List albums with pagination**: `GET /api/album/list?page=1&limit=20`

### Diagnostic Endpoints
- **Health check**: `GET /api/health`
- **Hello world**: `GET /api/hello`
- **Database test**: `GET /api/db-test`

## Frontend Configuration

In your frontend code, set the API base URL as follows:

```javascript
// Correct way:
const API_URL = 'https://sound-link-project.vercel.app';

// Then use it like this:
fetch(`${API_URL}/api/song/list?all=true`)
  .then(response => response.json())
  .then(data => console.log(data));
```

## CORS
The API is configured to accept requests from:
- `https://ankitsoundlink.netlify.app`
- Local development URLs

If you need to add additional domains, update the CORS configuration in the API handlers. 