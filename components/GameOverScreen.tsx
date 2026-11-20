import { StyleSheet, Text, View } from 'react-native';
import { Button } from './ui';

interface Props {
  score: number;
  coins: number;
  timeSurvived: number;
  kills: number;
  onPlayAgain: () => void;
  onShop: () => void;
}

function fmtTime(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function GameOverScreen({ score, coins, timeSurvived, kills, onPlayAgain, onShop }: Props) {
  return (
    <View style={styles.backdrop}>
      <Text style={styles.title}>You Died</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Score</Text>
          <Text style={styles.value}>{score}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Survived</Text>
          <Text style={styles.value}>{fmtTime(timeSurvived)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Kills</Text>
          <Text style={styles.value}>{kills}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Coins Earned</Text>
          <Text style={styles.coinValue}>+{coins}</Text>
        </View>
      </View>
      <View style={styles.buttons}>
        <Button title="Play Again" onPress={onPlayAgain} style={styles.btn} />
        <Button title="Shop" onPress={onShop} variant="secondary" style={styles.btn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(2,6,23,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 22,
  },
  title: { color: '#ef4444', fontSize: 36, fontWeight: '900' },
  card: {
    alignSelf: 'stretch',
    backgroundColor: '#111a2e',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 18,
    gap: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#94a3b8', fontSize: 14 },
  value: { color: '#fff', fontSize: 16, fontWeight: '800' },
  coinValue: { color: '#fbbf24', fontSize: 16, fontWeight: '800' },
  buttons: { alignSelf: 'stretch', gap: 10 },
  btn: { alignSelf: 'stretch' },
});
