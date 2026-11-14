const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const imageUtils = require('@expo/image-utils');

const PROJECT_ROOT = '/storage/emulated/0/bound';
const LOGOS_DIR = path.join(PROJECT_ROOT, 'assets/logos');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'assets');
const USER_UPLOADED_PNG = '/data/user/0/com.agy/files/.gemini/antigravity-app/brain/00fe800a-a29a-432c-b7b9-cbe4096f3ed4/.user_uploaded/media_1794654421974_f86e5baa.png';

fs.mkdirSync(LOGOS_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// 1. MASTER SVG DEFINITIONS
// ---------------------------------------------------------------------------

// A. Master Full-Color Tile (1024x1024)
const MASTER_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="100%" height="100%" style="display:block">
  <defs>
    <linearGradient id="bg-master" x1="512" y1="0" x2="512" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1D1E23"/>
      <stop offset="100%" stop-color="#131418"/>
    </linearGradient>
    <clipPath id="waveMedClip-master">
      <circle cx="512" cy="502" r="250"/>
    </clipPath>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg-master)"/>
  <g transform="translate(512 502) scale(1.0000) translate(-512 -502)">
    <!-- Circular Medallion Base -->
    <circle cx="512" cy="502" r="264" fill="#22242C" stroke="rgba(255,255,255,0.46)" stroke-width="14"/>

    <!-- Three Parallel Harmonic S-Curve Ribbons -->
    <g clip-path="url(#waveMedClip-master)">
      <path d="M 190 519 C 340 519, 404 445, 512 445 C 620 445, 684 371, 834 371" fill="none" stroke="#1E9BFF" stroke-width="37" stroke-linecap="round"/>
      <path d="M 190 576 C 340 576, 404 502, 512 502 C 620 502, 684 428, 834 428" fill="none" stroke="#3DDC84" stroke-width="37" stroke-linecap="round"/>
      <path d="M 190 633 C 340 633, 404 559, 512 559 C 620 559, 684 485, 834 485" fill="none" stroke="#FFB020" stroke-width="37" stroke-linecap="round"/>
    </g>
  </g>
</svg>`;

// B. Master Symbol on Transparent Background (512x512)
const SYMBOL_TRANSPARENT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <clipPath id="waveMedClip-trans">
      <circle cx="256" cy="256" r="218"/>
    </clipPath>
  </defs>
  <!-- Circular Medallion Base -->
  <circle cx="256" cy="256" r="230" fill="#22242C" stroke="rgba(255,255,255,0.46)" stroke-width="12"/>

  <!-- Three Parallel Harmonic S-Curve Ribbons -->
  <g clip-path="url(#waveMedClip-trans)">
    <path d="M -25 271 C 106 271, 162 206, 256 206 C 350 206, 406 142, 537 142" fill="none" stroke="#1E9BFF" stroke-width="32" stroke-linecap="round"/>
    <path d="M -25 321 C 106 321, 162 256, 256 256 C 350 256, 406 191, 537 191" fill="none" stroke="#3DDC84" stroke-width="32" stroke-linecap="round"/>
    <path d="M -25 370 C 106 370, 162 306, 256 306 C 350 306, 406 241, 537 241" fill="none" stroke="#FFB020" stroke-width="32" stroke-linecap="round"/>
  </g>
</svg>`;

