#!/usr/bin/env python3
"""
Generate Round 4 Logos for Bound - Contextual Student Attendance Tracker
Concepts:
  J: The Attendance Calendar Matrix (Calendar + Timetable + Emerald Checkmark)
  K: The 75% Cutoff Gauge (Circular Cutoff Dial + Threshold Notch + Center Checkmark)
  L: The Bound Student Ledger (Course Notebook Binder + Attendance Badge + Streak Dots)
"""

import os
import math

OUTPUT_DIR = "/storage/emulated/0/bound/assets/logos"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Concept J: The Attendance Calendar Matrix
# ---------------------------------------------------------------------------
CONCEPT_J_SYMBOL = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="j-cal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2A2F3D" />
      <stop offset="100%" stop-color="#141720" />
    </linearGradient>
    <linearGradient id="j-check-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5BFFA8" />
      <stop offset="100%" stop-color="#05DF72" />
    </linearGradient>
  </defs>
  <!-- Calendar Body -->
  <rect x="18" y="24" width="64" height="60" rx="14" fill="url(#j-cal-grad)" stroke="#3E4559" stroke-width="2" />
  
  <!-- Binder Rings / Top Tabs -->
  <rect x="32" y="16" width="6" height="14" rx="3" fill="#8E9BB0" />
  <rect x="62" y="16" width="6" height="14" rx="3" fill="#8E9BB0" />
  
  <!-- Calendar Header Line -->
  <line x1="22" y1="38" x2="78" y2="38" stroke="#3E4559" stroke-width="2" stroke-linecap="round" />
  
  <!-- Timetable Grid Dots (Unmarked Days) -->
  <circle cx="32" cy="48" r="3" fill="#4B5569" />
  <circle cx="50" cy="48" r="3" fill="#4B5569" />
  <circle cx="68" cy="48" r="3" fill="#4B5569" />
  <circle cx="32" cy="62" r="3" fill="#4B5569" />
  <circle cx="50" cy="62" r="3" fill="#4B5569" />
  <circle cx="68" cy="62" r="3" fill="#4B5569" />
  <circle cx="32" cy="74" r="3" fill="#4B5569" />
  <circle cx="68" cy="74" r="3" fill="#4B5569" />
  
  <!-- Hero Attendance Checkmark (Punching out in safe emerald) -->
  <path d="M 38 64 L 48 74 L 72 46" fill="none" stroke="url(#j-check-grad)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
</svg>'''

CONCEPT_J_TILE = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="j-bg-grad" cx="50%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#1E2330" />
      <stop offset="100%" stop-color="#0A0C10" />
    </radialGradient>
    <linearGradient id="j-tile-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4B5568" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#1A202C" stop-opacity="0.2" />
    </linearGradient>
    <linearGradient id="j-card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#242A38" />
      <stop offset="100%" stop-color="#12151D" />
    </linearGradient>
    <linearGradient id="j-check-grad-lg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6EFEB5" />
      <stop offset="100%" stop-color="#05DF72" />
    </linearGradient>
    <filter id="j-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="j-card-shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.7" />
    </filter>
  </defs>
  <!-- Squircle Base -->
  <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#j-bg-grad)" stroke="url(#j-tile-border)" stroke-width="3" />
  
  <!-- Ambient Emerald Aura -->
  <circle cx="270" cy="290" r="140" fill="#05DF72" opacity="0.12" filter="url(#j-glow)" />
  
  <!-- Calendar Card -->
  <g filter="url(#j-card-shadow)">
    <rect x="96" y="120" width="320" height="300" rx="44" fill="url(#j-card-grad)" stroke="#374151" stroke-width="4" />
    
    <!-- Metallic Binder Hinges -->
    <rect x="160" y="86" width="28" height="64" rx="14" fill="#94A3B8" />
    <rect x="166" y="90" width="16" height="56" rx="8" fill="#E2E8F0" />
    <rect x="324" y="86" width="28" height="64" rx="14" fill="#94A3B8" />
    <rect x="330" y="90" width="16" height="56" rx="8" fill="#E2E8F0" />
    
    <!-- Header divider -->
    <line x1="116" y1="190" x2="396" y2="190" stroke="#374151" stroke-width="4" stroke-linecap="round" />
    
    <!-- Grid slots -->
    <circle cx="160" cy="240" r="12" fill="#334155" />
    <circle cx="256" cy="240" r="12" fill="#334155" />
    <circle cx="352" cy="240" r="12" fill="#334155" />
    
    <circle cx="160" cy="308" r="12" fill="#334155" />
    <circle cx="352" cy="308" r="12" fill="#334155" />
    
    <circle cx="160" cy="372" r="12" fill="#334155" />
    <circle cx="256" cy="372" r="12" fill="#334155" />
    <circle cx="352" cy="372" r="12" fill="#334155" />
    
    <!-- Hero Attendance Checkmark in safe zone -->
    <path d="M 200 310 L 246 356 L 350 230" fill="none" stroke="url(#j-check-grad-lg)" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" filter="url(#j-glow)" />
  </g>
</svg>'''

