import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import songRouter from './src/routes/songroute.js';
import connectDB from './src/config/mongodb.js';
import connectCloudinary from './src/config/cloudinary.js';
import albumRouter from './src/routes/albumroute.js';

//app config
const app=express();
const port= process.env.PORT || 4000;
connectDB();
connectCloudinary();


//middelewares

app.use(express.json());
app.use(cors());

//initializing routes

app.use("/api/song",songRouter)
app.use('/api/album',albumRouter)

app.get('/',(req,res)=> res.send("Api Working"))

app.listen(port, () => console.log(`Server started on ${port}`));
