import { HEROES, getSkin } from './heroes';
import { sfx } from './audio';
import {
  drawArenaBackground, drawVignette, drawHero, drawEnemy, drawProjectile, drawGem, drawEmbers,
  type EnemyLike,
} from './render';
import type { HeroId, UpgradeId } from './types';

export interface Projectile {
  x: number; y: number; vx: number; vy: number;
  radius: number; damage: number; pierce: number; life: number;
  hitIds: Set<number>; explosive: boolean; color: string; crit: boolean;
}

export interface Enemy extends EnemyLike {
  speed: number; damage: number;
}

export interface Gem { x: number; y: number; vx: number; vy: number; value: number; }
export interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number; }
export interface DamageText { x: number; y: number; life: number; text: string; crit: boolean; }
export interface ExplosionFx { x: number; y: number; life: number; maxLife: number; color: string; radius: number; }

export interface EngineCallbacks {
  onLevelUp: () => void;
  onGameOver: (result: { score: number; coins: number; timeSurvived: number; kills: number }) => void;
  onHud: (hud: HudState) => void;
}

export interface HudState {
  hp: number; maxHp: number; xp: number; xpNeeded: number;
  time: number; kills: number; coins: number; level: number;
}

export interface EngineStats {
  fireInterval: number; damage: number; projectileCount: number; spread: number;
  magnetRadius: number; moveSpeed: number; maxHp: number; regen: number; critChance: number;
}