CONCEPT_J_LOCKUP = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="100%" height="100%">
  <defs>
    <linearGradient id="jl-check-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5BFFA8" />
      <stop offset="100%" stop-color="#05DF72" />
    </linearGradient>
    <linearGradient id="jl-card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#242A38" />
      <stop offset="100%" stop-color="#12151D" />
    </linearGradient>
  </defs>
  <!-- Symbol (56x56) -->
  <g transform="translate(12, 12)">
    <rect x="4" y="8" width="48" height="44" rx="10" fill="url(#jl-card-grad)" stroke="#374151" stroke-width="2" />
    <rect x="14" y="2" width="5" height="10" rx="2" fill="#94A3B8" />
    <rect x="37" y="2" width="5" height="10" rx="2" fill="#94A3B8" />
    <line x1="8" y1="19" x2="48" y2="19" stroke="#374151" stroke-width="2" />
    <!-- Checkmark -->
    <path d="M 18 33 L 26 41 L 42 23" fill="none" stroke="url(#jl-check-grad)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
  </g>
  <!-- Wordmark -->
  <text x="82" y="47" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', sans-serif" font-size="28" font-weight="700" fill="#F8FAFC" letter-spacing="-0.5">Bound</text>
  <text x="82" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Text', sans-serif" font-size="10" font-weight="600" fill="#05DF72" letter-spacing="1.2">ATTENDANCE</text>
</svg>'''

# ---------------------------------------------------------------------------
# Concept K: The 75% Cutoff Gauge & Checkmark
# ---------------------------------------------------------------------------
# Gauge Arc: A 270-degree arc from 135 deg to 405 deg.
# 75% mark is at 135 + 0.75 * 270 = 337.5 degrees (top right).
# Center at (50, 50), radius 34.
CONCEPT_K_SYMBOL = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="k-arc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="60%" stop-color="#05DF72" />
      <stop offset="100%" stop-color="#5BFFA8" />
    </linearGradient>
  </defs>
  <!-- Outer Inactive Track -->
  <circle cx="50" cy="50" r="36" fill="none" stroke="#252A38" stroke-width="7" />
  
  <!-- Active Attendance Arc (exceeding 75% cutoff into safety) -->
  <!-- Stroke-dasharray for r=36 is 2*pi*36 ~ 226.2. 80% coverage = 181 -->
  <circle cx="50" cy="50" r="36" fill="none" stroke="url(#k-arc-grad)" stroke-width="7"
          stroke-dasharray="181 226" stroke-dashoffset="56" stroke-linecap="round" />
  
  <!-- 75% Cutoff Threshold Milestone Tick (at top-right ~45 deg) -->
  <line x1="72" y1="28" x2="80" y2="20" stroke="#F43F5E" stroke-width="3" stroke-linecap="round" />
  
  <!-- Center Affirmative Checkmark -->
  <path d="M 36 50 L 46 60 L 64 40" fill="none" stroke="#5BFFA8" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
</svg>'''

