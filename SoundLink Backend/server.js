import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import songRouter from './src/routes/songroute.js';
import connectDB from './src/config/mongodb.js';
import connectCloudinary from './src/config/cloudinary.js';
import albumRouter from './src/routes/albumroute.js';
import authRouter from './src/routes/authroute.js';
import favoriteRouter from './src/routes/favoriteroute.js';
import commentRouter from './src/routes/commentroute.js';
import searchRouter from './src/routes/searchroute.js';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import playlistroute from './src/routes/playlistroute.js';
import analyticsroute from './src/routes/analyticsroute.js';
import userRouter from './src/routes/userroute.js';
import movieAlbumRouter from './src/routes/movieAlbumRoutes.js';
import artistRouter from './src/routes/artistRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//app config
const app=express();
const port= process.env.PORT || 4000;
connectDB();
connectCloudinary();


//middelewares

app.use(express.json());
// Configure CORS to allow credentials
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',    // Local development
      'http://localhost:3000',    // Alternative local port
      'https://ankitsoundlink.netlify.app' // Netlify deployment
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(morgan('dev'));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 10000 requests per windowMs
});
app.use(limiter);

//initializing routes

app.use("/api/song",songRouter)
app.use('/api/album',albumRouter)
app.use('/api/auth', authRouter)
app.use('/api/favorite', favoriteRouter)
app.use('/api/comment', commentRouter)
app.use('/api/search', searchRouter)
app.use('/api/playlist', playlistroute)
app.use('/api/analytics', analyticsroute)
app.use('/api/user', userRouter)
app.use('/api/moviealbum', movieAlbumRouter)
app.use('/api/artist', artistRouter)

// Health check endpoint for Docker
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.get('/',(req,res)=> res.send("Api Working"))

app.listen(port, () => console.log(`Server started on ${port}`));
