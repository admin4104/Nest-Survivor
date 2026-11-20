import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Pause, Skull, Coins } from 'lucide-react-native';
import type { HudState } from '../game/engine';

interface Props {
  hud: HudState;
  onPause: () => void;
}

const GOLD = '#d4a94e';
const GOLD_DIM = 'rgba(212,169,78,0.45)';

function fmtTime(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Hud({ hud, onPause }: Props) {
  const hpPct = Math.max(0, Math.min(1, hud.hp / hud.maxHp));
  const xpPct = Math.max(0, Math.min(1, hud.xp / hud.xpNeeded));

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.topRow} pointerEvents="box-none">
        <View style={styles.bars}>
          <View style={[styles.barBg, styles.ornateFrame]}>
            <View style={styles.hpFill} pointerEvents="none">
              <View style={[styles.hpFillInner, { width: `${hpPct * 100}%` }]} />
              <Text style={styles.barText}>{Math.ceil(hud.hp)} / {Math.round(hud.maxHp)}</Text>
            </View>
          </View>
          <View style={[styles.barBg, styles.xpBar, styles.ornateFrameThin]}>
            <View style={styles.xpFill} pointerEvents="none">
              <View style={[styles.xpFillInner, { width: `${xpPct * 100}%` }]} />
            </View>
          </View>
        </View>
        <Pressable style={[styles.pauseBtn, styles.ornateFrame]} onPress={onPause} hitSlop={12}>
          <Pause size={22} color={GOLD} />
        </Pressable>
      </View>

      <View style={styles.statRow} pointerEvents="none">
        <View style={[styles.stat, styles.ornateFrameThin]}>
          <Skull size={13} color={GOLD} />
          <Text style={styles.statText}>{hud.kills}</Text>
        </View>
        <View style={[styles.timerWrap, styles.ornateFrameThin]}>
          <Text style={styles.timer}>{fmtTime(hud.time)}</Text>
        </View>
        <View style={[styles.stat, styles.ornateFrameThin]}>
          <Coins size={13} color="#fbbf24" />
          <Text style={[styles.statText, { color: '#fbbf24' }]}>{hud.coins}</Text>
        </View>
      </View>

      <View style={[styles.levelBadge, styles.ornateFrame]} pointerEvents="none">
        <View style={styles.levelGem} />
        <Text style={styles.levelText}>LV {hud.level}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    padding: 12,
    paddingTop: 40,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bars: { flex: 1, gap: 4 },
  barBg: {
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(10,6,14,0.72)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  ornateFrame: {
    borderWidth: 1.5,
    borderColor: GOLD_DIM,
    backgroundColor: 'rgba(20,10,18,0.66)',
    shadowColor: '#d4a94e',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  ornateFrameThin: {
    borderWidth: 1,
    borderColor: 'rgba(212,169,78,0.3)',
    backgroundColor: 'rgba(20,10,18,0.6)',
  },
  hpFill: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    justifyContent: 'center',
  },
  hpFillInner: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    backgroundColor: '#b3122b',
    borderTopColor: 'rgba(255,120,120,0.5)',
    borderTopWidth: 1.5,
    shadowColor: '#ef4444',
    shadowOpacity: 0.7,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  barText: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: 10,
    fontWeight: '700',
    color: '#ffe9c7',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowRadius: 3,
  },
  xpBar: {
    height: 9,
    borderRadius: 4,
  },
  xpFill: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
  },
  xpFillInner: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    backgroundColor: '#7c3aed',
    borderTopColor: 'rgba(196,150,255,0.6)',
    borderTopWidth: 1,
    shadowColor: '#a855f7',
    shadowOpacity: 0.7,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  pauseBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9,
  },
  statText: { color: '#f1d9ac', fontSize: 13, fontWeight: '700' },
  timerWrap: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
  },
  timer: { color: '#ffe9c7', fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  levelBadge: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  levelGem: {
    width: 8,
    height: 8,
    backgroundColor: '#a855f7',
    transform: [{ rotate: '45deg' }],
    shadowColor: '#c084fc',
    shadowOpacity: 0.9,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  levelText: { color: '#e7c86e', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
});
