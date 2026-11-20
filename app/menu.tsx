import { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Volume2, VolumeX } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import HeroPortrait from '../components/HeroPortrait';
import { Button, CurrencyPill } from '../components/ui';
import { HEROES, getSkin } from '../game/heroes';
import { ensureAudio, setSoundEnabled } from '../game/audio';
import type { SaveData } from '../game/types';

interface Props {
  save: SaveData;
  onUpdate: (patch: Partial<SaveData>) => void;
}

export default function MenuScreen({ save, onUpdate }: Props) {
  const router = useRouter();
  const hero = HEROES[save.selectedHero];
  const skin = getSkin(save.selectedSkins[save.selectedHero]);
  const [soundOn, setSoundOn] = useState(save.soundOn);

  const toggleSound = (v: boolean) => {
    setSoundOn(v);
    setSoundEnabled(v);
    onUpdate({ soundOn: v });
    if (v) ensureAudio();
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.soundToggle} onPress={() => toggleSound(!soundOn)} hitSlop={10}>
        {soundOn ? <Volume2 size={22} color="#e2e8f0" /> : <VolumeX size={22} color="#64748b" />}
      </Pressable>

      <View style={styles.heroPreview}>
        <HeroPortrait hero={hero} skin={skin} size={110} />
        <Text style={styles.heroName}>{hero.name}</Text>
        <Text style={[styles.heroSkin, { color: skin.projectile }]}>{skin.name}</Text>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>NEON SURVIVORS</Text>
        <Text style={styles.subtitle}>Survive the swarm. Level up. Unlock legends.</Text>
      </View>

      {save.highScore > 0 && <Text style={styles.highScore}>Best Score: {save.highScore}</Text>}

      <CurrencyPill coins={save.coins} gems={save.gems} />

      <View style={styles.menuButtons}>
        <Button
          title="Play"
          onPress={() => {
            ensureAudio();
            router.push({ pathname: '/game', params: { hero: save.selectedHero } });
          }}
        />
        <Button title="Heroes & Skins" variant="secondary" onPress={() => router.push('/heroes')} />
        <Button title="Shop" variant="secondary" onPress={() => router.push('/shop')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1120',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 24,
  },
  soundToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPreview: { alignItems: 'center', gap: 2 },
  heroName: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 4 },
  heroSkin: { fontSize: 13, fontWeight: '700' },
  titleBlock: { alignItems: 'center', gap: 6 },
  title: { color: '#38bdf8', fontSize: 34, fontWeight: '900', letterSpacing: 2 },
  subtitle: { color: '#94a3b8', fontSize: 13, textAlign: 'center' },
  highScore: { color: '#fbbf24', fontWeight: '800', fontSize: 15 },
  menuButtons: { alignSelf: 'stretch', gap: 10 },
});
