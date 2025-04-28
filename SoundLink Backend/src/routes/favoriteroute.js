import express from "express";
import { like, unlike, getFavorites } from "../controllers/favoriteController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/like", authenticate, like);
router.post("/unlike", authenticate, unlike);
router.get("/my", authenticate, getFavorites);

export default router; 