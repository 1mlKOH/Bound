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
# CONCEPT D: "The Glassmorphic Safety Gauge"
# Centered (L45, R45, T40, B40)
# =============================================================================

symbol_d = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-d">
  <title id="title-d">Bound Concept D - Glassmorphic Safety Gauge Symbol</title>
  <path fill="black" fill-rule="evenodd" d="
    M 73 40
    H 153
    C 181 40 203 59 203 84
    C 203 98 195 110 183 118
    C 199 126 211 142 211 162
    C 211 192 186 216 153 216
    H 73
    C 57.5 216 45 203.5 45 188
    V 68
    C 45 52.5 57.5 40 73 40
    Z
    M 77 68
    V 112
    H 147
    C 163 112 173 100 173 90
    C 173 80 163 68 147 68
    Z
    M 77 136
    V 188
    H 149
    C 169 188 181 176 181 162
    C 181 148 169 136 149 136
    Z
  "/>
  <rect x="77" y="152" width="96" height="36" rx="10" fill="black" opacity="0.3"/>
</svg>"""

tile_d_rich = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-d-rich">
  <title id="title-d-rich">Bound Concept D Glassmorphic App Icon</title>
  <defs>
    <linearGradient id="d_bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#181D26"/>
      <stop offset="100%" stop-color="#0A0C10"/>
    </linearGradient>
    <linearGradient id="d_rim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3D4758"/>
      <stop offset="100%" stop-color="#141822"/>
    </linearGradient>
    <radialGradient id="d_emerald_bloom" cx="65%" cy="75%" r="60%">
      <stop offset="0%" stop-color="#10E278" stop-opacity="0.45"/>
      <stop offset="50%" stop-color="#05A852" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#0A0C10" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="d_glass_spec" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
      <stop offset="40%" stop-color="#E2E8F0" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="#94A3B8" stop-opacity="0.5"/>
    </linearGradient>
    <linearGradient id="d_liquid" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#05DF72"/>
      <stop offset="100%" stop-color="#3DDC84"/>
    </linearGradient>
    <filter id="d_drop" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#05DF72" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect x="8" y="8" width="240" height="240" rx="54" fill="url(#d_bg)"/>
  <rect x="9" y="9" width="238" height="238" rx="53" fill="none" stroke="url(#d_rim)" stroke-width="2"/>
  <rect x="8" y="8" width="240" height="240" rx="54" fill="url(#d_emerald_bloom)"/>

  <g transform="translate(14, 16) scale(0.86)">
    <path filter="url(#d_drop)" fill="url(#d_liquid)" d="
      M 77 148 H 149 C 165 148 177 156 177 168 C 177 180 165 188 149 188 H 77 Z
    "/>
    <path fill="url(#d_glass_spec)" fill-rule="evenodd" d="
      M 73 40 H 153 C 181 40 203 59 203 84 C 203 98 195 110 183 118 C 199 126 211 142 211 162 C 211 192 186 216 153 216 H 73 C 57.5 216 45 203.5 45 188 V 68 C 45 52.5 57.5 40 73 40 Z
      M 77 68 V 112 H 147 C 163 112 173 100 173 90 C 173 80 163 68 147 68 Z
      M 77 136 V 188 H 149 C 169 188 181 176 181 162 C 181 148 169 136 149 136 Z
    "/>
    <path fill="#FFFFFF" opacity="0.6" d="
      M 73 40 H 153 C 173 40 190 50 197 64 H 69 C 69 52 75 42 73 40 Z
    "/>
    <circle cx="157" cy="90" r="12" fill="#3DDC84"/>
  </g>
</svg>"""

lockup_d = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 256" width="740" height="256" role="img" aria-labelledby="title-d-lockup">
  <title id="title-d-lockup">Bound Concept D Logo Lockup</title>
  <g id="symbol" transform="translate(16, 20) scale(0.84)">
    <path fill="black" fill-rule="evenodd" d="
      M 73 40 H 153 C 181 40 203 59 203 84 C 203 98 195 110 183 118 C 199 126 211 142 211 162 C 211 192 186 216 153 216 H 73 C 57.5 216 45 203.5 45 188 V 68 C 45 52.5 57.5 40 73 40 Z
      M 77 68 V 112 H 147 C 163 112 173 100 173 90 C 173 80 163 68 147 68 Z
      M 77 136 V 188 H 149 C 169 188 181 176 181 162 C 181 148 169 136 149 136 Z
    "/>
    <rect x="77" y="152" width="96" height="36" rx="10" fill="black" opacity="0.3"/>
  </g>
  <g id="wordmark" transform="translate(250, 0)">
    {WORDMARK_BOUND_PATH}
  </g>
