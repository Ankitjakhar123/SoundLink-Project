# SoundLink Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file based on `.env.example` and fill in your credentials.
3. Start the server:
   ```bash
   npm run server
   ```

## Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY`: Cloudinary credentials
- `JWT_SECRET`: Secret for JWT tokens
- `PORT`: Server port (default: 4000)

## API Endpoints

### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and get JWT
- `GET /api/auth/me` — Get current user info (requires Bearer token)

### Albums & Songs
- `POST /api/album/add` — Add album (admin only)
- `POST /api/album/bulk-add` — Bulk add albums (admin only)
- `POST /api/song/add` — Add song (admin only)
- `POST /api/song/bulk-add` — Bulk add songs (admin only)
- ...

### Favorites
- `POST /api/favorite/like` — Like a song or album
- `POST /api/favorite/unlike` — Unlike a song or album
- `GET /api/favorite/my` — Get all favorites for current user

### Comments
- `POST /api/comment/add` — Add a comment to a song or album
- `GET /api/comment/list` — Get comments for a song or album
- `POST /api/comment/delete` — Delete a comment (by user or admin)

### Search & Filter
- `GET /api/search?q=keyword` — Search songs, albums, and users by keyword

## Middleware

- **Rate Limiting:** Each IP is limited to 100 requests per 15 minutes.
- **Logging:** All requests are logged using morgan.
- **Validation:** Uses express-validator for input validation (see `src/middleware/validate.js`).

## Testing

Run backend tests with:
```bash
npm test
```

## Notes
- Protect sensitive routes with JWT and role-based middleware.
- See code for more details.

## API Documentation

- See the code for endpoint details.
- Swagger/OpenAPI documentation coming soon for full API reference.

## Docker Deployment

Build and run the backend with Docker:
```bash
docker build -t soundlink-backend .
docker run --env-file .env -p 4000:4000 soundlink-backend
```

> **Note:** Never commit your `.env` file to version control. It contains sensitive credentials. 