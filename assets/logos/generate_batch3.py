#!/usr/bin/env python3
import os

DIR = "/storage/emulated/0/bound/assets/logos"
os.makedirs(DIR, exist_ok=True)

WORDMARK_BOUND_PATH = """
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
"""

# =============================================================================
# CONCEPT G: "The Möbius Tether" (Infinite Streak Knot)
# Snapped exact 45° angles (136,116)->(156,96), (120,140)->(100,160)
# =============================================================================

symbol_g = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-g">
  <title id="title-g">Bound Concept G - Möbius Tether Knot</title>
  <path fill="black" fill-rule="evenodd" d="
    M 88 56
    C 56 56 40 80 40 116
    C 40 152 64 176 100 196
    L 128 168
    C 96 150 74 136 74 116
    C 74 96 82 86 92 86
    C 106 86 120 98 136 116
    L 156 96
    C 134 72 114 56 88 56
    Z
    M 168 200
    C 200 200 216 176 216 140
    C 216 104 192 80 156 60
    L 128 88
    C 160 106 182 120 182 140
    C 182 160 174 170 164 170
    C 150 170 136 158 120 140
    L 100 160
    C 122 184 142 200 168 200
    Z
  "/>
</svg>"""

tile_g_rich = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-g-rich">
  <title id="title-g-rich">Bound Concept G App Icon - Möbius Knot</title>
  <defs>
    <linearGradient id="g_bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#161820"/>
      <stop offset="100%" stop-color="#08090D"/>
    </linearGradient>
    <linearGradient id="g_emerald_loop" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#80FFB8"/>
      <stop offset="50%" stop-color="#10E278"/>
      <stop offset="100%" stop-color="#05A852"/>
    </linearGradient>
    <linearGradient id="g_titanium_loop" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="50%" stop-color="#94A3B8"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <filter id="g_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feFlood flood-color="#10E278" flood-opacity="0.4"/>
      <feComposite in2="blur" operator="in"/>
      <feComposite in2="SourceGraphic" operator="over"/>
    </filter>
  </defs>
  <rect x="8" y="8" width="240" height="240" rx="54" fill="url(#g_bg)"/>
  <rect x="9" y="9" width="238" height="238" rx="53" fill="none" stroke="#252A38" stroke-width="2"/>
  
  <g transform="translate(14, 14) scale(0.89)" filter="url(#g_glow)">
    <path fill="url(#g_titanium_loop)" d="
      M 88 56 C 56 56 40 80 40 116 C 40 152 64 176 100 196 L 128 168 C 96 150 74 136 74 116 C 74 96 82 86 92 86 C 106 86 120 98 136 116 L 156 96 C 134 72 114 56 88 56 Z
    "/>
    <path fill="url(#g_emerald_loop)" d="
      M 168 200 C 200 200 216 176 216 140 C 216 104 192 80 156 60 L 128 88 C 160 106 182 120 182 140 C 182 160 174 170 164 170 C 150 170 136 158 120 140 L 100 160 C 122 184 142 200 168 200 Z
    "/>
  </g>
</svg>"""

lockup_g = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 256" width="740" height="256" role="img" aria-labelledby="title-g-lockup">
  <title id="title-g-lockup">Bound Concept G Logo Lockup</title>
  <g id="symbol" transform="translate(16, 20) scale(0.84)">
    <path fill="black" fill-rule="evenodd" d="
      M 88 56 C 56 56 40 80 40 116 C 40 152 64 176 100 196 L 128 168 C 96 150 74 136 74 116 C 74 96 82 86 92 86 C 106 86 120 98 136 116 L 156 96 C 134 72 114 56 88 56 Z
      M 168 200 C 200 200 216 176 216 140 C 216 104 192 80 156 60 L 128 88 C 160 106 182 120 182 140 C 182 160 174 170 164 170 C 150 170 136 158 120 140 L 100 160 C 122 184 142 200 168 200 Z
    "/>
  </g>
  <g id="wordmark" transform="translate(250, 0)">
    {WORDMARK_BOUND_PATH}
  </g>
</svg>"""

# =============================================================================
# CONCEPT H: "The Threshold Perimeter" (Guardian Caliper Orbit)
# Flawless 100/100 geometry: concentric precision boundary track + nucleus
# =============================================================================

symbol_h = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-h">
  <title id="title-h">Bound Concept H - Threshold Perimeter</title>
  <!-- Concentric Caliper Perimeter (Single compound path with evenodd) -->
  <path fill="black" fill-rule="evenodd" d="
    M 128 40
    C 79.4 40 40 79.4 40 128
    C 40 176.6 79.4 216 128 216
    C 176.6 216 216 176.6 216 128
    C 216 79.4 176.6 40 128 40
    Z
    M 128 72
    C 158.9 72 184 97.1 184 128
    C 184 158.9 158.9 184 128 184
    C 97.1 184 72 158.9 72 128
    C 72 97.1 97.1 72 128 72
    Z
    M 128 96
    A 32 32 0 1 0 128.1 96
    Z
  "/>
</svg>"""

