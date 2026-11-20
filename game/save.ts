import type { SaveData } from './types';

const KEY = 'survivor-save-v1';

const DEFAULT_SAVE: SaveData = {
  coins: 0,
  gems: 0,
  unlockedHeroes: ['vanguard'],
  selectedHero: 'vanguard',
  unlockedSkins: ['vanguard-default', 'pyromancer-default', 'striker-default'],
  selectedSkins: { vanguard: 'vanguard-default', pyromancer: 'pyromancer-default', striker: 'striker-default' },
  highScore: 0,
  soundOn: true,
};

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      ...DEFAULT_SAVE,
      ...parsed,
      unlockedHeroes: parsed.unlockedHeroes?.length ? parsed.unlockedHeroes : [...DEFAULT_SAVE.unlockedHeroes],
      unlockedSkins: parsed.unlockedSkins?.length ? parsed.unlockedSkins : [...DEFAULT_SAVE.unlockedSkins],
      selectedSkins: { ...DEFAULT_SAVE.selectedSkins, ...(parsed.selectedSkins ?? {}) },
    };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function persistSave(data: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // storage unavailable; progress won't persist
  }
}

export function resetSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
