import express from "express";
import multer from "multer";
import { addArtist, listArtists, getArtist, updateArtist, deleteArtist, bulkAddArtists } from "../controllers/artistController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profiles");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Artist routes
router.post("/add", verifyToken, upload.single("image"), addArtist);
router.get("/list", listArtists);
router.get("/:id", getArtist);
router.put("/update/:id", verifyToken, upload.single("image"), updateArtist);
router.delete("/delete/:id", verifyToken, deleteArtist);
router.post("/bulk-add", verifyToken, bulkAddArtists);

export default router; 