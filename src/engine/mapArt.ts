import type { MapDef } from '../data/types'
import { Path } from './Path'

const W = 1600
const H = 900

/** Deterministic pseudo-random 0..1 from integer seed. */
function rnd(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

function softShadow(ctx: CanvasRenderingContext2D, draw: () => void, ox = 4, oy = 6, alpha = 0.22) {
  ctx.save()
  ctx.translate(ox, oy)
  ctx.globalAlpha = alpha
  ctx.fillStyle = '#000'
  draw()
  ctx.restore()
  draw()
}

function paintGrassBase(ctx: CanvasRenderingContext2D, seed: number, base: string, mid: string, dark: string) {
  // sky-tinted vertical wash for toy depth
  const sky = ctx.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, base)
  sky.addColorStop(0.55, mid)
  sky.addColorStop(1, dark)
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, H)

  // soft terrain blobs
  for (let i = 0; i < 55; i++) {
    const x = rnd(seed + i * 3) * W
    const y = rnd(seed + i * 7 + 1) * H
    const rx = 55 + rnd(seed + i * 11) * 70
    const ry = 30 + rnd(seed + i * 13) * 40
    const g = ctx.createRadialGradient(x, y, 0, x, y, rx)
    const tone = i % 3 === 0 ? '#6bc76b' : i % 3 === 1 ? '#4caf50' : '#7ed67e'
    g.addColorStop(0, tone + 'aa')
    g.addColorStop(1, tone + '00')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, rnd(seed + i) * 0.6, 0, Math.PI * 2)
    ctx.fill()
  }

  // grass tufts (cheap strokes, not on every pixel)
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  for (let i = 0; i < 120; i++) {
    const x = rnd(seed + i * 17 + 90) * W
    const y = rnd(seed + i * 19 + 40) * H
    ctx.strokeStyle = i % 2 ? '#3d8b40' : '#66bb6a'
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + 2, y - 8, x + (i % 2 ? 4 : -3), y - 14)
    ctx.stroke()
  }
}

