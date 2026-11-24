// ============================================================================
// Kawaii Lineless Flat-Vector Illustrations & Data (Toddler Amusement Park)
// ============================================================================

// 1. 9 Vivid Toddler Colors (Single Source of Truth Palette + Musical Frequencies)
window.COLOR_DATA = [
  { id: 'red', name: 'Red', hex: '#FF3B30', rim: '#C81E14', light: '#FF7A73', textDark: false, freq: 261.63 },
  { id: 'orange', name: 'Orange', hex: '#FF8A00', rim: '#C96400', light: '#FFB85C', textDark: false, freq: 293.66 },
  { id: 'yellow', name: 'Yellow', hex: '#FFD600', rim: '#D1A600', light: '#FFF07A', textDark: true, freq: 329.63 },
  { id: 'green', name: 'Green', hex: '#24C958', rim: '#15943D', light: '#6BE690', textDark: false, freq: 349.23 },
  { id: 'blue', name: 'Blue', hex: '#2B6BFF', rim: '#1847BA', light: '#73A0FF', textDark: false, freq: 392.00 },
  { id: 'purple', name: 'Purple', hex: '#8C4BFF', rim: '#6125CC', light: '#BD94FF', textDark: false, freq: 440.00 },
  { id: 'pink', name: 'Pink', hex: '#FF3D9A', rim: '#C41C6D', light: '#FF8AC2', textDark: false, freq: 493.88 },
  { id: 'white', name: 'White', hex: '#FFFFFF', rim: '#B8CBE0', light: '#FFFFFF', textDark: true, freq: 523.25 },
  { id: 'brown', name: 'Brown', hex: '#8E5431', rim: '#5E341B', light: '#BD8662', textDark: false, freq: 587.33 },
];

window.PALETTE = window.COLOR_DATA.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {});

// 2. 10 Numbers (1..10) with Bright Distinct Balloon Colors
window.NUMBER_DATA = [
  { num: 1, id: '1', word: 'One', hex: '#FF3B30', rim: '#C81E14', textDark: false },
  { num: 2, id: '2', word: 'Two', hex: '#FF8A00', rim: '#C96400', textDark: false },
  { num: 3, id: '3', word: 'Three', hex: '#FFD600', rim: '#C99E00', textDark: true },
  { num: 4, id: '4', word: 'Four', hex: '#24C958', rim: '#15943D', textDark: false },
  { num: 5, id: '5', word: 'Five', hex: '#2B6BFF', rim: '#1847BA', textDark: false },
  { num: 6, id: '6', word: 'Six', hex: '#00B894', rim: '#00876C', textDark: false },
  { num: 7, id: '7', word: 'Seven', hex: '#8C4BFF', rim: '#6125CC', textDark: false },
  { num: 8, id: '8', word: 'Eight', hex: '#FF3D9A', rim: '#C41C6D', textDark: false },
  { num: 9, id: '9', word: 'Nine', hex: '#8E5431', rim: '#5E341B', textDark: false },
  { num: 10, id: '10', word: 'Ten', hex: '#FF5E3A', rim: '#C43819', textDark: false },
];

// Internal helpers for Cute Living Shape Characters & Cutout Slots
function _shapeFaceSvg(cx, cy, scale = 1, smileType = 'toothy', cheekColor = '#FF8FB1') {
  const s = scale;
  const eyeX = 16 * s;
  const eyeY = cy - 5 * s;
  const cheekX = 25 * s;
  const cheekY = cy + 6 * s;
  const mouthY = cy + 8 * s;

  const mouth = smileType === 'curved'
    ? `<path d="M${cx - 11 * s} ${mouthY} Q${cx} ${mouthY + 13 * s} ${cx + 11 * s} ${mouthY}" stroke="#1E1B2E" stroke-width="${4.2 * s}" stroke-linecap="round" fill="none"/>`
    : `<path d="M${cx - 13 * s} ${mouthY - 1 * s} Q${cx} ${mouthY + 19 * s} ${cx + 13 * s} ${mouthY - 1 * s} Z" fill="#2D1424"/>
       <path d="M${cx - 9 * s} ${mouthY - 1 * s} L${cx + 9 * s} ${mouthY - 1 * s} L${cx + 7 * s} ${mouthY + 3.2 * s} L${cx - 7 * s} ${mouthY + 3.2 * s} Z" fill="#FFFFFF"/>
       <path d="M${cx - 7.5 * s} ${mouthY + 7.5 * s} Q${cx} ${mouthY + 15 * s} ${cx + 7.5 * s} ${mouthY + 7.5 * s} Q${cx} ${mouthY + 4 * s} ${cx - 7.5 * s} ${mouthY + 7.5 * s} Z" fill="#FF6B8B"/>`;

  return `
    <!-- Big Expressive Cartoon Eyes -->
    <ellipse cx="${cx - eyeX}" cy="${eyeY}" rx="${8.2 * s}" ry="${9.2 * s}" fill="#FFFFFF"/>
    <ellipse cx="${cx + eyeX}" cy="${eyeY}" rx="${8.2 * s}" ry="${9.2 * s}" fill="#FFFFFF"/>
    <circle cx="${cx - eyeX + 1 * s}" cy="${eyeY + 0.5 * s}" r="${5.4 * s}" fill="#1E1B2E"/>
    <circle cx="${cx + eyeX - 1 * s}" cy="${eyeY + 0.5 * s}" r="${5.4 * s}" fill="#1E1B2E"/>
    <circle cx="${cx - eyeX + 2.8 * s}" cy="${eyeY - 2 * s}" r="${2.2 * s}" fill="#FFFFFF"/>
    <circle cx="${cx + eyeX + 0.8 * s}" cy="${eyeY - 2 * s}" r="${2.2 * s}" fill="#FFFFFF"/>
    <!-- Rosy Cheeks -->
    <ellipse cx="${cx - cheekX}" cy="${cheekY}" rx="${7 * s}" ry="${4.8 * s}" fill="${cheekColor}" opacity="0.78"/>
    <ellipse cx="${cx + cheekX}" cy="${cheekY}" rx="${7 * s}" ry="${4.8 * s}" fill="${cheekColor}" opacity="0.78"/>
    <!-- Happy Smile -->
    ${mouth}
  `;
}

function _shapeBodyMarkup(id, fill, rim, isSlot = false) {
  const slotAttrs = isSlot
    ? `fill="${fill}" fill-opacity="0.28" stroke="#FFD54F" stroke-width="5" stroke-linejoin="round"`
    : `fill="${fill}"`;
  const slotBack = isSlot ? `<rect x="0" y="0" width="0" height="0"/>` : '';
  const rimMarkup = (rimPath) => (isSlot ? '' : rimPath);

  switch (id) {
    case 'circle':
      return `
        ${rimMarkup(`<circle cx="60" cy="64" r="47" fill="${rim}"/>`)}
        <circle cx="60" cy="58" r="47" ${slotAttrs}/>
        ${rimMarkup(`<ellipse cx="41" cy="33" rx="13" ry="7" transform="rotate(-28 41 33)" fill="rgba(255,255,255,0.42)"/>`)}
      `;
    case 'heart':
      return `
        ${rimMarkup(`<path d="M60 107 C54 102 12 73 12 43 C12 23 28 13 43 13 C52 13 57 18 60 24 C63 18 68 13 77 13 C92 13 108 23 108 43 C108 73 66 102 60 107 Z" transform="translate(0,5)" fill="${rim}"/>`)}
        <path d="M60 107 C54 102 12 73 12 43 C12 23 28 13 43 13 C52 13 57 18 60 24 C63 18 68 13 77 13 C92 13 108 23 108 43 C108 73 66 102 60 107 Z" ${slotAttrs}/>
        ${rimMarkup(`<ellipse cx="35" cy="31" rx="11" ry="6" transform="rotate(-25 35 31)" fill="rgba(255,255,255,0.42)"/>`)}
      `;
    case 'square':
      return `
        ${rimMarkup(`<rect x="16" y="20" width="88" height="88" rx="18" fill="${rim}"/>`)}
        <rect x="16" y="14" width="88" height="88" rx="18" ${slotAttrs}/>
        ${rimMarkup(`<rect x="26" y="22" width="28" height="9" rx="4.5" fill="rgba(255,255,255,0.38)"/>`)}
      `;
    case 'triangle':
      return `
        ${rimMarkup(`<path d="M60 16 L108 98 Q112 106 103 106 L17 106 Q8 106 12 98 Z" transform="translate(0,5)" fill="${rim}" stroke="${rim}" stroke-width="8" stroke-linejoin="round"/>`)}
        <path d="M60 14 L106 96 Q110 103 101 103 L19 103 Q10 103 14 96 Z" ${slotAttrs} ${isSlot ? '' : `stroke="${fill}" stroke-width="8" stroke-linejoin="round"`}/>
        ${rimMarkup(`<ellipse cx="50" cy="40" rx="6" ry="13" transform="rotate(26 50 40)" fill="rgba(255,255,255,0.42)"/>`)}
      `;
    case 'star':
      return `
        ${rimMarkup(`<path d="M60 10 L74 40 L107 44 L83 67 L89 100 L60 84 L31 100 L37 67 L13 44 L46 40 Z" transform="translate(0,5)" fill="${rim}" stroke="${rim}" stroke-width="7" stroke-linejoin="round"/>`)}
        <path d="M60 10 L74 40 L107 44 L83 67 L89 100 L60 84 L31 100 L37 67 L13 44 L46 40 Z" ${slotAttrs} ${isSlot ? '' : `stroke="${fill}" stroke-width="7" stroke-linejoin="round"`}/>
        ${rimMarkup(`<circle cx="53" cy="34" r="6" fill="rgba(255,255,255,0.42)"/>`)}
      `;
    case 'diamond':
      return `
        ${rimMarkup(`<path d="M60 11 L106 58 L60 105 L14 58 Z" transform="translate(0,5)" fill="${rim}" stroke="${rim}" stroke-width="8" stroke-linejoin="round"/>`)}
        <path d="M60 11 L106 58 L60 105 L14 58 Z" ${slotAttrs} ${isSlot ? '' : `stroke="${fill}" stroke-width="8" stroke-linejoin="round"`}/>
        ${rimMarkup(`<ellipse cx="47" cy="36" rx="11" ry="5.5" transform="rotate(-44 47 36)" fill="rgba(255,255,255,0.42)"/>`)}
      `;
    case 'oval':
      return `
        ${rimMarkup(`<ellipse cx="60" cy="63" rx="31" ry="51" fill="${rim}"/>`)}
        <ellipse cx="60" cy="58" rx="31" ry="51" ${slotAttrs}/>
        ${rimMarkup(`<ellipse cx="47" cy="28" rx="8" ry="12" transform="rotate(-24 47 28)" fill="rgba(255,255,255,0.42)"/>`)}
      `;
    case 'rectangle':
      return `
        ${rimMarkup(`<rect x="5" y="36" width="110" height="54" rx="14" fill="${rim}"/>`)}
        <rect x="5" y="30" width="110" height="54" rx="14" ${slotAttrs}/>
        ${rimMarkup(`<rect x="16" y="37" width="38" height="7" rx="3.5" fill="rgba(255,255,255,0.4)"/>`)}
      `;
    default:
      return `<circle cx="60" cy="60" r="46" ${slotAttrs}/>`;
  }
}

function _makeShapeEntry({ id, name, hex, rim, faceY = 60, faceScale = 1, smile = 'toothy', cheek = '#FF8FB1' }) {
  return {
    id,
    name,
    hex,
    rim,
    renderCharacter(size = 110) {
      return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" class="kawaii-svg shape-char-svg shape-char-${id}">
        ${_shapeBodyMarkup(id, hex, rim, false)}
        ${_shapeFaceSvg(60, faceY, faceScale, smile, cheek)}
      </svg>`;
    },
    renderSlot(size = 90) {
      return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" class="shape-slot-svg shape-slot-${id}">
        ${_shapeBodyMarkup(id, hex, rim, true)}
      </svg>`;
    },
  };
}

// 3. 8 Cute Toddler Living Shapes
window.SHAPE_DATA = [
  _makeShapeEntry({ id: 'circle', name: 'Circle', hex: '#2B6BFF', rim: '#1847BA', faceY: 59, faceScale: 1.02, smile: 'toothy', cheek: '#FF8FB8' }),
  _makeShapeEntry({ id: 'heart', name: 'Heart', hex: '#FF2E55', rim: '#C21436', faceY: 54, faceScale: 0.96, smile: 'toothy', cheek: '#FFA8C5' }),
  _makeShapeEntry({ id: 'square', name: 'Square', hex: '#8C4BFF', rim: '#6125CC', faceY: 58, faceScale: 1.02, smile: 'toothy', cheek: '#FF94C2' }),
  _makeShapeEntry({ id: 'triangle', name: 'Triangle', hex: '#FFB800', rim: '#CF8E00', faceY: 73, faceScale: 0.92, smile: 'curved', cheek: '#FF758F' }),
  _makeShapeEntry({ id: 'star', name: 'Star', hex: '#FF8A00', rim: '#C96400', faceY: 60, faceScale: 0.86, smile: 'toothy', cheek: '#FF5D8F' }),
  _makeShapeEntry({ id: 'diamond', name: 'Diamond', hex: '#1ED760', rim: '#129E44', faceY: 59, faceScale: 0.9, smile: 'curved', cheek: '#FF85A1' }),
  _makeShapeEntry({ id: 'oval', name: 'Oval', hex: '#FF4791', rim: '#C41D62', faceY: 58, faceScale: 0.9, smile: 'toothy', cheek: '#FFC2D9' }),
  _makeShapeEntry({ id: 'rectangle', name: 'Rectangle', hex: '#00C4B4', rim: '#008E82', faceY: 57, faceScale: 0.96, smile: 'toothy', cheek: '#FF8FB8' }),
];

