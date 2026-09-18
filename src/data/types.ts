export type DifficultyId = 'easy' | 'medium' | 'hard'
export type Targeting = 'first' | 'last' | 'close' | 'strong' | 'weak'
export type ScreenId =
  | 'home'
  | 'mapSelect'
  | 'play'
  | 'knowledge'
  | 'medals'
  | 'settings'
  | 'install'
  | 'victory'
  | 'defeat'

export type OrbKind =
  | 'ember'
  | 'azure'
  | 'jade'
  | 'sun'
  | 'rose'
  | 'shade'
  | 'pearl'
  | 'iron'
  | 'stripe'
  | 'prism'
  | 'clay'
  | 'heart'
  | 'ironHull'
  | 'titanBarge'
  | 'colossus'
  | 'apexKeep'

export type TowerId =
  | 'dartkeep'
  | 'spikewheel'
  | 'frostward'
  | 'boomcannon'
  | 'gyreblade'
  | 'longshot'
  | 'arcmage'
  | 'nightshade'
  | 'goospray'
  | 'coinGrove'
  | 'grovesage'
  | 'arccoil'
  | 'spikeForge'
  | 'mortarpit'
  | 'keeptotem'
  | 'hyperward'

export interface Vec2 {
  x: number
  y: number
}

export interface DifficultyDef {
  id: DifficultyId
  name: string
  lives: number
  startGold: number
  rounds: number
  hpMul: number
  cashMul: number
  color: string
}

export interface OrbDef {
  kind: OrbKind
  name: string
  color: string
  rim: string
  speed: number
  hp: number
  r: number
  cash: number
  children: OrbKind[]
  camo?: boolean
  regen?: boolean
  lead?: boolean
  bombImmune?: boolean
  freezeImmune?: boolean
  isBoss?: boolean
}

export interface UpgradeTier {
  name: string
  desc: string
  cost: number
  dmg?: number
  rate?: number
  range?: number
  pierce?: number
  splash?: number
  slow?: number
  camo?: boolean
  lead?: boolean
  extraShots?: number
  chain?: number
  farmIncome?: number
  auraDmg?: number
  auraRate?: number
  auraRange?: number
  auraCamo?: boolean
  projectileSpeed?: number
  minRange?: number
}

export interface TowerDef {
  id: TowerId
  name: string
  role: string
  cost: number
  range: number
  damage: number
  rate: number
  pierce: number
  color: string
  accent: string
  seesCamo: boolean
  popsLead: boolean
  isFarm: boolean
  isSupport: boolean
  isRadial: boolean
  isBeam: boolean
  isPulse: boolean
  isTrap: boolean
  isLob: boolean
  isGlue: boolean
  isFrost: boolean
  isBomb: boolean
  isChain: boolean
  farmIncome: number
  splash: number
  slow: number
  minRange: number
  paths: [UpgradeTier[], UpgradeTier[], UpgradeTier[]]
}

export interface MapDef {
  id: string
  name: string
  theme: 'meadow' | 'brook' | 'ice' | 'desert' | 'forest' | 'harbor' | 'mountain' | 'night' | 'crystal'
  waypoints: Vec2[]
  waterZones: { x: number; y: number; r: number }[]
  description: string
}

export interface WaveSpawn {
  kind: OrbKind
  count: number
  spacing: number
  delay: number
  camo?: boolean
  regen?: boolean
}

export interface KnowledgeNode {
  id: string
  column: 0 | 1 | 2
  row: number
  name: string
  desc: string
  cost: number
  prereq?: string
  effect: Record<string, number | boolean>
}

export interface AchievementDef {
  id: string
  name: string
  desc: string
  coins: number
}

export interface PlacedTower {
  uid: number
  defId: TowerId
  x: number
  y: number
  pathTiers: [number, number, number]
  targeting: Targeting
  cooldown: number
  angle: number
  spent: number
  farmTimer: number
}

export interface LiveOrb {
  uid: number
  kind: OrbKind
  dist: number
  hp: number
  maxHp: number
  slow: number
  slowT: number
  frozenT: number
  camo: boolean
  regen: boolean
  regenCd: number
  glueT: number
}

export interface Projectile {
  uid: number
  x: number
  y: number
  vx: number
  vy: number
  dmg: number
  pierce: number
  splash: number
  slow: number
  freeze: number
  lead: boolean
  camo: boolean
  life: number
  kind: 'dart' | 'tack' | 'bomb' | 'blade' | 'bolt' | 'shell' | 'glue' | 'beam' | 'spike'
  towerUid: number
  chainLeft?: number
  hit: Set<number>
}

export interface SpikePile {
  uid: number
  x: number
  y: number
  hits: number
  dmg: number
  lead: boolean
}

export interface FxParticle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  r: number
  text?: string
}

export interface RunSnapshot {
  mapId: string
  difficulty: DifficultyId
  doubleCash: boolean
  gold: number
  lives: number
  round: number
  freeplay: boolean
  freeplayExtra: number
  towers: PlacedTower[]
  won: boolean
  nextTowerUid: number
}

export interface MetaState {
  coins: number
  knowledge: Record<string, boolean>
  medals: Record<string, { easy?: boolean; medium?: boolean; hard?: boolean; doubleCash?: boolean }>
  achievements: Record<string, boolean>
  settings: {
    sfx: boolean
    music: boolean
    shake: boolean
    autoStart: boolean
    doubleCash: boolean
  }
  admin: boolean
  stats: {
    pops: number
    wins: number
    towersPlaced: Record<string, boolean>
    maxGold: number
    freeplayMax: number
    hullsPopped: number
    apexPopped: number
    grovesPlaced: number
    tier4Bought: boolean
  }
  run: RunSnapshot | null
  version: string
}