function paintRoad(ctx: CanvasRenderingContext2D, path: Path, theme: MapDef['theme']) {
  const palette =
    theme === 'ice'
      ? { edge: '#546e7a', mid: '#90a4ae', fill: '#cfd8dc', cobble: '#eceff1', highlight: '#ffffff88' }
      : theme === 'desert'
        ? { edge: '#a1887f', mid: '#c9a07a', fill: '#e0c090', cobble: '#d4b896', highlight: '#fff6e088' }
        : theme === 'harbor'
          ? { edge: '#4e342e', mid: '#6d4c41', fill: '#8d6e63', cobble: '#a1887f', highlight: '#bcaaa488' }
          : theme === 'forest'
            ? { edge: '#3e2723', mid: '#5d4037', fill: '#795548', cobble: '#8d6e63', highlight: '#a1887f88' }
            : theme === 'mountain'
              ? { edge: '#455a64', mid: '#78909c', fill: '#90a4ae', cobble: '#b0bec5', highlight: '#cfd8dc88' }
              : theme === 'night'
                ? { edge: '#311b92', mid: '#5e35b1', fill: '#7e57c2', cobble: '#9575cd', highlight: '#ffd54f66' }
                : theme === 'crystal'
                  ? { edge: '#00695c', mid: '#26a69a', fill: '#4db6ac', cobble: '#80cbc4', highlight: '#e1f5fe88' }
                  : { edge: '#5d4037', mid: '#8d6e63', fill: '#b8956c', cobble: '#c4a484', highlight: '#e8d5b588' }

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // soft ground shadow under road
  ctx.save()
  ctx.strokeStyle = 'rgba(0,0,0,0.28)'
  ctx.lineWidth = 58
  ctx.translate(3, 5)
  ctx.beginPath()
  path.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
  ctx.stroke()
  ctx.restore()

  // dark edge
  ctx.strokeStyle = palette.edge
  ctx.lineWidth = 52
  ctx.beginPath()
  path.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
  ctx.stroke()

  // mid band
  ctx.strokeStyle = palette.mid
  ctx.lineWidth = 44
  ctx.beginPath()
  path.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
  ctx.stroke()

  // main dirt fill
  ctx.strokeStyle = palette.fill
  ctx.lineWidth = 36
  ctx.beginPath()
  path.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
  ctx.stroke()

  // center highlight strip (toy painted look)
  ctx.strokeStyle = palette.highlight
  ctx.lineWidth = 8
  ctx.beginPath()
  path.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
  ctx.stroke()

  // cobble / packed-earth dots along exact waypoints
  for (let d = 0; d < path.totalLength; d += 16) {
    const p = path.posAt(d)
    const n = path.posAt(Math.min(path.totalLength, d + 5))
    const ang = Math.atan2(n.y - p.y, n.x - p.x) + Math.PI / 2
    const jitter = (rnd(d * 3 + 7) - 0.5) * 2
    for (const s of [-12, -4, 4, 12]) {
      const cx = p.x + Math.cos(ang) * (s + jitter)
      const cy = p.y + Math.sin(ang) * (s + jitter)
      ctx.fillStyle = palette.cobble
      ctx.beginPath()
      ctx.ellipse(cx, cy, 4.2, 3.2, ang, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.22)'
      ctx.beginPath()
      ctx.ellipse(cx - 1, cy - 1, 1.6, 1.1, ang, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function water(ctx: CanvasRenderingContext2D, zones: MapDef['waterZones'], ice: boolean) {
  for (const z of zones) {
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    ctx.beginPath()
    ctx.ellipse(z.x + 4, z.y + 8, z.r * 1.25, z.r * 0.9, 0, 0, Math.PI * 2)
    ctx.fill()

    const g = ctx.createRadialGradient(z.x - z.r * 0.25, z.y - z.r * 0.3, z.r * 0.08, z.x, z.y, z.r)
    if (ice) {
      g.addColorStop(0, '#ffffff')
      g.addColorStop(0.35, '#e3f2fd')
      g.addColorStop(0.75, '#90caf9')
      g.addColorStop(1, '#64b5f6')
    } else {
      g.addColorStop(0, '#81d4fa')
      g.addColorStop(0.4, '#29b6f6')
      g.addColorStop(0.85, '#0288d1')
      g.addColorStop(1, '#01579b')
    }
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(z.x, z.y, z.r * 1.25, z.r * 0.88, 0, 0, Math.PI * 2)
    ctx.fill()

    // rim
    ctx.strokeStyle = ice ? '#bbdefb' : '#0277bd'
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.strokeStyle = ice ? '#ffffffaa' : '#4fc3f788'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(z.x, z.y, z.r * 1.15, z.r * 0.78, 0, 0, Math.PI * 2)
    ctx.stroke()

    // specular / ripple
    ctx.fillStyle = ice ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.35)'
    ctx.beginPath()
    ctx.ellipse(z.x - z.r * 0.35, z.y - z.r * 0.35, z.r * 0.35, z.r * 0.18, -0.4, 0, Math.PI * 2)
    ctx.fill()

    if (!ice) {
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'
      ctx.lineWidth = 2
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.ellipse(z.x, z.y + i * 10 - 8, z.r * (0.55 - i * 0.1), z.r * (0.22 - i * 0.04), 0, 0.2, Math.PI - 0.2)
        ctx.stroke()
      }
    } else {
      // ice cracks
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'
      ctx.lineWidth = 1.5
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + 0.3
        ctx.beginPath()
        ctx.moveTo(z.x + Math.cos(a) * z.r * 0.15, z.y + Math.sin(a) * z.r * 0.1)
        ctx.lineTo(z.x + Math.cos(a) * z.r * 0.7, z.y + Math.sin(a) * z.r * 0.55)
        ctx.stroke()
      }
    }
  }
}

function drawBush(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color = '#43a047') {
  softShadow(ctx, () => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x - s * 0.4, y, s * 0.55, 0, Math.PI * 2)
    ctx.arc(x + s * 0.35, y, s * 0.5, 0, Math.PI * 2)
    ctx.arc(x, y - s * 0.35, s * 0.6, 0, Math.PI * 2)
    ctx.fill()
  }, 2, 3, 0.2)
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.beginPath()
  ctx.arc(x - s * 0.15, y - s * 0.45, s * 0.22, 0, Math.PI * 2)
  ctx.fill()
}