// 4. Complete A-Z Animal Dataset with Accurate Tracing Strokes (0 0 400 400)
window.ABC_DATA = [
  { letter: 'A', word: 'Alligator', color: '#24C958', cardBg: '#28CD5C', strokes: ['M200 70 L105 325', 'M200 70 L295 325', 'M138 242 L262 242'] },
  { letter: 'B', word: 'Bear', color: '#FF8A00', cardBg: '#FF9500', strokes: ['M130 75 L130 325', 'M130 75 C265 75 265 195 130 198', 'M130 198 C278 198 278 325 130 325'] },
  { letter: 'C', word: 'Cat', color: '#FFB800', cardBg: '#FFC400', strokes: ['M278 112 C240 62 120 68 120 200 C120 332 240 338 278 288'] },
  { letter: 'D', word: 'Dog', color: '#FF5E3A', cardBg: '#FF6B4A', strokes: ['M130 75 L130 325', 'M130 75 C305 75 305 325 130 325'] },
  { letter: 'E', word: 'Elephant', color: '#14B8F0', cardBg: '#19B5FE', strokes: ['M135 75 L135 325', 'M135 75 L270 75', 'M135 198 L248 198', 'M135 325 L270 325'] },
  { letter: 'F', word: 'Frog', color: '#1ED760', cardBg: '#22C55E', strokes: ['M140 75 L140 325', 'M140 75 L272 75', 'M140 198 L248 198'] },
  { letter: 'G', word: 'Giraffe', color: '#F59E0B', cardBg: '#FFA800', strokes: ['M275 115 C235 62 115 70 115 200 C115 330 255 340 278 265 L278 205 L208 205'] },
  { letter: 'H', word: 'Horse', color: '#D97706', cardBg: '#E67E22', strokes: ['M125 75 L125 325', 'M275 75 L275 325', 'M125 200 L275 200'] },
  { letter: 'I', word: 'Iguana', color: '#00C4B4', cardBg: '#00C9B7', strokes: ['M145 75 L255 75', 'M200 75 L200 325', 'M145 325 L255 325'] },
  { letter: 'J', word: 'Jellyfish', color: '#2B8CFF', cardBg: '#3395FF', strokes: ['M235 75 L235 255 C235 335 130 335 125 260'] },
  { letter: 'K', word: 'Koala', color: '#8E44AD', cardBg: '#9B51E0', strokes: ['M130 75 L130 325', 'M268 78 L138 202', 'M168 175 L272 325'] },
  { letter: 'L', word: 'Lion', color: '#FF7A00', cardBg: '#FF8800', strokes: ['M140 75 L140 325', 'M140 325 L272 325'] },
  { letter: 'M', word: 'Monkey', color: '#E06D3B', cardBg: '#EB7A44', strokes: ['M102 325 L102 78', 'M102 78 L200 225', 'M200 225 L298 78', 'M298 78 L298 325'] },
  { letter: 'N', word: 'Narwhal', color: '#38BDF8', cardBg: '#0EA5E9', strokes: ['M122 325 L122 78', 'M122 78 L278 325', 'M278 325 L278 78'] },
  { letter: 'O', word: 'Owl', color: '#7C3AED', cardBg: '#8B5CF6', strokes: ['M200 72 C112 72 108 328 200 328 C292 328 288 72 200 72'] },
  { letter: 'P', word: 'Pig', color: '#FF66A3', cardBg: '#FF6FA8', strokes: ['M135 75 L135 325', 'M135 75 C278 75 278 212 135 212'] },
  { letter: 'Q', word: 'Quail', color: '#5856D6', cardBg: '#6366F1', strokes: ['M200 72 C112 72 108 322 200 322 C292 322 288 72 200 72', 'M222 252 L285 330'] },
  { letter: 'R', word: 'Rabbit', color: '#FF3B6B', cardBg: '#FF477E', strokes: ['M135 75 L135 325', 'M135 75 C272 75 272 205 135 205', 'M198 205 L272 325'] },
  { letter: 'S', word: 'Sheep', color: '#2EC4B6', cardBg: '#14B8A6', strokes: ['M262 110 C220 58 125 78 132 142 C140 212 268 188 268 262 C268 332 155 340 125 292'] },
  { letter: 'T', word: 'Tiger', color: '#F97316', cardBg: '#FB8500', strokes: ['M108 78 L292 78', 'M200 78 L200 325'] },
  { letter: 'U', word: 'Unicorn', color: '#EC4899', cardBg: '#F72585', strokes: ['M125 75 L125 235 C125 342 275 342 275 235 L275 75'] },
  { letter: 'V', word: 'Violin', color: '#A855F7', cardBg: '#9D4EDD', strokes: ['M112 75 L200 325', 'M288 75 L200 325'] },
  { letter: 'W', word: 'Whale', color: '#0284C7', cardBg: '#0096C7', strokes: ['M92 78 L144 322', 'M144 322 L200 165', 'M200 165 L256 322', 'M256 322 L308 78'] },
  { letter: 'X', word: 'X-ray fish', color: '#06B6D4', cardBg: '#0891B2', strokes: ['M118 78 L282 322', 'M282 78 L118 322'] },
  { letter: 'Y', word: 'Yak', color: '#FF453A', cardBg: '#FF5449', strokes: ['M115 78 L200 202', 'M285 78 L200 202', 'M200 202 L200 325'] },
  { letter: 'Z', word: 'Zebra', color: '#6534FF', cardBg: '#6C3BFF', strokes: ['M118 80 L282 80', 'M282 80 L118 320', 'M118 320 L282 320'] },
];

// Reusable kawaii eye & cheek snippets for 26 animals
function _kawaiiEyes(lx = 58, rx = 102, y = 78, r = 7.2) {
  return `
    <circle cx="${lx}" cy="${y}" r="${r}" fill="#1E1B2E"/>
    <circle cx="${lx + r * 0.34}" cy="${y - r * 0.34}" r="${r * 0.36}" fill="#FFFFFF"/>
    <circle cx="${rx}" cy="${y}" r="${r}" fill="#1E1B2E"/>
    <circle cx="${rx + r * 0.34}" cy="${y - r * 0.34}" r="${r * 0.36}" fill="#FFFFFF"/>
  `;
}

function _kawaiiCheeks(lx = 44, rx = 116, y = 92, r = 9.5, color = '#FF8FA3') {
  return `
    <ellipse cx="${lx}" cy="${y}" rx="${r}" ry="${r * 0.72}" fill="${color}" opacity="0.72"/>
    <ellipse cx="${rx}" cy="${y}" rx="${r}" ry="${r * 0.72}" fill="${color}" opacity="0.72"/>
  `;
}

