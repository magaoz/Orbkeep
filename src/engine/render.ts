import { ORB_DEFS } from '../data/orbs'
import { TOWER_BY_ID } from '../data/towers'
import type { GameEngine } from './GameEngine'
import { drawKeeperSprite } from './keeperArt'

const W = 1600
const H = 900

function drawOrb(ctx: CanvasRenderingContext2D, x: number, y: number, kind: string, camo: boolean, regen: boolean, hpFrac: number) {
  const def = ORB_DEFS[kind as keyof typeof ORB_DEFS]
  if (!def) return
  const r = def.r
  ctx.save()
  if (camo) ctx.globalAlpha = 0.45

  // soft contact shadow
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.beginPath()
  ctx.ellipse(x + 1, y + r * 0.55, r * 0.75, r * 0.28, 0, 0, Math.PI * 2)
  ctx.fill()

  // glass body
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r)
  g.addColorStop(0, '#ffffffee')
  g.addColorStop(0.22, '#ffffff55')
  g.addColorStop(0.45, def.color)
  g.addColorStop(0.82, def.color)
  g.addColorStop(1, def.rim)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()

  // inner rim ring
  ctx.strokeStyle = def.rim
  ctx.lineWidth = 2.5
  ctx.stroke()
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(x, y, r * 0.82, -2.4, -0.4)
  ctx.stroke()

  // primary specular
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.beginPath()
  ctx.ellipse(x - r * 0.32, y - r * 0.38, r * 0.3, r * 0.18, -0.55, 0, Math.PI * 2)
  ctx.fill()
  // secondary glint
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.beginPath()
  ctx.ellipse(x + r * 0.25, y + r * 0.2, r * 0.12, r * 0.08, 0.4, 0, Math.PI * 2)
  ctx.fill()

  if (def.kind === 'stripe') {
    ctx.strokeStyle = '#111'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(x, y, r * 0.7, 0.2, 1.2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x, y, r * 0.7, 2.2, 3.2)
    ctx.stroke()
  }
  if (regen) {
    ctx.strokeStyle = '#ef5350'
    ctx.lineWidth = 2.5
    ctx.setLineDash([4, 3])
    ctx.beginPath()
    ctx.arc(x, y, r + 3, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }
  if (def.lead) {
    ctx.fillStyle = '#455a64'
    ctx.strokeStyle = '#263238'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(x - 5, y - 5, 10, 10, 2)
    ctx.fill()
    ctx.stroke()
  }
  if (def.isBoss && hpFrac < 1) {
    ctx.fillStyle = '#222'
    ctx.fillRect(x - r, y - r - 12, r * 2, 6)
    ctx.fillStyle = '#f44336'
    ctx.fillRect(x - r, y - r - 12, r * 2 * hpFrac, 6)
    ctx.strokeStyle = '#0008'
    ctx.strokeRect(x - r, y - r - 12, r * 2, 6)
  }
  ctx.restore()
}

