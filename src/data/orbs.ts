import type { OrbDef, OrbKind } from './types'

export const ORB_DEFS: Record<OrbKind, OrbDef> = {
  ember: {
    kind: 'ember', name: 'Ember', color: '#e53935', rim: '#8b1a16',
    speed: 70, hp: 1, r: 12, cash: 1, children: [],
  },
  azure: {
    kind: 'azure', name: 'Azure', color: '#1e88e5', rim: '#0d47a1',
    speed: 85, hp: 1, r: 13, cash: 1, children: ['ember'],
  },
  jade: {
    kind: 'jade', name: 'Jade', color: '#43a047', rim: '#1b5e20',
    speed: 100, hp: 1, r: 14, cash: 1, children: ['azure'],
  },
  sun: {
    kind: 'sun', name: 'Sun', color: '#fdd835', rim: '#f9a825',
    speed: 120, hp: 1, r: 14, cash: 1, children: ['jade'],
  },
  rose: {
    kind: 'rose', name: 'Rose', color: '#ec407a', rim: '#ad1457',
    speed: 145, hp: 1, r: 15, cash: 1, children: ['sun'],
  },
  shade: {
    kind: 'shade', name: 'Shade', color: '#212121', rim: '#000',
    speed: 110, hp: 1, r: 16, cash: 1, children: ['rose', 'rose'], bombImmune: true,
  },
  pearl: {
    kind: 'pearl', name: 'Pearl', color: '#fafafa', rim: '#bdbdbd',
    speed: 110, hp: 1, r: 16, cash: 1, children: ['rose', 'rose'], freezeImmune: true,
  },
  iron: {
    kind: 'iron', name: 'Iron', color: '#78909c', rim: '#37474f',
    speed: 80, hp: 1, r: 17, cash: 1, children: ['shade', 'shade'], lead: true,
  },
  stripe: {
    kind: 'stripe', name: 'Stripe', color: '#fff', rim: '#111',
    speed: 125, hp: 1, r: 17, cash: 1, children: ['shade', 'pearl'],
  },
  prism: {
    kind: 'prism', name: 'Prism', color: '#ab47bc', rim: '#6a1b9a',
    speed: 140, hp: 1, r: 18, cash: 1, children: ['stripe', 'stripe'],
  },
  clay: {
    kind: 'clay', name: 'Clay', color: '#a1887f', rim: '#5d4037',
    speed: 95, hp: 10, r: 20, cash: 10, children: ['prism', 'prism'],
  },
  heart: {
    kind: 'heart', name: 'Heart', color: '#ef5350', rim: '#c62828',
    speed: 100, hp: 1, r: 16, cash: 1, children: ['rose', 'rose'], regen: true,
  },
  ironHull: {
    kind: 'ironHull', name: 'Iron Hull', color: '#546e7a', rim: '#263238',
    speed: 55, hp: 200, r: 28, cash: 50, children: ['clay', 'clay', 'iron', 'iron'], lead: true, isBoss: true,
  },
  titanBarge: {
    kind: 'titanBarge', name: 'Titan Barge', color: '#6d4c41', rim: '#3e2723',
    speed: 45, hp: 500, r: 34, cash: 100, children: ['ironHull', 'clay', 'clay'], isBoss: true,
  },
  colossus: {
    kind: 'colossus', name: 'Colossus', color: '#5e35b1', rim: '#311b92',
    speed: 38, hp: 1200, r: 40, cash: 200, children: ['titanBarge', 'clay', 'clay', 'prism'], isBoss: true,
  },
  apexKeep: {
    kind: 'apexKeep', name: 'Apex Keep', color: '#ff6f00', rim: '#e65100',
    speed: 30, hp: 3000, r: 48, cash: 500, children: ['colossus', 'titanBarge', 'clay'], isBoss: true,
  },
}

export function effectiveOrb(kind: OrbKind, camo?: boolean, regen?: boolean): OrbDef {
  const base = ORB_DEFS[kind]
  return {
    ...base,
    camo: camo || base.camo,
    regen: regen || base.regen,
  }
}