// 26 Distinct Kawaii Animal SVGs (viewBox="0 0 160 160")
const _ANIMAL_ART = {
  // A: Alligator
  a: `
    <!-- Scaly spikes on head/back -->
    <polygon points="36,46 46,28 56,46" fill="#189E43"/>
    <polygon points="56,42 66,24 76,42" fill="#189E43"/>
    <polygon points="76,44 86,28 96,44" fill="#189E43"/>
    <!-- Chubby belly & body -->
    <ellipse cx="74" cy="124" rx="44" ry="26" fill="#32D464"/>
    <ellipse cx="74" cy="128" rx="30" ry="18" fill="#BDF59C"/>
    <!-- Eye bumps -->
    <circle cx="52" cy="54" r="16" fill="#32D464"/>
    <circle cx="84" cy="54" r="16" fill="#32D464"/>
    <!-- Long friendly snout -->
    <rect x="30" y="56" width="108" height="48" rx="24" fill="#32D464"/>
    <path d="M40 94 Q88 114 132 92" fill="#BDF59C"/>
    <!-- Cute white zigzag teeth -->
    <polygon points="62,96 68,106 74,96" fill="#FFFFFF"/>
    <polygon points="86,96 92,106 98,96" fill="#FFFFFF"/>
    <polygon points="110,94 116,104 122,94" fill="#FFFFFF"/>
    <!-- Nostrils on snout tip -->
    <circle cx="116" cy="68" r="3.5" fill="#146B2E"/>
    <circle cx="128" cy="68" r="3.5" fill="#146B2E"/>
    <!-- Eyes & blush -->
    <circle cx="52" cy="54" r="9.5" fill="#FFFFFF"/>
    <circle cx="84" cy="54" r="9.5" fill="#FFFFFF"/>
    ${_kawaiiEyes(54, 86, 54, 5.8)}
    <ellipse cx="44" cy="80" rx="8" ry="5.5" fill="#FF8FA3" opacity="0.65"/>
    <path d="M52 92 Q90 104 128 88" stroke="#146B2E" stroke-width="4" stroke-linecap="round" fill="none"/>
  `,
  // B: Bear
  b: `
    <circle cx="42" cy="44" r="20" fill="#9E5B2B"/>
    <circle cx="42" cy="44" r="11" fill="#F2C18D"/>
    <circle cx="118" cy="44" r="20" fill="#9E5B2B"/>
    <circle cx="118" cy="44" r="11" fill="#F2C18D"/>
    <ellipse cx="80" cy="132" rx="42" ry="24" fill="#B56A35"/>
    <ellipse cx="80" cy="134" rx="25" ry="15" fill="#F7D5AE"/>
    <rect x="30" y="38" width="100" height="86" rx="43" fill="#B56A35"/>
    <ellipse cx="80" cy="96" rx="26" ry="20" fill="#F7D5AE"/>
    ${_kawaiiCheeks(45, 115, 92, 10)}
    ${_kawaiiEyes(58, 102, 76, 7.2)}
    <ellipse cx="80" cy="88" rx="9.5" ry="6.8" fill="#3B1F12"/>
    <path d="M68 98 Q80 112 92 98 Z" fill="#3B1929"/>
    <path d="M73 104 Q80 110 87 104 Q80 101 73 104 Z" fill="#FF6B8B"/>
  `,
  // C: Cat
  c: `
    <!-- Pointy Ears -->
    <polygon points="32,72 36,22 72,48" fill="#FF9824"/>
    <polygon points="40,62 42,32 64,49" fill="#FFB3C6"/>
    <polygon points="128,72 124,22 88,48" fill="#FF9824"/>
    <polygon points="120,62 118,32 96,49" fill="#FFB3C6"/>
    <!-- Tail curl -->
    <path d="M116 132 Q144 126 140 98" stroke="#FF9824" stroke-width="12" stroke-linecap="round" fill="none"/>
    <ellipse cx="80" cy="132" rx="38" ry="22" fill="#FFA93A"/>
    <!-- Head -->
    <rect x="30" y="42" width="100" height="82" rx="41" fill="#FFA93A"/>
    <!-- Tabby stripes -->
    <rect x="76" y="42" width="8" height="16" rx="4" fill="#D96B00"/>
    <rect x="63" y="45" width="7" height="13" rx="3.5" fill="#D96B00"/>
    <rect x="90" y="45" width="7" height="13" rx="3.5" fill="#D96B00"/>
    ${_kawaiiCheeks(46, 114, 92, 9.5)}
    ${_kawaiiEyes(58, 102, 80, 7.2)}
    <!-- Whiskers -->
    <path d="M20 84 L38 87 M20 96 L38 94 M140 84 L122 87 M140 96 L122 94" stroke="#7A3E00" stroke-width="3.2" stroke-linecap="round"/>
    <!-- Cute pink nose & W cat mouth -->
    <polygon points="74,88 86,88 80,95" fill="#FF5D8F"/>
    <path d="M68 99 Q74 106 80 98 Q86 106 92 99" stroke="#3B1F12" stroke-width="4" stroke-linecap="round" fill="none"/>
  `,
  // D: Dog
  d: `
    <ellipse cx="30" cy="72" rx="16" ry="30" transform="rotate(16 30 72)" fill="#7A4928"/>
    <ellipse cx="130" cy="72" rx="16" ry="30" transform="rotate(-16 130 72)" fill="#7A4928"/>
    <ellipse cx="80" cy="134" rx="38" ry="22" fill="#F5D399"/>
    <rect x="34" y="38" width="92" height="82" rx="40" fill="#FCE4B8"/>
    <!-- Eye patch -->
    <ellipse cx="56" cy="74" rx="18" ry="16" fill="#B57445"/>
    <!-- Red Collar + Gold Tag -->
    <rect x="50" y="115" width="60" height="10" rx="5" fill="#FF3B30"/>
    <circle cx="80" cy="126" r="7" fill="#FFD600"/>
    ${_kawaiiCheeks(46, 114, 92, 9)}
    ${_kawaiiEyes(57, 103, 76, 7)}
    <ellipse cx="80" cy="87" rx="9.5" ry="6.8" fill="#1E1B2E"/>
    <path d="M66 96 Q80 114 94 96 Z" fill="#3B1929"/>
    <path d="M72 104 Q80 112 88 104 Q80 100 72 104 Z" fill="#FF6B8B"/>
  `,
  // E: Elephant
  e: `
    <!-- Big Floppy Ears -->
    <ellipse cx="30" cy="78" rx="26" ry="36" transform="rotate(-10 30 78)" fill="#6EC3FF"/>
    <ellipse cx="30" cy="80" rx="16" ry="24" transform="rotate(-10 30 80)" fill="#FFB8D1"/>
    <ellipse cx="130" cy="78" rx="26" ry="36" transform="rotate(10 130 78)" fill="#6EC3FF"/>
    <ellipse cx="130" cy="80" rx="16" ry="24" transform="rotate(10 130 80)" fill="#FFB8D1"/>
    <ellipse cx="80" cy="132" rx="40" ry="22" fill="#82CEFF"/>
    <!-- Head -->
    <circle cx="80" cy="76" r="42" fill="#82CEFF"/>
    ${_kawaiiCheeks(48, 112, 88, 9.5)}
    ${_kawaiiEyes(58, 102, 72, 7)}
    <!-- Cute Smile -->
    <path d="M64 96 Q72 105 84 98" stroke="#1E1B2E" stroke-width="4" stroke-linecap="round" fill="none"/>
    <!-- Curved Trunk -->
    <path d="M78 82 C78 112 108 116 110 96" stroke="#6EC3FF" stroke-width="18" stroke-linecap="round" fill="none"/>
    <path d="M78 82 C78 112 108 116 110 96" stroke="#82CEFF" stroke-width="14" stroke-linecap="round" fill="none"/>
  `,
  // F: Frog
  f: `
    <!-- Little Golden Crown -->
    <polygon points="63,34 68,16 80,27 92,16 97,34" fill="#FFD000"/>
    <ellipse cx="80" cy="130" rx="42" ry="22" fill="#25C954"/>
    <ellipse cx="80" cy="132" rx="28" ry="15" fill="#BDF59C"/>
    <!-- Big Frog Head -->
    <rect x="24" y="48" width="112" height="72" rx="36" fill="#25C954"/>
    <!-- Big Eye Bumps -->
    <circle cx="50" cy="48" r="20" fill="#25C954"/>
    <circle cx="110" cy="48" r="20" fill="#25C954"/>
    <circle cx="50" cy="48" r="14" fill="#FFFFFF"/>
    <circle cx="110" cy="48" r="14" fill="#FFFFFF"/>
    ${_kawaiiEyes(52, 108, 48, 7.5)}
    ${_kawaiiCheeks(42, 118, 86, 10)}
    <path d="M52 86 Q80 108 108 86 Z" fill="#145A29"/>
    <path d="M64 96 Q80 106 96 96 Q80 90 64 96 Z" fill="#FF6B8B"/>
  `,
  // G: Giraffe
  g: `
    <!-- Neck -->
    <rect x="64" y="96" width="32" height="54" rx="14" fill="#FFD230"/>
    <circle cx="74" cy="122" r="6" fill="#C46A21"/>
    <circle cx="88" cy="138" r="7" fill="#C46A21"/>
    <!-- Ossicones (horns) & Ears -->
    <line x1="64" y1="42" x2="58" y2="20" stroke="#FFD230" stroke-width="7" stroke-linecap="round"/>
    <circle cx="57" cy="18" r="7.5" fill="#9E4F16"/>
    <line x1="96" y1="42" x2="102" y2="20" stroke="#FFD230" stroke-width="7" stroke-linecap="round"/>
    <circle cx="103" cy="18" r="7.5" fill="#9E4F16"/>
    <ellipse cx="36" cy="54" rx="15" ry="8" transform="rotate(-18 36 54)" fill="#FFD230"/>
    <ellipse cx="124" cy="54" rx="15" ry="8" transform="rotate(18 124 54)" fill="#FFD230"/>
    <!-- Head & Cream Snout -->
    <rect x="38" y="36" width="84" height="76" rx="36" fill="#FFD230"/>
    <circle cx="52" cy="52" r="6" fill="#C46A21"/>
    <circle cx="108" cy="54" r="6.5" fill="#C46A21"/>
    <ellipse cx="80" cy="92" rx="34" ry="22" fill="#FFF0BD"/>
    ${_kawaiiCheeks(46, 114, 84, 8.5)}
    ${_kawaiiEyes(58, 102, 66, 6.8)}
    <circle cx="70" cy="86" r="3.5" fill="#9E4F16"/>
    <circle cx="90" cy="86" r="3.5" fill="#9E4F16"/>
    <path d="M68 97 Q80 108 92 97" stroke="#5C2D0C" stroke-width="4" stroke-linecap="round" fill="none"/>
  `,
  // H: Horse
  h: `
    <!-- Pointed Ears -->
    <ellipse cx="48" cy="34" rx="10" ry="20" transform="rotate(-14 48 34)" fill="#B8642A"/>
    <ellipse cx="48" cy="36" rx="5" ry="12" transform="rotate(-14 48 36)" fill="#FFB3C6"/>
    <ellipse cx="112" cy="34" rx="10" ry="20" transform="rotate(14 112 34)" fill="#B8642A"/>
    <ellipse cx="112" cy="36" rx="5" ry="12" transform="rotate(14 112 36)" fill="#FFB3C6"/>
    <rect x="60" y="106" width="40" height="44" rx="16" fill="#B8642A"/>
    <!-- Head -->
    <rect x="40" y="34" width="80" height="86" rx="36" fill="#C97132"/>
    <!-- White forehead blaze -->
    <ellipse cx="80" cy="58" rx="9" ry="16" fill="#FFF5E4"/>
    <!-- Chocolate Mane Tuft -->
    <path d="M64 32 Q80 14 98 32 Q90 48 74 44 Z" fill="#592A11"/>
    <!-- Cream Muzzle -->
    <ellipse cx="80" cy="98" rx="32" ry="22" fill="#F7D8B2"/>
    ${_kawaiiCheeks(48, 112, 84, 8)}
    ${_kawaiiEyes(58, 102, 68, 6.8)}
    <circle cx="68" cy="92" r="4" fill="#592A11"/>
    <circle cx="92" cy="92" r="4" fill="#592A11"/>
    <path d="M68 103 Q80 113 92 103" stroke="#592A11" stroke-width="4" stroke-linecap="round" fill="none"/>
  `,
  // I: Iguana (elongated snout, dorsal crest spikes, long straight tail)
  i: `
    <!-- Long straight iguana tail -->
    <path d="M104 128 L150 120" stroke="#18B888" stroke-width="14" stroke-linecap="round" fill="none"/>
    <path d="M122 125 L125 117 M136 123 L139 116" stroke="#FF8A00" stroke-width="4" stroke-linecap="round"/>
    <!-- Orange Dorsal Crest Spikes -->
    <polygon points="46,42 54,22 64,40" fill="#FF8A00"/>
    <polygon points="64,40 74,18 84,40" fill="#FF8A00"/>
    <polygon points="84,42 94,24 102,44" fill="#FF8A00"/>
    <polygon points="98,54 110,44 108,62" fill="#FF8A00"/>
    <!-- Body & Throat Dewlap -->
    <ellipse cx="80" cy="122" rx="38" ry="24" fill="#2AD49A"/>
    <ellipse cx="64" cy="108" rx="22" ry="15" fill="#A8F57A"/>
    <!-- Elongated Iguana Head & Snout -->
    <rect x="22" y="42" width="98" height="62" rx="31" fill="#2AD49A"/>
    <circle cx="96" cy="82" r="9" fill="#00A8B5"/>
    <circle cx="52" cy="68" r="12" fill="#FFFFFF"/>
    <circle cx="88" cy="68" r="12" fill="#FFFFFF"/>
    ${_kawaiiEyes(54, 86, 68, 6.8)}
    <ellipse cx="36" cy="82" rx="7.5" ry="5" fill="#FF8FA3" opacity="0.7"/>
    <path d="M36 88 Q62 99 88 88" stroke="#0F6B4B" stroke-width="4" stroke-linecap="round" fill="none"/>
  `,
  // J: Jellyfish
  j: `
    <!-- Wavy Tentacles -->
    <path d="M50 100 Q40 126 52 146 M70 104 Q64 132 74 148 M90 104 Q96 132 86 148 M110 100 Q120 126 108 146"
          stroke="#FF70B8" stroke-width="10" stroke-linecap="round" fill="none"/>
    <!-- Translucent Bell Dome -->
    <path d="M26 92 C26 36 134 36 134 92 C134 108 114 112 80 112 C46 112 26 108 26 92 Z" fill="#63D8FF"/>
    <!-- Scalloped Rim -->
    <circle cx="44" cy="102" r="12" fill="#8CE5FF"/>
    <circle cx="68" cy="105" r="12" fill="#8CE5FF"/>
    <circle cx="92" cy="105" r="12" fill="#8CE5FF"/>
    <circle cx="116" cy="102" r="12" fill="#8CE5FF"/>
    <!-- Glossy Shine -->
    <ellipse cx="54" cy="58" rx="13" ry="7" transform="rotate(-25 54 58)" fill="#FFFFFF" opacity="0.7"/>
    ${_kawaiiCheeks(46, 114, 88, 8.5, '#FF70B8')}
    ${_kawaiiEyes(58, 102, 78, 6.8)}
    <path d="M70 89 Q80 100 90 89" stroke="#1E1B2E" stroke-width="4" stroke-linecap="round" fill="none"/>
  `,
  // K: Koala
  k: `
    <!-- Huge Fluffy Ears -->
    <circle cx="32" cy="64" r="26" fill="#8E9AAF"/>
    <circle cx="32" cy="64" r="15" fill="#E9EFF7"/>
    <circle cx="128" cy="64" r="26" fill="#8E9AAF"/>
    <circle cx="128" cy="64" r="15" fill="#E9EFF7"/>
    <ellipse cx="80" cy="132" rx="38" ry="22" fill="#9AA7BD"/>
    <ellipse cx="80" cy="134" rx="22" ry="14" fill="#E9EFF7"/>
    <!-- Head -->
    <rect x="34" y="40" width="92" height="80" rx="40" fill="#A5B2C8"/>
    ${_kawaiiCheeks(48, 112, 92, 9.5)}
    ${_kawaiiEyes(56, 104, 78, 6.8)}
    <!-- Iconic Big Dark Oval Koala Nose -->
    <ellipse cx="80" cy="84" rx="11" ry="16" fill="#2D3142"/>
    <ellipse cx="76" cy="78" rx="3" ry="5" fill="#FFFFFF" opacity="0.35"/>
    <path d="M70 104 Q80 112 90 104" stroke="#2D3142" stroke-width="3.8" stroke-linecap="round" fill="none"/>
  `,
  // L: Lion
  l: `
    <!-- Scalloped Fiery Mane -->
    <circle cx="80" cy="34" r="18" fill="#E8630A"/>
    <circle cx="112" cy="44" r="18" fill="#E8630A"/>
    <circle cx="126" cy="74" r="18" fill="#E8630A"/>
    <circle cx="114" cy="104" r="18" fill="#E8630A"/>
    <circle cx="80" cy="116" r="18" fill="#E8630A"/>
    <circle cx="46" cy="104" r="18" fill="#E8630A"/>
    <circle cx="34" cy="74" r="18" fill="#E8630A"/>
    <circle cx="48" cy="44" r="18" fill="#E8630A"/>
    <!-- Ears & Body -->
    <circle cx="48" cy="42" r="13" fill="#FFB82E"/>
    <circle cx="112" cy="42" r="13" fill="#FFB82E"/>
    <ellipse cx="80" cy="136" rx="34" ry="18" fill="#FFB82E"/>
    <!-- Golden Face -->
    <circle cx="80" cy="76" r="38" fill="#FFC43D"/>
    <ellipse cx="80" cy="92" rx="22" ry="15" fill="#FFF2CC"/>
    ${_kawaiiCheeks(50, 110, 86, 8.5)}
    ${_kawaiiEyes(60, 100, 72, 6.8)}
    <polygon points="73,84 87,84 80,92" fill="#A84300"/>
    <path d="M69 95 Q80 104 91 95" stroke="#5C2600" stroke-width="3.8" stroke-linecap="round" fill="none"/>
  `,
  // M: Monkey
  m: `
    <!-- Big Round Side Ears -->
    <circle cx="26" cy="78" r="20" fill="#8C4F2B"/>
    <circle cx="26" cy="78" r="12" fill="#F7C59F"/>
    <circle cx="134" cy="78" r="20" fill="#8C4F2B"/>
    <circle cx="134" cy="78" r="12" fill="#F7C59F"/>
    <!-- Curly Tail -->
    <path d="M114 134 C142 132 144 98 126 98" stroke="#8C4F2B" stroke-width="10" stroke-linecap="round" fill="none"/>
    <ellipse cx="80" cy="132" rx="36" ry="20" fill="#9E5A32"/>
    <!-- Head -->
    <circle cx="80" cy="78" r="42" fill="#9E5A32"/>
    <path d="M74 36 Q82 22 92 34" stroke="#8C4F2B" stroke-width="8" stroke-linecap="round" fill="none"/>
    <!-- Heart-shaped Peach Face Mask -->
    <circle cx="64" cy="72" r="20" fill="#FFE0BD"/>
    <circle cx="96" cy="72" r="20" fill="#FFE0BD"/>
    <ellipse cx="80" cy="94" rx="30" ry="20" fill="#FFE0BD"/>
    ${_kawaiiCheeks(48, 112, 90, 8.5)}
    ${_kawaiiEyes(60, 100, 72, 6.8)}
    <ellipse cx="75" cy="84" rx="3" ry="2.2" fill="#5C2D16"/>
    <ellipse cx="85" cy="84" rx="3" ry="2.2" fill="#5C2D16"/>
    <path d="M64 94 Q80 112 96 94 Z" fill="#3B1929"/>
    <path d="M71 102 Q80 109 89 102 Q80 98 71 102 Z" fill="#FF6B8B"/>
  `,
  // N: Narwhal
  n: `
    <!-- Tail Fluke -->
    <path d="M124 114 C142 102 150 116 134 126 C150 136 142 148 124 134 Z" fill="#29A8DF"/>
    <!-- Golden Spiral Unicorn Tusk! -->
    <polygon points="68,46 80,8 92,46" fill="#FFD954"/>
    <line x1="72" y1="36" x2="88" y2="30" stroke="#E09F00" stroke-width="3" stroke-linecap="round"/>
    <line x1="75" y1="24" x2="85" y2="20" stroke="#E09F00" stroke-width="3" stroke-linecap="round"/>
    <!-- Chubby Aqua Body -->
    <ellipse cx="78" cy="96" rx="50" ry="44" fill="#48C4F7"/>
    <ellipse cx="76" cy="114" rx="36" ry="22" fill="#D8F5FF"/>
    <!-- Cute Side Flippers -->
    <ellipse cx="32" cy="110" rx="14" ry="8" transform="rotate(-25 32 110)" fill="#29A8DF"/>
    <ellipse cx="118" cy="114" rx="14" ry="8" transform="rotate(25 118 114)" fill="#29A8DF"/>
    ${_kawaiiCheeks(46, 106, 94, 9)}
    ${_kawaiiEyes(56, 96, 82, 7)}
    <path d="M68 94 Q76 104 86 94" stroke="#1E1B2E" stroke-width="4" stroke-linecap="round" fill="none"/>
  `,
  // O: Owl
  o: `
    <!-- Plump Owl Body & Ear Tufts -->
    <polygon points="32,46 26,20 56,36" fill="#7B42BC"/>
    <polygon points="128,46 134,20 104,36" fill="#7B42BC"/>
    <ellipse cx="80" cy="88" rx="50" ry="54" fill="#8C52D1"/>
    <!-- Wings -->
    <ellipse cx="30" cy="96" rx="13" ry="28" transform="rotate(12 30 96)" fill="#6B35AB"/>
    <ellipse cx="130" cy="96" rx="13" ry="28" transform="rotate(-12 130 96)" fill="#6B35AB"/>
    <!-- Cream Belly & Scallops -->
    <ellipse cx="80" cy="114" rx="32" ry="24" fill="#F3E8FF"/>
    <path d="M64 108 Q70 115 76 108 M84 108 Q90 115 96 108 M74 120 Q80 127 86 120" stroke="#B794F4" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <!-- Big Round Owl Eye Discs -->
    <circle cx="58" cy="68" r="22" fill="#FFF7FF"/>
    <circle cx="102" cy="68" r="22" fill="#FFF7FF"/>
    ${_kawaiiEyes(58, 102, 68, 9)}
    ${_kawaiiCheeks(40, 120, 86, 8)}
    <!-- Golden Beak & Feet -->
    <polygon points="72,74 88,74 80,90" fill="#FFB800"/>
    <ellipse cx="64" cy="142" rx="10" ry="5.5" fill="#FFB800"/>
    <ellipse cx="96" cy="142" rx="10" ry="5.5" fill="#FFB800"/>
  `,
  // P: Pig
  p: `
    <!-- Curly Tail -->
    <path d="M126 118 C144 114 144 96 132 98 C124 100 130 112 142 106" stroke="#FF6B9E" stroke-width="6" stroke-linecap="round" fill="none"/>
    <!-- Folded Piggy Ears -->
    <polygon points="34,58 28,24 62,38" fill="#FF6B9E"/>
    <polygon points="126,58 132,24 98,38" fill="#FF6B9E"/>
    <ellipse cx="80" cy="132" rx="40" ry="20" fill="#FF8AB5"/>
    <!-- Chubby Bubblegum Head -->
    <circle cx="80" cy="80" r="46" fill="#FF9EC2"/>
    ${_kawaiiCheeks(42, 118, 92, 9.5, '#FF477E')}
    ${_kawaiiEyes(56, 104, 70, 7)}
    <!-- Big Oval Snout -->
    <ellipse cx="80" cy="88" rx="20" ry="14" fill="#FF6398"/>
    <ellipse cx="73" cy="88" rx="4" ry="6" fill="#8F1D47"/>
    <ellipse cx="87" cy="88" rx="4" ry="6" fill="#8F1D47"/>
    <path d="M68 108 Q80 118 92 108" stroke="#6E1436" stroke-width="4" stroke-linecap="round" fill="none"/>
  `,
  // Q: Quail (simplified plump body + unmistakable curved topknot plume)
  q: `
    <path d="M78 44 C76 18 98 10 105 22 C109 30 92 36 84 44 Z" fill="#2B2D42"/>
    <circle cx="102" cy="21" r="8" fill="#2B2D42"/>
    <ellipse cx="80" cy="96" rx="48" ry="44" fill="#6D83B5"/>
    <ellipse cx="80" cy="110" rx="34" ry="26" fill="#F7D5B4"/>
    <ellipse cx="116" cy="98" rx="13" ry="22" transform="rotate(-14 116 98)" fill="#4E6191"/>
    ${_kawaiiCheeks(48, 112, 88, 9)}
    ${_kawaiiEyes(60, 100, 72, 7.5)}
    <polygon points="72,80 88,80 80,94" fill="#FF9500"/>
    <line x1="66" y1="138" x2="66" y2="149" stroke="#FF9500" stroke-width="5.5" stroke-linecap="round"/>
    <line x1="94" y1="138" x2="94" y2="149" stroke="#FF9500" stroke-width="5.5" stroke-linecap="round"/>
  `,
  // R: Rabbit (warm pastel peach-pink coat so it pops vividly on white cards!)
  r: `
    <ellipse cx="58" cy="36" rx="15" ry="33" transform="rotate(-8 58 36)" fill="#F7D6E0"/>
    <ellipse cx="58" cy="38" rx="8" ry="22" transform="rotate(-8 58 38)" fill="#FF8FB5"/>
    <ellipse cx="102" cy="36" rx="15" ry="33" transform="rotate(8 102 36)" fill="#F7D6E0"/>
    <ellipse cx="102" cy="38" rx="8" ry="22" transform="rotate(8 102 38)" fill="#FF8FB5"/>
    <ellipse cx="80" cy="134" rx="40" ry="20" fill="#F2C6D4"/>
    <ellipse cx="80" cy="92" rx="47" ry="41" fill="#FADCE6"/>
    ${_kawaiiCheeks(46, 114, 98, 9.5, '#FF7AA8')}
    ${_kawaiiEyes(58, 102, 82, 7.5)}
    <polygon points="73,91 87,91 80,99" fill="#FF4D88"/>
    <rect x="75" y="102" width="10" height="8" rx="2.5" fill="#FFFFFF"/>
    <path d="M68 101 Q74 108 80 100 Q86 108 92 101" stroke="#3B1929" stroke-width="3.8" stroke-linecap="round" fill="none"/>
  `,
  // S: Sheep (fluffy white cloud wool body of 7 overlapping circles + warm cream face + dark ears/legs)
  s: `
    <!-- Little dark hooves/legs -->
    <rect x="52" y="128" width="12" height="22" rx="6" fill="#4A4458"/>
    <rect x="96" y="128" width="12" height="22" rx="6" fill="#4A4458"/>
    <!-- Fluffy White Cloud Wool Body (soft blue-grey rim for crisp readability on white cards) -->
    <g fill="#F4F6FB" stroke="#D5DCEB" stroke-width="3">
      <circle cx="46" cy="112" r="24"/>
      <circle cx="80" cy="120" r="26"/>
      <circle cx="114" cy="112" r="24"/>
      <circle cx="36" cy="82" r="24"/>
      <circle cx="124" cy="82" r="24"/>
      <circle cx="56" cy="54" r="22"/>
      <circle cx="104" cy="54" r="22"/>
    </g>
    <!-- Dark floppy ears -->
    <ellipse cx="30" cy="74" rx="16" ry="9" transform="rotate(-24 30 74)" fill="#4A4458"/>
    <ellipse cx="130" cy="74" rx="16" ry="9" transform="rotate(24 130 74)" fill="#4A4458"/>
    <!-- Warm Cream Face -->
    <rect x="46" y="54" width="68" height="60" rx="30" fill="#FFE6CC"/>
    <!-- Fluffy Top Wool Tuft -->
    <circle cx="62" cy="46" r="16" fill="#F4F6FB"/>
    <circle cx="80" cy="40" r="19" fill="#FFFFFF"/>
    <circle cx="98" cy="46" r="16" fill="#F4F6FB"/>
    ${_kawaiiCheeks(55, 105, 92, 8.5, '#FF8FA3')}
    ${_kawaiiEyes(62, 98, 78, 7)}
    <path d="M72 95 Q80 103 88 95" stroke="#4A4458" stroke-width="4" stroke-linecap="round" fill="none"/>
  `,
  // T: Tiger
  t: `
    <circle cx="42" cy="44" r="18" fill="#FF8416"/>
    <circle cx="42" cy="44" r="9" fill="#FFE0B5"/>
    <circle cx="118" cy="44" r="18" fill="#FF8416"/>
    <circle cx="118" cy="44" r="9" fill="#FFE0B5"/>
    <ellipse cx="80" cy="134" rx="38" ry="20" fill="#FF8416"/>
    <!-- Head -->
    <rect x="30" y="38" width="100" height="84" rx="42" fill="#FF8E24"/>
    <!-- Bold Dark Tiger Stripes -->
    <path d="M76 38 L80 56 L84 38 Z M62 41 L68 54 L71 40 Z M89 40 L92 54 L98 41 Z" fill="#291A14"/>
    <path d="M30 74 L46 78 L30 83 Z M32 88 L46 90 L33 95 Z" fill="#291A14"/>
    <path d="M130 74 L114 78 L130 83 Z M128 88 L114 90 L127 95 Z" fill="#291A14"/>
    <!-- White Muzzle Pads -->
    <circle cx="71" cy="96" r="13" fill="#FFF7EB"/>
    <circle cx="89" cy="96" r="13" fill="#FFF7EB"/>
    ${_kawaiiCheeks(48, 112, 92, 8.5)}
    ${_kawaiiEyes(58, 102, 76, 7)}
    <polygon points="73,86 87,86 80,94" fill="#FF5D8F"/>
    <path d="M68 98 Q74 105 80 97 Q86 105 92 98" stroke="#291A14" stroke-width="3.8" stroke-linecap="round" fill="none"/>
  `,
  // U: Unicorn
  u: `
    <!-- Pastel Rainbow Mane -->
    <circle cx="44" cy="64" r="18" fill="#FF6BB5"/>
    <circle cx="38" cy="88" r="18" fill="#A855F7"/>
    <circle cx="44" cy="112" r="16" fill="#38BDF8"/>
    <!-- Ears -->
    <ellipse cx="52" cy="42" rx="10" ry="18" transform="rotate(-18 52 42)" fill="#FFFFFF"/>
    <ellipse cx="52" cy="44" rx="5" ry="10" transform="rotate(-18 52 44)" fill="#FFB3D1"/>
    <ellipse cx="114" cy="42" rx="10" ry="18" transform="rotate(18 114 42)" fill="#FFFFFF"/>
    <ellipse cx="114" cy="44" rx="5" ry="10" transform="rotate(18 114 44)" fill="#FFB3D1"/>
    <!-- Shimmering Golden Horn -->
    <polygon points="72,44 84,8 96,44" fill="#FFD600"/>
    <line x1="76" y1="34" x2="92" y2="28" stroke="#FF9900" stroke-width="3" stroke-linecap="round"/>
    <line x1="79" y1="23" x2="89" y2="19" stroke="#FF9900" stroke-width="3" stroke-linecap="round"/>
    <!-- Head & Pink Muzzle -->
    <rect x="44" y="40" width="80" height="86" rx="38" fill="#FFFFFF"/>
    <ellipse cx="84" cy="102" rx="30" ry="20" fill="#FFE0EE"/>
    <!-- Rainbow Forelock -->
    <path d="M68 40 Q86 58 102 40 Q94 30 74 34 Z" fill="#FF6BB5"/>
    ${_kawaiiCheeks(54, 114, 88, 8)}
    ${_kawaiiEyes(64, 104, 74, 6.8)}
    <circle cx="74" cy="96" r="3" fill="#FF6BB5"/>
    <circle cx="94" cy="96" r="3" fill="#FF6BB5"/>
    <path d="M74 106 Q84 114 94 106" stroke="#4A2545" stroke-width="3.8" stroke-linecap="round" fill="none"/>
  `,
  // V: Violin (cheerful kawaii wooden violin with bow & smiling face!)
  v: `
    <!-- Bow across background -->
    <line x1="22" y1="126" x2="142" y2="34" stroke="#8E5431" stroke-width="7" stroke-linecap="round"/>
    <line x1="26" y1="130" x2="144" y2="40" stroke="#FFF6D6" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Violin Neck & Scroll -->
    <rect x="72" y="14" width="16" height="44" rx="6" fill="#5E341B"/>
    <circle cx="80" cy="16" r="9" fill="#8E5431"/>
    <circle cx="65" cy="24" r="4.5" fill="#3B1F12"/>
    <circle cx="95" cy="24" r="4.5" fill="#3B1F12"/>
    <!-- Violin Figure-8 Body -->
    <ellipse cx="80" cy="74" rx="32" ry="26" fill="#E67E22"/>
    <ellipse cx="80" cy="116" rx="42" ry="32" fill="#E67E22"/>
    <ellipse cx="80" cy="114" rx="33" ry="24" fill="#F39C12"/>
    <!-- Strings & Chinrest -->
    <line x1="76" y1="30" x2="76" y2="132" stroke="#FFF7D6" stroke-width="2.2" opacity="0.85"/>
    <line x1="84" y1="30" x2="84" y2="132" stroke="#FFF7D6" stroke-width="2.2" opacity="0.85"/>
    <rect x="68" y="132" width="24" height="10" rx="5" fill="#3B1F12"/>
    ${_kawaiiCheeks(54, 106, 114, 8)}
    ${_kawaiiEyes(64, 96, 100, 6.8)}
    <path d="M71 114 Q80 123 89 114" stroke="#3B1F12" stroke-width="4" stroke-linecap="round" fill="none"/>
  `,
  // W: Whale
  w: `
    <!-- Happy Water Spout Fountain on top! -->
    <path d="M76 44 Q64 16 44 24 M80 44 Q92 16 112 24" stroke="#7CE0FF" stroke-width="6.5" stroke-linecap="round" fill="none"/>
    <circle cx="40" cy="30" r="4.5" fill="#7CE0FF"/>
    <circle cx="116" cy="30" r="4.5" fill="#7CE0FF"/>
    <!-- Tail Fluke -->
    <path d="M126 104 C144 88 152 104 136 116 C150 128 140 140 124 124 Z" fill="#0B78BA"/>
    <!-- Big Round Ocean Blue Whale Body -->
    <path d="M22 96 C22 46 126 46 130 104 C132 126 110 134 74 134 C38 134 22 122 22 96 Z" fill="#1895E0"/>
    <!-- Light Ribbed Belly -->
    <path d="M28 108 Q74 118 124 112 C118 130 98 134 74 134 C44 134 30 124 28 108 Z" fill="#BCEBFF"/>
    ${_kawaiiCheeks(44, 98, 96, 8.5)}
    ${_kawaiiEyes(52, 90, 84, 6.8)}
    <path d="M62 96 Q72 105 82 96" stroke="#083B5E" stroke-width="4" stroke-linecap="round" fill="none"/>
  `,
  // X: X-ray fish (bold readable 3-bone glowing skeleton!)
  x: `
    <polygon points="62,48 88,24 98,52" fill="#FFD600"/>
    <polygon points="66,112 90,136 98,108" fill="#FFD600"/>
    <polygon points="120,80 150,52 142,80 150,108" fill="#FF9500"/>
    <ellipse cx="76" cy="80" rx="56" ry="38" fill="#22D3C5"/>
    <ellipse cx="88" cy="80" rx="34" ry="24" fill="#0B5F69"/>
    <line x1="60" y1="80" x2="114" y2="80" stroke="#FFFFFF" stroke-width="6.5" stroke-linecap="round"/>
    <line x1="72" y1="65" x2="72" y2="95" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
    <line x1="88" y1="63" x2="88" y2="97" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
    <line x1="104" y1="67" x2="104" y2="93" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
    <circle cx="42" cy="72" r="10" fill="#FFFFFF"/>
    <circle cx="40" cy="72" r="5.8" fill="#1E1B2E"/>
    <circle cx="42" cy="70" r="2.2" fill="#FFFFFF"/>
    <ellipse cx="48" cy="88" rx="6.5" ry="4.5" fill="#FF7597" opacity="0.8"/>
    <path d="M28 84 Q36 92 44 85" stroke="#084B52" stroke-width="3.8" stroke-linecap="round" fill="none"/>
  `,
  // Y: Yak (long shaggy dark-brown fur skirt + upward curved ivory horns + cream muzzle)
  y: `
    <!-- Upward Curving Ivory Horns -->
    <path d="M46 52 C18 46 14 14 34 14 C30 30 38 38 52 40 Z" fill="#FFF2CC"/>
    <path d="M114 52 C142 46 146 14 126 14 C130 30 122 38 108 40 Z" fill="#FFF2CC"/>
    <!-- Shaggy Dark-Brown Fur Skirt on Sides & Bottom -->
    <ellipse cx="36" cy="112" rx="22" ry="30" fill="#4A2715"/>
    <ellipse cx="124" cy="112" rx="22" ry="30" fill="#4A2715"/>
    <ellipse cx="80" cy="126" rx="52" ry="24" fill="#59301A"/>
    <ellipse cx="80" cy="88" rx="46" ry="44" fill="#6E3B21"/>
    <!-- Thick Shaggy Forehead Bangs -->
    <circle cx="58" cy="48" r="18" fill="#4A2715"/>
    <circle cx="80" cy="44" r="20" fill="#4A2715"/>
    <circle cx="102" cy="48" r="18" fill="#4A2715"/>
    ${_kawaiiEyes(58, 102, 74, 7)}
    <!-- Warm Cream Muzzle -->
    <rect x="46" y="88" width="68" height="36" rx="18" fill="#FFE6C7"/>
    <circle cx="64" cy="100" r="4.8" fill="#4A2715"/>
    <circle cx="96" cy="100" r="4.8" fill="#4A2715"/>
    <path d="M68 111 Q80 120 92 111" stroke="#4A2715" stroke-width="4" stroke-linecap="round" fill="none"/>
  `,
  // Z: Zebra (big readable head, 4 bold stripes, warm tinted ears & snout!)
  z: `
    <!-- Spiky Striped Mane -->
    <rect x="72" y="10" width="16" height="28" rx="7" fill="#23222E"/>
    <rect x="56" y="16" width="14" height="22" rx="6" fill="#E8ECF5"/>
    <rect x="90" y="16" width="14" height="22" rx="6" fill="#E8ECF5"/>
    <!-- Colored Inner Ears -->
    <ellipse cx="42" cy="36" rx="12" ry="21" transform="rotate(-18 42 36)" fill="#E8ECF5"/>
    <ellipse cx="42" cy="38" rx="6.5" ry="12" transform="rotate(-18 42 38)" fill="#FF85A9"/>
    <ellipse cx="118" cy="36" rx="12" ry="21" transform="rotate(18 118 36)" fill="#E8ECF5"/>
    <ellipse cx="118" cy="38" rx="6.5" ry="12" transform="rotate(18 118 38)" fill="#FF85A9"/>
    <!-- Big Crisp Head with 4 Bold Stripes -->
    <rect x="30" y="34" width="100" height="96" rx="44" fill="#F4F6FB" stroke="#D5DCEB" stroke-width="3"/>
    <path d="M30 58 L62 65 L30 73 Z M30 82 L58 88 L30 95 Z" fill="#23222E"/>
    <path d="M130 58 L98 65 L130 73 Z M130 82 L102 88 L130 95 Z" fill="#23222E"/>
    <polygon points="73,34 87,34 80,60" fill="#23222E"/>
    <!-- Warm Dark-Violet Muzzle -->
    <ellipse cx="80" cy="108" rx="38" ry="24" fill="#4A4458"/>
    ${_kawaiiCheeks(44, 116, 92, 8.5, '#FF85A9')}
    ${_kawaiiEyes(58, 102, 74, 7.5)}
    <circle cx="67" cy="102" r="4.5" fill="#FFE0EB" opacity="0.78"/>
    <circle cx="93" cy="102" r="4.5" fill="#FFE0EB" opacity="0.78"/>
    <path d="M66 114 Q80 124 94 114" stroke="#FFFFFF" stroke-width="4.2" stroke-linecap="round" fill="none"/>
  `,
};

