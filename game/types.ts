export type HeroId = 'vanguard' | 'pyromancer' | 'striker';

export type WeaponKind = 'bolt' | 'explosive' | 'piercing';

export interface HeroDef {
  id: HeroId;
  name: string;
  title: string;
  description: string;
  passive: string;
  price: number;
  color: string;
  accent: string;
  weapon: WeaponKind;
  fireInterval: number;
  damage: number;
  moveSpeed: number;
  maxHp: number;
  projectileCount: number;
  spread: number;
  magnetRadius: number;
  pierce: number;
}

export type SkinId = string;

export interface SkinDef {
  id: SkinId;
  heroId: HeroId;
  name: string;
  price: number;
  body: string;
  trim: string;
  projectile: string;
  trail: string;
}

export type UpgradeId =
  | 'attackSpeed'
  | 'damage'
  | 'projectile'
  | 'magnet'
  | 'moveSpeed'
  | 'maxHp'
  | 'regen'
  | 'crit';

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  description: string;
  icon: string;
  color: string;
  maxStacks: number;
}

export interface GameStats {
  fireInterval: number;
  damage: number;
  projectileCount: number;
  spread: number;
  magnetRadius: number;
  moveSpeed: number;
  maxHp: number;
  regen: number;
  critChance: number;
}

export interface SaveData {
  coins: number;
  gems: number;
  unlockedHeroes: HeroId[];
  selectedHero: HeroId;
  unlockedSkins: SkinId[];
  selectedSkins: Record<HeroId, SkinId | null>;
  highScore: number;
  soundOn: boolean;
}

export interface RunResult {
  score: number;
  coins: number;
  gems: number;
  timeSurvived: number;
  kills: number;
}
