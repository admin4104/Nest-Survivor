import type { UpgradeDef, UpgradeId } from './types';

export const UPGRADES: UpgradeDef[] = [
  { id: 'attackSpeed', name: 'Attack Speed', description: 'Fire 15% faster', icon: 'zap', color: '#facc15', maxStacks: 8 },
  { id: 'damage', name: 'Damage', description: '+25% projectile damage', icon: 'flame', color: '#f87171', maxStacks: 8 },
  { id: 'projectile', name: 'Multi Shot', description: '+1 projectile per volley', icon: 'layers', color: '#60a5fa', maxStacks: 4 },
  { id: 'magnet', name: 'Magnet Radius', description: '+40% gem pickup range', icon: 'magnet', color: '#c084fc', maxStacks: 5 },
  { id: 'moveSpeed', name: 'Move Speed', description: '+12% movement speed', icon: 'wind', color: '#34d399', maxStacks: 5 },
  { id: 'maxHp', name: 'Max Health', description: '+20 max HP and heal 20', icon: 'heart', color: '#fb7185', maxStacks: 6 },
  { id: 'regen', name: 'Regeneration', description: 'Heal 0.5 HP per second', icon: 'activity', color: '#4ade80', maxStacks: 4 },
  { id: 'crit', name: 'Critical Strike', description: '+10% crit chance (2x damage)', icon: 'target', color: '#fb923c', maxStacks: 5 },
];

export function rollUpgradeChoices(stacks: Record<UpgradeId, number>, count = 3): UpgradeDef[] {
  const pool = UPGRADES.filter((u) => stacks[u.id] < u.maxStacks);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
