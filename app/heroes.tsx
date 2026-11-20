import { useRouter } from 'expo-router';
import HeroSelectScreen from '../components/HeroSelectScreen';
import type { SaveData, HeroId } from '../game/types';

interface Props {
  save: SaveData;
  onUpdate: (patch: Partial<SaveData>) => void;
}

export default function HeroesRoute({ save, onUpdate }: Props) {
  const router = useRouter();

  const selectSkin = (heroId: string, skinId: string | null) => {
    if (skinId && !save.unlockedSkins.includes(skinId)) return;
    onUpdate({ selectedSkins: { ...save.selectedSkins, [heroId]: skinId } });
  };

  return (
    <HeroSelectScreen
      coins={save.coins}
      gems={save.gems}
      unlockedHeroes={save.unlockedHeroes}
      selectedHero={save.selectedHero}
      unlockedSkins={save.unlockedSkins}
      selectedSkins={save.selectedSkins}
      onSelectHero={(id) => {
        if (save.unlockedHeroes.includes(id as HeroId)) {
          onUpdate({ selectedHero: id === 'pyromancer' || id === 'striker' ? id : 'vanguard' });
        }
      }}
      onSelectSkin={selectSkin}
      onBack={() => router.back()}
    />
  );
}
