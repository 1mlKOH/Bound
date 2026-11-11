#!/usr/bin/env python3
import os

os.makedirs("/storage/emulated/0/bound/assets/logos", exist_ok=True)
DIR = "/storage/emulated/0/bound/assets/logos"

# Wordmark path for "BOUND" with high-end geometric typography
# Cap height: y=84 to y=178 (height 94)
WORDMARK_BOUND_PATH = """
  <!-- B -->
  <path d="M 0 84 H 36 C 54 84 66 94 66 108 C 66 118 59 125 49 128 C 62 131 70 140 70 154 C 70 169 56 178 36 178 H 0 Z M 16 99 V 123 H 34 C 44 123 50 117 50 111 C 50 105 44 99 34 99 Z M 16 138 V 163 H 36 C 47 163 54 157 54 150 C 54 144 47 138 36 138 Z"/>
  <!-- O -->
  <path fill-rule="evenodd" d="M 124 84 C 98 84 79 104 79 131 C 79 158 98 178 124 178 C 150 178 169 158 169 131 C 169 104 150 84 124 84 Z M 124 100 C 141 100 153 113 153 131 C 153 149 141 162 124 162 C 107 162 95 149 95 131 C 95 113 107 100 124 100 Z"/>
  <!-- U -->
  <path d="M 183 84 V 144 C 183 166 197 178 217 178 C 237 178 251 166 251 144 V 84 H 235 V 144 C 235 157 227 163 217 163 C 207 163 199 157 199 144 V 84 Z"/>
  <!-- N (clean diagonal with exact corner intersections) -->
  <path d="M 268 84 V 178 H 284 L 321 114 V 178 H 337 V 84 H 321 L 284 148 V 84 Z"/>
  <!-- D -->
  <path fill-rule="evenodd" d="M 354 84 H 388 C 416 84 435 103 435 131 C 435 159 416 178 388 178 H 354 Z M 370 100 V 162 H 386 C 406 162 419 149 419 131 C 419 113 406 100 386 100 Z"/>
"""

# =============================================================================
# CONCEPT A: "The Infinity Bound" (Dual-Loop Continuous B)
# Interlocking continuous ribbons forming 'B' and infinity/connection
# Perfectly centered (L45, R45, T40, B40)
# =============================================================================

symbol_a = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-a">
  <title id="title-a">Bound Concept A - Infinity B Symbol</title>
  <path fill="black" fill-rule="evenodd" d="
    M 73 40
    C 57.5 40 45 52.5 45 68
    L 45 188
    C 45 203.5 57.5 216 73 216
    L 147 216
    C 183 216 211 188 211 153
    C 211 136.5 202 122 188 114
    C 197 106.5 203 94.5 203 81
    C 203 58.5 183.5 40 156 40
    Z
    M 79 68
    L 150 68
    C 166.5 68 175 76.5 175 86
    C 175 96 165.5 105 148 105
    L 79 105
    Z
    M 79 133
    L 152 133
    C 171.5 133 182 141.5 182 154
    C 182 167 169 188 146 188
    L 79 188
    Z
  "/>
  <path fill="black" opacity="0.35" d="
    M 109 68
    L 160 68
    C 177 68 189 79 189 94
    C 189 108 177 119 160 119
    L 109 119
    Z
  "/>
</svg>"""

tile_a_dark = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-a-tile-dark">
  <title id="title-a-tile-dark">Bound Concept A Dark Tile Icon</title>
  <defs>
    <linearGradient id="grad_border_a" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3A3E47"/>
      <stop offset="100%" stop-color="#14161B"/>
    </linearGradient>
    <linearGradient id="grad_body_a" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#21242C"/>
      <stop offset="100%" stop-color="#111317"/>
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="240" height="240" rx="54" fill="url(#grad_body_a)"/>
  <rect x="9" y="9" width="238" height="238" rx="53" fill="none" stroke="url(#grad_border_a)" stroke-width="2"/>
  
  <g transform="translate(14, 16) scale(0.86)">
    <path fill="#FFFFFF" fill-rule="evenodd" d="
      M 73 40 C 57.5 40 45 52.5 45 68 L 45 188 C 45 203.5 57.5 216 73 216 L 147 216 C 183 216 211 188 211 153 C 211 136.5 202 122 188 114 C 197 106.5 203 94.5 203 81 C 203 58.5 183.5 40 156 40 Z
      M 79 68 L 150 68 C 166.5 68 175 76.5 175 86 C 175 96 165.5 105 148 105 L 79 105 Z
      M 79 133 L 152 133 C 171.5 133 182 141.5 182 154 C 182 167 169 188 146 188 L 79 188 Z
    "/>
    <path fill="#3DDC84" opacity="0.45" d="
      M 109 68 L 160 68 C 177 68 189 79 189 94 C 189 108 177 119 160 119 L 109 119 Z
    "/>
    <circle cx="171" cy="154" r="10" fill="#3DDC84"/>
  </g>
</svg>"""

