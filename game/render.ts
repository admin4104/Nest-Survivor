import type { SkinDef, WeaponKind } from './types';

// ---------- helpers ----------

export function hash2(x: number, y: number): number {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
}

function clamp255(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp255((n >> 16) + amt);
  const g = clamp255(((n >> 8) & 0xff) + amt);
  const b = clamp255((n & 0xff) + amt);
  return `rgb(${r},${g},${b})`;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---------- arena background (Nest of Thorns courtyard) ----------

export function drawArenaBackground(
  ctx: CanvasRenderingContext2D, camX: number, camY: number, w: number, h: number, time: number
) {
  ctx.fillStyle = '#0d0a12';
  ctx.fillRect(camX - 200, camY - 200, w + 400, h + 400);

  const TILE = 120;
  const tx0 = Math.floor((camX - 200) / TILE);
  const ty0 = Math.floor((camY - 200) / TILE);
  const tx1 = Math.ceil((camX + w + 200) / TILE);
  const ty1 = Math.ceil((camY + h + 200) / TILE);

  for (let tx = tx0; tx <= tx1; tx++) {
    for (let ty = ty0; ty <= ty1; ty++) {
      const r = hash2(tx, ty);
      const px = tx * TILE;
      const py = ty * TILE;
      const base = 24 + Math.floor(r * 10);
      // flagstone base — cold violet-grey castle stone
      ctx.fillStyle = `rgb(${base + 8},${base + 4},${base + 16})`;
      ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);

      // irregular cobble sub-stones inside each tile
      const rows = 2 + Math.floor(hash2(tx + 3.1, ty + 7.7) * 2);
      const cols = 2 + Math.floor(hash2(tx + 15.9, ty + 2.2) * 2);
      for (let cxi = 0; cxi < cols; cxi++) {
        for (let cyi = 0; cyi < rows; cyi++) {
          const cr = hash2(tx * 7 + cxi * 3.7, ty * 5 + cyi * 2.9);
          const cw = (TILE - 8) / cols;
          const ch = (TILE - 8) / rows;
          const v = 26 + Math.floor(cr * 14);
          ctx.fillStyle = `rgb(${v + 6},${v + 2},${v + 14})`;
          ctx.fillRect(px + 4 + cxi * cw + 1, py + 4 + cyi * ch + 1, cw - 2, ch - 2);
          ctx.fillStyle = 'rgba(255,255,255,0.045)';
          ctx.fillRect(px + 4 + cxi * cw + 1, py + 4 + cyi * ch + 1, cw - 2, 1.5);
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fillRect(px + 4 + cxi * cw + 1, py + 4 + cyi * ch + ch - 3, cw - 2, 2);
        }
      }

      const r2 = hash2(tx + 91.7, ty + 13.3);
      const pulse = 0.5 + 0.5 * Math.sin(time * 1.6 + r * 10);

      // glowing crimson thorn vines threading across the courtyard
      if (r2 > 0.82) {
        const cx = px + 10 + r * 40;
        const cy = py + 10 + r2 * 50;
        ctx.save();
        ctx.strokeStyle = `rgba(244,63,94,${0.35 + pulse * 0.35})`;
        ctx.shadowColor = '#e11d48';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(cx + 34, cy - 12, cx + 72, cy + 8);
        ctx.quadraticCurveTo(cx + 96, cy + 20, cx + 112, cy + 4);
        ctx.stroke();
        ctx.shadowBlur = 0;
        // thorn barbs
        ctx.fillStyle = `rgba(253,164,175,${0.5 + pulse * 0.4})`;
        for (let bi = 0; bi < 5; bi++) {
          const bt = 0.15 + bi * 0.2;
          const bx = cx + bt * 112;
          const by = cy + Math.sin(bt * 6 + r) * 8;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + 3, by - 6);
          ctx.lineTo(bx + 5, by);
          ctx.fill();
        }
        ctx.restore();
      } else if (r2 > 0.62) {
        // violet rune circle
        ctx.save();
        const rx = px + TILE / 2;
        const ry = py + TILE / 2;
        ctx.strokeStyle = `rgba(167,139,250,${0.14 + pulse * 0.16})`;
        ctx.shadowColor = '#8b5cf6';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(rx, ry, 26, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rx, ry, 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.translate(rx, ry);
        ctx.rotate(time * 0.35 + r);
        ctx.strokeRect(-12, -12, 24, 24);
        ctx.restore();
      } else if (r2 < 0.07) {
        // cracked flagstone
        ctx.strokeStyle = 'rgba(0,0,0,0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const cx = px + 20 + r * 60;
        const cy = py + 20 + r2 * 80 + 20;
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 16, cy + 12);
        ctx.lineTo(cx + 30, cy + 5);
        ctx.lineTo(cx + 46, cy + 18);
        ctx.stroke();
        // faint crimson seeping from the crack
        ctx.strokeStyle = `rgba(225,29,72,${0.15 + pulse * 0.12})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (r2 < 0.18) {
        // bone pile
        ctx.fillStyle = 'rgba(203,213,225,0.28)';
        const bx = px + 24 + r * 60;
        const by = py + 30 + r * 50;
        ctx.fillRect(bx, by, 14, 2.5);
        ctx.fillRect(bx + 3, by - 4, 2.5, 11);
        ctx.beginPath();
        ctx.arc(bx + 22, by + 1, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

// Screen-space drifting torch embers — purely atmospheric, no engine state
export function drawEmbers(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const COUNT = 34;
  for (let i = 0; i < COUNT; i++) {
    const r1 = hash2(i * 3.7, 1.3);
    const r2 = hash2(i * 7.9, 4.1);
    const r3 = hash2(i * 13.1, 8.7);
    const speed = 14 + r2 * 26;
    const x = r1 * w + Math.sin(time * 0.6 + i * 2.1) * 24;
    const y = ((r2 * h + time * speed) % (h + 60)) - 30;
    const flick = 0.5 + 0.5 * Math.sin(time * 5 + i * 1.7);
    const alpha = (0.12 + r3 * 0.3) * (0.5 + flick * 0.5);
    const size = 1.2 + r3 * 2.2;
    const warm = r3 > 0.5;
    ctx.save();
    ctx.shadowColor = warm ? '#f97316' : '#e11d48';
    ctx.shadowBlur = 6;
    ctx.fillStyle = warm ? `rgba(251,146,60,${alpha})` : `rgba(244,63,94,${alpha})`;
    ctx.beginPath();
    ctx.arc(x, h - y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // crimson-tinted ambient vignette
  const crimson = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.8);
  crimson.addColorStop(0, 'rgba(136,19,55,0)');
  crimson.addColorStop(1, 'rgba(136,19,55,0.14)');
  ctx.fillStyle = crimson;
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// ---------- hero (winged, cloaked) ----------

export interface HeroDraw {
  x: number;
  y: number;
  angle: number;
  t: number;
  moving: boolean;
  skin: SkinDef;
  weapon: WeaponKind;
  scale?: number;
}

export function drawHero(ctx: CanvasRenderingContext2D, o: HeroDraw) {
  const s = o.scale ?? 1;
  const bob = o.moving ? Math.sin(o.t * 12) * 1.6 : Math.sin(o.t * 3) * 0.8;
  const flap = o.moving ? Math.sin(o.t * 14) * 0.5 : Math.sin(o.t * 4) * 0.18;
  const ax = Math.cos(o.angle);
  const ay = Math.sin(o.angle);

  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.scale(s, s);

  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 15, 12, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bob);

  // wings behind the body — dark feathered, flapping with movement
  ctx.save();
  ctx.translate(-ax * 4, -ay * 2 - 2);
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(1, side);
    ctx.rotate(flap * side * 0.35);
    ctx.fillStyle = shade(o.skin.body, -55);
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.quadraticCurveTo(-16, -14, -26, -10);
    ctx.quadraticCurveTo(-20, -5, -24, -2);
    ctx.quadraticCurveTo(-17, -1, -19, 4);
    ctx.quadraticCurveTo(-12, 4, -13, 8);
    ctx.quadraticCurveTo(-7, 6, -2, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = shade(o.skin.trim, -30);
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // tattered cape
  ctx.fillStyle = shade(o.skin.body, -40);
  ctx.beginPath();
  ctx.moveTo(-ax * 5 - 6, -ay * 4 - 4);
  ctx.quadraticCurveTo(-ax * 12, -ay * 6 + 8, -ax * 8 - 4, -ay * 3 + 14);
  ctx.quadraticCurveTo(-ax * 4, -ay * 2 + 9, -ax * 6 + 2, -ay * 1 + 12);
  ctx.quadraticCurveTo(-ax * 2 + 4, -ay * 1 + 6, ax * 4 - 2, -ay * 2 + 6);
  ctx.lineTo(ax * 3, -ay * 2 - 4);
  ctx.closePath();
  ctx.fill();

  // weapon (drawn under the arm side, pointing at aim)
  ctx.save();
  ctx.rotate(o.angle);
  if (o.weapon === 'bolt') {
    ctx.fillStyle = shade(o.skin.body, -20);
    ctx.fillRect(3, -8, 5, 9);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(7, -6.5, 14, 3.5);
    ctx.shadowColor = o.skin.projectile;
    ctx.shadowBlur = 8;
    ctx.fillStyle = o.skin.projectile;
    ctx.fillRect(19, -6, 5, 2.5);
    ctx.shadowBlur = 0;
  } else if (o.weapon === 'explosive') {
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-4, 7);
    ctx.lineTo(16, -6);
    ctx.stroke();
    // twisted thorn-wood staff crown
    ctx.strokeStyle = shade(o.skin.body, -30);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(17, -7);
    ctx.lineTo(21, -12);
    ctx.moveTo(17, -7);
    ctx.lineTo(13, -13);
    ctx.stroke();
    ctx.shadowColor = o.skin.projectile;
    ctx.shadowBlur = 12;
    ctx.fillStyle = o.skin.projectile;
    ctx.beginPath();
    ctx.arc(17, -7, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff7ed';
    ctx.beginPath();
    ctx.arc(17, -7, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(7, -9, 11, 2.5);
    ctx.fillRect(7, 6.5, 11, 2.5);
    ctx.shadowColor = o.skin.projectile;
    ctx.shadowBlur = 6;
    ctx.fillStyle = o.skin.projectile;
    ctx.fillRect(16, -9, 4, 2.5);
    ctx.fillRect(16, 6.5, 4, 2.5);
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // torso — breastplate
  ctx.fillStyle = o.skin.body;
  roundRectPath(ctx, -9, -6, 18, 17, 6);
  ctx.fill();
  ctx.fillStyle = shade(o.skin.body, 24);
  roundRectPath(ctx, -9, -6, 18, 6, 5);
  ctx.fill();
  ctx.fillStyle = o.skin.trim;
  ctx.fillRect(-6, 0, 12, 3);
  // belt
  ctx.fillStyle = shade(o.skin.body, -45);
  ctx.fillRect(-8, 7, 16, 3);

  // shoulder pauldrons
  ctx.fillStyle = shade(o.skin.body, 30);
  ctx.beginPath();
  ctx.arc(-ay * 11, ax * 11 - 2, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ay * 11, -ax * 11 - 2, 4.5, 0, Math.PI * 2);
  ctx.fill();
  // pauldron spikes
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.moveTo(-ay * 11, ax * 11 - 7);
  ctx.lineTo(-ay * 11 - 2, ax * 11 - 11);
  ctx.lineTo(-ay * 11 + 2.5, ax * 11 - 6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(ay * 11, -ax * 11 - 7);
  ctx.lineTo(ay * 11 + 2, -ax * 11 - 11);
  ctx.lineTo(ay * 11 - 2.5, -ax * 11 - 6);
  ctx.fill();

  // head + deep hood
  ctx.fillStyle = shade(o.skin.body, 14);
  ctx.beginPath();
  ctx.arc(0, -12, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(o.skin.body, -25);
  ctx.beginPath();
  ctx.arc(ax * 1.5, -12 + ay * 1.5, 7.5, Math.PI * 0.85, Math.PI * 2.15);
  ctx.fill();
  // hood interior shadow
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.beginPath();
  ctx.arc(ax * 2, -12 + ay * 2, 4.8, 0, Math.PI * 2);
  ctx.fill();

  // glowing eyes from the hood
  const ex = ax * 3.5;
  const ey = -12 + ay * 3;
  ctx.shadowColor = o.skin.projectile;
  ctx.shadowBlur = 7;
  ctx.fillStyle = o.skin.projectile;
  ctx.beginPath();
  ctx.arc(ex - ay * 2.6, ey + ax * 2.6, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ex + ay * 2.6, ey - ax * 2.6, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();
  ctx.restore();
}

// ---------- enemies (skeleton / gargoyle / knight / demon lord) ----------

export interface EnemyLike {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  kind: 'grunt' | 'fast' | 'tank' | 'boss';
  flash: number;
  hp: number;
  maxHp: number;
}

export function drawEnemy(ctx: CanvasRenderingContext2D, e: EnemyLike, t: number) {
  const ang = Math.atan2(e.vy, e.vx);
  const walk = Math.sin(t * 10 + e.id * 1.7) * (e.kind === 'fast' ? 2 : 1.2);
  const flash = e.flash > 0;
  const body = flash ? '#ffffff' : e.color;
  const dark = flash ? '#dddddd' : shade(e.color, -40);
  const bone = flash ? '#ffffff' : '#e2e0d5';
  const eye = flash
    ? '#ffffff'
    : e.kind === 'grunt'
      ? '#fde047'
      : e.kind === 'fast'
        ? '#67e8f9'
        : e.kind === 'tank'
          ? '#fb923c'
          : '#f87171';

  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(e.x, e.y + e.radius * 0.9, e.radius * 0.9, e.radius * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(e.x, e.y + walk * 0.3);

  const ax = Math.cos(ang);
  const ay = Math.sin(ang);

  if (e.kind === 'grunt') {
    // skeletal warrior — skull, ribcage, jagged blade
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
    ctx.fill();
    // ribcage stripes
    ctx.strokeStyle = dark;
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-e.radius * 0.6, i * e.radius * 0.35);
      ctx.lineTo(e.radius * 0.6, i * e.radius * 0.35);
      ctx.stroke();
    }
    // spine
    ctx.beginPath();
    ctx.moveTo(0, -e.radius * 0.7);
    ctx.lineTo(0, e.radius * 0.7);
    ctx.stroke();
    // skull
    ctx.fillStyle = bone;
    ctx.beginPath();
    ctx.arc(ax * e.radius * 0.35, ay * e.radius * 0.35 - 2, e.radius * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.beginPath();
    ctx.arc(ax * e.radius * 0.55 - ay * e.radius * 0.22, ay * e.radius * 0.55 + ax * e.radius * 0.22 - 3, 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ax * e.radius * 0.55 + ay * e.radius * 0.22, ay * e.radius * 0.55 - ax * e.radius * 0.22 - 3, 1.7, 0, Math.PI * 2);
    ctx.fill();
    // jaw
    ctx.fillStyle = shade(bone, -30);
    ctx.fillRect(ax * e.radius * 0.3 - 3, ay * e.radius * 0.3 + 2, 6, 2);
    // jagged sword
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ax * e.radius * 0.5 - ay * e.radius * 0.8, ay * e.radius * 0.5 + ax * e.radius * 0.8);
    ctx.lineTo(ax * e.radius * 0.9 - ay * e.radius * 1.1, ay * e.radius * 0.9 + ax * e.radius * 1.1);
    ctx.lineTo(ax * e.radius * 1.3 - ay * e.radius * 0.5, ay * e.radius * 1.3 + ax * e.radius * 0.5);
    ctx.stroke();
  } else if (e.kind === 'fast') {
    // gargoyle — crouched winged imp, horns, tail
    ctx.save();
    ctx.rotate(ang + Math.PI / 2);
    // wings
    ctx.fillStyle = dark;
    const wf = Math.sin(t * 16 + e.id) * 0.4;
    for (const wside of [-1, 1]) {
      ctx.save();
      ctx.scale(wside, 1);
      ctx.rotate(wf * wside * 0.3);
      ctx.beginPath();
      ctx.moveTo(e.radius * 0.4, 0);
      ctx.quadraticCurveTo(e.radius * 2, -e.radius * 0.8, e.radius * 2.3, -e.radius * 2);
      ctx.quadraticCurveTo(e.radius * 1.6, -e.radius * 1.4, e.radius * 1.5, -e.radius * 0.6);
      ctx.quadraticCurveTo(e.radius * 1.2, -e.radius * 0.8, e.radius * 0.4, 0);
      ctx.fill();
      ctx.restore();
    }
    // crouched body
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(0, -e.radius * 1.5);
    ctx.quadraticCurveTo(e.radius, -e.radius * 0.4, e.radius * 0.75, e.radius * 1.1);
    ctx.lineTo(e.radius * 0.3, e.radius * 0.75);
    ctx.lineTo(0, e.radius * 1.3);
    ctx.lineTo(-e.radius * 0.3, e.radius * 0.75);
    ctx.lineTo(-e.radius * 0.75, e.radius * 1.1);
    ctx.quadraticCurveTo(-e.radius, -e.radius * 0.4, 0, -e.radius * 1.5);
    ctx.fill();
    // horns
    ctx.strokeStyle = bone;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-e.radius * 0.4, -e.radius * 1.2);
    ctx.quadraticCurveTo(-e.radius * 0.9, -e.radius * 1.9, -e.radius * 0.3, -e.radius * 2);
    ctx.moveTo(e.radius * 0.4, -e.radius * 1.2);
    ctx.quadraticCurveTo(e.radius * 0.9, -e.radius * 1.9, e.radius * 0.3, -e.radius * 2);
    ctx.stroke();
    // tail
    ctx.beginPath();
    ctx.moveTo(0, e.radius * 1.2);
    ctx.quadraticCurveTo(e.radius * 0.8, e.radius * 1.9, e.radius * 0.3, e.radius * 2.2);
    ctx.stroke();
    ctx.restore();
  } else if (e.kind === 'tank') {
    // elite aura — glowing violet ring under the knight
    if (!flash) {
      ctx.save();
      const ap = 0.5 + 0.5 * Math.sin(t * 3 + e.id);
      ctx.strokeStyle = `rgba(168,85,247,${0.35 + ap * 0.3})`;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, e.radius * 0.9, e.radius * 1.25, e.radius * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    // armored knight — plate plates, helm visor, shield
    ctx.fillStyle = body;
    roundRectPath(ctx, -e.radius, -e.radius * 0.9, e.radius * 2, e.radius * 1.8, 5);
    ctx.fill();
    // plate segments
    ctx.fillStyle = dark;
    ctx.fillRect(-e.radius, -e.radius * 0.9, e.radius * 2, 4);
    ctx.fillRect(-e.radius * 0.3, -e.radius * 0.9, e.radius * 0.6, e.radius * 1.8);
    ctx.fillRect(-e.radius, e.radius * 0.35, e.radius * 2, 3);
    // rivets
    ctx.fillStyle = shade(e.color, 30);
    ctx.beginPath();
    ctx.arc(-e.radius * 0.95, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(e.radius * 0.95, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // helm with visor slit facing movement direction
    ctx.fillStyle = shade(e.color, 10);
    ctx.beginPath();
    ctx.arc(ax * e.radius * 0.5, ay * e.radius * 0.5, e.radius * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = flash ? '#ffffff' : '#000000';
    ctx.fillRect(ax * e.radius * 0.6 - ay * e.radius * 0.4 - 1, ay * e.radius * 0.6 + ax * e.radius * 0.4 - 2, e.radius * 0.8 + 2, 4);
    // shield
    ctx.fillStyle = shade(e.color, -25);
    roundRectPath(ctx, -e.radius * 1.35, -e.radius * 0.55, e.radius * 0.5, e.radius * 1.1, 4);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else {
    // elite aura — burning crimson ring under the demon lord
    if (!flash) {
      ctx.save();
      const ap = 0.5 + 0.5 * Math.sin(t * 2.4 + e.id);
      ctx.strokeStyle = `rgba(239,68,68,${0.4 + ap * 0.35})`;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, e.radius * 0.9, e.radius * 1.3, e.radius * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    // demon lord — horned crown, tattered wings, glowing sigil
    ctx.save();
    // wings behind
    ctx.fillStyle = dark;
    const wf = Math.sin(t * 5) * 0.15;
    for (const wside of [-1, 1]) {
      ctx.save();
      ctx.scale(wside, 1);
      ctx.rotate(wf);
      ctx.beginPath();
      ctx.moveTo(e.radius * 0.5, -e.radius * 0.2);
      ctx.quadraticCurveTo(e.radius * 1.8, -e.radius * 1.1, e.radius * 2.1, -e.radius * 1.9);
      ctx.quadraticCurveTo(e.radius * 1.5, -e.radius * 1.2, e.radius * 1.6, -e.radius * 0.5);
      ctx.quadraticCurveTo(e.radius * 1.1, -e.radius * 0.6, e.radius * 0.5, -e.radius * 0.2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
    ctx.fill();
    // armored crown spikes
    ctx.fillStyle = dark;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * e.radius * 0.35 - 4, -e.radius * 0.85);
      ctx.lineTo(i * e.radius * 0.35, -e.radius * 1.25);
      ctx.lineTo(i * e.radius * 0.35 + 4, -e.radius * 0.85);
      ctx.fill();
    }
    // curled horns
    ctx.strokeStyle = bone;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-e.radius * 0.8, -e.radius * 0.3);
    ctx.quadraticCurveTo(-e.radius * 1.5, -e.radius * 0.9, -e.radius * 1.1, -e.radius * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.radius * 0.8, -e.radius * 0.3);
    ctx.quadraticCurveTo(e.radius * 1.5, -e.radius * 0.9, e.radius * 1.1, -e.radius * 1.5);
    ctx.stroke();
    // burning sigil on the chest
    ctx.strokeStyle = flash ? '#ffffff' : '#fca5a5';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-e.radius * 0.4, -e.radius * 0.2);
    ctx.lineTo(-e.radius * 0.1, e.radius * 0.3);
    ctx.lineTo(-e.radius * 0.3, e.radius * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.radius * 0.5, 0);
    ctx.lineTo(e.radius * 0.2, e.radius * 0.4);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // glowing eyes toward the player
  ctx.shadowColor = eye;
  ctx.shadowBlur = 7;
  ctx.fillStyle = eye;
  if (e.kind === 'fast') {
    const fx = ax * e.radius * 0.9;
    const fy = ay * e.radius * 0.9;
    ctx.beginPath();
    ctx.ellipse(fx, fy, 4, 1.6, ang, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const ex = ax * e.radius * 0.45;
    const ey = ay * e.radius * 0.45;
    const er = e.radius * 0.13 + 1;
    ctx.beginPath();
    ctx.arc(ex - ay * e.radius * 0.3, ey + ax * e.radius * 0.3, er, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex + ay * e.radius * 0.3, ey - ax * e.radius * 0.3, er, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  ctx.restore();

  if (e.hp < e.maxHp) {
    const pct = Math.max(0, e.hp / e.maxHp);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(e.x - e.radius, e.y - e.radius - 9, e.radius * 2, 3.5);
    ctx.fillStyle = e.kind === 'boss' ? '#f87171' : '#4ade80';
    ctx.fillRect(e.x - e.radius, e.y - e.radius - 9, e.radius * 2 * pct, 3.5);
  }
}

// ---------- projectiles & gems ----------

export interface ProjectileLike {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  explosive: boolean;
  crit: boolean;
}

export function drawProjectile(ctx: CanvasRenderingContext2D, p: ProjectileLike) {
  const ang = Math.atan2(p.vy, p.vx);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(ang);

  // arcane streak trail
  const grad = ctx.createLinearGradient(-22, 0, 4, 0);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(1, p.color);
  ctx.fillStyle = grad;
  ctx.fillRect(-22, -p.radius * 0.45, 24, p.radius * 0.9);

  // feather barbs riding the trail
  ctx.fillStyle = p.color;
  ctx.globalAlpha = 0.55;
  for (let i = 0; i < 2; i++) {
    const off = -8 - i * 8;
    ctx.beginPath();
    ctx.moveTo(off, -p.radius * 0.4);
    ctx.lineTo(off - 4, -p.radius * 1.1);
    ctx.lineTo(off + 2, -p.radius * 0.4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(off, p.radius * 0.4);
    ctx.lineTo(off - 4, p.radius * 1.1);
    ctx.lineTo(off + 2, p.radius * 0.4);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.shadowColor = p.color;
  ctx.shadowBlur = p.crit ? 15 : 9;
  ctx.fillStyle = p.color;
  if (p.explosive) {
    const flick = 1 + Math.sin(p.x * 0.05 + p.y * 0.05) * 0.15;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * 1.3 * flick, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff7ed';
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // arcane shard head
    ctx.beginPath();
    ctx.moveTo(p.radius + 4, 0);
    ctx.lineTo(0, -p.radius * 0.75);
    ctx.lineTo(-p.radius * 0.6, 0);
    ctx.lineTo(0, p.radius * 0.75);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(p.radius * 0.9, 0);
    ctx.lineTo(0, -p.radius * 0.32);
    ctx.lineTo(0, p.radius * 0.32);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export interface GemLike {
  x: number;
  y: number;
  value: number;
}

export function drawGem(ctx: CanvasRenderingContext2D, g: GemLike, t: number) {
  const pulse = 0.75 + 0.25 * Math.sin(t * 4 + g.x * 0.1 + g.y * 0.1);
  const color = g.value >= 10 ? '#fbbf24' : g.value >= 4 ? '#c084fc' : '#38bdf8';
  const s = g.value >= 10 ? 7 : g.value >= 4 ? 6 : 4.5;
  ctx.save();
  ctx.translate(g.x, g.y + Math.sin(t * 3 + g.x * 0.1) * 1.5);
  ctx.shadowColor = color;
  ctx.shadowBlur = 8 * pulse;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.7, 0);
  ctx.lineTo(0, s);
  ctx.lineTo(-s * 0.7, 0);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.5);
  ctx.lineTo(s * 0.3, 0);
  ctx.lineTo(0, s * 0.4);
  ctx.lineTo(-s * 0.3, 0);
  ctx.closePath();
  ctx.fill();
  // crisp border
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.7, 0);
  ctx.lineTo(0, s);
  ctx.lineTo(-s * 0.7, 0);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}
