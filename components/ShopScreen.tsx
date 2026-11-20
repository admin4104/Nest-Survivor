import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, Lock, Check } from 'lucide-react-native';
import HeroPortrait from './HeroPortrait';
import { HERO_LIST, getSkinsForHero, getSkin } from '../game/heroes';
import { Button, CurrencyPill } from './ui';
import type { HeroDef } from '../game/types';

interface Props {
  coins: number;
  gems: number;
  unlockedHeroes: string[];
  unlockedSkins: string[];
  selectedSkins: Record<string, string | null>;
  onBuyHero: (hero: HeroDef) => void;
  onMockBuyHero: (hero: HeroDef) => void;
  onBuySkin: (skinId: string, price: number) => void;
  onMockBuySkin: (skinId: string) => void;
  onBack: () => void;
}

export default function ShopScreen(p: Props) {
  const lockedHeroes = HERO_LIST.filter((h) => !p.unlockedHeroes.includes(h.id));
  const lockedSkins = HERO_LIST.flatMap((h) =>
    getSkinsForHero(h.id).filter((s) => s.price > 0 && !p.unlockedSkins.includes(s.id))
  );

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={p.onBack} style={styles.backBtn} hitSlop={8}>
          <ChevronLeft size={24} color="#e2e8f0" />
        </Pressable>
        <Text style={styles.title}>Shop</Text>
        <CurrencyPill coins={p.coins} gems={p.gems} />
      </View>

      <Text style={styles.note}>
        Earn coins by surviving. "Mock IAP" buttons unlock items for free to test the purchase flow.
      </Text>

      {lockedHeroes.length === 0 && lockedSkins.length === 0 && (
        <View style={styles.allOwned}>
          <Check size={22} color="#4ade80" />
          <Text style={styles.allOwnedText}>You own everything!</Text>
        </View>
      )}

      {lockedHeroes.length > 0 && <Text style={styles.section}>Heroes</Text>}
      {lockedHeroes.map((h) => (
        <View key={h.id} style={styles.item}>
          <View style={styles.portraitWrap}>
            <HeroPortrait hero={h} skin={getSkinsForHero(h.id)[0]} size={52} animate={false} />
            <View style={styles.lockOverlay}>
              <Lock size={16} color="rgba(255,255,255,0.9)" />
            </View>
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{h.name}</Text>
            <Text style={styles.itemDesc} numberOfLines={2}>{h.description}</Text>
          </View>
          <View style={styles.itemActions}>
            <Button
              title={`${h.price} C`}
              onPress={() => p.onBuyHero(h)}
              disabled={p.coins < h.price}
              style={styles.buyBtn}
              textStyle={styles.buyText}
            />
            <Button
              title="Mock IAP"
              onPress={() => p.onMockBuyHero(h)}
              variant="secondary"
              style={styles.buyBtn}
              textStyle={styles.mockText}
            />
          </View>
        </View>
      ))}

      {lockedSkins.length > 0 && <Text style={styles.section}>Skins</Text>}
      <View style={styles.skinList}>
        {lockedSkins.map((s) => {
          const hero = HERO_LIST.find((h) => h.id === s.heroId)!;
          const preview = getSkin(s.id);
          return (
            <View key={s.id} style={styles.item}>
              <View style={styles.portraitWrap}>
                <HeroPortrait hero={hero} skin={preview} size={52} animate={false} />
                <View style={styles.lockOverlay}>
                  <Lock size={16} color="rgba(255,255,255,0.9)" />
                </View>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{s.name}</Text>
                <Text style={styles.itemDesc}>{hero.name} skin</Text>
              </View>
              <View style={styles.itemActions}>
                <Button
                  title={`${s.price} C`}
                  onPress={() => p.onBuySkin(s.id, s.price)}
                  disabled={p.coins < s.price}
                  style={styles.buyBtn}
                  textStyle={styles.buyText}
                />
                <Button
                  title="Mock IAP"
                  onPress={() => p.onMockBuySkin(s.id)}
                  variant="secondary"
                  style={styles.buyBtn}
                  textStyle={styles.mockText}
                />
              </View>
            </View>
          );
        })}
      </View>

      <Button title="Back to Menu" onPress={p.onBack} variant="secondary" style={styles.back} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0b1120' },
  content: { padding: 16, paddingTop: 50, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '900', flex: 1 },
  note: { color: '#64748b', fontSize: 12, lineHeight: 17 },
  section: { color: '#e2e8f0', fontSize: 17, fontWeight: '900', marginTop: 6 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#111a2e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
  },
  portraitWrap: { width: 52, height: 52 },
  lockOverlay: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2,6,23,0.55)',
    borderRadius: 26,
  },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { color: '#fff', fontWeight: '800', fontSize: 15 },
  itemDesc: { color: '#94a3b8', fontSize: 12, lineHeight: 16 },
  itemActions: { gap: 6, alignItems: 'stretch' },
  buyBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, minWidth: 92 },
  buyText: { fontSize: 13, color: '#fbbf24' },
  mockText: { fontSize: 13 },
  skinList: { gap: 10 },
  allOwned: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#111a2e',
    borderRadius: 16,
    padding: 20,
  },
  allOwnedText: { color: '#4ade80', fontWeight: '800', fontSize: 15 },
  back: { marginTop: 10 },
});
