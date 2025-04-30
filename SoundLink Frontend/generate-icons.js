import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure icons directory exists
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Read the source icon
const sourceIconPath = path.join(iconsDir, 'soundlink-icon.svg');
if (!fs.existsSync(sourceIconPath)) {
  console.error('Error: Source icon not found at', sourceIconPath);
  process.exit(1);
}

const sourceIcon = fs.readFileSync(sourceIconPath, 'utf8');

// Helper function to create a resized SVG
function createResizedSVG(size) {
  // Create a new SVG with updated viewBox and dimensions
  const resizedSVG = sourceIcon
    .replace(/width="400"/, `width="${size}"`)
    .replace(/height="400"/, `height="${size}"`);
  return resizedSVG;
}

// Icon sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate icons for each size
sizes.forEach(size => {
  const svgContent = createResizedSVG(size);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, svgContent);
  console.log(`Generated icon: ${filePath}`);
});

console.log('Icons generated successfully!'); 