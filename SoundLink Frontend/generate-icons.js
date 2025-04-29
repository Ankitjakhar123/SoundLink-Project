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

// Generate a basic SVG icon with the given size and text
function generateSvgIcon(size, text) {
  const fontSize = Math.floor(size / 4);
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#1DB954" rx="15%" />
    <text x="50%" y="50%" font-family="Arial" font-size="${fontSize}" fill="white" text-anchor="middle" dominant-baseline="middle">
      ${text}
    </text>
  </svg>`;
}

// Icon sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate icons for each size
sizes.forEach(size => {
  const svgContent = generateSvgIcon(size, 'SL');
  const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, svgContent);
  console.log(`Generated icon: ${filePath}`);
});

console.log('Icons generated successfully! Convert them to PNG format for use in your PWA.'); 