function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, hue: string) {
  ctx.fillStyle = '#2e7d32'
  ctx.fillRect(x - 1, y, 2, 8)
  ctx.fillStyle = hue
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3.2, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#ffeb3b'
  ctx.beginPath()
  ctx.arc(x, y, 2.5, 0, Math.PI * 2)
  ctx.fill()
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1, canopy = '#2e7d32') {
  softShadow(ctx, () => {
    ctx.fillStyle = '#5d4037'
    ctx.beginPath()
    ctx.moveTo(x - 5 * scale, y + 18 * scale)
    ctx.lineTo(x + 5 * scale, y + 18 * scale)
    ctx.lineTo(x + 3 * scale, y - 4 * scale)
    ctx.lineTo(x - 3 * scale, y - 4 * scale)
    ctx.fill()
    ctx.fillStyle = canopy
    ctx.beginPath()
    ctx.moveTo(x, y - 42 * scale)
    ctx.lineTo(x - 22 * scale, y - 4 * scale)
    ctx.lineTo(x + 22 * scale, y - 4 * scale)
    ctx.fill()
    ctx.fillStyle = '#1b5e20'
    ctx.beginPath()
    ctx.moveTo(x, y - 28 * scale)
    ctx.lineTo(x - 18 * scale, y + 4 * scale)
    ctx.lineTo(x + 18 * scale, y + 4 * scale)
    ctx.fill()
  }, 3, 4, 0.2)
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.beginPath()
  ctx.ellipse(x - 6 * scale, y - 30 * scale, 5 * scale, 3 * scale, -0.4, 0, Math.PI * 2)
  ctx.fill()
}

function drawCactus(ctx: CanvasRenderingContext2D, x: number, y: number) {
  softShadow(ctx, () => {
    ctx.fillStyle = '#558b2f'
    ctx.beginPath()
    ctx.roundRect(x - 7, y - 36, 14, 44, 7)
    ctx.fill()
    ctx.beginPath()
    ctx.roundRect(x - 22, y - 22, 16, 10, 5)
    ctx.fill()
    ctx.beginPath()
    ctx.roundRect(x - 22, y - 30, 10, 16, 5)
    ctx.fill()
    ctx.beginPath()
    ctx.roundRect(x + 6, y - 14, 16, 10, 5)
    ctx.fill()
    ctx.beginPath()
    ctx.roundRect(x + 12, y - 22, 10, 16, 5)
    ctx.fill()
  }, 2, 3, 0.2)
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.fillRect(x - 4, y - 32, 3, 20)
}

function drawRock(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color = '#90a4ae') {
  softShadow(ctx, () => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x - s, y)
    ctx.quadraticCurveTo(x - s * 0.6, y - s * 0.9, x, y - s * 0.75)
    ctx.quadraticCurveTo(x + s * 0.7, y - s * 0.85, x + s, y)
    ctx.quadraticCurveTo(x, y + s * 0.35, x - s, y)
    ctx.fill()
  }, 2, 3, 0.2)
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.beginPath()
  ctx.ellipse(x - s * 0.25, y - s * 0.35, s * 0.25, s * 0.12, -0.3, 0, Math.PI * 2)
  ctx.fill()
}

function drawBarn(ctx: CanvasRenderingContext2D, x: number, y: number) {
  softShadow(ctx, () => {
    ctx.fillStyle = '#c62828'
    ctx.fillRect(x - 40, y - 30, 80, 50)
    ctx.fillStyle = '#6d4c41'
    ctx.beginPath()
    ctx.moveTo(x - 48, y - 28)
    ctx.lineTo(x, y - 58)
    ctx.lineTo(x + 48, y - 28)
    ctx.fill()
    ctx.fillStyle = '#5d4037'
    ctx.fillRect(x - 12, y - 5, 24, 25)
    ctx.fillStyle = '#ffd54f'
    ctx.beginPath()
    ctx.arc(x + 8, y + 8, 2, 0, Math.PI * 2)
    ctx.fill()
  }, 4, 5, 0.25)
}