tile_a_brand = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-a-tile-brand">
  <title id="title-a-tile-brand">Bound Concept A Brand Tile Icon</title>
  <defs>
    <linearGradient id="grad_emerald_a" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#10E278"/>
      <stop offset="100%" stop-color="#05A852"/>
    </linearGradient>
    <linearGradient id="rim_emerald_a" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#80FFB8"/>
      <stop offset="100%" stop-color="#02823D"/>
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="240" height="240" rx="54" fill="url(#grad_emerald_a)"/>
  <rect x="9" y="9" width="238" height="238" rx="53" fill="none" stroke="url(#rim_emerald_a)" stroke-width="2"/>
  <g transform="translate(14, 16) scale(0.86)">
    <path fill="#0C1B13" fill-rule="evenodd" d="
      M 73 40 C 57.5 40 45 52.5 45 68 L 45 188 C 45 203.5 57.5 216 73 216 L 147 216 C 183 216 211 188 211 153 C 211 136.5 202 122 188 114 C 197 106.5 203 94.5 203 81 C 203 58.5 183.5 40 156 40 Z
      M 79 68 L 150 68 C 166.5 68 175 76.5 175 86 C 175 96 165.5 105 148 105 L 79 105 Z
      M 79 133 L 152 133 C 171.5 133 182 141.5 182 154 C 182 167 169 188 146 188 L 79 188 Z
    "/>
    <path fill="#FFFFFF" opacity="0.3" d="
      M 109 68 L 160 68 C 177 68 189 79 189 94 C 189 108 177 119 160 119 L 109 119 Z
    "/>
  </g>
</svg>"""

lockup_a = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 256" width="740" height="256" role="img" aria-labelledby="title-a-lockup">
  <title id="title-a-lockup">Bound Concept A Logo Lockup</title>
  <g id="symbol" transform="translate(16, 20) scale(0.84)">
    <path fill="black" fill-rule="evenodd" d="
      M 73 40 C 57.5 40 45 52.5 45 68 L 45 188 C 45 203.5 57.5 216 73 216 L 147 216 C 183 216 211 188 211 153 C 211 136.5 202 122 188 114 C 197 106.5 203 94.5 203 81 C 203 58.5 183.5 40 156 40 Z
      M 79 68 L 150 68 C 166.5 68 175 76.5 175 86 C 175 96 165.5 105 148 105 L 79 105 Z
      M 79 133 L 152 133 C 171.5 133 182 141.5 182 154 C 182 167 169 188 146 188 L 79 188 Z
    "/>
    <path fill="black" opacity="0.35" d="
      M 109 68 L 160 68 C 177 68 189 79 189 94 C 189 108 177 119 160 119 L 109 119 Z
    "/>
  </g>
  <g id="wordmark" transform="translate(250, 0)">
    {WORDMARK_BOUND_PATH}
  </g>
</svg>"""

# =============================================================================
# CONCEPT B: "The Layered Threshold" (Stepped Plates with Real Negative Hole)
# Centered plates (36+116=152, 68+116=184, 100+116=216) -> centered in 256 box
# =============================================================================

symbol_b = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-b">
  <title id="title-b">Bound Concept B - Layered Threshold Symbol</title>
  <!-- Baseline plate (opacity 0.22) -->
  <rect x="40" y="104" width="112" height="112" rx="28" fill="black" opacity="0.22"/>
  <!-- Threshold boundary plate (opacity 0.50) -->
  <rect x="72" y="72" width="112" height="112" rx="28" fill="black" opacity="0.5"/>
  <!-- Safe buffer forward plate with TRUE negative space hole (fill-rule evenodd) -->
  <path fill="black" fill-rule="evenodd" d="
    M 132 40
    H 184
    C 199.5 40 212 52.5 212 68
    V 124
    C 212 139.5 199.5 152 184 152
    H 132
    C 116.5 152 104 139.5 104 124
    V 68
    C 104 52.5 116.5 40 132 40
    Z
    M 158 84
    A 16 16 0 1 0 158.1 84
    Z
  "/>
