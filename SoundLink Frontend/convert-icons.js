// Convert SVG to PNG script
// Note: This requires sharp package to be installed:
// npm install sharp --save-dev

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const ICONS_DIR = path.join(__dirname, 'public', 'icons');
const SOURCE_SVG = path.join(ICONS_DIR, 'soundlink-icon.svg');

// Sizes to generate
const SIZES = [
  48,
  72,
  96,
  128,
  144,
  152,
  192,
  384,
  512
];

async function convertSvgToPng() {
  try {
    // Check if source exists
    if (!fs.existsSync(SOURCE_SVG)) {
      console.error(`Source SVG not found: ${SOURCE_SVG}`);
      return;
    }

    // Read the SVG file
    const svgBuffer = fs.readFileSync(SOURCE_SVG);
    
    // Process each size
    for (const size of SIZES) {
      const outputPath = path.join(ICONS_DIR, `soundlink-icon-${size}.png`);
      
      console.log(`Converting to ${size}x${size} PNG...`);
      
      // Convert SVG to PNG with specified size
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`Created: ${outputPath}`);
    }
    
    console.log('All icons generated successfully!');
    console.log('');
    console.log('IMPORTANT: Remember to rebuild the app with:');
    console.log('npm run build');
    
  } catch (error) {
    console.error('Error converting icons:', error);
  }
}

// Run the conversion
convertSvgToPng(); 