function drawBridge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, ang: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(ang)
  softShadow(ctx, () => {
    ctx.fillStyle = '#6d4c41'
    ctx.fillRect(-w / 2, -14, w, 28)
    ctx.fillStyle = '#8d6e63'
    ctx.fillRect(-w / 2 + 4, -10, w - 8, 20)
    ctx.strokeStyle = '#5d4037'
    ctx.lineWidth = 3
    for (let i = -w / 2 + 10; i < w / 2; i += 14) {
      ctx.beginPath()
      ctx.moveTo(i, -10)
      ctx.lineTo(i, 10)
      ctx.stroke()
    }
  }, 2, 3, 0.2)
  ctx.restore()
}

function drawIgloo(ctx: CanvasRenderingContext2D, x: number, y: number) {
  softShadow(ctx, () => {
    const g = ctx.createRadialGradient(x - 10, y - 20, 5, x, y, 42)
    g.addColorStop(0, '#ffffff')
    g.addColorStop(1, '#b3e5fc')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, 38, Math.PI, 0)
    ctx.lineTo(x + 38, y + 8)
    ctx.lineTo(x - 38, y + 8)
    ctx.fill()
    ctx.fillStyle = '#455a64'
    ctx.beginPath()
    ctx.ellipse(x, y + 2, 14, 16, 0, Math.PI, 0)
    ctx.fill()
  }, 3, 4, 0.2)
}

function drawPyramid(ctx: CanvasRenderingContext2D, x: number, y: number) {
  softShadow(ctx, () => {
    ctx.fillStyle = '#d4a017'
    ctx.beginPath()
    ctx.moveTo(x, y - 70)
    ctx.lineTo(x + 55, y + 20)
    ctx.lineTo(x - 55, y + 20)
    ctx.fill()
    ctx.fillStyle = '#b8860b'
    ctx.beginPath()
    ctx.moveTo(x, y - 70)
    ctx.lineTo(x + 55, y + 20)
    ctx.lineTo(x + 10, y + 20)
    ctx.fill()
  }, 4, 5, 0.22)
}

function drawDock(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  softShadow(ctx, () => {
    ctx.fillStyle = '#5d4037'
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = '#8d6e63'
    for (let i = 0; i < w; i += 18) {
      ctx.fillRect(x + i + 2, y + 3, 14, h - 6)
    }
  }, 3, 4, 0.25)
}

function drawBoat(ctx: CanvasRenderingContext2D, x: number, y: number) {
  softShadow(ctx, () => {
    ctx.fillStyle = '#6d4c41'
    ctx.beginPath()
    ctx.moveTo(x - 28, y)
    ctx.quadraticCurveTo(x, y + 18, x + 28, y)
    ctx.lineTo(x + 22, y - 8)
    ctx.lineTo(x - 22, y - 8)
    ctx.fill()
    ctx.fillStyle = '#efebe9'
    ctx.beginPath()
    ctx.moveTo(x, y - 8)
    ctx.lineTo(x, y - 36)
    ctx.lineTo(x + 22, y - 8)
    ctx.fill()
  }, 2, 3, 0.2)
}

function drawLighthouse(ctx: CanvasRenderingContext2D, x: number, y: number) {
  softShadow(ctx, () => {
    ctx.fillStyle = '#eceff1'
    ctx.beginPath()
    ctx.moveTo(x - 14, y + 40)
    ctx.lineTo(x - 10, y - 30)
    ctx.lineTo(x + 10, y - 30)
    ctx.lineTo(x + 14, y + 40)
    ctx.fill()
    ctx.fillStyle = '#c62828'
    ctx.fillRect(x - 12, y - 10, 24, 12)
    ctx.fillRect(x - 14, y + 18, 28, 12)
    ctx.fillStyle = '#ffd54f'
    ctx.beginPath()
    ctx.moveTo(x - 12, y - 30)
    ctx.lineTo(x, y - 48)
    ctx.lineTo(x + 12, y - 30)
    ctx.fill()
  }, 3, 4, 0.22)
}