CONCEPT_K_TILE = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="k-bg-grad" cx="50%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#181D28" />
      <stop offset="100%" stop-color="#08090C" />
    </radialGradient>
    <linearGradient id="k-tile-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#475569" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#1E293B" stop-opacity="0.2" />
    </linearGradient>
    <linearGradient id="k-arc-grad-lg" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="50%" stop-color="#05DF72" />
      <stop offset="100%" stop-color="#6EFEB5" />
    </linearGradient>
    <filter id="k-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <radialGradient id="k-core-grad" cx="40%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#1E2536" />
      <stop offset="100%" stop-color="#0D1117" />
    </radialGradient>
  </defs>
  <!-- Squircle Base -->
  <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#k-bg-grad)" stroke="url(#k-tile-border)" stroke-width="3" />
  
  <!-- Outer Bezel Ring -->
  <circle cx="256" cy="256" r="172" fill="none" stroke="#1F2430" stroke-width="32" />
  
  <!-- Active Attendance Gauge Arc: r=172, circumference ~ 1080. 82% arc ~ 885 -->
  <circle cx="256" cy="256" r="172" fill="none" stroke="url(#k-arc-grad-lg)" stroke-width="32"
          stroke-dasharray="860 1080" stroke-dashoffset="270" stroke-linecap="round" filter="url(#k-glow)" />
          
  <!-- 75% Cutoff Threshold Needle / Flag -->
  <line x1="365" y1="147" x2="400" y2="112" stroke="#F43F5E" stroke-width="10" stroke-linecap="round" />
  <!-- Text Label for 75% Marker -->
  <text x="408" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" font-size="22" font-weight="800" fill="#F43F5E">75%</text>
  
  <!-- Inner Floating Obsidian Core -->
  <circle cx="256" cy="256" r="118" fill="url(#k-core-grad)" stroke="#2C3549" stroke-width="4" />
  
  <!-- Bold Centered Emerald Checkmark -->
  <path d="M 195 258 L 238 301 L 325 205" fill="none" stroke="#6EFEB5" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" filter="url(#k-glow)" />
</svg>'''

CONCEPT_K_LOCKUP = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="100%" height="100%">
  <defs>
    <linearGradient id="kl-arc-grad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="70%" stop-color="#05DF72" />
      <stop offset="100%" stop-color="#5BFFA8" />
    </linearGradient>
  </defs>
  <!-- Symbol (56x56) -->
  <g transform="translate(12, 12)">
    <circle cx="28" cy="28" r="22" fill="none" stroke="#252A38" stroke-width="5" />
    <circle cx="28" cy="28" r="22" fill="none" stroke="url(#kl-arc-grad)" stroke-width="5"
            stroke-dasharray="110 138" stroke-dashoffset="35" stroke-linecap="round" />
    <line x1="42" y1="14" x2="48" y2="8" stroke="#F43F5E" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 19 28 L 25 34 L 38 21" fill="none" stroke="#5BFFA8" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>
  <!-- Wordmark -->
  <text x="82" y="47" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', sans-serif" font-size="28" font-weight="700" fill="#F8FAFC" letter-spacing="-0.5">Bound</text>
  <text x="82" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Text', sans-serif" font-size="10" font-weight="600" fill="#05DF72" letter-spacing="1.2">THRESHOLD 75%</text>
</svg>'''

# ---------------------------------------------------------------------------
# Concept L: The Bound Student Ledger (Course Notebook + Attendance Badge)
# ---------------------------------------------------------------------------
CONCEPT_L_SYMBOL = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="l-book-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#242B3A" />
      <stop offset="100%" stop-color="#10131A" />
    </linearGradient>
    <linearGradient id="l-badge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5BFFA8" />
      <stop offset="100%" stop-color="#05DF72" />
    </linearGradient>
  </defs>
  <!-- Notebook Cover with Left Binding -->
  <rect x="24" y="16" width="56" height="68" rx="10" fill="url(#l-book-grad)" stroke="#3E475C" stroke-width="2" />
  
  <!-- Spiral Wire Rings on Left Spine (Playing on 'Bound') -->
  <rect x="18" y="26" width="12" height="5" rx="2.5" fill="#94A3B8" />
  <rect x="18" y="42" width="12" height="5" rx="2.5" fill="#94A3B8" />
  <rect x="18" y="58" width="12" height="5" rx="2.5" fill="#94A3B8" />
  
  <!-- Subtle Spine crease line -->
  <line x1="34" y1="16" x2="34" y2="84" stroke="#1E2330" stroke-width="2" />
  
  <!-- Center Attendance Shield Badge -->
  <rect x="42" y="32" width="28" height="28" rx="7" fill="#171D27" stroke="#334155" stroke-width="1.5" />
  
  <!-- Radiant Emerald Checkmark inside badge -->
  <path d="M 48 45 L 54 51 L 64 39" fill="none" stroke="url(#l-badge-grad)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
  
  <!-- Attendance Streak Pips -->
  <circle cx="46" cy="68" r="2.5" fill="#05DF72" />
  <circle cx="56" cy="68" r="2.5" fill="#05DF72" />
  <circle cx="66" cy="68" r="2.5" fill="#475569" />
</svg>'''

CONCEPT_L_TILE = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="l-bg-grad" cx="50%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#1A202C" />
      <stop offset="100%" stop-color="#090B0E" />
    </radialGradient>
    <linearGradient id="l-tile-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#475569" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#1E293B" stop-opacity="0.2" />
    </linearGradient>
    <linearGradient id="l-book-grad-lg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#242B3A" />
      <stop offset="100%" stop-color="#121620" />
    </linearGradient>
    <linearGradient id="l-badge-grad-lg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6EFEB5" />
      <stop offset="100%" stop-color="#05DF72" />
    </linearGradient>
    <filter id="l-shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000000" flood-opacity="0.75" />
    </filter>
    <filter id="l-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <!-- Squircle Base -->
  <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#l-bg-grad)" stroke="url(#l-tile-border)" stroke-width="3" />
  
  <!-- Hardbound Notebook Container -->
  <g filter="url(#l-shadow)">
    <!-- Book Cover -->
    <rect x="120" y="86" width="280" height="340" rx="42" fill="url(#l-book-grad-lg)" stroke="#374151" stroke-width="4" />
    
    <!-- Metallic Spiral Rings (Physical 'Bound' motif) -->
    <g fill="#94A3B8">
      <rect x="92" y="140" width="56" height="24" rx="12" />
      <rect x="96" y="144" width="48" height="16" rx="8" fill="#E2E8F0" />
      
      <rect x="92" y="220" width="56" height="24" rx="12" />
      <rect x="96" y="224" width="48" height="16" rx="8" fill="#E2E8F0" />
      
      <rect x="92" y="300" width="56" height="24" rx="12" />
      <rect x="96" y="304" width="48" height="16" rx="8" fill="#E2E8F0" />
      
      <rect x="92" y="380" width="56" height="24" rx="12" />
      <rect x="96" y="384" width="48" height="16" rx="8" fill="#E2E8F0" />
    </g>
    
    <!-- Left spine line -->
    <line x1="172" y1="86" x2="172" y2="426" stroke="#111827" stroke-width="4" />
    
    <!-- Center Attendance Status Card -->
    <rect x="210" y="160" width="144" height="144" rx="32" fill="#161C26" stroke="#2D3748" stroke-width="3" />
    
    <!-- Glowing Emerald Attendance Checkmark -->
    <path d="M 240 230 L 270 260 L 324 196" fill="none" stroke="url(#l-badge-grad-lg)" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" filter="url(#l-glow)" />
    
    <!-- Streak status pills below card -->
    <g transform="translate(222, 340)">
      <circle cx="20" cy="16" r="14" fill="#05DF72" filter="url(#l-glow)" />
      <circle cx="60" cy="16" r="14" fill="#05DF72" filter="url(#l-glow)" />
      <circle cx="100" cy="16" r="14" fill="#334155" />
    </g>
  </g>
</svg>'''

CONCEPT_L_LOCKUP = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="100%" height="100%">
  <defs>
    <linearGradient id="ll-badge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5BFFA8" />
      <stop offset="100%" stop-color="#05DF72" />
    </linearGradient>
    <linearGradient id="ll-book-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#242B3A" />
      <stop offset="100%" stop-color="#121620" />
    </linearGradient>
  </defs>
  <!-- Symbol (56x56) -->
  <g transform="translate(12, 12)">
    <rect x="10" y="4" width="42" height="48" rx="8" fill="url(#ll-book-grad)" stroke="#374151" stroke-width="2" />
    <rect x="4" y="12" width="10" height="4" rx="2" fill="#94A3B8" />
    <rect x="4" y="24" width="10" height="4" rx="2" fill="#94A3B8" />
    <rect x="4" y="36" width="10" height="4" rx="2" fill="#94A3B8" />
    <line x1="18" y1="4" x2="18" y2="52" stroke="#111827" stroke-width="2" />
    <path d="M 26 28 L 32 34 L 44 20" fill="none" stroke="url(#ll-badge-grad)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>
  <!-- Wordmark -->
  <text x="82" y="47" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', sans-serif" font-size="28" font-weight="700" fill="#F8FAFC" letter-spacing="-0.5">Bound</text>
  <text x="82" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Text', sans-serif" font-size="10" font-weight="600" fill="#05DF72" letter-spacing="1.2">CLASS LOG</text>
</svg>'''

files = {
    "concept-j-symbol.svg": CONCEPT_J_SYMBOL,
    "concept-j-tile.svg": CONCEPT_J_TILE,
    "concept-j-lockup.svg": CONCEPT_J_LOCKUP,
    "concept-k-symbol.svg": CONCEPT_K_SYMBOL,
    "concept-k-tile.svg": CONCEPT_K_TILE,
    "concept-k-lockup.svg": CONCEPT_K_LOCKUP,
    "concept-l-symbol.svg": CONCEPT_L_SYMBOL,
    "concept-l-tile.svg": CONCEPT_L_TILE,
    "concept-l-lockup.svg": CONCEPT_L_LOCKUP,
}

for name, content in files.items():
    path = os.path.join(OUTPUT_DIR, name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Generated {name} ({len(content)} bytes)")

print("All Round 4 contextual SVGs generated successfully.")