const ENEMY_BASE = { hp: 20, speed: 55, radius: 12, damage: 8, color: '#ef4444' };

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx2d: CanvasRenderingContext2D;
  private cb: EngineCallbacks;
  private raf = 0;
  private last = 0;
  private running = false;
  private paused = false;
  private over = false;

  private heroId: HeroId;
  private stats: EngineStats;

  private worldW = 3000;
  private worldH = 3000;
  private camX = 0; private camY = 0;
  private viewW = 0; private viewH = 0;

  private px = 0; private py = 0;
  private hp = 100;
  private level = 1;
  private xp = 0;
  private xpNeeded = 5;
  private fireTimer = 0;
  private regenAcc = 0;
  private invuln = 0;
  private aim = 0;

  private projectiles: Projectile[] = [];
  private enemies: Enemy[] = [];
  private gems: Gem[] = [];
  private particles: Particle[] = [];
  private dmgTexts: DamageText[] = [];
  private explosions: ExplosionFx[] = [];
  private nextEnemyId = 1;

  private shakeTime = 0;
  private shakeMag = 0;

  // Striker passive: momentum speed bonus
  private momentum = 0;
  // Pyromancer passive: burning damage over time
  private burnAccum = 0;
  // Pyromancer passive: burning ground zones left by explosions
  private burning: { x: number; y: number; life: number; tick: number; radius: number; dps: number }[] = [];

  private spawnTimer = 0;
  private elapsed = 0;

  private kills = 0;
  private coins = 0;
  private upgradeStacks: Record<UpgradeId, number> = {
    attackSpeed: 0, damage: 0, projectile: 0, magnet: 0,
    moveSpeed: 0, maxHp: 0, regen: 0, crit: 0,
  };

  inputX = 0; inputY = 0;

  constructor(canvas: HTMLCanvasElement, heroId: HeroId, cb: EngineCallbacks) {
    this.canvas = canvas;
    const c = canvas.getContext('2d');
    if (!c) throw new Error('canvas 2d unavailable');
    this.ctx2d = c;
    this.cb = cb;
    this.heroId = heroId;
    const def = HEROES[heroId];
    this.stats = {
      fireInterval: def.fireInterval,
      damage: def.damage,
      projectileCount: def.projectileCount,
      spread: def.spread,
      magnetRadius: def.magnetRadius,
      moveSpeed: def.moveSpeed,
      maxHp: def.maxHp,
      regen: 0,
      critChance: 0.05,
    };
    this.hp = def.maxHp;
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.viewW = this.canvas.clientWidth;
    this.viewH = this.canvas.clientHeight;
    this.canvas.width = Math.round(this.viewW * dpr);
    this.canvas.height = Math.round(this.viewH * dpr);
    this.ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  applyUpgrade(id: UpgradeId) {
    const s = this.stats;
    switch (id) {
      case 'attackSpeed': this.upgradeStacks.attackSpeed++; s.fireInterval = Math.max(0.12, s.fireInterval * 0.87); break;
      case 'damage': this.upgradeStacks.damage++; s.damage *= 1.25; break;
      case 'projectile': this.upgradeStacks.projectile++; s.projectileCount += 1; break;
      case 'magnet': this.upgradeStacks.magnet++; s.magnetRadius *= 1.4; break;
      case 'moveSpeed': this.upgradeStacks.moveSpeed++; s.moveSpeed *= 1.12; break;
      case 'maxHp': this.upgradeStacks.maxHp++; s.maxHp += 20; this.hp = Math.min(s.maxHp, this.hp + 20); break;
      case 'regen': this.upgradeStacks.regen++; s.regen += 0.5; break;
      case 'crit': this.upgradeStacks.crit++; s.critChance += 0.1; break;
    }
  }

  getUpgradeStacks() { return { ...this.upgradeStacks }; }

  start() {
    this.running = true;
    this.last = performance.now();
    const loop = (t: number) => {
      if (!this.running) return;
      const dt = Math.min((t - this.last) / 1000, 0.05);
      this.last = t;
      if (!this.paused && !this.over) this.update(dt);
      this.render();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  setPaused(p: boolean) { this.paused = p; this.last = performance.now(); }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private shake(mag: number, dur: number) {
    this.shakeMag = Math.max(this.shakeMag, mag);
    this.shakeTime = Math.max(this.shakeTime, dur);
  }

  // ---------- update ----------

  private update(dt: number) {
    this.elapsed += dt;
    if (this.shakeTime > 0) this.shakeTime -= dt;
    this.updatePlayer(dt);
    this.updateSpawning(dt);
    this.updateEnemies(dt);
    this.updateFiring(dt);
    this.updateProjectiles(dt);
    this.updateGems(dt);
    this.updateParticles(dt);
    this.updateCamera();
    this.pushHud();
  }

  private updatePlayer(dt: number) {
    if (this.momentum > 0) this.momentum -= dt;
    const speedBonus = this.heroId === 'striker' && this.momentum > 0 ? 1.25 : 1;
    const len = Math.hypot(this.inputX, this.inputY);
    if (len > 0.01) {
      const nx = this.inputX / Math.max(1, len);
      const ny = this.inputY / Math.max(1, len);
      this.px += nx * this.stats.moveSpeed * speedBonus * dt;
      this.py += ny * this.stats.moveSpeed * speedBonus * dt;
      this.aim = Math.atan2(ny, nx);
    }
    this.px = Math.max(-this.worldW / 2, Math.min(this.worldW / 2, this.px));
    this.py = Math.max(-this.worldH / 2, Math.min(this.worldH / 2, this.py));

    if (this.stats.regen > 0 && this.hp < this.stats.maxHp) {
      this.regenAcc += this.stats.regen * dt;
      if (this.regenAcc >= 1) {
        this.hp = Math.min(this.stats.maxHp, this.hp + Math.floor(this.regenAcc));
        this.regenAcc -= Math.floor(this.regenAcc);
      }
    }
    if (this.invuln > 0) this.invuln -= dt;
  }

  private updateCamera() {
    this.camX = this.px - this.viewW / 2;
    this.camY = this.py - this.viewH / 2;
    const margin = 300;
    this.camX = Math.max(-this.worldW / 2 - margin, Math.min(this.worldW / 2 + margin - this.viewW, this.camX));
    this.camY = Math.max(-this.worldH / 2 - margin, Math.min(this.worldH / 2 + margin - this.viewH, this.camY));
  }

  private updateSpawning(dt: number) {
    this.spawnTimer -= dt;
    const interval = Math.max(0.35, 1.4 - this.elapsed * 0.012);
    if (this.spawnTimer <= 0) {
      this.spawnTimer = interval;
      const batch = 1 + Math.floor(this.elapsed / 45);
      for (let i = 0; i < batch; i++) this.spawnEnemy();
    }
  }

  private spawnEnemy() {
    const t = this.elapsed;
    const scale = 1 + t / 60;
    const roll = Math.random();
    let kind: Enemy['kind'] = 'grunt';
    if (t > 20 && roll < 0.2) kind = 'fast';
    if (t > 40 && roll > 0.85) kind = 'tank';
    if (t > 90 && roll > 0.985) kind = 'boss';

    const base = ENEMY_BASE;
    let hp = base.hp * scale;
    let speed = base.speed * (1 + t / 240);
    let radius = base.radius;
    let damage = base.damage;
    let color = base.color;
    if (kind === 'fast') { hp *= 0.6; speed *= 1.7; radius = 9; color = '#f97316'; }
    if (kind === 'tank') { hp *= 2.6; speed *= 0.7; radius = 18; damage *= 1.5; color = '#a855f7'; }
    if (kind === 'boss') { hp *= 12; speed *= 0.85; radius = 30; damage *= 2.5; color = '#dc2626'; }

    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(this.viewW, this.viewH) / 2 + 60;
    this.enemies.push({
      id: this.nextEnemyId++,
      x: this.px + Math.cos(angle) * dist,
      y: this.py + Math.sin(angle) * dist,
      vx: 0, vy: 0,
      hp, maxHp: hp,
      speed, radius, damage, color, kind,
      flash: 0,
    });
  }

  private updateEnemies(dt: number) {
    const px = this.px, py = this.py;
    for (const e of this.enemies) {
      const dx = px - e.x, dy = py - e.y;
      const d = Math.hypot(dx, dy) || 1;
      e.vx = (dx / d) * e.speed;
      e.vy = (dy / d) * e.speed;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      if (e.flash > 0) e.flash -= dt;

      if (d < e.radius + 14 && this.invuln <= 0) {
        const reduction = this.heroId === 'vanguard' ? 0.8 : 1;
        this.hp -= e.damage * dt * 2 * reduction;
        this.invuln = 0.35;
        this.shake(4, 0.15);
        if (this.hp <= 0) this.die();
      }
    }
    for (let i = 0; i < this.enemies.length; i++) {
      const a = this.enemies[i];
      for (let j = i + 1; j < this.enemies.length; j++) {
        const b = this.enemies[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        const min = a.radius + b.radius;
        if (d > 0.01 && d < min) {
          const push = ((min - d) / d) * 0.5;
          a.x -= dx * push; a.y -= dy * push;
          b.x += dx * push; b.y += dy * push;
        }
      }
    }
  }

  private nearestEnemy(): Enemy | null {
    let best: Enemy | null = null;
    let bestD = Infinity;
    for (const e of this.enemies) {
      const d = (e.x - this.px) ** 2 + (e.y - this.py) ** 2;
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  // Returns the N nearest distinct enemies so extra projectiles seek separate targets
  private nearestEnemies(n: number): Enemy[] {
    if (n <= 1) {
      const single = this.nearestEnemy();
      return single ? [single] : [];
    }
    const scored = this.enemies
      .map((e) => ({ e, d: (e.x - this.px) ** 2 + (e.y - this.py) ** 2 }))
      .sort((a, b) => a.d - b.d);
    return scored.slice(0, n).map((s) => s.e);
  }

  private updateFiring(dt: number) {
    this.fireTimer -= dt;
    if (this.fireTimer > 0) return;
    const targets = this.nearestEnemies(this.stats.projectileCount);
    if (targets.length === 0) return;
    this.fireTimer = this.stats.fireInterval;

    const primary = targets[0];
    const baseAngle = Math.atan2(primary.y - this.py, primary.x - this.px);
    this.aim = baseAngle;
    const n = this.stats.projectileCount;
    const spread = this.stats.spread;
    const def = HEROES[this.heroId];
    const skin = getSkin(this.heroId);
    for (let i = 0; i < n; i++) {
      const target = targets[i % targets.length];
      const targetAngle = Math.atan2(target.y - this.py, target.x - this.px);
      const offset = n === 1 ? 0 : (i - (n - 1) / 2) * spread;
      const a = targetAngle + offset;
      const crit = Math.random() < this.stats.critChance;
      this.projectiles.push({
        x: this.px + Math.cos(a) * 16, y: this.py + Math.sin(a) * 16,
        vx: Math.cos(a) * 420, vy: Math.sin(a) * 420,
        radius: crit ? 7 : 5,
        damage: this.stats.damage * (crit ? 2 : 1),
        pierce: def.pierce,
        life: 1.6,
        hitIds: new Set(),
        explosive: def.weapon === 'explosive',
        color: crit ? '#fde047' : skin.projectile,
        crit,
      });
    }
    // muzzle flash particles at the barrel
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: this.px + Math.cos(baseAngle) * 18,
        y: this.py + Math.sin(baseAngle) * 18,
        vx: Math.cos(baseAngle) * 90 + (Math.random() - 0.5) * 40,
        vy: Math.sin(baseAngle) * 90 + (Math.random() - 0.5) * 40,
        life: 0.12, maxLife: 0.12, color: skin.projectile, size: 2.5,
      });
    }
    sfx.shoot();
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) { this.projectiles.splice(i, 1); continue; }

      for (const e of this.enemies) {
        if (p.hitIds.has(e.id)) continue;
        const dx = e.x - p.x, dy = e.y - p.y;
        if (dx * dx + dy * dy < (e.radius + p.radius) ** 2) {
          p.hitIds.add(e.id);
          if (p.explosive) {
            this.explode(p.x, p.y, p.damage, p.color);
            this.projectiles.splice(i, 1);
          } else {
            this.damageEnemy(e, p.damage, p.crit);
            this.burst(p.x, p.y, p.color, 4, 120);
            if (p.pierce > 0) p.pierce--;
            else this.projectiles.splice(i, 1);
          }
          break;
        }
      }
    }
  }

  private burst(x: number, y: number, color: string, n: number, speed: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = speed * (0.4 + Math.random() * 0.8);
      this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.35, maxLife: 0.35, color, size: 2 + Math.random() * 2.5 });
    }
  }

  private explode(x: number, y: number, damage: number, color: string) {
    const radius = 70;
    this.explosions.push({ x, y, life: 0.35, maxLife: 0.35, color, radius });
    let hits = 0;
    for (const e of [...this.enemies]) {
      const d = Math.hypot(e.x - x, e.y - y);
      if (d < radius + e.radius) { this.damageEnemy(e, damage * 0.8, false); hits++; }
    }
    if (this.heroId === 'pyromancer') this.burning.push({ x, y, life: 2, tick: 0, radius, dps: damage * 0.15 });
    this.burst(x, y, color, 16, 200);
    this.shake(hits > 3 ? 6 : 3, 0.18);
  }

  private damageEnemy(e: Enemy, amount: number, crit: boolean) {
    e.hp -= amount;
    e.flash = 0.08;
    this.dmgTexts.push({ x: e.x + (Math.random() - 0.5) * 10, y: e.y - e.radius, life: 0.6, text: String(Math.round(amount)), crit });
    sfx.hit();
    if (e.hp <= 0) this.killEnemy(e);
  }

  private killEnemy(e: Enemy) {
    const idx = this.enemies.indexOf(e);
    if (idx === -1) return;
    this.enemies.splice(idx, 1);
    this.kills++;
    if (this.heroId === 'striker') this.momentum = 3;
    const gemValue = e.kind === 'boss' ? 10 : e.kind === 'tank' ? 4 : e.kind === 'fast' ? 2 : 1;
    this.gems.push({ x: e.x, y: e.y, vx: 0, vy: 0, value: gemValue });
    if (e.kind === 'boss') this.coins += 25;
    else if (e.kind === 'tank') this.coins += 5;
    else this.coins += Math.random() < 0.25 ? 1 : 0;

    this.burst(e.x, e.y, e.color, e.kind === 'boss' ? 30 : 10, e.kind === 'boss' ? 260 : 140);
    if (e.kind === 'boss') this.shake(8, 0.3);
    else if (e.kind === 'tank') this.shake(3, 0.12);
    sfx.kill();
  }

  private updateGems(dt: number) {
    for (let i = this.gems.length - 1; i >= 0; i--) {
      const g = this.gems[i];
      const dx = this.px - g.x, dy = this.py - g.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < this.stats.magnetRadius) {
        const pull = 260 * (1 - d / this.stats.magnetRadius) + 80;
        g.vx += (dx / d) * pull * dt * 6;
        g.vy += (dy / d) * pull * dt * 6;
      }
      g.vx *= 0.92; g.vy *= 0.92;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      if (d < 18) {
        this.gems.splice(i, 1);
        this.xp += g.value;
        sfx.gem();
        while (this.xp >= this.xpNeeded) this.levelUp();
      }
    }
  }

  private levelUp() {
    this.xp -= this.xpNeeded;
    this.level++;
    this.xpNeeded = Math.round(this.xpNeeded * 1.4 + 3);
    this.paused = true;
    sfx.levelUp();
    this.cb.onLevelUp();
  }

  resumeAfterLevelUp() {
    this.paused = false;
    this.last = performance.now();
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= 0.9; p.vy *= 0.9;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.dmgTexts.length - 1; i >= 0; i--) {
      const t = this.dmgTexts[i];
      t.y -= 30 * dt;
      t.life -= dt;
      if (t.life <= 0) this.dmgTexts.splice(i, 1);
    }
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      this.explosions[i].life -= dt;
      if (this.explosions[i].life <= 0) this.explosions.splice(i, 1);
    }
    // Pyromancer burning ground
    for (let i = this.burning.length - 1; i >= 0; i--) {
      const b = this.burning[i];
      b.life -= dt;
      b.tick -= dt;
      if (b.tick <= 0) {
        b.tick = 0.4;
        for (const e of [...this.enemies]) {
          if (Math.hypot(e.x - b.x, e.y - b.y) < b.radius + e.radius) this.damageEnemy(e, b.dps * 0.4, false);
        }
      }
      if (b.life <= 0) this.burning.splice(i, 1);
    }
  }

  private die() {
    if (this.over) return;
    this.over = true;
    this.hp = 0;
    sfx.death();
    this.cb.onGameOver({
      score: this.kills * 10 + Math.floor(this.elapsed) * 2,
      coins: this.coins,
      timeSurvived: this.elapsed,
      kills: this.kills,
    });
  }

  private pushHud() {
    this.cb.onHud({
      hp: Math.max(0, this.hp),
      maxHp: this.stats.maxHp,
      xp: this.xp,
      xpNeeded: this.xpNeeded,
      time: this.elapsed,
      kills: this.kills,
      coins: this.coins,
      level: this.level,
    });
  }

  // ---------- render ----------

  private render() {
    const ctx = this.ctx2d;
    const w = this.viewW, h = this.viewH;
    const t = this.elapsed;

    ctx.save();
    if (this.shakeTime > 0 && this.shakeMag > 0) {
      const m = this.shakeMag * (this.shakeTime / 0.3);
      ctx.translate((Math.random() - 0.5) * m * 2, (Math.random() - 0.5) * m * 2);
    }

    ctx.fillStyle = '#100d17';
    ctx.fillRect(-20, -20, w + 40, h + 40);
    ctx.translate(-this.camX, -this.camY);

    drawArenaBackground(ctx, this.camX, this.camY, w, h, t);

    for (const g of this.gems) drawGem(ctx, g, t);

    // Pyromancer burning ground
    for (const b of this.burning) {
      const k = b.life / 2;
      ctx.save();
      ctx.globalAlpha = Math.min(0.4, k) * 0.9;
      const g3 = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
      g3.addColorStop(0, 'rgba(249,115,22,0.7)');
      g3.addColorStop(1, 'rgba(249,115,22,0)');
      ctx.fillStyle = g3;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const e of this.enemies) {
      if (e.x < this.camX - 60 || e.x > this.camX + w + 60) continue;
      if (e.y < this.camY - 60 || e.y > this.camY + h + 60) continue;
      drawEnemy(ctx, e, t);
    }

    for (const ex of this.explosions) {
      const k = 1 - ex.life / ex.maxLife;
      ctx.save();
      ctx.globalAlpha = (1 - k) * 0.9;
      ctx.strokeStyle = ex.color;
      ctx.lineWidth = 6 * (1 - k) + 2;
      ctx.shadowColor = ex.color;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, ex.radius * (0.3 + k * 0.9), 0, Math.PI * 2);
      ctx.stroke();
      const g2 = ctx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, ex.radius * (0.4 + k));
      g2.addColorStop(0, ex.color);
      g2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g2;
      ctx.globalAlpha = (1 - k) * 0.55;
      ctx.beginPath();
      ctx.arc(ex.x, ex.y, ex.radius * (0.4 + k), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const p of this.projectiles) drawProjectile(ctx, p);

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    const skin = getSkin(this.heroId);
    drawHero(ctx, {
      x: this.px, y: this.py, angle: this.aim, t,
      moving: Math.hypot(this.inputX, this.inputY) > 0.01,
      skin, weapon: HEROES[this.heroId].weapon,
    });

    ctx.textAlign = 'center';
    for (const d of this.dmgTexts) {
      ctx.globalAlpha = Math.max(0, d.life / 0.6);
      ctx.font = d.crit ? 'bold 17px monospace' : 'bold 12px monospace';
      ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      ctx.lineWidth = 3;
      ctx.strokeText(d.text, d.x, d.y);
      ctx.fillStyle = d.crit ? '#fde047' : '#f1f5f9';
      ctx.fillText(d.text, d.x, d.y);
    }
    ctx.globalAlpha = 1;

    ctx.restore();

    ctx.save();
    drawVignette(ctx, w, h);
    ctx.restore();

    ctx.save();
    drawEmbers(ctx, w, h, t);
    ctx.restore();
  }
}
