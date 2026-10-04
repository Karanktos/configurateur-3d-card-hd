// Styles de rendu. « standard » : le rendu d'origine. « sobre » : reproduit celle de la carte plan-3d-live-card
// (tone mapping ACES à faible exposition, lumières peu intenses, murs gris mats, terrain sombre uni, matières atténuées, halos chauds).
// Toutes les valeurs propres au style sont ici ; le moteur lit ST.p (le style actif).
const KEY = 'cfg3d-style';
const NAMES = ['standard', 'sobre'];

const TABLE = {
  standard: {
    aces: false, contrast: 1.07, gtao: 0.85, bloom: { s: 0.32, r: 0.22, t: 0.95 },
    top: '#d9d4cb', terrain: null, soft: null, normalK: 1, desat: 0, rough: { wall: 0, floor: 0 },
    gain: [1.35, -0.35], halo: [1, 0], evening: false,
  },
  sobre: {
    aces: true, contrast: 1.12, gtao: 0.75, bloom: { s: 0.45, r: 0.35, t: 0.85 },
    top: '#6a6a69', terrain: '#6a694f', soft: { keep: 0.55, lod: 6 }, normalK: 0.3, desat: 0.28, rough: { wall: 0.95, floor: 0.6 },
    gain: [4, -2.2], halo: [1.48, 0.19], evening: true,
    // éclairage jour / nuit : valeurs de plan-3d (three r147, lumières « legacy » ×π) converties pour three r170 (lumières physiques) : intensité × π
    L: { sun: 0.95 * Math.PI, moon: 0.09 * Math.PI, hemiD: 0.28 * Math.PI, hemiN: 0.1 * Math.PI, ambD: 0.04 * Math.PI, ambN: 0.09 * Math.PI, envD: 0.16 * Math.PI, envN: 0.05 * Math.PI, expD: 0.8, expN: 1 },
  },
};

export const CAP = '#3e3b37';   // chapeau des murs (option wallCap)
export const ST = { name: 'standard', p: TABLE.standard, wallCap: false, aniso: 8 };

export function readSaved() { try { const v = localStorage.getItem(KEY); return NAMES.includes(v) ? v : null; } catch (e) { return null; } }
export function saveStyle(n) { try { localStorage.setItem(KEY, n); } catch (e) { /* stockage indisponible */ } }
// priorité : choix fait avec le bouton (mémorisé dans ce navigateur), sinon `style:` du YAML, sinon standard
export function pick(yaml) { const y = String(yaml || '').toLowerCase(); return readSaved() || (NAMES.includes(y) ? y : 'standard'); }
export function use(n) { ST.name = NAMES.includes(n) ? n : 'standard'; ST.p = TABLE[ST.name]; return ST.name; }
export const isSobre = () => ST.name === 'sobre';
