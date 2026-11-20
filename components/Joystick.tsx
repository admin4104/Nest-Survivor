import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  onMove: (x: number, y: number) => void;
}

const MAX = 55;

export default function Joystick({ onMove }: Props) {
  const layerRef = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const moveRef = useRef(onMove);
  moveRef.current = onMove;
  const [visible, setVisible] = useState(false);
  const [originPos, setOriginPos] = useState({ x: 0, y: 0 });
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const handleStart = useCallback((e: PointerEvent) => {
    if (pointerId.current !== null) return;
    pointerId.current = e.pointerId;
    origin.current = { x: e.clientX, y: e.clientY };
    setOriginPos({ x: e.clientX, y: e.clientY });
    setKnob({ x: 0, y: 0 });
    setVisible(true);
  }, []);

  const handleMove = useCallback((e: PointerEvent) => {
    if (pointerId.current !== e.pointerId || !origin.current) return;
    let dx = e.clientX - origin.current.x;
    let dy = e.clientY - origin.current.y;
    const d = Math.hypot(dx, dy);
    if (d > MAX) { dx = (dx / d) * MAX; dy = (dy / d) * MAX; }
    setKnob({ x: dx, y: dy });
    moveRef.current(dx / MAX, dy / MAX);
  }, []);

  const handleEnd = useCallback((e: PointerEvent) => {
    if (pointerId.current !== e.pointerId) return;
    pointerId.current = null;
    origin.current = null;
    setVisible(false);
    moveRef.current(0, 0);
  }, []);

  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;
    el.addEventListener('pointerdown', handleStart);
    el.addEventListener('pointermove', handleMove);
    el.addEventListener('pointerup', handleEnd);
    el.addEventListener('pointercancel', handleEnd);
    return () => {
      el.removeEventListener('pointerdown', handleStart);
      el.removeEventListener('pointermove', handleMove);
      el.removeEventListener('pointerup', handleEnd);
      el.removeEventListener('pointercancel', handleEnd);
    };
  }, [handleStart, handleMove, handleEnd]);

  return (
    <div ref={layerRef} style={styles.touchLayer as unknown as React.CSSProperties}>
      {visible && (
        <View
          style={[styles.base, { left: originPos.x - 60, top: originPos.y - 60 }]}
          pointerEvents="none"
        >
          <View style={[styles.knob, { transform: [{ translateX: knob.x }, { translateY: knob.y }] }]} />
        </View>
      )}
    </div>
  );
}

const FILL = { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 } as const;

const styles = StyleSheet.create({
  touchLayer: {
    ...FILL,
    touchAction: 'none',
    zIndex: 5,
  } as never,
  base: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  knob: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
});
