import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ title, onPress, variant = 'primary', disabled, style, textStyle }: Props) {
  const bg = variant === 'primary' ? '#0ea5e9' : variant === 'danger' ? '#ef4444' : 'rgba(255,255,255,0.1)';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
        style,
      ]}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </Pressable>
  );
}

export function CurrencyPill({ coins, gems }: { coins: number; gems: number }) {
  return (
    <View style={styles.pillRow}>
      <View style={styles.pill}>
        <Text style={styles.pillCoin}>C</Text>
        <Text style={styles.pillText}>{coins}</Text>
      </View>
      <View style={styles.pill}>
        <Text style={styles.pillGem}>G</Text>
        <Text style={styles.pillText}>{gems}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: '#fff', fontSize: 16, fontWeight: '800' },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  pillCoin: { color: '#fbbf24', fontWeight: '900', fontSize: 13 },
  pillGem: { color: '#38bdf8', fontWeight: '900', fontSize: 13 },
  pillText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
