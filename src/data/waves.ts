import type { OrbKind, WaveSpawn } from './types'

function g(kind: OrbKind, count: number, spacing = 0.55, delay = 0, camo = false, regen = false): WaveSpawn {
  return { kind, count, spacing, delay, camo, regen }
}

/** Scripted rounds 1–60. Index 0 unused; round N uses WAVES[N]. */
export const WAVES: WaveSpawn[][] = [
  [],
  // 1–10
  [g('ember', 10, 0.7)],
  [g('ember', 15, 0.55)],
  [g('ember', 12, 0.5), g('azure', 5, 0.6, 3)],
  [g('azure', 18, 0.5)],
  [g('azure', 10, 0.45), g('jade', 8, 0.55, 2)],
  [g('jade', 16, 0.5)],
  [g('jade', 12, 0.45), g('sun', 6, 0.55, 2)],
  [g('sun', 14, 0.45)],
  [g('sun', 10, 0.4), g('rose', 5, 0.5, 2)],
  [g('rose', 12, 0.4)],
  // 11–20
  [g('rose', 10, 0.4), g('shade', 4, 0.7, 3)],
  [g('shade', 8, 0.55)],
  [g('pearl', 8, 0.55)],
  [g('shade', 6, 0.5), g('pearl', 6, 0.5, 2)],
  [g('stripe', 6, 0.6)],
  [g('stripe', 4, 0.55), g('rose', 12, 0.35, 2)],
  [g('iron', 5, 0.7)],
  [g('iron', 4, 0.65), g('shade', 8, 0.45, 2)],
  [g('prism', 4, 0.7)],
  [g('prism', 3, 0.65), g('stripe', 4, 0.5, 2), g('rose', 10, 0.35, 5)],
  // 21–30
  [g('heart', 8, 0.5, 0, false, true)],
  [g('clay', 2, 1.2)],
  [g('clay', 3, 1.0), g('prism', 4, 0.6, 3)],
  [g('ember', 20, 0.25, 0, true), g('azure', 15, 0.3, 4, true)],
  [g('iron', 8, 0.55), g('shade', 10, 0.4, 3)],
  [g('clay', 4, 0.9), g('stripe', 6, 0.5, 2)],
  [g('prism', 8, 0.5), g('heart', 6, 0.45, 3, false, true)],
  [g('iron', 6, 0.5, 0, true), g('rose', 20, 0.3, 4)],
  [g('clay', 5, 0.8), g('ironHull', 1, 0, 6)],
  [g('prism', 10, 0.4), g('clay', 4, 0.9, 3)],
  // 31–40
  [g('stripe', 12, 0.4), g('pearl', 10, 0.4, 2), g('shade', 10, 0.4, 4)],
  [g('clay', 6, 0.75), g('iron', 8, 0.5, 2)],
  [g('heart', 12, 0.4, 0, false, true), g('prism', 8, 0.45, 3)],
  [g('ember', 30, 0.2, 0, true), g('jade', 20, 0.25, 3, true), g('rose', 15, 0.3, 6, true)],
  [g('ironHull', 2, 2.0), g('clay', 4, 0.8, 4)],
  [g('clay', 8, 0.7), g('prism', 10, 0.4, 2)],
  [g('titanBarge', 1, 0, 0), g('clay', 6, 0.7, 5)],
  [g('iron', 15, 0.4), g('stripe', 10, 0.4, 3), g('clay', 5, 0.8, 6)],
  [g('heart', 15, 0.35, 0, true, true), g('prism', 12, 0.4, 3)],
  [g('clay', 10, 0.65), g('ironHull', 2, 2.5, 4)],
  // 41–50
  [g('prism', 16, 0.35), g('clay', 8, 0.7, 3), g('iron', 12, 0.4, 6)],
  [g('titanBarge', 2, 3.0), g('clay', 8, 0.65, 4)],
  [g('rose', 40, 0.2, 0, true), g('stripe', 15, 0.35, 4, true)],
  [g('clay', 12, 0.6), g('ironHull', 3, 2.0, 3)],
  [g('colossus', 1, 0, 0), g('clay', 10, 0.6, 8)],
  [g('prism', 20, 0.3), g('heart', 15, 0.35, 2, false, true), g('iron', 15, 0.4, 5)],
  [g('titanBarge', 2, 2.5), g('ironHull', 3, 2.0, 4), g('clay', 8, 0.6, 8)],
  [g('clay', 15, 0.55), g('stripe', 20, 0.3, 2, true)],
  [g('colossus', 1, 0, 0), g('titanBarge', 1, 0, 10), g('clay', 12, 0.55, 5)],
  [g('ironHull', 4, 1.8), g('clay', 12, 0.55, 3), g('prism', 16, 0.3, 6)],
  // 51–60
  [g('colossus', 2, 4.0), g('clay', 15, 0.5, 4)],
  [g('heart', 25, 0.28, 0, true, true), g('iron', 20, 0.35, 3), g('clay', 12, 0.55, 6)],
  [g('titanBarge', 3, 2.5), g('ironHull', 4, 1.8, 4)],
  [g('colossus', 2, 3.5), g('prism', 25, 0.28, 3), g('clay', 15, 0.5, 6)],
  [g('apexKeep', 1, 0, 0), g('clay', 20, 0.45, 10)],
  [g('colossus', 2, 3.0), g('titanBarge', 2, 2.5, 5), g('ironHull', 4, 1.5, 8)],
  [g('clay', 25, 0.4), g('prism', 30, 0.25, 2, true), g('iron', 25, 0.3, 5)],
  [g('apexKeep', 1, 0, 0), g('colossus', 1, 0, 12), g('clay', 20, 0.4, 5)],
  [g('titanBarge', 4, 2.0), g('colossus', 2, 3.0, 4), g('clay', 20, 0.4, 8)],
  [g('apexKeep', 2, 8.0), g('colossus', 2, 4.0, 5), g('titanBarge', 3, 2.5, 10), g('clay', 25, 0.35, 8)],
]