// C. Monotone Dark (For light backgrounds, documents, black print)
const SYMBOL_MONO_DARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <clipPath id="waveMedClip-mono-dark">
      <circle cx="256" cy="256" r="218"/>
    </clipPath>
  </defs>
  <!-- Circular Medallion Base -->
  <circle cx="256" cy="256" r="230" fill="#F1F3F5" stroke="#0F172A" stroke-width="14"/>

  <!-- Three Parallel Ribbons (Ink Black #0F172A) -->
  <g clip-path="url(#waveMedClip-mono-dark)">
    <path d="M -25 271 C 106 271, 162 206, 256 206 C 350 206, 406 142, 537 142" fill="none" stroke="#0F172A" stroke-width="32" stroke-linecap="round"/>
    <path d="M -25 321 C 106 321, 162 256, 256 256 C 350 256, 406 191, 537 191" fill="none" stroke="#0F172A" stroke-width="32" stroke-linecap="round"/>
    <path d="M -25 370 C 106 370, 162 306, 256 306 C 350 306, 406 241, 537 241" fill="none" stroke="#0F172A" stroke-width="32" stroke-linecap="round"/>
  </g>
</svg>`;

// D. Monotone White (For dark backgrounds, reversed, single ink)
const SYMBOL_MONO_WHITE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <clipPath id="waveMedClip-mono-white">
      <circle cx="256" cy="256" r="218"/>
    </clipPath>
  </defs>
  <!-- Circular Medallion Base -->
  <circle cx="256" cy="256" r="230" fill="none" stroke="#FFFFFF" stroke-width="14"/>

  <!-- Three Parallel Ribbons (Pure White #FFFFFF) -->
  <g clip-path="url(#waveMedClip-mono-white)">
    <path d="M -25 271 C 106 271, 162 206, 256 206 C 350 206, 406 142, 537 142" fill="none" stroke="#FFFFFF" stroke-width="32" stroke-linecap="round"/>
    <path d="M -25 321 C 106 321, 162 256, 256 256 C 350 256, 406 191, 537 191" fill="none" stroke="#FFFFFF" stroke-width="32" stroke-linecap="round"/>
    <path d="M -25 370 C 106 370, 162 306, 256 306 C 350 306, 406 241, 537 241" fill="none" stroke="#FFFFFF" stroke-width="32" stroke-linecap="round"/>
  </g>
</svg>`;

// E. Monotone Brand Emerald (Signature single-color accent)
const SYMBOL_MONO_EMERALD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <clipPath id="waveMedClip-mono-emerald">
      <circle cx="256" cy="256" r="218"/>
    </clipPath>
  </defs>
  <!-- Circular Medallion Base -->
  <circle cx="256" cy="256" r="230" fill="rgba(61, 220, 132, 0.12)" stroke="#3DDC84" stroke-width="14"/>

  <!-- Three Parallel Ribbons (#3DDC84) -->
  <g clip-path="url(#waveMedClip-mono-emerald)">
    <path d="M -25 271 C 106 271, 162 206, 256 206 C 350 206, 406 142, 537 142" fill="none" stroke="#3DDC84" stroke-width="32" stroke-linecap="round"/>
    <path d="M -25 321 C 106 321, 162 256, 256 256 C 350 256, 406 191, 537 191" fill="none" stroke="#3DDC84" stroke-width="32" stroke-linecap="round"/>
    <path d="M -25 370 C 106 370, 162 306, 256 306 C 350 306, 406 241, 537 241" fill="none" stroke="#3DDC84" stroke-width="32" stroke-linecap="round"/>
  </g>
</svg>`;

// F. Favicon Optical Cut (Optimized for 16px - 32px - 48px scale with heavier strokes & full canvas)
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <defs>
    <linearGradient id="bg-fav" x1="128" y1="0" x2="128" y2="256" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1D1E23"/>
      <stop offset="100%" stop-color="#131418"/>
    </linearGradient>
    <clipPath id="fav-clip">
      <circle cx="128" cy="128" r="102"/>
    </clipPath>
  </defs>
  <!-- Dark Background Tile -->
  <rect width="256" height="256" rx="54" fill="url(#bg-fav)"/>
  
  <!-- Outer Rim with optical weight -->
  <circle cx="128" cy="128" r="110" fill="#22242C" stroke="rgba(255,255,255,0.55)" stroke-width="9"/>

  <!-- High-contrast bold ribbons -->
  <g clip-path="url(#fav-clip)">
    <path d="M -15 136 C 53 136, 81 103, 128 103 C 175 103, 203 70, 271 70" fill="none" stroke="#1E9BFF" stroke-width="21" stroke-linecap="round"/>
    <path d="M -15 161 C 53 161, 81 128, 128 128 C 175 128, 203 95, 271 95" fill="none" stroke="#3DDC84" stroke-width="21" stroke-linecap="round"/>
    <path d="M -15 186 C 53 186, 81 153, 128 153 C 175 153, 203 120, 271 120" fill="none" stroke="#FFB020" stroke-width="21" stroke-linecap="round"/>
  </g>
</svg>`;

// G. Notification Icon (Monochrome White Silhouette for Android Status Bar)
const NOTIFICATION_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="100%" height="100%">
  <defs>
    <clipPath id="notif-clip">
      <circle cx="48" cy="48" r="39"/>
    </clipPath>
  </defs>
  <!-- Outer Rim -->
  <circle cx="48" cy="48" r="42" fill="none" stroke="#FFFFFF" stroke-width="5"/>

  <!-- Pure White Ribbons with Transparent Gaps -->
  <g clip-path="url(#notif-clip)">
    <path d="M -6 51 C 20 51, 30 39, 48 39 C 66 39, 76 27, 102 27" fill="none" stroke="#FFFFFF" stroke-width="7.5" stroke-linecap="round"/>
    <path d="M -6 60 C 20 60, 30 48, 48 48 C 66 48, 76 36, 102 36" fill="none" stroke="#FFFFFF" stroke-width="7.5" stroke-linecap="round"/>
    <path d="M -6 69 C 20 69, 30 57, 48 57 C 66 57, 76 45, 102 45" fill="none" stroke="#FFFFFF" stroke-width="7.5" stroke-linecap="round"/>
  </g>
</svg>`;

// Geometric "BOUND" Wordmark vector paths
const WORDMARK_PATHS = (fillColor) => `
  <g fill="${fillColor}">
    <!-- B -->
    <path d="M 0 84 H 36 C 54 84 66 94 66 108 C 66 118 59 125 49 128 C 62 131 70 140 70 154 C 70 169 56 178 36 178 H 0 Z M 16 99 V 123 H 34 C 44 123 50 117 50 111 C 50 105 44 99 34 99 Z M 16 138 V 163 H 36 C 47 163 54 157 54 150 C 54 144 47 138 36 138 Z"/>
    <!-- O -->
    <path fill-rule="evenodd" d="M 124 84 C 98 84 79 104 79 131 C 79 158 98 178 124 178 C 150 178 169 158 169 131 C 169 104 150 84 124 84 Z M 124 100 C 141 100 153 113 153 131 C 153 149 141 162 124 162 C 107 162 95 149 95 131 C 95 113 107 100 124 100 Z"/>
    <!-- U -->
    <path d="M 183 84 V 144 C 183 166 197 178 217 178 C 237 178 251 166 251 144 V 84 H 235 V 144 C 235 157 227 163 217 163 C 207 163 199 157 199 144 V 84 Z"/>
    <!-- N -->
    <path d="M 268 84 V 178 H 284 L 321 114 V 178 H 337 V 84 H 321 L 284 148 V 84 Z"/>
    <!-- D -->
    <path fill-rule="evenodd" d="M 354 84 H 388 C 416 84 435 103 435 131 C 435 159 416 178 388 178 H 354 Z M 370 100 V 162 H 386 C 406 162 419 149 419 131 C 419 113 406 100 386 100 Z"/>
  </g>
`;

// H. Horizontal Lockup - Dark Background (780x256)
const LOCKUP_HORIZONTAL_DARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 256" width="100%" height="100%">
  <defs>
    <clipPath id="h-clip-dark">
      <circle cx="128" cy="128" r="88"/>
    </clipPath>
  </defs>
  <rect width="780" height="256" fill="#0F1015"/>
  <!-- Symbol -->
  <g transform="translate(128 128) scale(0.82) translate(-128 -128)">
    <circle cx="128" cy="128" r="95" fill="#22242C" stroke="rgba(255,255,255,0.46)" stroke-width="7"/>
    <g clip-path="url(#h-clip-dark)">
      <path d="M -15 136 C 53 136, 81 103, 128 103 C 175 103, 203 70, 271 70" fill="none" stroke="#1E9BFF" stroke-width="16" stroke-linecap="round"/>
      <path d="M -15 161 C 53 161, 81 128, 128 128 C 175 128, 203 95, 271 95" fill="none" stroke="#3DDC84" stroke-width="16" stroke-linecap="round"/>
      <path d="M -15 186 C 53 186, 81 153, 128 153 C 175 153, 203 120, 271 120" fill="none" stroke="#FFB020" stroke-width="16" stroke-linecap="round"/>
    </g>
  </g>
  <!-- Wordmark -->
  <g transform="translate(260 0) scale(0.96) translate(0 -5)">
    ${WORDMARK_PATHS('#FFFFFF')}
  </g>
</svg>`;

// I. Horizontal Lockup - Light Background (780x256)
const LOCKUP_HORIZONTAL_LIGHT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 256" width="100%" height="100%">
  <defs>
    <clipPath id="h-clip-light">
      <circle cx="128" cy="128" r="88"/>
    </clipPath>
  </defs>
  <rect width="780" height="256" fill="#FFFFFF"/>
  <!-- Symbol -->
  <g transform="translate(128 128) scale(0.82) translate(-128 -128)">
    <circle cx="128" cy="128" r="95" fill="#F1F3F5" stroke="#0F172A" stroke-width="7"/>
    <g clip-path="url(#h-clip-light)">
      <path d="M -15 136 C 53 136, 81 103, 128 103 C 175 103, 203 70, 271 70" fill="none" stroke="#1E9BFF" stroke-width="16" stroke-linecap="round"/>
      <path d="M -15 161 C 53 161, 81 128, 128 128 C 175 128, 203 95, 271 95" fill="none" stroke="#3DDC84" stroke-width="16" stroke-linecap="round"/>
      <path d="M -15 186 C 53 186, 81 153, 128 153 C 175 153, 203 120, 271 120" fill="none" stroke="#FFB020" stroke-width="16" stroke-linecap="round"/>
    </g>
  </g>
  <!-- Wordmark -->
  <g transform="translate(260 0) scale(0.96) translate(0 -5)">
    ${WORDMARK_PATHS('#0F172A')}
  </g>
</svg>`;

// J. Stacked Lockup - Dark Background (512x512)
const LOCKUP_STACKED_DARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <clipPath id="s-clip-dark">
      <circle cx="256" cy="180" r="115"/>
    </clipPath>
  </defs>
  <rect width="512" height="512" fill="#0F1015"/>
  <!-- Centered Symbol -->
  <g>
    <circle cx="256" cy="180" r="124" fill="#22242C" stroke="rgba(255,255,255,0.46)" stroke-width="8"/>
    <g clip-path="url(#s-clip-dark)">
      <path d="M 68 190 C 158 190, 194 146, 256 146 C 318 146, 354 102, 444 102" fill="none" stroke="#1E9BFF" stroke-width="20" stroke-linecap="round"/>
      <path d="M 68 223 C 158 223, 194 180, 256 180 C 318 180, 354 136, 444 136" fill="none" stroke="#3DDC84" stroke-width="20" stroke-linecap="round"/>
      <path d="M 68 256 C 158 256, 194 213, 256 213 C 318 213, 354 170, 444 170" fill="none" stroke="#FFB020" stroke-width="20" stroke-linecap="round"/>
    </g>
  </g>
  <!-- Centered Wordmark below -->
  <g transform="translate(38 275) scale(1.00)">
    ${WORDMARK_PATHS('#FFFFFF')}
  </g>
</svg>`;

// Write all SVGs to assets/logos/
const SVG_MAP = {
  'bound-logo-master.svg': MASTER_LOGO_SVG,
  'bound-symbol.svg': SYMBOL_TRANSPARENT_SVG,
  'bound-symbol-monotone-dark.svg': SYMBOL_MONO_DARK_SVG,
  'bound-symbol-monotone-white.svg': SYMBOL_MONO_WHITE_SVG,
  'bound-symbol-monotone-emerald.svg': SYMBOL_MONO_EMERALD_SVG,
  'bound-favicon.svg': FAVICON_SVG,
  'bound-notification-icon.svg': NOTIFICATION_ICON_SVG,
  'bound-lockup-horizontal-dark.svg': LOCKUP_HORIZONTAL_DARK_SVG,
  'bound-lockup-horizontal-light.svg': LOCKUP_HORIZONTAL_LIGHT_SVG,
  'bound-lockup-stacked-dark.svg': LOCKUP_STACKED_DARK_SVG,
};

for (const [filename, content] of Object.entries(SVG_MAP)) {
  fs.writeFileSync(path.join(LOGOS_DIR, filename), content.trim());
  console.log('Written SVG:', filename);
}

// ---------------------------------------------------------------------------
// 2. PRODUCTION PNG GENERATION FROM USER UPLOADED MASTER
// ---------------------------------------------------------------------------
async function generateAllPngs() {
  const masterBuf = fs.readFileSync(USER_UPLOADED_PNG);
  const masterPng = PNG.sync.read(masterBuf);

  // 1. Primary App Icon: 1024x1024 master icon
  fs.writeFileSync(path.join(ASSETS_DIR, 'icon.png'), masterBuf);
  console.log('Saved assets/icon.png (1024x1024)');

  // 2. Adaptive Icon Foreground: 512x512 with transparent background outside circular medallion
  // Center: 512, 502, Radius: 264px (outer stroke edge ~271px)
  const adaptivePng = new PNG({ width: masterPng.width, height: masterPng.height });
  const cx = 512, cy = 502;
  const rInside = 267;
  const rOutside = 271;

  for (let y = 0; y < masterPng.height; y++) {
    for (let x = 0; x < masterPng.width; x++) {
      const idx = (masterPng.width * y + x) << 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      adaptivePng.data[idx] = masterPng.data[idx];
      adaptivePng.data[idx + 1] = masterPng.data[idx + 1];
      adaptivePng.data[idx + 2] = masterPng.data[idx + 2];

      if (dist <= rInside) {
        adaptivePng.data[idx + 3] = masterPng.data[idx + 3];
      } else if (dist >= rOutside) {
        adaptivePng.data[idx + 3] = 0;
      } else {
        // Smooth anti-aliased edge falloff
        const factor = (rOutside - dist) / (rOutside - rInside);
        adaptivePng.data[idx + 3] = Math.round(masterPng.data[idx + 3] * factor);
      }
    }
  }

  const adaptive1024Buf = PNG.sync.write(adaptivePng);
  const tempAdaptivePath = path.join(LOGOS_DIR, 'adaptive-temp-1024.png');
  fs.writeFileSync(tempAdaptivePath, adaptive1024Buf);

  // Scale down adaptive foreground to 512x512
  const adaptive512Res = await imageUtils.generateImageAsync(
    { projectRoot: PROJECT_ROOT, cacheType: 'icons' },
    { src: tempAdaptivePath, width: 512, height: 512, resizeMode: 'contain', backgroundColor: 'transparent' }
  );
  fs.writeFileSync(path.join(ASSETS_DIR, 'adaptive-icon.png'), adaptive512Res.source);
  console.log('Saved assets/adaptive-icon.png (512x512 transparent foreground)');
  fs.unlinkSync(tempAdaptivePath);

  // 3. Splash Screen: 512x512 branded splash icon
  const splashRes = await imageUtils.generateImageAsync(
    { projectRoot: PROJECT_ROOT, cacheType: 'icons' },
    { src: USER_UPLOADED_PNG, width: 512, height: 512, resizeMode: 'contain', backgroundColor: 'transparent' }
  );
  fs.writeFileSync(path.join(ASSETS_DIR, 'splash.png'), splashRes.source);
  console.log('Saved assets/splash.png (512x512)');

  // 4. Notification Icon: 96x96 pure white silhouette for Android status bar
  const notifPng = new PNG({ width: masterPng.width, height: masterPng.height });
  for (let y = 0; y < masterPng.height; y++) {
    for (let x = 0; x < masterPng.width; x++) {
      const idx = (masterPng.width * y + x) << 2;
      const r = masterPng.data[idx];
      const g = masterPng.data[idx + 1];
      const b = masterPng.data[idx + 2];

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const isRing = dist >= 254 && dist <= 273 && (r + g + b) > 180;
      const isBlue = b > 160 && b > r + 40;
      const isGreen = g > 140 && g > r + 15 && g > b + 15;
      const isOrange = r > 180 && g > 120 && b < 120;
      const isRibbon = dist < 254 && (isBlue || isGreen || isOrange);

      if (isRing) {
        notifPng.data[idx] = 255;
        notifPng.data[idx + 1] = 255;
        notifPng.data[idx + 2] = 255;
        notifPng.data[idx + 3] = Math.min(255, (r + g + b) - 100);
      } else if (isRibbon) {
        notifPng.data[idx] = 255;
        notifPng.data[idx + 1] = 255;
        notifPng.data[idx + 2] = 255;
        notifPng.data[idx + 3] = 255;
      } else {
        notifPng.data[idx] = 0;
        notifPng.data[idx + 1] = 0;
        notifPng.data[idx + 2] = 0;
        notifPng.data[idx + 3] = 0;
      }
    }
  }

  const notif1024Buf = PNG.sync.write(notifPng);
  const tempNotifPath = path.join(LOGOS_DIR, 'notif-temp-1024.png');
  fs.writeFileSync(tempNotifPath, notif1024Buf);

  const notif96Res = await imageUtils.generateImageAsync(
    { projectRoot: PROJECT_ROOT, cacheType: 'icons' },
    { src: tempNotifPath, width: 96, height: 96, resizeMode: 'contain', backgroundColor: 'transparent' }
  );
  fs.writeFileSync(path.join(ASSETS_DIR, 'notification-icon.png'), notif96Res.source);
  console.log('Saved assets/notification-icon.png (96x96 monochrome silhouette)');
  fs.unlinkSync(tempNotifPath);

  // 5. Favicon: 48x48 web favicon PNG
  const fav48Res = await imageUtils.generateImageAsync(
    { projectRoot: PROJECT_ROOT, cacheType: 'icons' },
    { src: USER_UPLOADED_PNG, width: 48, height: 48, resizeMode: 'contain', backgroundColor: 'transparent' }
  );
  fs.writeFileSync(path.join(ASSETS_DIR, 'favicon.png'), fav48Res.source);
  console.log('Saved assets/favicon.png (48x48)');

  console.log('All production PNGs and icons successfully generated!');
}

generateAllPngs().catch(console.error);
