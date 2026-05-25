import { create } from 'zustand';
import { appDataApi } from '@/lib/db';

const STORAGE_KEY = 'oc-settings';
const DB_KEY = 'settings';

type ThemeName = 'purple' | 'blue' | 'pink' | 'green' | 'cyan' | 'rose' | 'yellow' | 'gray';

interface SettingsState {
  font: string;
  bgImage: string | null;
  customFont: { name: string; url: string } | null;
  themeColor: ThemeName;
  setFont: (font: string) => void;
  setBgImage: (url: string | null) => void;
  setCustomFont: (name: string, url: string) => void;
  clearCustomFont: () => void;
  setThemeColor: (name: ThemeName) => void;
  init: () => void;
}

const fontFamilies: Record<string, string> = {
  sans: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
  serif: "'Noto Serif SC', 'Source Han Serif SC', 'SimSun', serif",
  mono: "'JetBrains Mono', 'Noto Sans SC', monospace",
  rounded: "'Varela Round', 'Noto Sans SC', system-ui, sans-serif",
};

function applyFont(font: string, customName?: string) {
  const family = font === 'custom' ? `"${customName}", sans-serif` : (fontFamilies[font] || fontFamilies.sans);
  const id = 'oc-font-style';
  const old = document.getElementById(id);
  if (old) old.remove();
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `body,button,input,select,textarea,h1,h2,h3,h4,h5,h6,p,span,div{font-family:${family}!important}`;
  document.head.appendChild(style);
  const linkId = 'oc-font-link';
  const oldLink = document.getElementById(linkId);
  if (oldLink) oldLink.remove();
  if (font === 'serif') loadGoogleFont('Noto+Serif+SC');
  else if (font === 'mono') loadGoogleFont('JetBrains+Mono');
  else if (font === 'rounded') loadGoogleFont('Varela+Round');
}

function loadGoogleFont(name: string) {
  const link = document.createElement('link');
  link.id = 'oc-font-link';
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${name}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

function applyBgImage(url: string | null) {
  const id = 'oc-bg-style';
  const old = document.getElementById(id);
  if (old) old.remove();
  if (url) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = [
      `html{background-image:url(${url})!important;background-size:cover!important;background-attachment:fixed!important;background-position:center!important}`,
      `body{background:transparent!important}`,
      `main,aside,header{background-color:rgb(255 255 255/0.88)!important}`,
      `.card{background-color:rgb(252 250 248/0.82)!important;backdrop-filter:blur(4px)}`,
      `.dark main,.dark aside,.dark header{background-color:rgb(20 18 24)!important}`,
      `.dark .card{background-color:rgb(30 28 36)!important;backdrop-filter:none}`,
      `.dark body{background:rgb(20 18 24)!important}`,
    ].join('');
    document.head.appendChild(style);
  }
}

const themePalettes: Record<string, Record<string, string>> = {
  purple: {
    '--primary-50':'245 240 250','--primary-100':'235 224 245','--primary-200':'212 193 235',
    '--primary-300':'189 162 224','--primary-400':'166 131 214','--primary-500':'142 107 204',
    '--primary-600':'124 92 191','--primary-700':'106 72 179','--primary-800':'90 58 158','--primary-900':'74 45 133',
  },
  blue: {
    '--primary-50':'239 246 255','--primary-100':'219 234 254','--primary-200':'191 219 254',
    '--primary-300':'147 197 253','--primary-400':'96 165 250','--primary-500':'59 130 246',
    '--primary-600':'37 99 235','--primary-700':'29 78 216','--primary-800':'30 64 175','--primary-900':'30 58 138',
  },
  pink: {
    '--primary-50':'253 242 248','--primary-100':'252 231 243','--primary-200':'251 207 232',
    '--primary-300':'249 168 212','--primary-400':'244 114 182','--primary-500':'236 72 153',
    '--primary-600':'219 39 119','--primary-700':'190 24 93','--primary-800':'157 23 77','--primary-900':'131 24 67',
  },
  green: {
    '--primary-50':'240 253 244','--primary-100':'220 252 231','--primary-200':'187 247 208',
    '--primary-300':'134 239 172','--primary-400':'74 222 128','--primary-500':'34 197 94',
    '--primary-600':'22 163 74','--primary-700':'21 128 61','--primary-800':'22 101 52','--primary-900':'20 83 45',
  },
  cyan: {
    '--primary-50':'236 254 255','--primary-100':'207 250 254','--primary-200':'165 243 252',
    '--primary-300':'103 232 249','--primary-400':'34 211 238','--primary-500':'6 182 212',
    '--primary-600':'8 145 178','--primary-700':'14 116 144','--primary-800':'21 94 117','--primary-900':'22 78 99',
  },
  rose: {
    '--primary-50':'255 241 242','--primary-100':'255 228 230','--primary-200':'254 205 211',
    '--primary-300':'253 164 175','--primary-400':'251 113 133','--primary-500':'244 63 94',
    '--primary-600':'225 29 72','--primary-700':'190 18 60','--primary-800':'159 18 57','--primary-900':'136 19 55',
  },
  yellow: {
    '--primary-50':'255 252 235','--primary-100':'255 248 210','--primary-200':'255 240 165',
    '--primary-300':'255 230 115','--primary-400':'252 218 62','--primary-500':'245 205 18',
    '--primary-600':'220 180 10','--primary-700':'190 152 5','--primary-800':'158 125 3','--primary-900':'125 98 2',
  },
  gray: {
    '--primary-50':'249 248 247','--primary-100':'240 238 236','--primary-200':'225 222 218',
    '--primary-300':'200 196 190','--primary-400':'170 165 158','--primary-500':'145 140 132',
    '--primary-600':'120 115 108','--primary-700':'95 90 85','--primary-800':'72 68 63','--primary-900':'50 47 43',
  },
};