/** Freeplay HP compound rate: starts at 1.07 and ramps toward ~1.11. */
export function freeplayHpScale(extra: number): number {
  return 1.07 + Math.min(0.04, Math.max(0, extra) * 0.0008)
}

/**
 * Post-victory freeplay waves. Harder denser spawns, earlier camo/lead/ceramic,
 * mini-boss every 3 extras, and more frequent Iron Hull / Titan / Colossus / Apex.
 */
export function freeplayWave(extra: number): WaveSpawn[] {
  const base = Math.min(60, 45 + Math.floor(extra / 2))
  const template = WAVES[base] ?? WAVES[60]
  const dens = 1 + extra * 0.08
  const spacingMul = Math.max(0.55, 1 - Math.min(0.4, extra * 0.012))

  const out: WaveSpawn[] = template.map((s) => ({
    ...s,
    count: Math.ceil(s.count * dens),
    spacing: Math.max(0.12, s.spacing * spacingMul),
  }))

  // Camo / lead / ceramic pressure earlier in freeplay
  if (extra >= 1) {
    out.push(g('clay', 5 + Math.floor(extra * 0.7), Math.max(0.22, 0.55 - extra * 0.012), 1.5))
    out.push(g('prism', 6 + Math.floor(extra / 2), Math.max(0.2, 0.4 - extra * 0.008), 2.5, true))
  }
  if (extra >= 2) {
    out.push(g('iron', 6 + extra, Math.max(0.22, 0.45 - extra * 0.008), 3, extra >= 3))
  }
  if (extra >= 4) {
    out.push(g('stripe', 8 + Math.floor(extra / 2), Math.max(0.2, 0.4 - extra * 0.01), 4, true))
  }
  if (extra >= 6) {
    out.push(g('heart', 8 + Math.floor(extra / 3), 0.3, 5, true, true))
  }

  // Mini-boss every 3 freeplay extras
  if (extra > 0 && extra % 3 === 0) {
    const mini: OrbKind =
      extra < 6 ? 'ironHull' : extra < 12 ? 'titanBarge' : extra < 21 ? 'colossus' : 'apexKeep'
    out.push(g(mini, 1 + Math.floor(extra / 18), 2.2, 0.5))
  }

  // Rotating boss spice — unlocks earlier than before
  const bosses: OrbKind[] = ['ironHull', 'titanBarge']
  if (extra >= 4) bosses.push('colossus')
  if (extra >= 8) bosses.push('apexKeep')
  out.push(g(bosses[extra % bosses.length], 1 + Math.floor(extra / 7), 1.4, 2))

  // More frequent named bosses
  if (extra > 0 && extra % 4 === 0) out.push(g('ironHull', 1 + Math.floor(extra / 12), 1.8, 6))
  if (extra >= 5 && extra % 5 === 0) out.push(g('titanBarge', 1 + Math.floor(extra / 15), 2.5, 7))
  if (extra >= 8 && extra % 4 === 0) out.push(g('colossus', 1, 3, 8))
  if (extra >= 10 && extra % 5 === 0) out.push(g('apexKeep', 1, 0, 9))

  return out
}