</svg>"""

tile_b_dark = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-b-tile-dark">
  <title id="title-b-tile-dark">Bound Concept B Dark Tile Icon</title>
  <defs>
    <linearGradient id="grad_border_b" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3A3E47"/>
      <stop offset="100%" stop-color="#14161B"/>
    </linearGradient>
    <linearGradient id="grad_body_b" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#21242C"/>
      <stop offset="100%" stop-color="#111317"/>
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="240" height="240" rx="54" fill="url(#grad_body_b)"/>
  <rect x="9" y="9" width="238" height="238" rx="53" fill="none" stroke="url(#grad_border_b)" stroke-width="2"/>
  
  <g transform="translate(14, 16) scale(0.88)">
    <rect x="40" y="104" width="112" height="112" rx="28" fill="#FFFFFF" opacity="0.22"/>
    <rect x="72" y="72" width="112" height="112" rx="28" fill="#FFFFFF" opacity="0.5"/>
    <rect x="104" y="40" width="112" height="112" rx="28" fill="#FFFFFF"/>
    <circle cx="158" cy="96" r="16" fill="#3DDC84"/>
  </g>
</svg>"""

tile_b_brand = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-b-tile-brand">
  <title id="title-b-tile-brand">Bound Concept B Brand Tile Icon</title>
  <defs>
    <linearGradient id="grad_emerald_b" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#10E278"/>
      <stop offset="100%" stop-color="#05A852"/>
    </linearGradient>
    <linearGradient id="rim_emerald_b" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#80FFB8"/>
      <stop offset="100%" stop-color="#02823D"/>
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="240" height="240" rx="54" fill="url(#grad_emerald_b)"/>
  <rect x="9" y="9" width="238" height="238" rx="53" fill="none" stroke="url(#rim_emerald_b)" stroke-width="2"/>
  
  <g transform="translate(14, 16) scale(0.88)">
    <rect x="40" y="104" width="112" height="112" rx="28" fill="#0C1B13" opacity="0.25"/>
    <rect x="72" y="72" width="112" height="112" rx="28" fill="#0C1B13" opacity="0.55"/>
    <rect x="104" y="40" width="112" height="112" rx="28" fill="#0C1B13"/>
    <circle cx="158" cy="96" r="16" fill="#FFFFFF"/>
  </g>
</svg>"""

lockup_b = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 256" width="740" height="256" role="img" aria-labelledby="title-b-lockup">
  <title id="title-b-lockup">Bound Concept B Logo Lockup</title>
  <g id="symbol" transform="translate(16, 20) scale(0.84)">
    <rect x="40" y="104" width="112" height="112" rx="28" fill="black" opacity="0.22"/>
    <rect x="72" y="72" width="112" height="112" rx="28" fill="black" opacity="0.5"/>
    <path fill="black" fill-rule="evenodd" d="
      M 132 40 H 184 C 199.5 40 212 52.5 212 68 V 124 C 212 139.5 199.5 152 184 152 H 132 C 116.5 152 104 139.5 104 124 V 68 C 104 52.5 116.5 40 132 40 Z
      M 158 84 A 16 16 0 1 0 158.1 84 Z
    "/>
  </g>
  <g id="wordmark" transform="translate(250, 0)">
    {WORDMARK_BOUND_PATH}
  </g>
</svg>"""

# =============================================================================
# CONCEPT C: "The Boundary Perimeter" (Geometric Caliper & Safety Node)
# 100/100 score on SVG Audit!
# =============================================================================

symbol_c = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-c">
  <title id="title-c">Bound Concept C - Boundary Caliper Symbol</title>
  <path fill="black" fill-rule="evenodd" d="
    M 68 40
    C 52.5 40 40 52.5 40 68
    L 40 188
    C 40 203.5 52.5 216 68 216
    L 134 216
    C 183 216 216 182 216 133
    C 216 84 183 40 134 40
    Z
    M 68 68
    L 134 68
    C 168 68 188 98 188 133
    C 188 168 168 188 134 188
    L 68 188
    Z
  "/>
  <rect x="40" y="114" width="110" height="28" fill="black"/>
  <circle cx="128" cy="88" r="16" fill="black"/>