function landmarksAwayFromPath(path: Path, x: number, y: number, pad = 55): boolean {
  return !path.isOnPath(x, y, pad)
}

function gateMarker(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label: 'IN' | 'OUT') {
  softShadow(ctx, () => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, 18, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3
    ctx.stroke()
  }, 2, 3, 0.25)
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 11px system-ui'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x, y)
}


function drawLantern(ctx: CanvasRenderingContext2D, x: number, y: number) {
  softShadow(ctx, () => {
    ctx.fillStyle = '#5d4037'
    ctx.fillRect(x - 3, y - 28, 6, 18)
    ctx.fillStyle = '#ffb300'
    ctx.beginPath()
    ctx.moveTo(x - 10, y - 10)
    ctx.lineTo(x + 10, y - 10)
    ctx.lineTo(x + 7, y + 8)
    ctx.lineTo(x - 7, y + 8)
    ctx.fill()
    ctx.fillStyle = '#ffe082'
    ctx.beginPath()
    ctx.ellipse(x, y - 2, 5, 6, 0, 0, Math.PI * 2)
    ctx.fill()
  }, 2, 3, 0.2)
  ctx.fillStyle = 'rgba(255,213,79,0.25)'
  ctx.beginPath()
  ctx.arc(x, y, 28, 0, Math.PI * 2)
  ctx.fill()
}

function drawStall(ctx: CanvasRenderingContext2D, x: number, y: number) {
  softShadow(ctx, () => {
    ctx.fillStyle = '#6d4c41'
    ctx.fillRect(x - 22, y - 4, 44, 18)
    ctx.fillStyle = '#e53935'
    ctx.beginPath()
    ctx.moveTo(x - 26, y - 4)
    ctx.lineTo(x, y - 22)
    ctx.lineTo(x + 26, y - 4)
    ctx.fill()
    ctx.fillStyle = '#ffd54f'
    ctx.fillRect(x - 8, y + 2, 6, 6)
    ctx.fillStyle = '#42a5f5'
    ctx.fillRect(x + 4, y + 2, 6, 6)
  }, 2, 3, 0.22)
}

function drawCrystal(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, hue: string) {
  softShadow(ctx, () => {
    ctx.fillStyle = hue
    ctx.beginPath()
    ctx.moveTo(x, y - s)
    ctx.lineTo(x + s * 0.45, y)
    ctx.lineTo(x, y + s * 0.25)
    ctx.lineTo(x - s * 0.45, y)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.beginPath()
    ctx.moveTo(x, y - s)
    ctx.lineTo(x - s * 0.2, y - s * 0.2)
    ctx.lineTo(x, y + s * 0.05)
    ctx.fill()
  }, 2, 3, 0.2)
}

function drawPeak(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  softShadow(ctx, () => {
    ctx.fillStyle = '#78909c'
    ctx.beginPath()
    ctx.moveTo(x, y - s)
    ctx.lineTo(x + s * 0.7, y + s * 0.35)
    ctx.lineTo(x - s * 0.7, y + s * 0.35)
    ctx.fill()
    ctx.fillStyle = '#eceff1'
    ctx.beginPath()
    ctx.moveTo(x, y - s)
    ctx.lineTo(x + s * 0.22, y - s * 0.35)
    ctx.lineTo(x - s * 0.18, y - s * 0.25)
    ctx.fill()
  }, 3, 4, 0.22)
}