</svg>"""

# =============================================================================
# CONCEPT E: "The Isometric Boundary Ribbon" (3D Faceted B with true negative cuts)
# Snapped angles: 45° clean diagonals
# =============================================================================

symbol_e = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-e">
  <title id="title-e">Bound Concept E - Isometric Boundary Ribbon Symbol</title>
  <!-- Single compound path with true negative space holes (fill-rule evenodd) -->
  <path fill="black" fill-rule="evenodd" d="
    M 52 44
    H 148
    L 196 92
    L 156 128
    L 204 176
    L 164 216
    H 52
    L 92 176
    H 148
    L 172 176
    L 140 144
    H 92
    L 52 104
    Z
    M 92 76
    H 136
    L 156 96
    L 136 116
    H 92
    Z
    M 108 156
    H 148
    L 168 176
    L 148 196
    H 108
    Z
  "/>
</svg>"""

tile_e_rich = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-e-rich">
  <title id="title-e-rich">Bound Concept E 3D Isometric App Icon</title>
  <defs>
    <linearGradient id="e_bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#14171E"/>
      <stop offset="100%" stop-color="#08090C"/>
    </linearGradient>
    <linearGradient id="e_front" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#10E278"/>
      <stop offset="100%" stop-color="#05A852"/>
    </linearGradient>
    <linearGradient id="e_top" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#80FFB8"/>
      <stop offset="100%" stop-color="#3DDC84"/>
    </linearGradient>
    <filter id="e_cast_shadow" x="-20%" y="-20%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="14" result="blur"/>
      <feOffset dx="0" dy="14"/>
      <feFlood flood-color="#05DF72" flood-opacity="0.35"/>
      <feComposite in2="blur" operator="in"/>
      <feComposite in2="SourceGraphic" operator="over"/>
    </filter>
  </defs>
  <rect x="8" y="8" width="240" height="240" rx="54" fill="url(#e_bg)"/>
  <rect x="9" y="9" width="238" height="238" rx="53" fill="none" stroke="#252B38" stroke-width="2"/>
  
  <g transform="translate(16, 16) scale(0.88)" filter="url(#e_cast_shadow)">
    <path fill="url(#e_front)" fill-rule="evenodd" d="
      M 52 44 H 148 L 196 92 L 156 128 L 204 176 L 164 216 H 52 L 92 176 H 148 L 172 176 L 140 144 H 92 L 52 104 Z
      M 92 76 H 136 L 156 96 L 136 116 H 92 Z
      M 108 156 H 148 L 168 176 L 148 196 H 108 Z
    "/>
    <!-- Top-plane highlight plate -->
    <polygon points="52,44 148,44 168,64 72,64" fill="url(#e_top)"/>
  </g>
</svg>"""

lockup_e = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 256" width="740" height="256" role="img" aria-labelledby="title-e-lockup">
  <title id="title-e-lockup">Bound Concept E Logo Lockup</title>
  <g id="symbol" transform="translate(16, 20) scale(0.84)">
    <path fill="black" fill-rule="evenodd" d="
      M 52 44 H 148 L 196 92 L 156 128 L 204 176 L 164 216 H 52 L 92 176 H 148 L 172 176 L 140 144 H 92 L 52 104 Z
      M 92 76 H 136 L 156 96 L 136 116 H 92 Z
      M 108 156 H 148 L 168 176 L 148 196 H 108 Z
    "/>
  </g>
  <g id="wordmark" transform="translate(250, 0)">
    {WORDMARK_BOUND_PATH}
  </g>
</svg>"""

# =============================================================================
# CONCEPT F: "The Chrono-Loop / Radial Node" (Precision Ring with true donut hole)
# =============================================================================

