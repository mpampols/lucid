// ---------- icons ----------
const ICON_PATHS = {
  math:'<path d="M7 4v6M4 7h6M14 7h6M5 14l4 4M9 14l-4 4M14 16h6"/><circle cx="17" cy="13" r=".9" fill="currentColor" stroke="none"/><circle cx="17" cy="19" r=".9" fill="currentColor" stroke="none"/>',
  stroop:'<path d="M12 3.5c3 4 6 7 6 10.5a6 6 0 0 1-12 0c0-3.5 3-6.5 6-10.5z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
  digits:'<text x="12" y="16" text-anchor="middle" font-size="10.5" font-weight="800" fill="currentColor" stroke="none" font-family="Nunito Sans, sans-serif">123</text>',
  grid:'<rect x="4" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8" fill="currentColor"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8" fill="currentColor"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8"/>',
  anagram:'<text x="12" y="16.5" text-anchor="middle" font-size="12.5" font-weight="800" fill="currentColor" stroke="none" font-family="Nunito Sans, sans-serif">Ab</text>',
  compare:'<path d="M9 6l7 6-7 6"/>',
  switch:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
  nback:'<path d="M9 7l-5 5 5 5"/><path d="M15 7l-5 5 5 5"/><path d="M20 12h-6"/>',
  rotate:'<path d="M12 3v18" stroke-dasharray="2 2.6"/><path d="M9 7H5v10h4zM15 7h4v10h-4z"/>'
};
// Standalone SVG (with xmlns) for drawing icons onto a canvas
export const iconSVG = (id,color='#fff',size=24)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" color="${color}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[id]}</svg>`;
export const icon = (id,size=26)=>`<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[id]}</svg>`;
export const flameSVG = (s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.6 2.2c.4 3-1.3 4.7-2.8 6.3C8.3 10 6.5 11.9 6.5 15a5.5 5.5 0 0 0 11 0c0-2.4-1.2-4.1-2.3-5.2-.2 1.3-.8 2.3-1.7 2.8.5-3.6-.5-7.6-.9-10.4z"/></svg>`;
export const checkSVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
export const heartSVG = (lost)=>`<svg class="${lost?'lost':''}" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.5 3 4.5 6.7 4.5c2.2 0 3.7 1.2 5.3 3.2 1.6-2 3.1-3.2 5.3-3.2 3.7 0 5.8 4 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>`;
export const soundSVG = on=>`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/>${on?'<path d="M15.5 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>':'<path d="M16 9.5l5 5M21 9.5l-5 5"/>'}</svg>`;
export const tabIcons = {
  home:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 3L5 14h6l-1 7 8-11h-6z"/></svg>',
  share:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3M7.5 7.5L12 3l4.5 4.5"/><path d="M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12"/></svg>',
  stats:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V5M4 19h16"/><path d="M8 15l4-4 3 3 5-6"/></svg>'
};
