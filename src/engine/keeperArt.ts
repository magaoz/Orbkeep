import type { TowerDef, TowerId } from '../data/types'
import { TOWER_BY_ID } from '../data/towers'

/** Draw a glossy toy-3D keeper sprite centered at origin (caller translates). */
export function drawKeeperSprite(
  ctx: CanvasRenderingContext2D,
  defId: TowerId,
  opts: { angle?: number; scale?: number; showFace?: boolean } = {},
) {
  const def = TOWER_BY_ID[defId]
  if (!def) return
  const scale = opts.scale ?? 1
  const angle = opts.angle ?? 0
  const showFace = opts.showFace !== false

  ctx.save()
  ctx.scale(scale, scale)

  // ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.28)'
  ctx.beginPath()
  ctx.ellipse(2, 12, 20, 8, 0, 0, Math.PI * 2)
  ctx.fill()

  // wooden plinth
  const baseG = ctx.createLinearGradient(-18, 4, 18, 14)
  baseG.addColorStop(0, '#8d6e63')
  baseG.addColorStop(0.5, '#5d4037')
  baseG.addColorStop(1, '#3e2723')
  ctx.fillStyle = baseG
  ctx.beginPath()
  ctx.ellipse(0, 10, 20, 9, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#3e2723'
  ctx.lineWidth = 2
  ctx.stroke()

  if (def.isFarm) {
    drawFarm(ctx, def)
  } else if (def.isSupport) {
    drawTotem(ctx, def)
  } else if (def.isRadial) {
    drawRadial(ctx, def)
  } else if (def.isTrap) {
    drawForge(ctx, def)
  } else if (def.isLob) {
    drawMortar(ctx, def, angle)
  } else if (def.isBeam) {
    drawBeam(ctx, def, angle)
  } else if (def.isBomb) {
    drawCannon(ctx, def, angle)
  } else if (def.isFrost) {
    drawFrost(ctx, def, angle)
  } else if (def.isGlue) {
    drawGlue(ctx, def, angle)
  } else if (def.isChain) {
    drawCoil(ctx, def, angle)
  } else if (def.isPulse) {
    drawSage(ctx, def)
  } else {
    drawTurret(ctx, def, angle, showFace, defId)
  }

  // top gloss
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ctx.beginPath()
  ctx.ellipse(-4, -10, 8, 4, -0.4, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function bodyGradient(ctx: CanvasRenderingContext2D, def: TowerDef, x0: number, y0: number, x1: number, y1: number) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  g.addColorStop(0, lighten(def.color, 0.35))
  g.addColorStop(0.45, def.color)
  g.addColorStop(1, def.accent)
  return g
}

function lighten(hex: string, amt: number): string {
  const n = hex.replace('#', '')
  if (n.length !== 6) return hex
  const r = Math.min(255, parseInt(n.slice(0, 2), 16) + Math.floor(255 * amt))
  const g = Math.min(255, parseInt(n.slice(2, 4), 16) + Math.floor(255 * amt))
  const b = Math.min(255, parseInt(n.slice(4, 6), 16) + Math.floor(255 * amt))
  return `rgb(${r},${g},${b})`
}

function drawFace(ctx: CanvasRenderingContext2D, y = -2) {
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(-5, y, 3.2, 0, Math.PI * 2)
  ctx.arc(5, y, 3.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath()
  ctx.arc(-5, y, 1.6, 0, Math.PI * 2)
  ctx.arc(5, y, 1.6, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(0, y + 5, 4, 0.15, Math.PI - 0.15)
  ctx.stroke()
}

function drawTurret(ctx: CanvasRenderingContext2D, def: TowerDef, angle: number, showFace: boolean, id: TowerId) {
  ctx.save()
  ctx.rotate(angle)
  ctx.fillStyle = bodyGradient(ctx, def, -14, -14, 14, 14)
  roundBody(ctx, -15, -15, 30, 30, 8)
  // barrel
  ctx.fillStyle = def.accent
  ctx.beginPath()
  ctx.roundRect(8, -6, 22, 12, 4)
  ctx.fill()
  ctx.fillStyle = lighten(def.color, 0.4)
  ctx.fillRect(10, -3, 16, 3)
  // type accent
  if (id === 'longshot') {
    ctx.fillStyle = '#90caf9'
    ctx.fillRect(18, -2, 14, 4)
  } else if (id === 'nightshade') {
    ctx.fillStyle = '#7e57c2'
    ctx.beginPath()
    ctx.arc(0, 0, 6, 0, Math.PI * 2)
    ctx.fill()
  } else if (id === 'arcmage' || id === 'gyreblade') {
    ctx.strokeStyle = def.accent
    ctx.lineWidth = 2
    ctx.strokeRect(-10, -10, 20, 20)
  }
  ctx.restore()
  if (showFace) drawFace(ctx, -4)
}

function roundBody(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'
  ctx.lineWidth = 2
  ctx.stroke()
}

function drawRadial(ctx: CanvasRenderingContext2D, def: TowerDef) {
  ctx.fillStyle = bodyGradient(ctx, def, -16, -16, 16, 16)
  ctx.beginPath()
  ctx.arc(0, -2, 16, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = def.accent
  ctx.lineWidth = 3
  ctx.stroke()
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    ctx.strokeStyle = def.accent
    ctx.lineWidth = 3.5
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * 10, Math.sin(a) * 10 - 2)
    ctx.lineTo(Math.cos(a) * 24, Math.sin(a) * 24 - 2)
    ctx.stroke()
    ctx.fillStyle = lighten(def.color, 0.3)
    ctx.beginPath()
    ctx.arc(Math.cos(a) * 24, Math.sin(a) * 24 - 2, 3, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#fff8'
  ctx.beginPath()
  ctx.arc(-4, -8, 5, 0, Math.PI * 2)
  ctx.fill()
}

function drawFarm(ctx: CanvasRenderingContext2D, def: TowerDef) {
  ctx.fillStyle = bodyGradient(ctx, def, 0, -30, 0, 10)
  ctx.beginPath()
  ctx.moveTo(0, -32)
  ctx.lineTo(-20, 10)
  ctx.lineTo(20, 10)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = def.accent
  ctx.lineWidth = 2
  ctx.stroke()
  // coin
  const g = ctx.createRadialGradient(-2, -10, 1, 0, -8, 10)
  g.addColorStop(0, '#fff59d')
  g.addColorStop(0.5, '#ffd54f')
  g.addColorStop(1, '#f9a825')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(0, -8, 10, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#f57f17'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = '#f57f17'
  ctx.font = 'bold 12px system-ui'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('$', 0, -7)
}

function drawTotem(ctx: CanvasRenderingContext2D, def: TowerDef) {
  ctx.fillStyle = bodyGradient(ctx, def, -10, -40, 10, 10)
  ctx.fillRect(-9, -34, 18, 42)
  ctx.strokeStyle = def.accent
  ctx.lineWidth = 2
  ctx.strokeRect(-9, -34, 18, 42)
  ctx.fillStyle = def.color
  ctx.beginPath()
  ctx.moveTo(-22, -34)
  ctx.lineTo(0, -54)
  ctx.lineTo(22, -34)
  ctx.fill()
  ctx.fillStyle = '#ffd54f'
  ctx.beginPath()
  ctx.arc(0, -20, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, -6, 4, 0, Math.PI * 2)
  ctx.fill()
  drawFace(ctx, -28)
}

function drawCannon(ctx: CanvasRenderingContext2D, def: TowerDef, angle: number) {
  ctx.save()
  ctx.rotate(angle)
  ctx.fillStyle = bodyGradient(ctx, def, -16, -12, 16, 12)
  roundBody(ctx, -16, -14, 32, 28, 10)
  ctx.fillStyle = '#37474f'
  ctx.beginPath()
  ctx.roundRect(6, -8, 26, 16, 6)
  ctx.fill()
  ctx.fillStyle = '#263238'
  ctx.beginPath()
  ctx.arc(30, 0, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  drawFace(ctx, -4)
}

function drawFrost(ctx: CanvasRenderingContext2D, def: TowerDef, angle: number) {
  ctx.save()
  ctx.rotate(angle)
  ctx.fillStyle = bodyGradient(ctx, def, -14, -14, 14, 14)
  ctx.beginPath()
  ctx.moveTo(0, -20)
  ctx.lineTo(18, 0)
  ctx.lineTo(0, 16)
  ctx.lineTo(-18, 0)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = '#e1f5fe'
  ctx.beginPath()
  ctx.arc(0, -2, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  drawFace(ctx, -2)
}

function drawGlue(ctx: CanvasRenderingContext2D, def: TowerDef, angle: number) {
  ctx.save()
  ctx.rotate(angle)
  ctx.fillStyle = bodyGradient(ctx, def, -14, -16, 14, 12)
  roundBody(ctx, -14, -16, 28, 28, 8)
  ctx.fillStyle = '#c0ca33'
  ctx.beginPath()
  ctx.arc(16, 0, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#afb42b'
  ctx.beginPath()
  ctx.ellipse(16, 2, 5, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  drawFace(ctx, -4)
}

function drawCoil(ctx: CanvasRenderingContext2D, def: TowerDef, angle: number) {
  ctx.save()
  ctx.rotate(angle)
  ctx.fillStyle = bodyGradient(ctx, def, -12, -12, 12, 12)
  ctx.beginPath()
  ctx.arc(0, 0, 14, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#4fc3f7'
  ctx.lineWidth = 3
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(0, 0, 8 + i * 4, -0.6 + i * 0.4, 1.8 + i * 0.3)
    ctx.stroke()
  }
  ctx.restore()
  drawFace(ctx, -2)
}

function drawSage(ctx: CanvasRenderingContext2D, def: TowerDef) {
  ctx.fillStyle = bodyGradient(ctx, def, -14, -18, 14, 10)
  ctx.beginPath()
  ctx.arc(0, -4, 16, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = def.accent
  ctx.lineWidth = 3
  ctx.stroke()
  // thorn petals
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    ctx.fillStyle = def.accent
    ctx.beginPath()
    ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12 - 4)
    ctx.lineTo(Math.cos(a) * 24, Math.sin(a) * 24 - 4)
    ctx.lineTo(Math.cos(a + 0.25) * 12, Math.sin(a + 0.25) * 12 - 4)
    ctx.fill()
  }
  drawFace(ctx, -4)
}

function drawForge(ctx: CanvasRenderingContext2D, def: TowerDef) {
  ctx.fillStyle = bodyGradient(ctx, def, -16, -10, 16, 12)
  roundBody(ctx, -18, -12, 36, 24, 6)
  ctx.fillStyle = '#90a4ae'
  ctx.beginPath()
  ctx.moveTo(-8, -18)
  ctx.lineTo(0, -28)
  ctx.lineTo(8, -18)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(4, -14)
  ctx.lineTo(12, -24)
  ctx.lineTo(16, -12)
  ctx.fill()
  ctx.fillStyle = '#ff7043'
  ctx.beginPath()
  ctx.arc(0, 0, 5, 0, Math.PI * 2)
  ctx.fill()
}

function drawMortar(ctx: CanvasRenderingContext2D, def: TowerDef, angle: number) {
  ctx.save()
  ctx.rotate(angle * 0.15)
  ctx.fillStyle = bodyGradient(ctx, def, -16, -8, 16, 14)
  roundBody(ctx, -18, -8, 36, 26, 8)
  ctx.fillStyle = '#37474f'
  ctx.beginPath()
  ctx.ellipse(0, -14, 10, 14, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#263238'
  ctx.beginPath()
  ctx.ellipse(0, -22, 7, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  drawFace(ctx, 2)
}

function drawBeam(ctx: CanvasRenderingContext2D, def: TowerDef, angle: number) {
  ctx.save()
  ctx.rotate(angle)
  ctx.fillStyle = bodyGradient(ctx, def, -12, -18, 12, 12)
  roundBody(ctx, -14, -18, 28, 32, 10)
  ctx.fillStyle = '#e91e63'
  ctx.beginPath()
  ctx.arc(18, 0, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#f8bbd0'
  ctx.beginPath()
  ctx.arc(18, 0, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  drawFace(ctx, -6)
}

/** Draw portrait into a small canvas (for tray / UI). */
export function paintKeeperPortrait(canvas: HTMLCanvasElement, defId: TowerId) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const size = canvas.clientWidth || 40
  canvas.width = size * dpr
  canvas.height = size * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, size, size)
  // vignette plate
  const bg = ctx.createRadialGradient(size * 0.35, size * 0.3, 2, size * 0.5, size * 0.55, size * 0.55)
  const def = TOWER_BY_ID[defId]
  bg.addColorStop(0, lighten(def?.color ?? '#888', 0.25))
  bg.addColorStop(1, def?.accent ?? '#444')
  ctx.fillStyle = bg
  ctx.beginPath()
  ctx.roundRect(1, 1, size - 2, size - 2, 10)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.save()
  ctx.translate(size / 2, size / 2 + 4)
  drawKeeperSprite(ctx, defId, { angle: -0.35, scale: size / 64, showFace: true })
  ctx.restore()
}
