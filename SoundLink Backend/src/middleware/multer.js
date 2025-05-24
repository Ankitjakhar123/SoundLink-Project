import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory: ${uploadsDir}`);
}

// Save file to local 'uploads' folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Filter for files based on field name
const fileFilter = (req, file, cb) => {
  // Check file type based on field name
  if (file.fieldname === 'image' || file.fieldname === 'coverImage') {
    // Accept images only for image fields
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return cb(new Error('Only image files are allowed for image uploads!'), false);
    }
  } else if (file.fieldname === 'audio') {
    // Accept audio files only for audio fields
    if (!file.originalname.match(/\.(mp3|wav|ogg|m4a|flac|aac)$/i)) {
      return cb(new Error('Only audio files are allowed for audio uploads!'), false);
    }
  }
  cb(null, true);
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit (increased for audio files)
  }
});

export default upload;
