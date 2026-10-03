const fs = require('fs');
const path = require('path');

const srcManifest = path.join(__dirname, 'manifest.json');
const destManifest = path.join(__dirname, 'dist', 'manifest.json');

if (fs.existsSync(srcManifest)) {
  fs.copyFileSync(srcManifest, destManifest);
  console.log('✓ manifest.json copied to dist/');
}

// Copy extension icons if present
const iconsDir = path.join(__dirname, 'icons');
const destIconsDir = path.join(__dirname, 'dist', 'icons');
if (fs.existsSync(iconsDir)) {
  if (!fs.existsSync(destIconsDir)) fs.mkdirSync(destIconsDir, { recursive: true });
  fs.readdirSync(iconsDir).forEach(file => {
    fs.copyFileSync(path.join(iconsDir, file), path.join(destIconsDir, file));
  });
  console.log('✓ icons copied to dist/');
}