function drawTower(ctx: CanvasRenderingContext2D, eng: GameEngine, uid: number) {
  const t = eng.towers.find((x) => x.uid === uid)!
  const def = TOWER_BY_ID[t.defId]
  const selected = eng.selectedTowerUid === t.uid
  const stats = eng.statsFor(t)

  if (selected || eng.placing === t.defId) {
    ctx.fillStyle = 'rgba(100,180,255,0.15)'
    ctx.strokeStyle = 'rgba(100,180,255,0.5)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(t.x, t.y, stats.range, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    if (stats.minRange > 0) {
      ctx.strokeStyle = 'rgba(255,80,80,0.4)'
      ctx.beginPath()
      ctx.arc(t.x, t.y, stats.minRange, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  ctx.save()
  ctx.translate(t.x, t.y)
  drawKeeperSprite(ctx, t.defId, { angle: t.angle, scale: 1, showFace: true })

  // tier pips under base
  ctx.fillStyle = '#ffd54f'
  const tiers = t.pathTiers
  for (let p = 0; p < 3; p++) {
    for (let i = 0; i < tiers[p]; i++) {
      ctx.fillStyle = p === 0 ? '#ff7043' : p === 1 ? '#42a5f5' : '#66bb6a'
      ctx.fillRect(-18 + p * 12, 18 + i * 3, 8, 2)
    }
  }
  if (selected) {
    ctx.strokeStyle = '#ffd54f'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, 26, 0, Math.PI * 2)
    ctx.stroke()
  }
  void def
  ctx.restore()
}

export function renderGame(ctx: CanvasRenderingContext2D, eng: GameEngine, view: { scale: number; ox: number; oy: number }) {
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  const shakeX = eng.shake ? (Math.random() - 0.5) * eng.shake : 0
  const shakeY = eng.shake ? (Math.random() - 0.5) * eng.shake : 0
  ctx.setTransform(view.scale, 0, 0, view.scale, view.ox + shakeX * view.scale, view.oy + shakeY * view.scale)

  ctx.drawImage(eng.mapBg, 0, 0)

  // spikes
  for (const s of eng.spikes) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    ctx.beginPath()
    ctx.moveTo(s.x + 1, s.y - 6)
    ctx.lineTo(s.x + 8, s.y + 8)
    ctx.lineTo(s.x - 6, s.y + 8)
    ctx.fill()
    ctx.fillStyle = '#90a4ae'
    ctx.beginPath()
    ctx.moveTo(s.x, s.y - 8)
    ctx.lineTo(s.x + 7, s.y + 6)
    ctx.lineTo(s.x - 7, s.y + 6)
    ctx.fill()
    ctx.fillStyle = '#cfd8dc'
    ctx.beginPath()
    ctx.moveTo(s.x, s.y - 8)
    ctx.lineTo(s.x + 3, s.y + 1)
    ctx.lineTo(s.x - 2, s.y + 1)
    ctx.fill()
  }

  // towers
  for (const t of eng.towers) drawTower(ctx, eng, t.uid)

  // placing ghost
  if (eng.placing && eng.placePos) {
    const def = TOWER_BY_ID[eng.placing]
    const range = def.range * (1 + eng.knowledge.rangeMul)
    ctx.fillStyle = eng.placeValid ? 'rgba(80,200,80,0.2)' : 'rgba(200,60,60,0.25)'
    ctx.beginPath()
    ctx.arc(eng.placePos.x, eng.placePos.y, range, 0, Math.PI * 2)
    ctx.fill()
    ctx.save()
    ctx.globalAlpha = 0.65
    ctx.translate(eng.placePos.x, eng.placePos.y)
    drawKeeperSprite(ctx, eng.placing, { angle: 0, scale: 1, showFace: true })
    ctx.restore()
  }

  // orbs
  for (const o of eng.orbs) {
    const p = eng.path.posAt(o.dist)
    drawOrb(ctx, p.x, p.y, o.kind, o.camo, o.regen, o.hp / o.maxHp)
  }

  // projectiles
  for (const p of eng.projectiles) {
    if (p.kind === 'beam') {
      ctx.strokeStyle = '#e91e63'
      ctx.lineWidth = 3
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x + p.vx, p.y + p.vy)
      ctx.stroke()
      ctx.globalAlpha = 1
      continue
    }
    ctx.fillStyle =
      p.kind === 'bomb' || p.kind === 'shell' ? '#5d4037' :
      p.kind === 'glue' ? '#c0ca33' :
      p.kind === 'bolt' ? '#4fc3f7' :
      p.kind === 'blade' ? '#b0bec5' :
      p.kind === 'tack' ? '#ef6c00' : '#fff'
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.kind === 'bomb' || p.kind === 'shell' ? 7 : 4, 0, Math.PI * 2)
    ctx.fill()
    if (p.kind === 'bomb' || p.kind === 'shell') {
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.beginPath()
      ctx.arc(p.x - 2, p.y - 2, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // fx
  for (const f of eng.fx) {
    const a = f.life / f.maxLife
    ctx.globalAlpha = a
    if (f.text) {
      ctx.fillStyle = f.color
      const big = f.text.startsWith('Round bonus') || f.text.startsWith('Interest')
      ctx.font = big ? 'bold 28px system-ui' : 'bold 16px system-ui'
      ctx.textAlign = 'center'
      ctx.strokeStyle = 'rgba(0,0,0,0.55)'
      ctx.lineWidth = big ? 4 : 2
      ctx.strokeText(f.text, f.x, f.y)
      ctx.fillText(f.text, f.x, f.y)
    } else if (f.r > 40) {
      ctx.fillStyle = f.color
      ctx.beginPath()
      ctx.arc(f.x, f.y, f.r * (1 - a * 0.3), 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillStyle = f.color
      ctx.beginPath()
      ctx.arc(f.x, f.y, f.r * a, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  ctx.restore()
}

export function screenToWorld(
  sx: number, sy: number,
  canvas: HTMLCanvasElement,
  view: { scale: number; ox: number; oy: number },
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect()
  const cx = ((sx - rect.left) / rect.width) * canvas.width
  const cy = ((sy - rect.top) / rect.height) * canvas.height
  return {
    x: (cx - view.ox) / view.scale,
    y: (cy - view.oy) / view.scale,
  }
}

export function computeView(canvasW: number, canvasH: number): { scale: number; ox: number; oy: number } {
  const scale = Math.min(canvasW / W, canvasH / H)
  const ox = (canvasW - W * scale) / 2
  const oy = (canvasH - H * scale) / 2
  return { scale, ox, oy }
}

export { W as WORLD_W, H as WORLD_H }
