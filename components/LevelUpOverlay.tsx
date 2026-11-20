import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Zap, Flame, Layers, Magnet, Wind, Heart, Activity, Target } from 'lucide-react-native';
import { UPGRADES } from '../game/upgrades';
import type { UpgradeDef, UpgradeId } from '../game/types';

const ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  zap: Zap, flame: Flame, layers: Layers, magnet: Magnet,
  wind: Wind, heart: Heart, activity: Activity, target: Target,
};

interface Props {
  choices: UpgradeDef[];
  stacks: Record<UpgradeId, number>;
  onPick: (id: UpgradeId) => void;
}

export default function LevelUpOverlay({ choices, stacks, onPick }: Props) {
  return (
    <View style={styles.backdrop}>
      <View style={styles.titleFrame}>
        <View style={styles.titleCorner} />
        <Text style={styles.title}>Level Up!</Text>
        <View style={styles.titleCorner} />
      </View>
      <Text style={styles.subtitle}>Choose an upgrade</Text>
      <View style={styles.cards}>
        {choices.map((u) => {
          const Icon = ICONS[u.icon] ?? Zap;
          const maxed = stacks[u.id] >= u.maxStacks;
          return (
            <Pressable
              key={u.id}
              style={({ pressed }) => [styles.card, { opacity: pressed ? 0.8 : 1 }]}
              onPress={() => onPick(u.id)}
            >
              <View style={[styles.iconWrap, { backgroundColor: `${u.color}22` }]}>
                <Icon size={30} color={u.color} />
              </View>
              <Text style={styles.cardName}>{u.name}</Text>
              <Text style={styles.cardDesc}>{u.description}</Text>
              <Text style={styles.cardStacks}>Owned {stacks[u.id]} / {u.maxStacks}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(2,6,23,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 18,
  },
  titleFrame: {
    borderWidth: 1.5,
    borderColor: 'rgba(212,169,78,0.55)',
    backgroundColor: 'rgba(24,14,20,0.85)',
    borderRadius: 14,
    paddingHorizontal: 26,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#d4a94e',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  titleCorner: {
    width: 8,
    height: 8,
    backgroundColor: '#d4a94e',
    transform: [{ rotate: '45deg' }],
    shadowColor: '#facc15',
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  title: { color: '#facc15', fontSize: 32, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 4 },
  subtitle: { color: '#b9a58c', fontSize: 15, marginTop: -10, letterSpacing: 0.5 },
  cards: { flexDirection: 'column', gap: 12, alignSelf: 'stretch' },
  card: {
    backgroundColor: 'rgba(22,13,24,0.94)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(212,169,78,0.4)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#d4a94e',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212,169,78,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: { color: '#f5e6c4', fontSize: 17, fontWeight: '800' },
  cardDesc: { color: '#b9a58c', fontSize: 13, marginTop: 2 },
  cardStacks: { color: 'rgba(212,169,78,0.6)', fontSize: 11, marginTop: 2, fontWeight: '700' },
});
