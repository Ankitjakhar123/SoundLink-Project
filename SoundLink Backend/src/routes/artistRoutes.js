import express from "express";
import multer from "multer";
import { addArtist, listArtists, getArtist, updateArtist, deleteArtist, bulkAddArtists } from "../controllers/artistController.js";
import { protect } from "../middleware/authMiddleware.js";

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
router.post("/add", protect, upload.single("image"), addArtist);
router.get("/list", listArtists);
router.get("/:id", getArtist);
router.put("/update/:id", protect, upload.single("image"), updateArtist);
router.delete("/delete/:id", protect, deleteArtist);
router.post("/bulk-add", protect, bulkAddArtists);

export default router; 