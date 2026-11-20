import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Joystick from '../components/Joystick';
import Hud from '../components/Hud';
import LevelUpOverlay from '../components/LevelUpOverlay';
import GameOverScreen from '../components/GameOverScreen';
import PauseOverlay from '../components/PauseOverlay';
import { GameEngine, type HudState } from '../game/engine';
import { rollUpgradeChoices } from '../game/upgrades';
import { ensureAudio } from '../game/audio';
import { useSave } from '../game/useSave';
import type { HeroId, UpgradeId } from '../game/types';

type Phase = 'playing' | 'levelup' | 'paused' | 'over';

const EMPTY_HUD: HudState = { hp: 100, maxHp: 100, xp: 0, xpNeeded: 5, time: 0, kills: 0, coins: 0, level: 1 };

const EMPTY_STACKS: Record<UpgradeId, number> = {
  attackSpeed: 0, damage: 0, projectile: 0, magnet: 0, moveSpeed: 0, maxHp: 0, regen: 0, crit: 0,
};

export default function GameScreen() {
  const router = useRouter();
  const { save, update } = useSave();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [phase, setPhase] = useState<Phase>('playing');
  const [hud, setHud] = useState<HudState>(EMPTY_HUD);
  const [choices, setChoices] = useState(() => rollUpgradeChoices(EMPTY_STACKS));
  const [stacks, setStacks] = useState<Record<UpgradeId, number>>(EMPTY_STACKS);
  const [result, setResult] = useState({ score: 0, coins: 0, timeSurvived: 0, kills: 0 });
  const [runKey, setRunKey] = useState(0);
  const runSaved = useRef(false);

  const { hero: heroParam } = useLocalSearchParams<{ hero?: string }>();
  const heroId: HeroId = heroParam === 'pyromancer' || heroParam === 'striker' ? heroParam : 'vanguard';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new GameEngine(canvas, heroId, {
      onLevelUp: () => {
        setChoices(rollUpgradeChoices(engine.getUpgradeStacks()));
        setStacks(engine.getUpgradeStacks());
        setPhase('levelup');
      },
      onGameOver: (r) => {
        setResult(r);
        setPhase('over');
        if (!runSaved.current) {
          runSaved.current = true;
          update({
            coins: (save?.coins ?? 0) + r.coins,
            highScore: Math.max(save?.highScore ?? 0, r.score),
          });
        }
      },
      onHud: setHud,
    });
    engineRef.current = engine;
    engine.start();
    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey]);

  useEffect(() => {
    ensureAudio();
    engineRef.current?.setPaused(phase !== 'playing');
  }, [phase]);

  const pickUpgrade = (id: UpgradeId) => {
    engineRef.current?.applyUpgrade(id);
    setStacks(engineRef.current?.getUpgradeStacks() ?? stacks);
    setPhase('playing');
  };

  const playAgain = () => {
    setPhase('playing');
    setHud(EMPTY_HUD);
    setStacks(EMPTY_STACKS);
    setResult({ score: 0, coins: 0, timeSurvived: 0, kills: 0 });
    runSaved.current = false;
    setRunKey((k) => k + 1);
  };

  return (
    <View style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />
      <Joystick onMove={(x, y) => {
        if (engineRef.current) { engineRef.current.inputX = x; engineRef.current.inputY = y; }
      }} />
      <Hud hud={hud} onPause={() => setPhase('paused')} />

      {phase === 'levelup' && (
        <LevelUpOverlay choices={choices} stacks={stacks} onPick={pickUpgrade} />
      )}
      {phase === 'paused' && (
        <PauseOverlay
          onResume={() => setPhase('playing')}
          onQuit={() => router.back()}
        />
      )}
      {phase === 'over' && (
        <GameOverScreen
          score={result.score}
          coins={result.coins}
          timeSurvived={result.timeSurvived}
          kills={result.kills}
          onPlayAgain={playAgain}
          onShop={() => router.replace('/shop')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1120' },
  canvas: { position: 'absolute', width: '100%', height: '100%' } as never,
});