export const themePresets = [
  { id: 'purple', label: '浅紫', color: '#8E6BCC' },
  { id: 'blue',   label: '浅蓝', color: '#3B82F6' },
  { id: 'pink',   label: '浅粉', color: '#EC4899' },
  { id: 'green',  label: '浅绿', color: '#22C55E' },
  { id: 'cyan',   label: '浅青', color: '#06B6D4' },
  { id: 'rose',   label: '浅红', color: '#F43F5E' },
  { id: 'yellow', label: '浅黄', color: '#F5CD12' },
  { id: 'gray',   label: '浅灰', color: '#918C84' },
] as const;

function applyThemeColors(name: string) {
  const colors = themePalettes[name] || themePalettes.purple;
  const root = document.documentElement;
  for (const [key, val] of Object.entries(colors)) {
    root.style.setProperty(key, val, 'important');
  }
  const p50 = colors['--primary-50'].trim().split(/\s+/).map(Number);
  const surface = p50.map((n: number) => Math.round(n + (255 - n) * 0.4)).join(' ');
  root.style.setProperty('--color-surface', surface, 'important');
  root.style.setProperty('--color-bar', colors['--primary-50'], 'important');
  root.style.setProperty('--color-border', colors['--primary-200'], 'important');
  root.style.setProperty('--color-primary', colors['--primary-500'], 'important');
  root.style.setProperty('--color-primary-light', colors['--primary-100'], 'important');

  const styleId = 'oc-card-style';
  const old = document.getElementById(styleId);
  if (old) old.remove();
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `.card{background-color:rgb(${colors['--primary-100']}/0.35)!important}`;
  document.head.appendChild(style);
}

function injectFontFace(name: string, url: string) {
  const id = 'oc-custom-font-face';
  const old = document.getElementById(id);
  if (old) old.remove();
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `@font-face{font-family:"${name}";src:url(${url});font-display:swap}`;
  document.head.appendChild(style);
}

function saveToDb() {
  const s = useSettings.getState();
  appDataApi.set(DB_KEY, {
    bgImage: s.bgImage,
    themeColor: s.themeColor,
    font: s.font,
    customFont: s.customFont,
  }).catch(() => {});
}

export const useSettings = create<SettingsState>((set) => ({
  font: 'sans',
  bgImage: null,
  customFont: null,
  themeColor: 'purple',

  setThemeColor: (name: ThemeName) => {
    applyThemeColors(name);
    set({ themeColor: name });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...useSettings.getState() }));
    saveToDb();
  },

  setFont: (font: string) => {
    applyFont(font);
    set({ font });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...useSettings.getState() }));
    saveToDb();
  },

  setCustomFont: (name: string, url: string) => {
    injectFontFace(name, url);
    applyFont('custom', name);
    set({ customFont: { name, url }, font: 'custom' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...useSettings.getState() }));
    saveToDb();
  },

  clearCustomFont: () => {
    const old = document.getElementById('oc-custom-font-face');
    if (old) old.remove();
    applyFont('sans');
    set({ customFont: null, font: 'sans' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...useSettings.getState() }));
    saveToDb();
  },

  setBgImage: (url: string | null) => {
    applyBgImage(url);
    set({ bgImage: url });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...useSettings.getState() }));
    saveToDb();
  },

  init: async () => {
    try {
      let data: any = null;
      try { data = await appDataApi.get(DB_KEY); } catch {}
      // Migrate localStorage to Supabase if needed
      if (!data) {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) { try { data = JSON.parse(raw); } catch {} }
        if (data) saveToDb(); // upload to Supabase for cross-device sync
      }
      const font = data?.font || 'sans';
      const theme: ThemeName = data?.themeColor || 'purple';
      const cf = data?.customFont || null;
      const bg = data?.bgImage || null;
      applyThemeColors(theme);
      if (bg) applyBgImage(bg);
      if (cf) {
        injectFontFace(cf.name, cf.url);
        applyFont('custom', cf.name);
        set({ font: 'custom', customFont: cf, themeColor: theme, bgImage: bg });
      } else {
        applyFont(font);
        set({ font, themeColor: theme, bgImage: bg });
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ font, themeColor: theme, bgImage: bg, customFont: cf }));
    } catch (e) { console.error('Settings init error:', e); }
  },
}));
