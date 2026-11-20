import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, Check, Lock, Zap } from 'lucide-react-native';
import HeroPortrait from './HeroPortrait';
import { HERO_LIST, getSkinsForHero } from '../game/heroes';
import type { SkinDef } from '../game/types';
import { Button, CurrencyPill } from './ui';

interface Props {
  coins: number;
  gems: number;
  unlockedHeroes: string[];
  selectedHero: string;
  unlockedSkins: string[];
  selectedSkins: Record<string, string | null>;
  onSelectHero: (id: string) => void;
  onSelectSkin: (heroId: string, skinId: string | null) => void;
  onBack: () => void;
}

export default function HeroSelectScreen(p: Props) {
  const hero = HERO_LIST.find((h) => h.id === p.selectedHero)!;
  const skins = getSkinsForHero(hero.id);
  const currentSkin = skins.find((s) => s.id === p.selectedSkins[hero.id]) ?? skins[0];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={p.onBack} style={styles.backBtn} hitSlop={8}>
          <ChevronLeft size={24} color="#e2e8f0" />
        </Pressable>
        <Text style={styles.title}>Heroes</Text>
        <CurrencyPill coins={p.coins} gems={p.gems} />
      </View>

      <View style={styles.heroRow}>
        {HERO_LIST.map((h) => {
          const owned = p.unlockedHeroes.includes(h.id);
          const selected = p.selectedHero === h.id;
          const hSkin = getSkinsForHero(h.id).find((s) => s.id === p.selectedSkins[h.id]) ?? getSkinsForHero(h.id)[0];
          return (
            <Pressable
              key={h.id}
              style={[styles.heroCard, selected && styles.heroCardSelected]}
              onPress={() => p.onSelectHero(h.id)}
            >
              {owned ? (
                <HeroPortrait hero={h} skin={hSkin} size={52} animate={selected} />
              ) : (
                <View style={styles.lockWrap}><Lock size={18} color="rgba(255,255,255,0.8)" /></View>
              )}
              <Text style={styles.heroName}>{h.name}</Text>
              {selected && <Check size={14} color="#4ade80" />}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.detail}>
        <View style={styles.detailTop}>
          <HeroPortrait hero={hero} skin={currentSkin} size={96} />
          <View style={styles.detailInfo}>
            <Text style={[styles.heroTitle, { color: hero.color }]}>{hero.title}</Text>
            <Text style={styles.heroDesc}>{hero.description}</Text>
            <View style={styles.passiveBadge}>
              <Zap size={12} color="#facc15" />
              <Text style={styles.passiveText}>{hero.passive}</Text>
            </View>
          </View>
        </View>
        <View style={styles.statGrid}>
          <Stat label="HP" value={hero.maxHp} />
          <Stat label="Speed" value={hero.moveSpeed} />
          <Stat label="Damage" value={hero.damage} />
          <Stat label="Fire Rate" value={`${(1 / hero.fireInterval).toFixed(1)}/s`} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Skins</Text>
      <View style={styles.skinGrid}>
        {skins.map((s) => {
          const owned = p.unlockedSkins.includes(s.id) || s.price === 0;
          const selected = (p.selectedSkins[hero.id] ?? null) === s.id;
          return (
            <Pressable key={s.id} style={[styles.skinCard, selected && styles.skinCardSelected]} onPress={() => p.onSelectSkin(hero.id, s.id)}>
              {owned ? (
                <HeroPortrait hero={hero} skin={s} size={48} animate={false} />
              ) : (
                <View style={styles.lockWrap}>
                  <Lock size={16} color="rgba(255,255,255,0.7)" />
                </View>
              )}
              <Text style={styles.skinName} numberOfLines={1}>{s.name}</Text>
              {owned ? (
                selected ? <Check size={14} color="#4ade80" /> : null
              ) : (
                <Text style={styles.skinPrice}>{s.price} C</Text>
              )}
            </Pressable>
          );
        })}
      </View>

      <Button title="Back to Menu" onPress={p.onBack} variant="secondary" style={styles.back} />
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0b1120' },
  content: { padding: 16, paddingTop: 50, gap: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '900', flex: 1 },
  heroRow: { flexDirection: 'row', gap: 10 },
  heroCard: {
    flex: 1,
    backgroundColor: '#111a2e',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  heroCardSelected: { borderColor: '#0ea5e9', backgroundColor: '#0c1a2e' },
  lockWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  heroName: { color: '#fff', fontWeight: '800', fontSize: 12 },
  detail: {
    backgroundColor: '#111a2e',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    gap: 12,
  },
  detailTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  detailInfo: { flex: 1, gap: 6 },
  heroTitle: { fontSize: 18, fontWeight: '900' },
  heroDesc: { color: '#94a3b8', fontSize: 13, lineHeight: 19 },
  passiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(250,204,21,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.25)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  passiveText: { color: '#facc15', fontSize: 11, fontWeight: '700', flex: 1, flexShrink: 1 },
  statGrid: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 10, alignItems: 'center' },
  statValue: { color: '#fff', fontWeight: '800', fontSize: 15 },
  statLabel: { color: '#64748b', fontSize: 10, marginTop: 2, textTransform: 'uppercase' },
  sectionTitle: { color: '#e2e8f0', fontSize: 17, fontWeight: '900', marginTop: 4 },
  skinGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  skinCard: {
    width: '31%',
    backgroundColor: '#111a2e',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 8,
    alignItems: 'center',
    gap: 4,
  },
  skinCardSelected: { borderColor: '#4ade80' },
  skinName: { color: '#e2e8f0', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  skinPrice: { color: '#fbbf24', fontSize: 11, fontWeight: '800' },
  back: { marginTop: 8 },
});
