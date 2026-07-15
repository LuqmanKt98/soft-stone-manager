import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

const BLUE = "#2a78d6";
const BLUE_DARK = "#1c5cab";

// Mountain / soft-stone mark on a blue gradient rounded square.
function iconSVG(size, { maskable = false } = {}) {
  const pad = maskable ? size * 0.14 : 0; // safe area for maskable
  const inner = size - pad * 2;
  const radius = maskable ? size * 0.5 : size * 0.22; // maskable full bg
  const cx = size / 2;
  // Mountain geometry within inner box
  const bx = pad;
  const by = pad;
  const w = inner;
  const h = inner;
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BLUE}"/>
      <stop offset="100%" stop-color="${BLUE_DARK}"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" fill="url(#g)"/>
  <g transform="translate(${bx},${by})">
    <path d="M ${w * 0.16} ${h * 0.74}
             L ${w * 0.42} ${h * 0.34}
             L ${w * 0.56} ${h * 0.52}
             L ${w * 0.68} ${h * 0.36}
             L ${w * 0.86} ${h * 0.74} Z"
          fill="#ffffff"/>
    <circle cx="${w * 0.42}" cy="${h * 0.30}" r="${w * 0.05}" fill="#ffffff" opacity="0.9"/>
  </g>
</svg>`;
}

async function render(size, name, opts) {
  const svg = Buffer.from(iconSVG(size, opts));
  await sharp(svg).png().toFile(join(outDir, name));
  console.log("✓", name);
}

await render(192, "icon-192.png");
await render(512, "icon-512.png");
await render(512, "maskable-512.png", { maskable: true });
await render(180, "apple-touch-icon.png");
await render(32, "favicon-32.png");

console.log("Icons generated in public/icons");
