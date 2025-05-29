# 🎵 SoundLink Backend

<div align="center">
  <img src="../SoundLink Frontend/public/icons/soundlink-logo.svg" alt="SoundLink Logo" width="300px">
  <p>Powerful RESTful API powering the SoundLink music streaming platform</p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
</div>

---

## 📋 Overview

The SoundLink Backend is a robust Node.js application built with Express that powers all the functionality of the SoundLink music streaming platform. It provides RESTful APIs for user authentication, music streaming, playlist management, and more.

## ✨ Key Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 🎧 **Music Streaming** - APIs for streaming songs with correct headers
- 📊 **Analytics** - Track song plays and user engagement
- 📱 **Responsive Design** - Adapts to different client requests
- 📂 **File Management** - Upload and store music files and images
- 🔍 **Advanced Search** - Full-text search across songs, albums, and artists
- ⚡ **Performance Optimized** - Caching and database indexing

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Documentation**: Swagger
- **Containerization**: Docker
- **Testing**: Jest
- **CI/CD**: GitHub Actions

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Local Development Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/soundlink.git
cd soundlink/SoundLink\ Backend
```

2. Install dependencies
```bash
npm install
```

3. Create environment variables
```bash
# Copy the example env file
cp .env.example .env

# Edit the .env file with your configuration
```

4. Start the development server
```bash
npm run dev
```

### Docker Setup

```bash
# Build the Docker image
docker build -t soundlink-backend .

# Run the container
docker run -p 4000:4000 -d soundlink-backend
```

## 📝 Environment Variables
Configure these variables in your `.env` file:

- `MONGODB_URI`: MongoDB connection string
- `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY`: Cloudinary credentials (for media storage)
- `JWT_SECRET`: Secret for JWT tokens
- `PORT`: Server port (default: 4000)
- `NODE_ENV`: Environment (development/production)

## 📚 API Documentation

The API is documented using Swagger. When the server is running, visit:
```
http://localhost:4000/api-docs
```

### Main API Endpoints

#### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and get JWT
- `GET /api/auth/me` — Get current user info (requires Bearer token)
- `PUT /api/auth/update-profile` — Update user profile
- `POST /api/auth/forgot-password` — Initiate password reset

#### Albums & Songs
- `POST /api/album/add` — Add album (admin only)
- `POST /api/album/bulk-add` — Bulk add albums (admin only)
- `GET /api/album/:id` — Get album details
- `GET /api/album/list` — List all albums with pagination
- `POST /api/song/add` — Add song (admin only)
- `POST /api/song/bulk-add` — Bulk add songs (admin only)
- `GET /api/song/:id` — Get song details
- `GET /api/song/:id/stream` — Stream song audio
- `GET /api/song/list` — List all songs with pagination

#### Playlists
- `POST /api/playlist/create` — Create a new playlist
- `GET /api/playlist/my` — Get user's playlists
- `PUT /api/playlist/:id` — Update playlist
- `DELETE /api/playlist/:id` — Delete a playlist
- `POST /api/playlist/:id/add-song` — Add song to playlist

#### Favorites
- `POST /api/favorite/like` — Like a song or album
- `POST /api/favorite/unlike` — Unlike a song or album
- `GET /api/favorite/my` — Get all favorites for current user

#### Comments
- `POST /api/comment/add` — Add a comment to a song or album
- `GET /api/comment/list` — Get comments for a song or album
- `POST /api/comment/delete` — Delete a comment (by user or admin)

#### Search & Filter
- `GET /api/search?q=keyword` — Search songs, albums, and users by keyword
- `GET /api/trending` — Get trending songs and albums

## 🔒 Middleware & Security

- **Authentication**: JWT validation middleware
- **Authorization**: Role-based access control
- **Rate Limiting**: Each IP is limited to 100 requests per 15 minutes
- **Logging**: All requests are logged using morgan
- **Validation**: Input validation using Joi
- **Security Headers**: Helmet for secure HTTP headers
- **CORS**: Configurable Cross-Origin Resource Sharing

## 💾 Database Schema

The application uses MongoDB with the following main collections:
- Users
- Songs
- Albums
- Artists
- Playlists
- Favorites
- Comments

## 📊 Monitoring

The server includes a health check endpoint:
```
GET /health
```

And a ping service that monitors server uptime.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
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