symbol_f = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-f">
  <title id="title-f">Bound Concept F - Chrono Loop Symbol</title>
  <!-- Timeline spine -->
  <rect x="46" y="40" width="28" height="176" rx="14" fill="black"/>
  <!-- Circular track with true negative hole -->
  <path fill="black" fill-rule="evenodd" d="
    M 144 94
    C 178.2 94 206 121.8 206 156
    C 206 190.2 178.2 216 144 216
    C 109.8 216 82 190.2 82 156
    C 82 121.8 109.8 94 144 94
    Z
    M 144 126
    C 160.5 126 174 139.5 174 156
    C 174 172.5 160.5 184 144 184
    C 127.5 184 114 172.5 114 156
    C 114 139.5 127.5 126 144 126
    Z
  "/>
  <!-- Upper Attendance Beacon with true negative cutout ring -->
  <path fill="black" fill-rule="evenodd" d="
    M 144 42
    A 26 26 0 1 0 144.1 42
    Z
    M 144 58
    A 10 10 0 1 1 143.9 58
    Z
  "/>
</svg>"""

tile_f_rich = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-f-rich">
  <title id="title-f-rich">Bound Concept F Chrono App Icon</title>
  <defs>
    <linearGradient id="f_bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#141822"/>
      <stop offset="100%" stop-color="#080A0E"/>
    </linearGradient>
    <linearGradient id="f_track" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#05DF72"/>
      <stop offset="50%" stop-color="#3DDC84"/>
      <stop offset="100%" stop-color="#02823D"/>
    </linearGradient>
    <filter id="f_core_glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feFlood flood-color="#3DDC84" flood-opacity="0.6"/>
      <feComposite in2="blur" operator="in"/>
      <feComposite in2="SourceGraphic" operator="over"/>
    </filter>
  </defs>
  <rect x="8" y="8" width="240" height="240" rx="54" fill="url(#f_bg)"/>
  <rect x="9" y="9" width="238" height="238" rx="53" fill="none" stroke="#2D3748" stroke-width="2"/>
  
  <g transform="translate(18, 16) scale(0.86)">
    <rect x="46" y="40" width="28" height="176" rx="14" fill="#FFFFFF"/>
    <path fill="url(#f_track)" fill-rule="evenodd" d="
      M 144 94 C 178.2 94 206 121.8 206 156 C 206 190.2 178.2 216 144 216 C 109.8 216 82 190.2 82 156 C 82 121.8 109.8 94 144 94 Z
      M 144 126 C 160.5 126 174 139.5 174 156 C 174 172.5 160.5 184 144 184 C 127.5 184 114 172.5 114 156 C 114 139.5 127.5 126 144 126 Z
    "/>
    <circle cx="144" cy="68" r="26" fill="#3DDC84" filter="url(#f_core_glow)"/>
    <circle cx="144" cy="68" r="10" fill="#FFFFFF"/>
  </g>
</svg>"""

lockup_f = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 256" width="740" height="256" role="img" aria-labelledby="title-f-lockup">
  <title id="title-f-lockup">Bound Concept F Logo Lockup</title>
  <g id="symbol" transform="translate(16, 20) scale(0.84)">
    <rect x="46" y="40" width="28" height="176" rx="14" fill="black"/>
    <path fill="black" fill-rule="evenodd" d="
      M 144 94 C 178.2 94 206 121.8 206 156 C 206 190.2 178.2 216 144 216 C 109.8 216 82 190.2 82 156 C 82 121.8 109.8 94 144 94 Z
      M 144 126 C 160.5 126 174 139.5 174 156 C 174 172.5 160.5 184 144 184 C 127.5 184 114 172.5 114 156 C 114 139.5 127.5 126 144 126 Z
    "/>
    <path fill="black" fill-rule="evenodd" d="
      M 144 42 A 26 26 0 1 0 144.1 42 Z
      M 144 58 A 10 10 0 1 1 143.9 58 Z
    "/>
  </g>
  <g id="wordmark" transform="translate(250, 0)">
    {WORDMARK_BOUND_PATH}
  </g>
</svg>"""

files = {
    "concept-d-symbol.svg": symbol_d,
    "concept-d-tile.svg": tile_d_rich,
    "concept-d-lockup.svg": lockup_d,
    
    "concept-e-symbol.svg": symbol_e,
    "concept-e-tile.svg": tile_e_rich,
    "concept-e-lockup.svg": lockup_e,

    "concept-f-symbol.svg": symbol_f,
    "concept-f-tile.svg": tile_f_rich,
    "concept-f-lockup.svg": lockup_f,
}

for name, content in files.items():
    p = os.path.join(DIR, name)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print("Wrote", p)
