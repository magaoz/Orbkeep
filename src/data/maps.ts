import type { MapDef, Vec2 } from './types'

/** Densify a polyline into evenly spaced waypoints (~8px). */
export function densify(pts: Vec2[], step = 8): Vec2[] {
  if (pts.length < 2) return pts.slice()
  const out: Vec2[] = [{ ...pts[0] }]
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy)
    const n = Math.max(1, Math.ceil(len / step))
    for (let k = 1; k <= n; k++) {
      const t = k / n
      out.push({ x: a.x + dx * t, y: a.y + dy * t })
    }
  }
  return out
}

const meadowKey: Vec2[] = [
  { x: -40, y: 450 }, { x: 200, y: 450 }, { x: 350, y: 280 }, { x: 550, y: 280 },
  { x: 700, y: 450 }, { x: 900, y: 620 }, { x: 1100, y: 620 }, { x: 1250, y: 400 },
  { x: 1400, y: 400 }, { x: 1640, y: 400 },
]

const twinbrookKey: Vec2[] = [
  { x: -40, y: 200 }, { x: 250, y: 200 }, { x: 400, y: 350 }, { x: 400, y: 550 },
  { x: 550, y: 700 }, { x: 800, y: 700 }, { x: 950, y: 550 }, { x: 950, y: 350 },
  { x: 1100, y: 200 }, { x: 1350, y: 200 }, { x: 1500, y: 350 }, { x: 1500, y: 550 },
  { x: 1640, y: 700 },
]

const paleKey: Vec2[] = [
  { x: 800, y: -40 }, { x: 800, y: 120 }, { x: 1200, y: 120 }, { x: 1400, y: 250 },
  { x: 1400, y: 650 }, { x: 1200, y: 780 }, { x: 400, y: 780 }, { x: 200, y: 650 },
  { x: 200, y: 250 }, { x: 400, y: 120 }, { x: 700, y: 120 }, { x: 700, y: 300 },
  { x: 1100, y: 300 }, { x: 1100, y: 600 }, { x: 500, y: 600 }, { x: 500, y: 450 },
  { x: 900, y: 450 }, { x: 900, y: 940 },
]

const duneKey: Vec2[] = [
  { x: -40, y: 450 }, { x: 200, y: 450 }, { x: 350, y: 300 }, { x: 550, y: 200 },
  { x: 800, y: 180 }, { x: 1050, y: 220 }, { x: 1250, y: 350 }, { x: 1350, y: 500 },
  { x: 1250, y: 650 }, { x: 1000, y: 720 }, { x: 750, y: 700 }, { x: 550, y: 600 },
  { x: 500, y: 450 }, { x: 650, y: 350 }, { x: 900, y: 340 }, { x: 1050, y: 420 },
  { x: 1080, y: 520 }, { x: 950, y: 560 }, { x: 800, y: 530 }, { x: 780, y: 450 },
  { x: 900, y: 420 }, { x: 1640, y: 420 },
]

const canopyKey: Vec2[] = [
  { x: 800, y: -40 }, { x: 800, y: 100 }, { x: 1100, y: 150 }, { x: 1300, y: 300 },
  { x: 1300, y: 550 }, { x: 1100, y: 720 }, { x: 800, y: 780 }, { x: 500, y: 720 },
  { x: 300, y: 550 }, { x: 300, y: 350 }, { x: 450, y: 220 }, { x: 700, y: 200 },
  { x: 950, y: 250 }, { x: 1100, y: 400 }, { x: 1100, y: 550 }, { x: 900, y: 650 },
  { x: 650, y: 650 }, { x: 500, y: 520 }, { x: 520, y: 380 }, { x: 700, y: 320 },
  { x: 880, y: 380 }, { x: 880, y: 520 }, { x: 720, y: 520 }, { x: 720, y: 940 },
]

const harborKey: Vec2[] = [
  { x: -40, y: 150 }, { x: 400, y: 150 }, { x: 400, y: 350 }, { x: 100, y: 350 },
  { x: 100, y: 550 }, { x: 500, y: 550 }, { x: 500, y: 750 }, { x: 200, y: 750 },
  { x: 200, y: 850 }, { x: 700, y: 850 }, { x: 700, y: 650 }, { x: 1100, y: 650 },
  { x: 1100, y: 450 }, { x: 800, y: 450 }, { x: 800, y: 250 }, { x: 1300, y: 250 },
  { x: 1300, y: 550 }, { x: 1500, y: 550 }, { x: 1500, y: 750 }, { x: 1640, y: 750 },
]


const ridgeKey: Vec2[] = [
  { x: -40, y: 720 }, { x: 180, y: 720 }, { x: 280, y: 560 }, { x: 420, y: 420 },
  { x: 560, y: 300 }, { x: 720, y: 220 }, { x: 900, y: 200 }, { x: 1080, y: 260 },
  { x: 1200, y: 380 }, { x: 1280, y: 520 }, { x: 1180, y: 640 }, { x: 980, y: 700 },
  { x: 780, y: 680 }, { x: 640, y: 560 }, { x: 620, y: 420 }, { x: 740, y: 340 },
  { x: 920, y: 360 }, { x: 1040, y: 480 }, { x: 1100, y: 620 }, { x: 1240, y: 740 },
  { x: 1420, y: 780 }, { x: 1640, y: 780 },
]

