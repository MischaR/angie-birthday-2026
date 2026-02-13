/**
 * Image optimization script
 * Run: npm run optimize-images
 *
 * 1. Creates WebP versions of all JPG/PNG images in assets
 * 2. Copies colombia.png from archive for fallback, creates colombia.webp
 * 3. Moves original JPG/PNG to archive/originals (keeps WebP in assets)
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const ARCHIVE_DIR = path.join(ASSETS_DIR, 'archive');
const ORIGINALS_DIR = path.join(ARCHIVE_DIR, 'originals');
const QUALITY = { webp: 82 };
const MAX_WIDTH = 1200;

// Images used in index.html (base names for WebP)
const USED_IMAGES = [
  'Angie_Colombia', 'Germany', 'FirstMeetings', 'slovenia', 'zugspitze',
  'StartWork', 'malaga', 'zurich', 'Colombia_Trip', 'Dubai', 'Mexico',
  'France', 'MBA', 'StartWorkFulltime', 'Future', 'colombia'
];

async function optimizeImages() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.log('Run: npm install sharp');
    process.exit(1);
  }

  if (!fs.existsSync(ORIGINALS_DIR)) {
    fs.mkdirSync(ORIGINALS_DIR, { recursive: true });
  }

  // Process colombia.png from archive
  const colombiaSrc = path.join(ARCHIVE_DIR, 'colombia.png');
  if (fs.existsSync(colombiaSrc)) {
    try {
      await sharp(colombiaSrc)
        .webp({ quality: QUALITY.webp })
        .toFile(path.join(ASSETS_DIR, 'colombia.webp'));
      fs.copyFileSync(colombiaSrc, path.join(ASSETS_DIR, 'colombia.png'));
      console.log('  ✓ colombia.png → colombia.webp (from archive)');
    } catch (err) {
      console.error('  ✗ colombia.png:', err.message);
    }
  }

  const files = fs.readdirSync(ASSETS_DIR).filter(f => {
    const fullPath = path.join(ASSETS_DIR, f);
    return fs.statSync(fullPath).isFile() &&
      /\.(jpg|jpeg|png)$/i.test(f) &&
      !f.toLowerCase().includes('favicon') &&
      !f.toLowerCase().startsWith('colombia.'); // Keep colombia.png in assets for fallback
  });

  console.log(`\nConverting ${files.length} images to WebP...\n`);

  for (const file of files) {
    const inputPath = path.join(ASSETS_DIR, file);
    const baseName = file.replace(/\.[^.]+$/i, '');
    const webpPath = path.join(ASSETS_DIR, `${baseName}.webp`);

    try {
      let pipeline = sharp(inputPath);
      const meta = await pipeline.metadata();
      if (meta.width > MAX_WIDTH) {
        pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
      }

      await pipeline.clone().webp({ quality: QUALITY.webp }).toFile(webpPath);
      console.log(`  ✓ ${file} → ${baseName}.webp`);

      // Move original to archive/originals (used as img fallback in <picture>)
      const destPath = path.join(ORIGINALS_DIR, file);
      fs.renameSync(inputPath, destPath);
      console.log(`    → archive/originals/`);
    } catch (err) {
      console.error(`  ✗ ${file}:`, err.message);
    }
  }

  console.log('\nDone! HTML updated to use WebP with fallbacks.');
}

optimizeImages().catch(console.error);
