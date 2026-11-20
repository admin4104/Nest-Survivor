import { useRouter } from 'expo-router';
import ShopScreen from '../components/ShopScreen';
import { HERO_LIST } from '../game/heroes';
import type { SaveData, HeroId } from '../game/types';

interface Props {
  save: SaveData;
  onUpdate: (patch: Partial<SaveData>) => void;
}

export default function ShopRoute({ save, onUpdate }: Props) {
  const router = useRouter();

  const buyHero = (price: number, id: string) => {
    if (save.coins < price) return;
    if (save.unlockedHeroes.includes(id as HeroId)) return;
    const heroId = id === 'pyromancer' || id === 'striker' ? id : 'vanguard';
    onUpdate({
      coins: save.coins - price,
      unlockedHeroes: [...save.unlockedHeroes, heroId],
      selectedHero: heroId,
    });
  };

  const mockBuyHero = (id: string) => {
    if (save.unlockedHeroes.includes(id as HeroId)) return;
    const heroId = id === 'pyromancer' || id === 'striker' ? id : 'vanguard';
    onUpdate({
      unlockedHeroes: [...save.unlockedHeroes, heroId],
      selectedHero: heroId,
    });
  };

  const buySkin = (skinId: string, price: number) => {
    if (save.coins < price || save.unlockedSkins.includes(skinId)) return;
    const heroId = HERO_LIST.find((h) => skinId.startsWith(h.id))?.id;
    onUpdate({
      coins: save.coins - price,
      unlockedSkins: [...save.unlockedSkins, skinId],
      ...(heroId ? { selectedSkins: { ...save.selectedSkins, [heroId]: skinId } } : {}),
    });
  };

  const mockBuySkin = (skinId: string) => {
    if (save.unlockedSkins.includes(skinId)) return;
    const heroId = HERO_LIST.find((h) => skinId.startsWith(h.id))?.id;
    onUpdate({
      unlockedSkins: [...save.unlockedSkins, skinId],
      ...(heroId ? { selectedSkins: { ...save.selectedSkins, [heroId]: skinId } } : {}),
    });
  };

  return (
    <ShopScreen
      coins={save.coins}
      gems={save.gems}
      unlockedHeroes={save.unlockedHeroes}
      unlockedSkins={save.unlockedSkins}
      selectedSkins={save.selectedSkins}
      onBuyHero={(h) => buyHero(h.price, h.id)}
      onMockBuyHero={(h) => mockBuyHero(h.id)}
      onBuySkin={buySkin}
      onMockBuySkin={mockBuySkin}
      onBack={() => router.back()}
    />
  );
}