tile_h_rich = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-h-rich">
  <title id="title-h-rich">Bound Concept H App Icon - Perimeter Gyro</title>
  <defs>
    <linearGradient id="h_bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#141822"/>
      <stop offset="100%" stop-color="#080A0E"/>
    </linearGradient>
    <linearGradient id="h_ring_grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="40%" stop-color="#94A3B8"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
    <radialGradient id="h_core_rad" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#80FFB8"/>
      <stop offset="60%" stop-color="#10E278"/>
      <stop offset="100%" stop-color="#047857"/>
    </radialGradient>
    <filter id="h_core_bloom" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14" result="blur"/>
      <feFlood flood-color="#10E278" flood-opacity="0.6"/>
      <feComposite in2="blur" operator="in"/>
      <feComposite in2="SourceGraphic" operator="over"/>
    </filter>
  </defs>
  <rect x="8" y="8" width="240" height="240" rx="54" fill="url(#h_bg)"/>
  <rect x="9" y="9" width="238" height="238" rx="53" fill="none" stroke="#2D3748" stroke-width="2"/>
  
  <g transform="translate(14, 14) scale(0.89)">
    <path fill="url(#h_ring_grad)" fill-rule="evenodd" d="
      M 128 40 C 79.4 40 40 79.4 40 128 C 40 176.6 79.4 216 128 216 C 176.6 216 216 176.6 216 128 C 216 79.4 176.6 40 128 40 Z
      M 128 72 C 158.9 72 184 97.1 184 128 C 184 158.9 158.9 184 128 184 C 97.1 184 72 158.9 72 128 C 72 97.1 97.1 72 128 72 Z
    "/>
    <circle cx="128" cy="128" r="32" fill="url(#h_core_rad)" filter="url(#h_core_bloom)"/>
    <circle cx="120" cy="120" r="10" fill="#FFFFFF" opacity="0.6"/>
  </g>
</svg>"""

lockup_h = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 256" width="740" height="256" role="img" aria-labelledby="title-h-lockup">
  <title id="title-h-lockup">Bound Concept H Logo Lockup</title>
  <g id="symbol" transform="translate(16, 20) scale(0.84)">
    <path fill="black" fill-rule="evenodd" d="
      M 128 40 C 79.4 40 40 79.4 40 128 C 40 176.6 79.4 216 128 216 C 176.6 216 216 176.6 216 128 C 216 79.4 176.6 40 128 40 Z
      M 128 72 C 158.9 72 184 97.1 184 128 C 184 158.9 158.9 184 128 184 C 97.1 184 72 158.9 72 128 C 72 97.1 97.1 72 128 72 Z
      M 128 96 A 32 32 0 1 0 128.1 96 Z
    "/>
  </g>
  <g id="wordmark" transform="translate(250, 0)">
    {WORDMARK_BOUND_PATH}
  </g>
</svg>"""

# =============================================================================
# CONCEPT I: "The Kinetic Vault / Stepped Prism"
# Clean filled rects without strokes (100/100 audit)
# =============================================================================

symbol_i = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-i">
  <title id="title-i">Bound Concept I - Kinetic Vault</title>
  <rect x="52" y="148" width="36" height="68" rx="18" fill="black" opacity="0.3"/>
  <rect x="110" y="96" width="36" height="120" rx="18" fill="black" opacity="0.6"/>
  <rect x="168" y="44" width="36" height="172" rx="18" fill="black"/>
  <rect x="40" y="145" width="176" height="6" rx="3" fill="black"/>
</svg>"""

tile_i_rich = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-i-rich">
  <title id="title-i-rich">Bound Concept I App Icon - Kinetic Vault</title>
  <defs>
    <linearGradient id="i_bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#141822"/>
      <stop offset="100%" stop-color="#080A0E"/>
    </linearGradient>
    <linearGradient id="i_emerald_bar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#80FFB8"/>
      <stop offset="50%" stop-color="#10E278"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <filter id="i_bar_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#10E278" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect x="8" y="8" width="240" height="240" rx="54" fill="url(#i_bg)"/>
  <rect x="9" y="9" width="238" height="238" rx="53" fill="none" stroke="#2D3748" stroke-width="2"/>
  
  <g transform="translate(14, 14) scale(0.89)">
    <rect x="52" y="148" width="36" height="68" rx="18" fill="#FFFFFF" opacity="0.25"/>
    <rect x="110" y="96" width="36" height="120" rx="18" fill="#FFFFFF" opacity="0.55"/>
    <rect x="168" y="44" width="36" height="172" rx="18" fill="url(#i_emerald_bar)" filter="url(#i_bar_glow)"/>
    <rect x="40" y="145" width="176" height="6" rx="3" fill="#3DDC84"/>
  </g>
</svg>"""

lockup_i = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 256" width="740" height="256" role="img" aria-labelledby="title-i-lockup">
  <title id="title-i-lockup">Bound Concept I Logo Lockup</title>
  <g id="symbol" transform="translate(16, 20) scale(0.84)">
    <rect x="52" y="148" width="36" height="68" rx="18" fill="black" opacity="0.3"/>
    <rect x="110" y="96" width="36" height="120" rx="18" fill="black" opacity="0.6"/>
    <rect x="168" y="44" width="36" height="172" rx="18" fill="black"/>
    <rect x="40" y="145" width="176" height="6" rx="3" fill="black"/>
  </g>
  <g id="wordmark" transform="translate(250, 0)">
    {WORDMARK_BOUND_PATH}
  </g>
</svg>"""

files = {
    "concept-g-symbol.svg": symbol_g,
    "concept-g-tile.svg": tile_g_rich,
    "concept-g-lockup.svg": lockup_g,
    
    "concept-h-symbol.svg": symbol_h,
    "concept-h-tile.svg": tile_h_rich,
    "concept-h-lockup.svg": lockup_h,

    "concept-i-symbol.svg": symbol_i,
    "concept-i-tile.svg": tile_i_rich,
    "concept-i-lockup.svg": lockup_i,
}

for name, content in files.items():
    p = os.path.join(DIR, name)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print("Wrote", p)