export function drawMapBackground(ctx: CanvasRenderingContext2D, map: MapDef, path: Path) {
  ctx.save()
  switch (map.theme) {
    case 'meadow': {
      paintGrassBase(ctx, 11, '#7ed67e', '#5cb85c', '#43a047')
      // flower field
      for (let i = 0; i < 55; i++) {
        const x = rnd(i * 31 + 3) * W
        const y = rnd(i * 47 + 9) * H
        if (!landmarksAwayFromPath(path, x, y, 40)) continue
        drawFlower(ctx, x, y, ['#ffeb3b', '#e91e63', '#fff', '#7e57c2', '#ff7043'][i % 5])
      }
      for (let i = 0; i < 14; i++) {
        const x = 80 + rnd(i * 19 + 2) * 1440
        const y = 80 + rnd(i * 23 + 5) * 740
        if (!landmarksAwayFromPath(path, x, y, 60)) continue
        drawBush(ctx, x, y, 16 + (i % 4) * 3)
      }
      if (landmarksAwayFromPath(path, 220, 180, 70)) drawBarn(ctx, 220, 180)
      if (landmarksAwayFromPath(path, 1380, 700, 70)) drawTree(ctx, 1380, 700, 1.2, '#388e3c')
      if (landmarksAwayFromPath(path, 150, 720, 50)) drawRock(ctx, 150, 720, 22, '#a1887f')
      break
    }
    case 'brook': {
      paintGrassBase(ctx, 22, '#81c784', '#66bb6a', '#43a047')
      water(ctx, map.waterZones, false)
      // bridges near water crossings feel
      drawBridge(ctx, 500, 520, 70, 0.35)
      drawBridge(ctx, 1000, 360, 70, -0.25)
      for (let i = 0; i < 10; i++) {
        const x = 100 + rnd(i * 41) * 1400
        const y = 100 + rnd(i * 37 + 2) * 700
        if (!landmarksAwayFromPath(path, x, y, 55)) continue
        drawTree(ctx, x, y, 0.85 + (i % 3) * 0.15, i % 2 ? '#2e7d32' : '#558b2f')
      }
      for (let i = 0; i < 8; i++) {
        const x = 60 + rnd(i * 29 + 8) * 1480
        const y = 60 + rnd(i * 33 + 4) * 780
        if (!landmarksAwayFromPath(path, x, y, 45)) continue
        drawBush(ctx, x, y, 14, '#689f38')
      }
      break
    }
    case 'ice': {
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, '#e3f2fd')
      g.addColorStop(0.5, '#bbdefb')
      g.addColorStop(1, '#90caf9')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      for (let i = 0; i < 35; i++) {
        ctx.fillStyle = i % 2 ? '#e8f5e9cc' : '#cfd8dccc'
        ctx.beginPath()
        ctx.ellipse(rnd(i * 17) * W, rnd(i * 19 + 1) * H, 70 + rnd(i) * 40, 30 + rnd(i + 2) * 25, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      // snow drifts
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      for (let i = 0; i < 40; i++) {
        ctx.beginPath()
        ctx.arc(rnd(i * 53 + 4) * W, rnd(i * 61 + 7) * H, 2 + rnd(i + 3) * 3, 0, Math.PI * 2)
        ctx.fill()
      }
      water(ctx, map.waterZones, true)
      if (landmarksAwayFromPath(path, 280, 200, 70)) drawIgloo(ctx, 280, 200)
      if (landmarksAwayFromPath(path, 1320, 220, 70)) drawIgloo(ctx, 1320, 220)
      for (let i = 0; i < 12; i++) {
        const x = 80 + rnd(i * 27) * 1440
        const y = 80 + rnd(i * 31 + 2) * 740
        if (!landmarksAwayFromPath(path, x, y, 55)) continue
        drawRock(ctx, x, y, 16 + (i % 4) * 4, '#b0bec5')
      }
      break
    }
    case 'desert': {
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, '#ffe082')
      g.addColorStop(0.45, '#f5e6c8')
      g.addColorStop(1, '#e0c090')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      for (let i = 0; i < 28; i++) {
        const x = rnd(i * 21) * W
        const y = rnd(i * 25 + 1) * H
        const dune = ctx.createRadialGradient(x, y, 0, x, y, 100)
        dune.addColorStop(0, '#edd9a3')
        dune.addColorStop(1, '#edd9a300')
        ctx.fillStyle = dune
        ctx.beginPath()
        ctx.ellipse(x, y, 100, 36, 0.15, 0, Math.PI * 2)
        ctx.fill()
      }
      if (landmarksAwayFromPath(path, 200, 200, 80)) drawPyramid(ctx, 200, 200)
      if (landmarksAwayFromPath(path, 1450, 160, 80)) drawPyramid(ctx, 1450, 160)
      for (let i = 0; i < 12; i++) {
        const x = 100 + ((i * 197) % 1400)
        const y = 100 + ((i * 131) % 700)
        if (!landmarksAwayFromPath(path, x, y, 50)) continue
        drawCactus(ctx, x, y)
      }
      for (let i = 0; i < 10; i++) {
        const x = 80 + rnd(i * 43) * 1440
        const y = 80 + rnd(i * 39 + 3) * 740
        if (!landmarksAwayFromPath(path, x, y, 45)) continue
        drawRock(ctx, x, y, 14 + (i % 3) * 4, '#bcaaa4')
      }
      break
    }
    case 'forest': {
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, '#43a047')
      g.addColorStop(0.5, '#2e7d32')
      g.addColorStop(1, '#1b5e20')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      // moss patches
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = i % 2 ? '#33691ecc' : '#558b2fcc'
        ctx.beginPath()
        ctx.ellipse(rnd(i * 18) * W, rnd(i * 22 + 1) * H, 60, 28, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      for (let i = 0; i < 70; i++) {
        const x = (i * 179) % W
        const y = (i * 151) % H
        if (!landmarksAwayFromPath(path, x, y, 48)) continue
        const shades = ['#1b5e20', '#2e7d32', '#33691e', '#004d40']
        drawTree(ctx, x, y, 0.7 + (i % 4) * 0.18, shades[i % shades.length])
      }
      // glowing mushrooms
      for (let i = 0; i < 18; i++) {
        const x = rnd(i * 71 + 5) * W
        const y = rnd(i * 67 + 8) * H
        if (!landmarksAwayFromPath(path, x, y, 40)) continue
        ctx.fillStyle = '#efebe9'
        ctx.fillRect(x - 2, y, 4, 8)
        ctx.fillStyle = i % 2 ? '#ef5350' : '#ffeb3b'
        ctx.beginPath()
        ctx.ellipse(x, y, 7, 5, 0, Math.PI, 0)
        ctx.fill()
      }
      break
    }
    case 'harbor': {
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, '#a5d6a7')
      g.addColorStop(0.5, '#81c784')
      g.addColorStop(1, '#66bb6a')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      water(ctx, map.waterZones, false)
      drawDock(ctx, 560, 780, 520, 36)
      drawDock(ctx, 1280, 180, 36, 320)
      drawDock(ctx, 40, 820, 200, 28)
      if (landmarksAwayFromPath(path, 1480, 160, 60)) drawLighthouse(ctx, 1480, 160)
      drawBoat(ctx, 280, 430)
      drawBoat(ctx, 1380, 380)
      for (let i = 0; i < 8; i++) {
        const x = 100 + rnd(i * 51) * 1400
        const y = 80 + rnd(i * 47 + 2) * 700
        if (!landmarksAwayFromPath(path, x, y, 50)) continue
        drawBush(ctx, x, y, 14, '#558b2f')
      }
      for (let i = 0; i < 6; i++) {
        const x = 120 + rnd(i * 59 + 3) * 1360
        const y = 100 + rnd(i * 53 + 6) * 700
        if (!landmarksAwayFromPath(path, x, y, 45)) continue
        drawRock(ctx, x, y, 16, '#78909c')
      }
      break
    }
    case 'mountain': {
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, '#b0bec5')
      g.addColorStop(0.45, '#90a4ae')
      g.addColorStop(1, '#607d8b')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      for (let i = 0; i < 18; i++) {
        const x = 80 + rnd(i * 37) * 1440
        const y = 60 + rnd(i * 41 + 2) * 500
        if (!landmarksAwayFromPath(path, x, y, 70)) continue
        drawPeak(ctx, x, y, 50 + (i % 4) * 12)
      }
      water(ctx, map.waterZones, false)
      for (let i = 0; i < 22; i++) {
        const x = 60 + rnd(i * 29 + 5) * 1480
        const y = 80 + rnd(i * 31 + 7) * 740
        if (!landmarksAwayFromPath(path, x, y, 48)) continue
        drawRock(ctx, x, y, 14 + (i % 5) * 5, i % 2 ? '#78909c' : '#546e7a')
      }
      for (let i = 0; i < 8; i++) {
        const x = 100 + rnd(i * 53) * 1400
        const y = 100 + rnd(i * 47 + 3) * 700
        if (!landmarksAwayFromPath(path, x, y, 50)) continue
        drawBush(ctx, x, y, 12, '#558b2f')
      }
      break
    }
    case 'night': {
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, '#1a237e')
      g.addColorStop(0.5, '#283593')
      g.addColorStop(1, '#311b92')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      // stars
      ctx.fillStyle = '#fffde7'
      for (let i = 0; i < 80; i++) {
        ctx.beginPath()
        ctx.arc(rnd(i * 73 + 2) * W, rnd(i * 79 + 5) * H * 0.7, 1 + rnd(i + 1) * 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
      // moon
      ctx.fillStyle = '#fff9c4'
      ctx.beginPath()
      ctx.arc(1400, 100, 42, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#283593'
      ctx.beginPath()
      ctx.arc(1418, 90, 34, 0, Math.PI * 2)
      ctx.fill()
      water(ctx, map.waterZones, false)
      for (let i = 0; i < 14; i++) {
        const x = 80 + rnd(i * 43 + 1) * 1440
        const y = 100 + rnd(i * 47 + 4) * 720
        if (!landmarksAwayFromPath(path, x, y, 55)) continue
        drawStall(ctx, x, y)
      }
      for (let i = 0; i < 20; i++) {
        const x = 60 + rnd(i * 59 + 8) * 1480
        const y = 80 + rnd(i * 61 + 3) * 760
        if (!landmarksAwayFromPath(path, x, y, 40)) continue
        drawLantern(ctx, x, y)
      }
      break
    }
    case 'crystal': {
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, '#e0f7fa')
      g.addColorStop(0.45, '#b2ebf2')
      g.addColorStop(1, '#80deea')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      for (let i = 0; i < 25; i++) {
        const x = rnd(i * 19) * W
        const y = rnd(i * 23 + 1) * H
        const blob = ctx.createRadialGradient(x, y, 0, x, y, 80)
        blob.addColorStop(0, '#ce93d8aa')
        blob.addColorStop(1, '#ce93d800')
        ctx.fillStyle = blob
        ctx.beginPath()
        ctx.ellipse(x, y, 80, 36, 0.2, 0, Math.PI * 2)
        ctx.fill()
      }
      water(ctx, map.waterZones, false)
      const hues = ['#26c6da', '#7e57c2', '#42a5f5', '#66bb6a', '#ab47bc']
      for (let i = 0; i < 28; i++) {
        const x = 70 + rnd(i * 37 + 2) * 1460
        const y = 70 + rnd(i * 41 + 6) * 760
        if (!landmarksAwayFromPath(path, x, y, 50)) continue
        drawCrystal(ctx, x, y, 18 + (i % 5) * 6, hues[i % hues.length])
      }
      for (let i = 0; i < 8; i++) {
        const x = 100 + rnd(i * 51) * 1400
        const y = 100 + rnd(i * 53 + 2) * 700
        if (!landmarksAwayFromPath(path, x, y, 45)) continue
        drawRock(ctx, x, y, 14, '#80cbc4')
      }
      break
    }
  }

  paintRoad(ctx, path, map.theme)

  const start = path.posAt(0)
  const end = path.posAt(path.totalLength)
  gateMarker(ctx, start.x, start.y, '#43a047', 'IN')
  gateMarker(ctx, end.x, end.y, '#e53935', 'OUT')
  ctx.restore()
}

const cache = new Map<string, HTMLCanvasElement>()

/** Clear cached map canvases (call after art upgrades / HMR). */
export function clearMapCache() {
  cache.clear()
}

export function getMapCanvas(map: MapDef, path: Path): HTMLCanvasElement {
  const hit = cache.get(map.id)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  drawMapBackground(c.getContext('2d')!, map, path)
  cache.set(map.id, c)
  return c
}
