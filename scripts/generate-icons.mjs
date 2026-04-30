/**
 * Generates pwa-192x192.png and pwa-512x512.png from public/favicon.svg
 * Run once: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgPath = join(root, 'public', 'favicon.svg');
const outDir = join(root, 'public', 'icons');

mkdirSync(outDir, { recursive: true });

const svgBuffer = readFileSync(svgPath);

const sizes = [192, 512];

for (const size of sizes) {
  const outPath = join(outDir, `pwa-${size}x${size}.png`);

  await sharp(svgBuffer)
    .resize(size, size, { fit: 'contain', background: { r: 9, g: 9, b: 11, alpha: 1 } })
    .png()
    .toFile(outPath);

  console.log(`Generated ${outPath}`);
}

console.log('Icons generated successfully.');