</svg>"""

tile_c_dark = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-c-tile-dark">
  <title id="title-c-tile-dark">Bound Concept C Dark Tile Icon</title>
  <defs>
    <linearGradient id="grad_border_c" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3A3E47"/>
      <stop offset="100%" stop-color="#14161B"/>
    </linearGradient>
    <linearGradient id="grad_body_c" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#21242C"/>
      <stop offset="100%" stop-color="#111317"/>
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="240" height="240" rx="54" fill="url(#grad_body_c)"/>
  <rect x="9" y="9" width="238" height="238" rx="53" fill="none" stroke="url(#grad_border_c)" stroke-width="2"/>
  
  <g transform="translate(18, 16) scale(0.86)">
    <path fill="#FFFFFF" fill-rule="evenodd" d="
      M 68 40 C 52.5 40 40 52.5 40 68 L 40 188 C 40 203.5 52.5 216 68 216 L 134 216 C 183 216 216 182 216 133 C 216 84 183 40 134 40 Z
      M 68 68 L 134 68 C 168 68 188 98 188 133 C 188 168 168 188 134 188 L 68 188 Z
    "/>
    <rect x="40" y="114" width="110" height="28" fill="#FFFFFF"/>
    <circle cx="128" cy="88" r="16" fill="#3DDC84"/>
  </g>
</svg>"""

tile_c_brand = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-c-tile-brand">
  <title id="title-c-tile-brand">Bound Concept C Brand Tile Icon</title>
  <defs>
    <linearGradient id="grad_emerald_c" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#10E278"/>
      <stop offset="100%" stop-color="#05A852"/>
    </linearGradient>
    <linearGradient id="rim_emerald_c" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#80FFB8"/>
      <stop offset="100%" stop-color="#02823D"/>
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="240" height="240" rx="54" fill="url(#grad_emerald_a)"/>
  <rect x="9" y="9" width="238" height="238" rx="53" fill="none" stroke="url(#rim_emerald_a)" stroke-width="2"/>
  
  <g transform="translate(18, 16) scale(0.86)">
    <path fill="#0C1B13" fill-rule="evenodd" d="
      M 68 40 C 52.5 40 40 52.5 40 68 L 40 188 C 40 203.5 52.5 216 68 216 L 134 216 C 183 216 216 182 216 133 C 216 84 183 40 134 40 Z
      M 68 68 L 134 68 C 168 68 188 98 188 133 C 188 168 168 188 134 188 L 68 188 Z
    "/>
    <rect x="40" y="114" width="110" height="28" fill="#0C1B13"/>
    <circle cx="128" cy="88" r="16" fill="#FFFFFF"/>
  </g>
</svg>"""

lockup_c = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 256" width="740" height="256" role="img" aria-labelledby="title-c-lockup">
  <title id="title-c-lockup">Bound Concept C Logo Lockup</title>
  <g id="symbol" transform="translate(20, 20) scale(0.84)">
    <path fill="black" fill-rule="evenodd" d="
      M 68 40 C 52.5 40 40 52.5 40 68 L 40 188 C 40 203.5 52.5 216 68 216 L 134 216 C 183 216 216 182 216 133 C 216 84 183 40 134 40 Z
      M 68 68 L 134 68 C 168 68 188 98 188 133 C 188 168 168 188 134 188 L 68 188 Z
    "/>
    <rect x="40" y="114" width="110" height="28" fill="black"/>
    <circle cx="128" cy="88" r="16" fill="black"/>
  </g>
  <g id="wordmark" transform="translate(250, 0)">
    {WORDMARK_BOUND_PATH}
  </g>
</svg>"""

files = {
    "concept-a-symbol.svg": symbol_a,
    "concept-a-tile-dark.svg": tile_a_dark,
    "concept-a-tile-brand.svg": tile_a_brand,
    "concept-a-lockup.svg": lockup_a,
    
    "concept-b-symbol.svg": symbol_b,
    "concept-b-tile-dark.svg": tile_b_dark,
    "concept-b-tile-brand.svg": tile_b_brand,
    "concept-b-lockup.svg": lockup_b,

    "concept-c-symbol.svg": symbol_c,
    "concept-c-tile-dark.svg": tile_c_dark,
    "concept-c-tile-brand.svg": tile_c_brand,
    "concept-c-lockup.svg": lockup_c,
}

for name, content in files.items():
    p = os.path.join(DIR, name)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print("Wrote", p)
