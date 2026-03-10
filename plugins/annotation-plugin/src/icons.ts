/**
 * Annotation Plugin Icons — using theme color #73C5FF to match other plugins
 */

const C = '#73C5FF';

export const ICON_ANNOTATION = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 17V20H6L17.56 8.44L14.56 5.44L3 17Z" fill="${C}" fill-opacity="0.15" stroke="${C}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M14.56 5.44L17.56 8.44L20 6L17 3L14.56 5.44Z" stroke="${C}" stroke-width="1.8" stroke-linejoin="round"/>
</svg>`;

export const ICON_ANNO_CLOUD = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 16C2.9 16 2 15.1 2 14C2 12.9 2.9 12 4 12C4 9.8 5.8 8 8 8C9.2 8 10.3 8.5 11 9.3C11.6 8.5 12.5 8 13.5 8C15.4 8 17 9.6 17 11.5C17 11.7 17 11.8 16.9 12H17C19.2 12 21 13.8 21 16" stroke="${C}" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="2 2"/>
</svg>`;

export const ICON_ANNO_ARROW = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="4" y1="20" x2="18" y2="6" stroke="${C}" stroke-width="2" stroke-linecap="round"/>
  <path d="M14 4L20 4L20 10" stroke="${C}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const ICON_ANNO_RECT = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="5" width="18" height="14" rx="1" stroke="${C}" stroke-width="2"/>
</svg>`;

export const ICON_ANNO_ELLIPSE = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="12" cy="12" rx="9" ry="6" stroke="${C}" stroke-width="2"/>
</svg>`;

export const ICON_ANNO_TEXT = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 6H19M12 6V19M9 19H15" stroke="${C}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const ICON_ANNO_LEADER = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 18L10 11L14 15" stroke="${C}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="14" y1="15" x2="21" y2="15" stroke="${C}" stroke-width="2" stroke-linecap="round"/>
  <path d="M3 18L5 21L1 21Z" fill="${C}"/>
</svg>`;

export const ICON_ANNO_FREEHAND = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 17C5 13 8 19 11 12C14 5 17 15 21 7" stroke="${C}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const ICON_ANNO_STAMP = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="14" width="18" height="6" rx="1" stroke="${C}" stroke-width="1.8"/>
  <path d="M10 14V10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10V14" stroke="${C}" stroke-width="1.8"/>
  <circle cx="12" cy="5" r="2" stroke="${C}" stroke-width="1.5"/>
</svg>`;

export const ICON_ANNO_HIGHLIGHT = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="5" width="18" height="14" rx="1" fill="#FFEB3B" fill-opacity="0.35" stroke="${C}" stroke-width="1.5" stroke-dasharray="3 2"/>
</svg>`;

export const ICON_ANNO_SHOW = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1 12C3 7 7.5 4 12 4C16.5 4 21 7 23 12C21 17 16.5 20 12 20C7.5 20 3 17 1 12Z" stroke="${C}" stroke-width="1.8"/>
  <circle cx="12" cy="12" r="3.5" stroke="${C}" stroke-width="1.8"/>
</svg>`;

export const ICON_ANNO_HIDE = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1 12C3 7 7.5 4 12 4C16.5 4 21 7 23 12C21 17 16.5 20 12 20C7.5 20 3 17 1 12Z" stroke="#999" stroke-width="1.8"/>
  <line x1="4" y1="4" x2="20" y2="20" stroke="#999" stroke-width="2" stroke-linecap="round"/>
</svg>`;

export const ICON_ANNO_LIST = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="9" y1="6" x2="21" y2="6" stroke="${C}" stroke-width="2" stroke-linecap="round"/>
  <line x1="9" y1="12" x2="21" y2="12" stroke="${C}" stroke-width="2" stroke-linecap="round"/>
  <line x1="9" y1="18" x2="21" y2="18" stroke="${C}" stroke-width="2" stroke-linecap="round"/>
  <circle cx="4" cy="6" r="2" fill="${C}"/>
  <circle cx="4" cy="12" r="2" fill="${C}"/>
  <circle cx="4" cy="18" r="2" fill="${C}"/>
</svg>`;

export const ICON_ANNO_CLEAR = `
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 6L18 18M18 6L6 18" stroke="${C}" stroke-width="2" stroke-linecap="round"/>
  <circle cx="12" cy="12" r="9" stroke="${C}" stroke-width="1.8"/>
</svg>`;