const bazaarKey: Vec2[] = [
  { x: -40, y: 180 }, { x: 220, y: 180 }, { x: 220, y: 360 }, { x: 480, y: 360 },
  { x: 480, y: 180 }, { x: 760, y: 180 }, { x: 760, y: 420 }, { x: 520, y: 420 },
  { x: 520, y: 620 }, { x: 820, y: 620 }, { x: 820, y: 420 }, { x: 1100, y: 420 },
  { x: 1100, y: 200 }, { x: 1380, y: 200 }, { x: 1380, y: 480 }, { x: 1160, y: 480 },
  { x: 1160, y: 700 }, { x: 1460, y: 700 }, { x: 1460, y: 860 }, { x: 1640, y: 860 },
]

const prismKey: Vec2[] = [
  { x: 800, y: -40 }, { x: 800, y: 100 }, { x: 1050, y: 140 }, { x: 1280, y: 220 },
  { x: 1420, y: 380 }, { x: 1400, y: 560 }, { x: 1220, y: 700 }, { x: 980, y: 780 },
  { x: 720, y: 800 }, { x: 480, y: 740 }, { x: 300, y: 600 }, { x: 260, y: 420 },
  { x: 360, y: 280 }, { x: 560, y: 220 }, { x: 780, y: 260 }, { x: 980, y: 340 },
  { x: 1080, y: 480 }, { x: 980, y: 600 }, { x: 760, y: 640 }, { x: 560, y: 560 },
  { x: 500, y: 420 }, { x: 620, y: 340 }, { x: 820, y: 380 }, { x: 880, y: 520 },
  { x: 760, y: 560 }, { x: 760, y: 940 },
]

export const MAPS: MapDef[] = [
  {
    id: 'meadow',
    name: 'Meadow Run',
    theme: 'meadow',
    description: 'A gentle S-curve through sunny grasslands.',
    waypoints: densify(meadowKey),
    waterZones: [],
  },
  {
    id: 'twinbrook',
    name: 'Twinbrook',
    theme: 'brook',
    description: 'S-curve around twin ponds — water is unbuildable.',
    waypoints: densify(twinbrookKey),
    waterZones: [
      { x: 620, y: 380, r: 90 },
      { x: 1080, y: 480, r: 85 },
    ],
  },
  {
    id: 'pale',
    name: 'Pale Circuit',
    theme: 'ice',
    description: 'A long oval around a frozen lake.',
    waypoints: densify(paleKey),
    waterZones: [{ x: 800, y: 450, r: 160 }],
  },
  {
    id: 'dune',
    name: 'Dune Coil',
    theme: 'desert',
    description: 'A thirsty desert spiral under the sun.',
    waypoints: densify(duneKey),
    waterZones: [],
  },
  {
    id: 'canopy',
    name: 'Canopy Spiral',
    theme: 'forest',
    description: 'An inner spiral deep in the canopy.',
    waypoints: densify(canopyKey),
    waterZones: [],
  },
  {
    id: 'harbor',
    name: 'Harbor Switch',
    theme: 'harbor',
    description: 'Long switchbacks along the harbor docks.',
    waypoints: densify(harborKey),
    waterZones: [
      { x: 300, y: 450, r: 70 },
      { x: 1400, y: 350, r: 80 },
      { x: 1200, y: 800, r: 60 },
    ],
  },
  {
    id: 'ridgefold',
    name: 'Ridgefold Ascent',
    theme: 'mountain',
    description: 'Switchbacks up a stony ridge — boulder fields block builds.',
    waypoints: densify(ridgeKey),
    waterZones: [
      { x: 400, y: 700, r: 55 },
      { x: 1350, y: 320, r: 60 },
    ],
  },
  {
    id: 'lanternmart',
    name: 'Lantern Mart',
    theme: 'night',
    description: 'Night bazaar alleys lit by lanterns — stalls are unbuildable.',
    waypoints: densify(bazaarKey),
    waterZones: [
      { x: 340, y: 500, r: 50 },
      { x: 980, y: 300, r: 48 },
      { x: 1280, y: 600, r: 55 },
    ],
  },
  {
    id: 'prismspan',
    name: 'Prism Span',
    theme: 'crystal',
    description: 'A crystal causeway spiral over glowing pools.',
    waypoints: densify(prismKey),
    waterZones: [
      { x: 800, y: 450, r: 110 },
      { x: 420, y: 680, r: 55 },
      { x: 1200, y: 280, r: 50 },
    ],
  },
]

export function getMap(id: string): MapDef {
  return MAPS.find((m) => m.id === id) ?? MAPS[0]
}
