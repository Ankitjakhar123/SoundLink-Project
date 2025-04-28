import express from "express";
import { addComment, getComments, deleteComment } from "../controllers/commentController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/add", authenticate, addComment);
router.get("/list", getComments);
router.post("/delete", authenticate, deleteComment);

export default router; 