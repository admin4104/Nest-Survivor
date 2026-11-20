import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { drawHero } from '../game/render';
import type { HeroDef, SkinDef } from '../game/types';

interface Props {
  hero: HeroDef;
  skin: SkinDef;
  size?: number;
  animate?: boolean;
  aiming?: number;
}

export default function HeroPortrait({ hero, skin, size = 64, animate = true, aiming = -Math.PI / 2 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const start = performance.now();
    const loop = (now: number) => {
      const t = animate ? (now - start) / 1000 : 0;
      ctx.clearRect(0, 0, size, size);
      drawHero(ctx, {
        x: size / 2, y: size / 2 + 4, angle: aiming, t,
        moving: animate, skin, weapon: hero.weapon,
        scale: size / 56,
      });
      if (animate) raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [hero, skin, size, animate, aiming]);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