// 5. Park Scenery, Attractions, Mascots & Celebration Art
window.PARK_ART = {
  // Returns adorable lineless flat-vector SVG (viewBox="0 0 160 160") for 'a'..'z'
  animalSvg(letterLower = 'a') {
    const key = String(letterLower || 'a').trim().toLowerCase().charAt(0) || 'a';
    const body = _ANIMAL_ART[key] || _ANIMAL_ART.a;
    return `<svg viewBox="0 0 160 160" class="kawaii-svg animal-svg animal-${key}">
      <circle cx="80" cy="84" r="66" fill="rgba(255,255,255,0.48)"/>
      ${body}
    </svg>`;
  },

  // Wide Panoramic Scrollable Amusement Park Background (viewBox="0 0 2200 820")
  parkScenerySvg() {
    return `<svg viewBox="0 0 2200 820" preserveAspectRatio="xMinYMid slice" class="park-scenery-svg">
      <defs>
        <linearGradient id="parkSkyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4AC7FF"/>
          <stop offset="56%" stop-color="#A3ECFF"/>
          <stop offset="100%" stop-color="#E8FCFF"/>
        </linearGradient>
        <linearGradient id="farHillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#87E87D"/>
          <stop offset="100%" stop-color="#52C85D"/>
        </linearGradient>
        <linearGradient id="nearLawnGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#58DA5B"/>
          <stop offset="100%" stop-color="#2EAD44"/>
        </linearGradient>
        <linearGradient id="sandPathGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFECA8"/>
          <stop offset="100%" stop-color="#F5C967"/>
        </linearGradient>
      </defs>

      <!-- Sunny Panoramic Sky -->
      <rect width="2200" height="820" fill="url(#parkSkyGrad)"/>

      <!-- Glowing Sun -->
      <circle cx="1980" cy="108" r="82" fill="#FFF3B0" opacity="0.45"/>
      <circle cx="1980" cy="108" r="54" fill="#FFE047"/>

      <!-- Fluffy Cloud Bank across horizon -->
      <g fill="#FFFFFF" opacity="0.88">
        <path d="M80 140 Q80 110 112 110 Q128 86 160 92 Q188 94 196 116 Q224 118 224 140 Z"/>
        <path d="M560 112 Q560 86 588 86 Q604 64 636 70 Q662 72 670 92 Q694 94 694 112 Z"/>
        <path d="M1140 138 Q1140 112 1170 112 Q1186 90 1218 96 Q1244 98 1252 118 Q1276 120 1276 138 Z"/>
        <path d="M1610 106 Q1610 82 1638 82 Q1654 62 1684 68 Q1708 70 1716 88 Q1738 90 1738 106 Z"/>
      </g>

      <!-- Hot Air Balloons in the Sky (inspired by Duck Booth reference!) -->
      <g transform="translate(470, 88)">
        <ellipse cx="0" cy="0" rx="22" ry="26" fill="#FF6B9E"/>
        <path d="M-8 -24 Q0 0 -8 24 M8 -24 Q0 0 8 24" stroke="#FF9EC0" stroke-width="4" fill="none"/>
        <rect x="-7" y="28" width="14" height="10" rx="3" fill="#8C5230"/>
      </g>
      <g transform="translate(1030, 114)">
        <ellipse cx="0" cy="0" rx="20" ry="24" fill="#9055FF"/>
        <path d="M-7 -22 Q0 0 -7 22 M7 -22 Q0 0 7 22" stroke="#BFA0FF" stroke-width="3.5" fill="none"/>
        <rect x="-6" y="26" width="12" height="9" rx="3" fill="#8C5230"/>
      </g>
      <g transform="translate(1520, 96)">
        <ellipse cx="0" cy="0" rx="21" ry="25" fill="#FFB800"/>
        <path d="M-7 -23 Q0 0 -7 23 M7 -23 Q0 0 7 23" stroke="#FFE066" stroke-width="3.5" fill="none"/>
        <rect x="-6" y="27" width="12" height="9" rx="3" fill="#8C5230"/>
      </g>

      <!-- Subtle Pastel Rollercoaster Tracks & Loops along Horizon -->
      <g opacity="0.46" stroke="#85BCEB" fill="none">
        <path d="M-20 355 Q130 220 270 315 T570 285 T890 335 T1230 275 T1570 330 T1920 275 T2220 335" stroke-width="6"/>
        <circle cx="330" cy="272" r="46" stroke-width="5.5"/>
        <circle cx="1360" cy="274" r="48" stroke-width="5.5"/>
        <path d="M120 275 L120 400 M200 265 L200 400 M480 280 L480 400 M740 290 L740 400 M1120 285 L1120 400 M1520 295 L1520 400 M1840 275 L1840 400" stroke-width="3"/>
      </g>

      <!-- Pastel Ferris Wheel in Far Background -->
      <g transform="translate(1745, 255)" opacity="0.68">
        <line x1="0" y1="0" x2="-48" y2="128" stroke="#7AAEE0" stroke-width="6" stroke-linecap="round"/>
        <line x1="0" y1="0" x2="48" y2="128" stroke="#7AAEE0" stroke-width="6" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="82" stroke="#FFFFFF" stroke-width="5" fill="none"/>
        <g stroke="#99C7F0" stroke-width="2.5">
          <line x1="-82" y1="0" x2="82" y2="0"/><line x1="0" y1="-82" x2="0" y2="82"/>
          <line x1="-58" y1="-58" x2="58" y2="58"/><line x1="-58" y1="58" x2="58" y2="-58"/>
        </g>
        <circle cx="0" cy="0" r="10" fill="#FFD600"/>
        <rect x="-9" y="-92" width="18" height="14" rx="6" fill="#FF5D8F"/>
        <rect x="74" y="-7" width="18" height="14" rx="6" fill="#FFB800"/>
        <rect x="-9" y="76" width="18" height="14" rx="6" fill="#2B6BFF"/>
        <rect x="-92" y="-7" width="18" height="14" rx="6" fill="#8C4BFF"/>
        <rect x="49" y="-66" width="16" height="13" rx="5" fill="#24C958"/>
        <rect x="-65" y="-66" width="16" height="13" rx="5" fill="#FF8A00"/>
      </g>

      <!-- Rolling Green Hills -->
      <path d="M0 375 Q360 315 740 365 T1480 355 T2200 370 L2200 820 L0 820 Z" fill="url(#farHillGrad)"/>

      <!-- Distant Circus Tents & Fountain Details -->
      <g transform="translate(880, 304)">
        <line x1="34" y1="2" x2="34" y2="-16" stroke="#8C5230" stroke-width="3"/>
        <polygon points="34,-16 52,-10 34,-4" fill="#FF3B30"/>
        <polygon points="0,44 34,2 68,44" fill="#FFFFFF"/>
        <polygon points="14,44 34,2 28,44" fill="#FF3B5C"/>
        <polygon points="40,44 34,2 54,44" fill="#FF3B5C"/>
        <rect x="6" y="44" width="56" height="22" rx="3" fill="#FFF0F5"/>
      </g>

      <!-- Main Lush Park Lawn -->
      <path d="M0 440 Q540 398 1100 432 T2200 420 L2200 820 L0 820 Z" fill="url(#nearLawnGrad)"/>

      <!-- Single Natural Horizontal Park Promenade Walkway -->
      <path d="M-40 695 Q380 658 780 690 T1560 680 T2240 692" stroke="#D99B43" stroke-width="92" fill="none" stroke-linecap="round"/>
      <path d="M-40 695 Q380 658 780 690 T1560 680 T2240 692" stroke="url(#sandPathGrad)" stroke-width="78" fill="none" stroke-linecap="round"/>

      <!-- Cute Rounded Park Trees & Little Flowers between Attractions -->
      <g>
        <g transform="translate(54, 415)">
          <rect x="20" y="42" width="16" height="44" rx="6" fill="#8C5230"/>
          <circle cx="28" cy="28" r="32" fill="#27AE44"/>
          <circle cx="10" cy="40" r="22" fill="#37C956"/>
          <circle cx="46" cy="40" r="22" fill="#1F9638"/>
        </g>
        <g transform="translate(860, 412) scale(0.92)">
          <rect x="20" y="42" width="16" height="44" rx="6" fill="#8C5230"/>
          <circle cx="28" cy="28" r="32" fill="#27AE44"/>
          <circle cx="10" cy="40" r="22" fill="#37C956"/>
          <circle cx="46" cy="40" r="22" fill="#1F9638"/>
        </g>
        <g transform="translate(1590, 418) scale(0.95)">
          <rect x="20" y="42" width="16" height="44" rx="6" fill="#8C5230"/>
          <circle cx="28" cy="28" r="32" fill="#27AE44"/>
          <circle cx="10" cy="40" r="22" fill="#37C956"/>
          <circle cx="46" cy="40" r="22" fill="#1F9638"/>
        </g>
        <g transform="translate(2095, 412)">
          <rect x="20" y="42" width="16" height="44" rx="6" fill="#8C5230"/>
          <circle cx="28" cy="28" r="32" fill="#27AE44"/>
          <circle cx="10" cy="40" r="22" fill="#37C956"/>
          <circle cx="46" cy="40" r="22" fill="#1F9638"/>
        </g>
        <!-- Decorative flower dots along lawn -->
        <circle cx="160" cy="762" r="5" fill="#FFF"/><circle cx="160" cy="762" r="2.2" fill="#FFD600"/>
        <circle cx="495" cy="756" r="5" fill="#FFB3D1"/><circle cx="495" cy="756" r="2.2" fill="#FF3B6B"/>
        <circle cx="940" cy="764" r="5" fill="#FFF"/><circle cx="940" cy="764" r="2.2" fill="#FFD600"/>
        <circle cx="1390" cy="756" r="5" fill="#BAE6FD"/><circle cx="1390" cy="756" r="2.2" fill="#0284C7"/>
        <circle cx="1820" cy="762" r="5" fill="#FFF"/><circle cx="1820" cy="762" r="2.2" fill="#FFD600"/>
      </g>
    </svg>`;
  },

  // Attraction 5: Duck Pond Carnival Booth (viewBox="0 0 260 230", inspired by user's photo!)
  rideDuckPondSvg() {
    return `<svg viewBox="0 0 260 230" class="ride-svg ride-duck-pond">
      <!-- Ground shadow -->
      <ellipse cx="130" cy="214" rx="102" ry="13" fill="rgba(18, 72, 24, 0.22)"/>

      <!-- Orange Carnival Booth Frame -->
      <rect x="34" y="96" width="192" height="114" rx="14" fill="#FF8A1A"/>
      <!-- Blue Water Tank Window -->
      <rect x="46" y="102" width="168" height="62" rx="8" fill="#46C2FF"/>
      <!-- Water Wave Line -->
      <path d="M46 134 Q68 124 90 134 T134 134 T178 134 T214 134 L214 164 L46 164 Z" fill="#1CA0EC"/>
      <!-- Cute Bubbles -->
      <circle cx="72" cy="126" r="6" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.8"/>
      <circle cx="192" cy="122" r="5" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.8"/>

      <!-- Swimming Purple & Red Ducks inside Tank -->
      <g transform="translate(82, 114) scale(0.42)">
        <path d="M16 56 C14 44 26 42 34 50 C44 46 86 48 92 64 C96 76 80 86 56 86 C32 86 18 76 16 56 Z" fill="#904BFF"/>
        <circle cx="78" cy="36" r="24" fill="#904BFF"/>
        <path d="M97 33 C112 32 115 41 108 45 C102 48 94 45 94 40 Z" fill="#FF9500"/>
        <circle cx="85" cy="33" r="6" fill="#1E1B2E"/><circle cx="87" cy="31" r="2.2" fill="#FFF"/>
      </g>
      <g transform="translate(142, 108) scale(0.44)">
        <path d="M16 56 C14 44 26 42 34 50 C44 46 86 48 92 64 C96 76 80 86 56 86 C32 86 18 76 16 56 Z" fill="#FF3B30"/>
        <circle cx="78" cy="36" r="24" fill="#FF3B30"/>
        <path d="M97 33 C112 32 115 41 108 45 C102 48 94 45 94 40 Z" fill="#FF9500"/>
        <circle cx="85" cy="33" r="6" fill="#1E1B2E"/><circle cx="87" cy="31" r="2.2" fill="#FFF"/>
      </g>

      <!-- Counter Ledge & Diamond Pattern Base -->
      <rect x="30" y="162" width="200" height="12" rx="6" fill="#FFD600"/>
      <g fill="#E56A00">
        <polygon points="62,180 72,193 62,206 52,193"/>
        <polygon points="96,180 106,193 96,206 86,193"/>
        <polygon points="130,180 140,193 130,206 120,193"/>
        <polygon points="164,180 174,193 164,206 154,193"/>
        <polygon points="198,180 208,193 198,206 188,193"/>
      </g>

      <!-- Striped Orange & White Carnival Awning -->
      <path d="M22 104 L38 64 L222 64 L238 104 Z" fill="#FFFFFF"/>
      <polygon points="38,64 62,64 52,104 22,104" fill="#FF7A1A"/>
      <polygon points="86,64 110,64 106,104 80,104" fill="#FF7A1A"/>
      <polygon points="134,64 158,64 160,104 134,104" fill="#FF7A1A"/>
      <polygon points="182,64 206,64 214,104 188,104" fill="#FF7A1A"/>
      <!-- Scallops -->
      <g>
        <circle cx="37" cy="104" r="15" fill="#FF7A1A"/>
        <circle cx="67" cy="104" r="15" fill="#FFFFFF"/>
        <circle cx="97" cy="104" r="15" fill="#FF7A1A"/>
        <circle cx="127" cy="104" r="15" fill="#FFFFFF"/>
        <circle cx="157" cy="104" r="15" fill="#FF7A1A"/>
        <circle cx="187" cy="104" r="15" fill="#FFFFFF"/>
        <circle cx="217" cy="104" r="15" fill="#FF7A1A"/>
      </g>

      <!-- Top Signboard + Giant Smiling Yellow Duck Sign! -->
      <rect x="64" y="42" width="132" height="26" rx="13" fill="#FF5A36" stroke="#FF8A1A" stroke-width="4"/>
      <g transform="translate(88, 4) scale(0.72)">
        <path d="M16 56 C14 44 26 42 34 50 C44 46 86 48 92 64 C96 76 80 86 56 86 C32 86 18 76 16 56 Z" fill="#FFE033" stroke="#FF8A1A" stroke-width="4"/>
        <circle cx="78" cy="36" r="24" fill="#FFE033" stroke="#FF8A1A" stroke-width="4"/>
        <path d="M97 33 C112 32 115 41 108 45 C102 48 94 45 94 40 Z" fill="#FF8A00"/>
        <circle cx="85" cy="33" r="6" fill="#1E1B2E"/><circle cx="87" cy="31" r="2.2" fill="#FFF"/>
      </g>
    </svg>`;
  },

  // Attraction 1: Striped Red-and-White Carnival Balloon Shop / Kiosk (viewBox="0 0 260 230")
  rideBalloonShopSvg() {
    return `<svg viewBox="0 0 260 230" class="ride-svg ride-balloon-shop">
      <!-- Ground shadow -->
      <ellipse cx="130" cy="212" rx="96" ry="13" fill="rgba(0,0,0,0.14)"/>

      <!-- Bobbing Cluster of Glossy Carnival Balloons Above Shop! -->
      <g>
        <!-- Strings -->
        <path d="M58 68 L92 122 M96 52 L110 118 M164 50 L146 118 M204 68 L166 122 M130 46 L130 118"
              stroke="#FFFFFF" stroke-width="2.6" opacity="0.88" fill="none"/>
        <!-- Far Left Green Balloon -->
        <ellipse cx="54" cy="48" rx="20" ry="24" transform="rotate(-14 54 48)" fill="#24C958"/>
        <ellipse cx="47" cy="39" rx="5" ry="9" transform="rotate(-18 47 39)" fill="rgba(255,255,255,0.5)"/>
        <!-- Far Right Purple Balloon -->
        <ellipse cx="206" cy="48" rx="20" ry="24" transform="rotate(14 206 48)" fill="#8C4BFF"/>
        <ellipse cx="199" cy="39" rx="5" ry="9" transform="rotate(-8 199 39)" fill="rgba(255,255,255,0.5)"/>
        <!-- Left-Center Blue Balloon with "1" -->
        <ellipse cx="92" cy="34" rx="23" ry="27" transform="rotate(-8 92 34)" fill="#2B6BFF"/>
        <ellipse cx="83" cy="22" rx="5" ry="10" transform="rotate(-16 83 22)" fill="rgba(255,255,255,0.48)"/>
        <text x="92" y="43" text-anchor="middle" fill="#FFFFFF" font-size="24" font-weight="900" font-family="system-ui, sans-serif">1</text>
        <!-- Right-Center Sunny Yellow Balloon with "A" -->
        <ellipse cx="168" cy="34" rx="23" ry="27" transform="rotate(8 168 34)" fill="#FFD600"/>
        <ellipse cx="159" cy="22" rx="5" ry="10" transform="rotate(-10 159 22)" fill="rgba(255,255,255,0.55)"/>
        <text x="168" y="43" text-anchor="middle" fill="#6B3E00" font-size="23" font-weight="900" font-family="system-ui, sans-serif">A</text>
        <!-- Center Hero Red/Pink Kawaii Balloon -->
        <ellipse cx="130" cy="28" rx="25" ry="29" fill="#FF3B5C"/>
        <polygon points="125,56 135,56 130,62" fill="#FF3B5C"/>
        <ellipse cx="119" cy="16" rx="6" ry="11" transform="rotate(-18 119 16)" fill="rgba(255,255,255,0.5)"/>
        <circle cx="122" cy="29" r="3.2" fill="#FFF"/>
        <circle cx="138" cy="29" r="3.2" fill="#FFF"/>
        <path d="M125 36 Q130 42 135 36" stroke="#FFF" stroke-width="2.8" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Kiosk Back Wall & Side Posts -->
      <rect x="54" y="108" width="152" height="96" rx="10" fill="#FFF5E1"/>
      <rect x="56" y="110" width="12" height="62" fill="#FFD166"/>
      <rect x="192" y="110" width="12" height="62" fill="#FFD166"/>

      <!-- Cute Bunting Pennants Inside Booth -->
      <polygon points="72,118 86,118 79,130" fill="#2B6BFF"/>
      <polygon points="92,118 106,118 99,130" fill="#FFD600"/>
      <polygon points="112,118 126,118 119,130" fill="#FF3D9A"/>
      <polygon points="132,118 146,118 139,130" fill="#24C958"/>
      <polygon points="152,118 166,118 159,130" fill="#8C4BFF"/>
      <polygon points="172,118 186,118 179,130" fill="#FF8A00"/>

      <!-- Striped Red & White Carnival Roof + Scalloped Awning -->
      <polygon points="40,108 130,70 220,108" fill="#FFFFFF"/>
      <polygon points="40,108 130,70 76,108" fill="#FF3B30"/>
      <polygon points="104,108 130,70 130,108" fill="#FF3B30"/>
      <polygon points="156,108 130,70 184,108" fill="#FF3B30"/>
      <!-- Scallop Trim -->
      <g>
        <circle cx="55" cy="108" r="15" fill="#FF3B30"/>
        <circle cx="85" cy="108" r="15" fill="#FFFFFF"/>
        <circle cx="115" cy="108" r="15" fill="#FF3B30"/>
        <circle cx="145" cy="108" r="15" fill="#FFFFFF"/>
        <circle cx="175" cy="108" r="15" fill="#FF3B30"/>
        <circle cx="205" cy="108" r="15" fill="#FFFFFF"/>
      </g>

      <!-- Striped Carnival Shop Counter -->
      <rect x="46" y="160" width="168" height="48" rx="10" fill="#FFFFFF"/>
      <rect x="62" y="164" width="20" height="44" fill="#FF3B30"/>
      <rect x="102" y="164" width="20" height="44" fill="#FF3B30"/>
      <rect x="142" y="164" width="20" height="44" fill="#FF3B30"/>
      <rect x="182" y="164" width="20" height="44" fill="#FF3B30"/>
      <!-- Warm Wooden Counter Top Ledge -->
      <rect x="40" y="154" width="180" height="14" rx="7" fill="#FFB800"/>
      <rect x="44" y="156" width="172" height="5" rx="2.5" fill="#FFE066"/>
    </svg>`;
  },

  // Attraction 2: ABC Animal Carousel / Pavilion (viewBox="0 0 260 230")
  rideAbcZooSvg() {
    return `<svg viewBox="0 0 260 230" class="ride-svg ride-abc-zoo">
      <!-- Ground shadow -->
      <ellipse cx="130" cy="214" rx="102" ry="13" fill="rgba(0,0,0,0.14)"/>

      <!-- Pavilion Backdrop & Golden Carousel Poles -->
      <rect x="48" y="102" width="164" height="96" rx="14" fill="#FFF6D6"/>
      <rect x="58" y="102" width="8" height="90" fill="#FFB800"/>
      <rect x="126" y="102" width="8" height="90" fill="#FFB800"/>
      <rect x="194" y="102" width="8" height="90" fill="#FFB800"/>

      <!-- Cute Giraffe Peeking Out on Left -->
      <g transform="translate(56, 114)">
        <line x1="20" y1="12" x2="16" y2="2" stroke="#FFD000" stroke-width="4" stroke-linecap="round"/>
        <circle cx="16" cy="1" r="4" fill="#8B4D1E"/>
        <line x1="36" y1="12" x2="40" y2="2" stroke="#FFD000" stroke-width="4" stroke-linecap="round"/>
        <circle cx="40" cy="1" r="4" fill="#8B4D1E"/>
        <rect x="18" y="34" width="20" height="38" rx="8" fill="#FFD000"/>
        <circle cx="25" cy="52" r="4" fill="#B56321"/>
        <rect x="8" y="10" width="40" height="36" rx="17" fill="#FFD000"/>
        <ellipse cx="28" cy="36" rx="16" ry="10" fill="#FFF0BD"/>
        <circle cx="19" cy="24" r="3.5" fill="#1E1B2E"/>
        <circle cx="37" cy="24" r="3.5" fill="#1E1B2E"/>
        <path d="M23 38 Q28 43 33 38" stroke="#5C2D0C" stroke-width="2.6" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Cute Puppy Peeking Out on Right -->
      <g transform="translate(144, 120)">
        <ellipse cx="10" cy="24" rx="8" ry="15" transform="rotate(14 10 24)" fill="#7A4928"/>
        <ellipse cx="48" cy="24" rx="8" ry="15" transform="rotate(-14 48 24)" fill="#7A4928"/>
        <rect x="10" y="8" width="38" height="36" rx="17" fill="#FFFFFF"/>
        <circle cx="21" cy="23" r="3.5" fill="#1E1B2E"/>
        <circle cx="37" cy="23" r="3.5" fill="#1E1B2E"/>
        <ellipse cx="29" cy="28" rx="4.5" ry="3.2" fill="#1E1B2E"/>
        <path d="M24 33 Q29 40 34 33 Z" fill="#FF6B8B"/>
      </g>

      <!-- Colorful Safari Carousel Roof Dome & Flag -->
      <line x1="130" y1="30" x2="130" y2="10" stroke="#FFB800" stroke-width="5" stroke-linecap="round"/>
      <polygon points="130,10 156,18 130,26" fill="#FF3B5C"/>
      <path d="M32 100 Q130 22 228 100 Z" fill="#24C958"/>
      <path d="M66 100 Q130 26 110 100 Z" fill="#FFD600"/>
      <path d="M150 100 Q130 26 194 100 Z" fill="#2B6BFF"/>
      <!-- Scallop Awning -->
      <circle cx="52" cy="100" r="16" fill="#24C958"/>
      <circle cx="84" cy="100" r="16" fill="#FFD600"/>
      <circle cx="116" cy="100" r="16" fill="#FF5E3A"/>
      <circle cx="148" cy="100" r="16" fill="#2B6BFF"/>
      <circle cx="180" cy="100" r="16" fill="#FFD600"/>
      <circle cx="208" cy="100" r="16" fill="#24C958"/>

      <!-- Chunky A B C Sign Badges on Roof Front! -->
      <g transform="translate(0, -4)">
        <rect x="74" y="64" width="34" height="34" rx="10" transform="rotate(-8 91 81)" fill="#FF3B30" stroke="#FFFFFF" stroke-width="3.5"/>
        <text x="91" y="89" text-anchor="middle" fill="#FFFFFF" font-size="22" font-weight="900" font-family="system-ui, sans-serif">A</text>

        <rect x="113" y="58" width="34" height="34" rx="10" fill="#FFB800" stroke="#FFFFFF" stroke-width="3.5"/>
        <text x="130" y="83" text-anchor="middle" fill="#FFFFFF" font-size="22" font-weight="900" font-family="system-ui, sans-serif">B</text>

        <rect x="152" y="64" width="34" height="34" rx="10" transform="rotate(8 169 81)" fill="#8C4BFF" stroke="#FFFFFF" stroke-width="3.5"/>
        <text x="169" y="89" text-anchor="middle" fill="#FFFFFF" font-size="22" font-weight="900" font-family="system-ui, sans-serif">C</text>
      </g>

      <!-- Carousel Base Platform -->
      <rect x="36" y="182" width="188" height="24" rx="12" fill="#FF8A00"/>
      <rect x="44" y="186" width="172" height="8" rx="4" fill="#FFD600"/>
    </svg>`;
  },

  // Attraction 3: Shapes Amusement Train on Wooden Tracks (viewBox="0 0 260 230")
  rideShapesExpressSvg() {
    return `<svg viewBox="0 0 260 230" class="ride-svg ride-shapes-express">
      <!-- Ground shadow -->
      <ellipse cx="130" cy="213" rx="114" ry="12" fill="rgba(0,0,0,0.14)"/>

      <!-- Wooden Sleeper Tracks & Steel Rails -->
      <g fill="#8C5230">
        <rect x="18" y="198" width="16" height="10" rx="3"/>
        <rect x="52" y="198" width="16" height="10" rx="3"/>
        <rect x="86" y="198" width="16" height="10" rx="3"/>
        <rect x="120" y="198" width="16" height="10" rx="3"/>
        <rect x="154" y="198" width="16" height="10" rx="3"/>
        <rect x="188" y="198" width="16" height="10" rx="3"/>
        <rect x="222" y="198" width="16" height="10" rx="3"/>
      </g>
      <rect x="10" y="194" width="240" height="6" rx="3" fill="#B0C4DE"/>

      <!-- Fluffy Pastel Steam Puffs -->
      <circle cx="212" cy="58" r="13" fill="#FFFFFF" opacity="0.9"/>
      <circle cx="192" cy="40" r="17" fill="#FFFFFF" opacity="0.82"/>
      <circle cx="164" cy="30" r="12" fill="#FFFFFF" opacity="0.7"/>

      <!-- Passenger Shapes Riding in Carriages! -->
      <!-- 1. Smiling Blue Circle in Rear Carriage -->
      <g transform="translate(22, 92)">
        <circle cx="24" cy="26" r="21" fill="#2B6BFF"/>
        <circle cx="18" cy="23" r="3" fill="#1E1B2E"/>
        <circle cx="30" cy="23" r="3" fill="#1E1B2E"/>
        <path d="M19 30 Q24 36 29 30" stroke="#FFF" stroke-width="2.6" stroke-linecap="round" fill="none"/>
      </g>

      <!-- 2. Smiling Red Heart in Middle Carriage -->
      <g transform="translate(80, 90)">
        <path d="M26 46 C22 42 4 29 4 17 C4 8 12 4 18 4 C22 4 25 7 26 10 C27 7 30 4 34 4 C40 4 48 8 48 17 C48 29 30 42 26 46 Z" fill="#FF2E55"/>
        <circle cx="20" cy="21" r="3" fill="#FFF"/>
        <circle cx="32" cy="21" r="3" fill="#FFF"/>
        <path d="M21 28 Q26 33 31 28" stroke="#FFF" stroke-width="2.6" stroke-linecap="round" fill="none"/>
      </g>

      <!-- 3. Smiling Yellow Triangle at Engine Cab -->
      <g transform="translate(142, 82)">
        <polygon points="24,6 46,46 2,46" fill="#FFB800" stroke="#FFB800" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="19" cy="31" r="2.8" fill="#1E1B2E"/>
        <circle cx="29" cy="31" r="2.8" fill="#1E1B2E"/>
        <path d="M20 37 Q24 41 28 37" stroke="#1E1B2E" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Couplers -->
      <rect x="68" y="156" width="16" height="7" rx="3" fill="#475569"/>
      <rect x="128" y="156" width="16" height="7" rx="3" fill="#475569"/>

      <!-- Rear Red Carriage -->
      <rect x="16" y="124" width="56" height="52" rx="10" fill="#FF3B30"/>
      <rect x="12" y="120" width="64" height="10" rx="5" fill="#FFD600"/>
      <circle cx="44" cy="152" r="11" fill="#C81E14" stroke="#FFD600" stroke-width="2.5"/>

      <!-- Middle Red Carriage -->
      <rect x="78" y="124" width="54" height="52" rx="10" fill="#E62E4D"/>
      <rect x="74" y="120" width="62" height="10" rx="5" fill="#FFD600"/>
      <rect x="95" y="141" width="20" height="20" rx="4" fill="#AD1A33" stroke="#FFD600" stroke-width="2.5"/>

      <!-- Cheerful Front Locomotive Engine -->
      <rect x="140" y="96" width="50" height="80" rx="10" fill="#2B6BFF"/>
      <rect x="134" y="90" width="62" height="12" rx="6" fill="#FFD600"/>
      <rect x="150" y="108" width="30" height="24" rx="6" fill="#BAE6FD"/>
      <!-- Boiler & Smokestack -->
      <rect x="182" y="124" width="54" height="52" rx="14" fill="#FF3B30"/>
      <rect x="204" y="82" width="18" height="44" rx="4" fill="#334155"/>
      <polygon points="198,82 228,82 222,96 204,96" fill="#FFD600"/>
      <!-- Cowcatcher & Headlight -->
      <polygon points="232,152 252,178 232,178" fill="#FFD600"/>
      <circle cx="236" cy="140" r="8" fill="#FFF3B0"/>

      <!-- Chunky Train Wheels -->
      <g>
        <circle cx="32" cy="182" r="13" fill="#1E293B"/><circle cx="32" cy="182" r="6" fill="#FFD600"/>
        <circle cx="58" cy="182" r="13" fill="#1E293B"/><circle cx="58" cy="182" r="6" fill="#FFD600"/>
        <circle cx="92" cy="182" r="13" fill="#1E293B"/><circle cx="92" cy="182" r="6" fill="#FFD600"/>
        <circle cx="118" cy="182" r="13" fill="#1E293B"/><circle cx="118" cy="182" r="6" fill="#FFD600"/>
        <circle cx="164" cy="180" r="16" fill="#1E293B"/><circle cx="164" cy="180" r="8" fill="#FFD600"/>
        <circle cx="212" cy="182" r="14" fill="#1E293B"/><circle cx="212" cy="182" r="6.5" fill="#FFD600"/>
      </g>
    </svg>`;
  },

  // Attraction 4: Letter Paint Studio / Tent in Royal Purple & Gold (viewBox="0 0 260 230")
  ridePaintPavilionSvg() {
    return `<svg viewBox="0 0 260 230" class="ride-svg ride-paint-pavilion">
      <!-- Ground shadow -->
      <ellipse cx="130" cy="214" rx="102" ry="13" fill="rgba(0,0,0,0.14)"/>

      <!-- Royal Purple & Gold Artist Tent Body -->
      <rect x="46" y="102" width="168" height="102" rx="16" fill="#5B21B6"/>
      <rect x="60" y="102" width="22" height="102" fill="#7C3AED"/>
      <rect x="119" y="102" width="22" height="102" fill="#7C3AED"/>
      <rect x="178" y="102" width="22" height="102" fill="#7C3AED"/>

      <!-- Artist Dome Roof in Royal Purple & Gold -->
      <circle cx="130" cy="24" r="9" fill="#FFD600"/>
      <path d="M36 102 C48 34 212 34 224 102 Z" fill="#6D28D9"/>
      <path d="M78 102 C88 38 172 38 182 102 Z" fill="#8B5CF6"/>
      <path d="M112 102 C118 40 142 40 148 102 Z" fill="#FFD600"/>
      <!-- Gold Scallop Trim -->
      <rect x="34" y="96" width="192" height="12" rx="6" fill="#FFB800"/>

      <!-- Canvas Display Frame on Front -->
      <rect x="74" y="76" width="112" height="118" rx="18" fill="#3B0764" stroke="#FFD600" stroke-width="5"/>

      <!-- Giant Half-Painted Golden Letter "A" with Dotted Guide & Green ">" Badge! -->
      <g>
        <!-- Untraced translucent track -->
        <path d="M130 98 L98 176 M130 98 L162 176 M108 152 L152 152"
              stroke="rgba(255,255,255,0.25)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <!-- White dotted guide lines -->
        <path d="M130 98 L162 176 M108 152 L152 152"
              stroke="rgba(255,255,255,0.85)" stroke-width="3.2" stroke-dasharray="6 8" stroke-linecap="round" fill="none"/>
        <!-- Half-painted Golden Stroke -->
        <path d="M130 98 L98 176"
              stroke="#FFD026" stroke-width="18" stroke-linecap="round" fill="none"/>
        <!-- Green ">" Chevron Start Badge -->
        <circle cx="130" cy="98" r="13" fill="#24C958" stroke="#FFFFFF" stroke-width="2.5"/>
        <path d="M127 93 L134 98 L127 103" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </g>

      <!-- Giant Oversized Artist Paintbrush Leaning on Right! -->
      <g transform="rotate(24 196 128)">
        <!-- Wooden handle -->
        <rect x="188" y="74" width="16" height="96" rx="8" fill="#FF8A00"/>
        <rect x="191" y="80" width="5" height="84" rx="2.5" fill="#FFB800"/>
        <!-- Silver ferrule -->
        <rect x="186" y="56" width="20" height="20" rx="4" fill="#CBD5E1"/>
        <!-- Bristles dipped in golden-pink paint -->
        <path d="M185 56 C182 32 196 20 200 16 C206 24 210 38 207 56 Z" fill="#FFE066"/>
        <path d="M187 36 C188 24 197 18 200 16 C204 22 206 29 206 38 Q196 42 187 36 Z" fill="#FF3D9A"/>
      </g>

      <!-- Paint Splatter Dots & Base Step -->
      <circle cx="58" cy="176" r="8" fill="#2B6BFF"/>
      <circle cx="70" cy="190" r="5" fill="#FF3D9A"/>
      <rect x="40" y="196" width="180" height="14" rx="7" fill="#FFB800"/>
    </svg>`;
  },

  // Shiny Golden Star Trophy / Medal with Ribbons for End-of-Round Celebrations!
  celebrationTrophySvg() {
    return `<svg viewBox="0 0 220 220" class="kawaii-svg celebration-trophy-svg">
      <!-- Sparkle Stars Around Trophy -->
      <polygon points="34,48 39,60 52,62 42,70 45,82 34,75 23,82 26,70 16,62 29,60" fill="#FFE066"/>
      <polygon points="186,44 190,54 200,56 192,63 194,73 186,67 178,73 180,63 172,56 182,54" fill="#FF70B8"/>
      <circle cx="42" cy="138" r="6" fill="#38BDF8"/>
      <circle cx="182" cy="132" r="7" fill="#24C958"/>

      <!-- Festive Red/Pink & Blue Award Ribbons Behind Base -->
      <polygon points="82,144 52,202 74,194 88,208 104,152" fill="#FF3B5C"/>
      <polygon points="138,144 168,202 146,194 132,208 116,152" fill="#2B6BFF"/>

      <!-- Trophy Cup Handles -->
      <path d="M66 72 C34 72 36 122 72 124" stroke="#FFB800" stroke-width="12" stroke-linecap="round" fill="none"/>
      <path d="M154 72 C186 72 184 122 148 124" stroke="#FFB800" stroke-width="12" stroke-linecap="round" fill="none"/>

      <!-- Golden Cup Pedestal & Stem -->
      <rect x="98" y="134" width="24" height="32" rx="6" fill="#F59E0B"/>
      <rect x="70" y="162" width="80" height="22" rx="10" fill="#FFB800"/>
      <rect x="62" y="178" width="96" height="16" rx="8" fill="#D97706"/>
      <rect x="82" y="167" width="56" height="8" rx="4" fill="#FFF3B0"/>

      <!-- Shiny Golden Cup Bowl -->
      <path d="M60 54 L160 54 L150 112 C146 138 74 138 70 112 Z" fill="#FFD000"/>
      <rect x="54" y="46" width="112" height="14" rx="7" fill="#FFE55C"/>
      <!-- Glossy Highlight -->
      <path d="M74 64 L86 64 L82 110 C80 118 73 116 72 108 Z" fill="rgba(255,255,255,0.52)"/>

      <!-- Giant Smiling Star Emblem in Center of Trophy! -->
      <polygon points="110,16 124,45 156,49 132,71 138,102 110,87 82,102 88,71 64,49 96,45"
               fill="#FFF3B0" stroke="#FF9500" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="100" cy="60" r="4.2" fill="#1E1B2E"/>
      <circle cx="120" cy="60" r="4.2" fill="#1E1B2E"/>
      <ellipse cx="92" cy="67" rx="5" ry="3.5" fill="#FF7597" opacity="0.8"/>
      <ellipse cx="128" cy="67" rx="5" ry="3.5" fill="#FF7597" opacity="0.8"/>
      <path d="M102 68 Q110 76 118 68" stroke="#1E1B2E" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    </svg>`;
  },

  // Cute White Polar-Bear/Puppy Mascot ("Momo")
  mascotBear(mood = 'happy') {
    const eyeRight = mood === 'wink'
      ? `<path d="M126 88 Q135 79 144 88" stroke="#1E1B2E" stroke-width="6" stroke-linecap="round" fill="none"/>`
      : `<circle cx="135" cy="86" r="8.5" fill="#1E1B2E"/><circle cx="138" cy="83" r="3" fill="#FFF"/>`;
    return `
      <svg viewBox="0 0 200 200" class="kawaii-svg">
        <!-- Chubby body -->
        <ellipse cx="102" cy="156" rx="52" ry="42" fill="#FFFFFF"/>
        <!-- Blue neckerchief -->
        <path d="M62 126 Q102 145 142 126 L122 154 L102 140 L82 154 Z" fill="#2A7DE1"/>
        <!-- Waving Left Arm -->
        <ellipse cx="48" cy="134" rx="18" ry="13" transform="rotate(-28 48 134)" fill="#FFFFFF"/>
        <circle cx="38" cy="128" r="5" fill="#BEE3FF"/>
        <!-- Right Arm -->
        <ellipse cx="154" cy="144" rx="17" ry="13" transform="rotate(24 154 144)" fill="#FFFFFF"/>
        <!-- Round Ears -->
        <circle cx="58" cy="48" r="20" fill="#FFFFFF"/>
        <circle cx="58" cy="48" r="10" fill="#DDF0FF"/>
        <circle cx="146" cy="48" r="20" fill="#FFFFFF"/>
        <circle cx="146" cy="48" r="10" fill="#DDF0FF"/>
        <!-- Big Squishy Head -->
        <rect x="40" y="38" width="124" height="98" rx="48" fill="#FFFFFF"/>
        <!-- Soft Pastel Blue Cheeks -->
        <ellipse cx="64" cy="102" rx="16" ry="12" fill="#9ED4FF" opacity="0.85"/>
        <ellipse cx="140" cy="102" rx="16" ry="12" fill="#9ED4FF" opacity="0.85"/>
        <!-- Left Eye -->
        <circle cx="72" cy="86" r="8.5" fill="#1E1B2E"/>
        <circle cx="75" cy="83" r="3" fill="#FFF"/>
        <!-- Right Eye -->
        ${eyeRight}
        <!-- Cute Dark Nose -->
        <ellipse cx="103" cy="94" rx="10" ry="7" fill="#1E1B2E"/>
        <!-- Big Happy Two-Tone Kawaii Mouth -->
        <path d="M87 105 Q103 128 119 105 Z" fill="#3B1929"/>
        <path d="M93 114 Q103 123 113 114 Q103 110 93 114 Z" fill="#FF6B8B"/>
      </svg>`;
  },

  // Cute Peeking Puppy
  peekingPuppy() {
    return `
      <svg viewBox="0 0 140 120" class="kawaii-svg">
        <!-- Floppy Brown Left Ear -->
        <ellipse cx="32" cy="52" rx="18" ry="28" transform="rotate(18 32 52)" fill="#7A4928"/>
        <!-- Perky White Right Ear -->
        <ellipse cx="106" cy="34" rx="14" ry="24" transform="rotate(12 106 34)" fill="#FFFFFF"/>
        <ellipse cx="106" cy="36" rx="7" ry="14" transform="rotate(12 106 36)" fill="#FFB5C5"/>
        <!-- Head -->
        <rect x="28" y="28" width="84" height="72" rx="36" fill="#FFFFFF"/>
        <!-- Red Collar + Gold Tag -->
        <rect x="44" y="94" width="52" height="10" rx="5" fill="#FF3B30"/>
        <circle cx="70" cy="104" r="6.5" fill="#FFD600"/>
        <!-- Rosy Cheeks -->
        <circle cx="44" cy="74" r="9" fill="#FFB3C6" opacity="0.8"/>
        <circle cx="98" cy="74" r="9" fill="#FFB3C6" opacity="0.8"/>
        <!-- Eyes (one big shiny, one happy wink!) -->
        <circle cx="54" cy="60" r="6.5" fill="#1E1B2E"/>
        <circle cx="56" cy="58" r="2.2" fill="#FFF"/>
        <path d="M82 61 Q89 54 96 61" stroke="#1E1B2E" stroke-width="4.5" stroke-linecap="round" fill="none"/>
        <!-- Big Puppy Nose -->
        <ellipse cx="70" cy="67" rx="9" ry="6.5" fill="#1E1B2E"/>
        <!-- Happy Tongue Smile -->
        <path d="M56 76 Q70 94 84 76 Z" fill="#3B1929"/>
        <path d="M62 84 Q70 91 78 84 Q70 80 62 84 Z" fill="#FF6B6B"/>
        <!-- Little Paws resting on edge -->
        <ellipse cx="44" cy="104" rx="13" ry="9" fill="#FFFFFF"/>
        <ellipse cx="96" cy="104" rx="13" ry="9" fill="#FFFFFF"/>
      </svg>`;
  },

  // Cute Peeking Crowned Frog
  peekingFrog() {
    return `
      <svg viewBox="0 0 140 120" class="kawaii-svg">
        <!-- Little Orange Crown -->
        <path d="M55 34 L60 16 L70 26 L80 16 L85 34 Z" fill="#FF7A00"/>
        <!-- Head -->
        <rect x="24" y="36" width="92" height="66" rx="33" fill="#25C954"/>
        <!-- Big Frog Eye Bumps -->
        <circle cx="46" cy="40" r="18" fill="#FFF"/>
        <circle cx="49" cy="40" r="9.5" fill="#1E1B2E"/>
        <circle cx="52" cy="37" r="3" fill="#FFF"/>
        <circle cx="94" cy="40" r="18" fill="#FFF"/>
        <circle cx="91" cy="40" r="9.5" fill="#1E1B2E"/>
        <circle cx="94" cy="37" r="3" fill="#FFF"/>
        <!-- Cheeks & Smile -->
        <circle cx="38" cy="70" r="8" fill="#FF8FA3" opacity="0.65"/>
        <circle cx="102" cy="70" r="8" fill="#FF8FA3" opacity="0.65"/>
        <path d="M58 68 Q70 80 82 68" stroke="#145A29" stroke-width="5" stroke-linecap="round" fill="none"/>
      </svg>`;
  },

  // Cartoon White Gloved Pointer Hand
  pointerHand() {
    return `
      <svg viewBox="0 0 90 100" width="68" height="76">
        <g>
          <path d="M36 14 C36 7 47 7 47 14 L47 42 C51 40 57 42 58 47 C63 46 68 49 69 54 C74 54 77 58 76 65 L73 79 C70 89 59 94 46 94 L37 94 C25 94 18 85 18 74 L18 57 C18 51 25 49 29 54 L36 62 Z"
                fill="#FFFFFF" stroke="#1E1B2E" stroke-width="4.5" stroke-linejoin="round"/>
          <rect x="30" y="84" width="34" height="10" rx="5" fill="#FFB800" stroke="#1E1B2E" stroke-width="3.5"/>
        </g>
      </svg>`;
  },
};
