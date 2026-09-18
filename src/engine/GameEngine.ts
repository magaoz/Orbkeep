import { ORB_DEFS } from '../data/orbs'
import { DIFFICULTIES } from '../data/difficulties'
import { getMap } from '../data/maps'
import { TOWER_BY_ID, TOWERS } from '../data/towers'
import { WAVES, freeplayWave, freeplayHpScale } from '../data/waves'
import { KNOWLEDGE } from '../data/knowledge'
import type {
  DifficultyId,
  FxParticle,
  LiveOrb,
  PlacedTower,
  Projectile,
  RunSnapshot,
  SpikePile,
  Targeting,
  TowerId,
  Vec2,
} from '../data/types'
import { Path } from './Path'
import { getMapCanvas } from './mapArt'

const W = 1600
const H = 900
const DT = 1 / 60

export interface KnowledgeEffects {
  startGold: number
  lives: number
  interest: number
  towerDiscount: number
  groveMul: number
  cashMul: number
  dmgMul: number
  pierce: number
  rateMul: number
  dartLead: boolean
  globalCamo: boolean
  rangeMul: number
  sellRate: number
  freeDartGold: number
  splashMul: number
  bossMul: number
}

export function computeKnowledge(owned: Record<string, boolean>): KnowledgeEffects {
  const e: KnowledgeEffects = {
    startGold: 0, lives: 0, interest: 0, towerDiscount: 0, groveMul: 0, cashMul: 0,
    dmgMul: 0, pierce: 0, rateMul: 0, dartLead: false, globalCamo: false,
    rangeMul: 0, sellRate: 0.7, freeDartGold: 0, splashMul: 0, bossMul: 0,
  }
  for (const node of KNOWLEDGE) {
    if (!owned[node.id]) continue
    const fx = node.effect
    if (typeof fx.startGold === 'number') e.startGold += fx.startGold
    if (typeof fx.lives === 'number') e.lives += fx.lives
    if (typeof fx.interest === 'number') e.interest += fx.interest
    if (typeof fx.towerDiscount === 'number') e.towerDiscount += fx.towerDiscount
    if (typeof fx.groveMul === 'number') e.groveMul += fx.groveMul
    if (typeof fx.cashMul === 'number') e.cashMul += fx.cashMul
    if (typeof fx.dmgMul === 'number') e.dmgMul += fx.dmgMul
    if (typeof fx.pierce === 'number') e.pierce += fx.pierce
    if (typeof fx.rateMul === 'number') e.rateMul += fx.rateMul
    if (fx.dartLead === true) e.dartLead = true
    if (fx.globalCamo === true) e.globalCamo = true
    if (typeof fx.rangeMul === 'number') e.rangeMul += fx.rangeMul
    if (typeof fx.sellRate === 'number') e.sellRate = fx.sellRate
    if (typeof fx.freeDartGold === 'number') e.freeDartGold += fx.freeDartGold
    if (typeof fx.splashMul === 'number') e.splashMul += fx.splashMul
    if (typeof fx.bossMul === 'number') e.bossMul += fx.bossMul
  }
  return e
}

export interface EngineCallbacks {
  onWin: (coinsEarned: number, flawless: boolean) => void
  onDefeat: () => void
  onPop: (kind: string, cash: number) => void
  onStat: (key: string, value?: number) => void
  onAutosave: (snap: RunSnapshot) => void
}

export class GameEngine {
  mapId: string
  difficulty: DifficultyId
  doubleCash: boolean
  knowledge: KnowledgeEffects
  path: Path
  mapBg: HTMLCanvasElement

  gold = 0
  lives = 0
  round = 0
  maxRounds = 40
  freeplay = false
  freeplayExtra = 0
  hpMul = 1
  cashMul = 1

  towers: PlacedTower[] = []
  orbs: LiveOrb[] = []
  projectiles: Projectile[] = []
  spikes: SpikePile[] = []
  fx: FxParticle[] = []

  nextUid = 1
  selectedTowerUid: number | null = null
  placing: TowerId | null = null
  placePos: Vec2 | null = null
  placeValid = false

  paused = false
  speed = 1 as 1 | 2 | 3
  autoStart = true
  roundActive = false
  betweenRounds = true
  autoCountdown = 0
  spawnQueue: { kind: string; camo: boolean; regen: boolean; at: number }[] = []
  spawnTimer = 0
  roundTime = 0
  startingLives = 0
  won = false
  defeated = false
  shake = 0
  shakeEnabled = true

  private cb: EngineCallbacks
  private saveAcc = 0

  constructor(
    mapId: string,
    difficulty: DifficultyId,
    doubleCash: boolean,
    knowledgeOwned: Record<string, boolean>,
    autoStart: boolean,
    shakeEnabled: boolean,
    cb: EngineCallbacks,
    snapshot?: RunSnapshot | null,
  ) {
    this.mapId = mapId
    this.difficulty = difficulty
    this.doubleCash = doubleCash
    this.knowledge = computeKnowledge(knowledgeOwned)
    this.autoStart = autoStart
    this.shakeEnabled = shakeEnabled
    this.cb = cb

    const map = getMap(mapId)
    this.path = new Path(map.waypoints)
    this.mapBg = getMapCanvas(map, this.path)

    const diff = DIFFICULTIES.find((d) => d.id === difficulty)!
    this.maxRounds = diff.rounds
    this.hpMul = diff.hpMul
    this.cashMul = diff.cashMul * (doubleCash ? 2 : 1) * (1 + this.knowledge.cashMul)

    if (snapshot) {
      this.gold = snapshot.gold
      this.lives = snapshot.lives
      this.round = snapshot.round
      this.freeplay = snapshot.freeplay
      this.freeplayExtra = snapshot.freeplayExtra
      this.towers = snapshot.towers.map((t) => ({ ...t, pathTiers: [...t.pathTiers] as [number, number, number] }))
      this.won = snapshot.won
      this.nextUid = snapshot.nextTowerUid
      this.startingLives = diff.lives + this.knowledge.lives
      this.betweenRounds = true
      this.roundActive = false
    } else {
      this.lives = diff.lives + this.knowledge.lives
      this.startingLives = this.lives
      // Double Cash 2× pop income only (cashMul) — starting gold stays normal
      let start = diff.startGold + this.knowledge.startGold + this.knowledge.freeDartGold
      this.gold = start
    }
  }

  towerCost(id: TowerId): number {
    const base = TOWER_BY_ID[id].cost
    return Math.floor(base * (1 - this.knowledge.towerDiscount))
  }

  statsFor(t: PlacedTower) {
    const def = TOWER_BY_ID[t.defId]
    let dmg = def.damage
    let rate = def.rate
    let range = def.range
    let pierce = def.pierce
    let splash = def.splash
    let slow = def.slow
    let camo = def.seesCamo || this.knowledge.globalCamo
    let lead = def.popsLead || (def.id === 'dartkeep' && this.knowledge.dartLead)
    let extraShots = 0
    let chain = def.isChain ? 2 : 0
    let farmIncome = def.farmIncome
    let auraDmg = 0
    let auraRate = 0
    let auraRange = 0
    let auraCamo = false
    let minRange = def.minRange

    for (let p = 0; p < 3; p++) {
      const tier = t.pathTiers[p]
      for (let i = 0; i < tier; i++) {
        const u = def.paths[p][i]
        if (u.dmg) dmg += u.dmg
        if (u.rate) rate += u.rate
        if (u.range) range += u.range
        if (u.pierce) pierce += u.pierce
        if (u.splash) splash += u.splash
        if (u.slow) slow += u.slow
        if (u.camo) camo = true
        if (u.lead) lead = true
        if (u.extraShots) extraShots += u.extraShots
        if (u.chain) chain += u.chain
        if (u.farmIncome) farmIncome += u.farmIncome
        if (u.auraDmg) auraDmg += u.auraDmg
        if (u.auraRate) auraRate += u.auraRate
        if (u.auraRange) auraRange += u.auraRange
        if (u.auraCamo) auraCamo = true
        if (u.minRange) minRange = u.minRange
      }
    }

    // support auras from nearby totems
    for (const other of this.towers) {
      if (other.uid === t.uid) continue
      const od = TOWER_BY_ID[other.defId]
      if (!od.isSupport) continue
      const os = this.statsForRaw(other)
      const ar = (od.range + os.auraRangeExtra) * (1 + this.knowledge.rangeMul)
      if (Math.hypot(other.x - t.x, other.y - t.y) <= ar) {
        dmg *= 1 + os.auraDmg
        rate *= 1 + os.auraRate
        if (os.auraCamo) camo = true
      }
    }

    dmg *= 1 + this.knowledge.dmgMul
    rate *= 1 + this.knowledge.rateMul
    range *= 1 + this.knowledge.rangeMul
    pierce += this.knowledge.pierce
    splash *= 1 + this.knowledge.splashMul
    farmIncome *= 1 + this.knowledge.groveMul

    return { dmg, rate, range, pierce, splash, slow, camo, lead, extraShots, chain, farmIncome, auraDmg, auraRate, auraRange, auraCamo, minRange, def }
  }

  private statsForRaw(t: PlacedTower) {
    const def = TOWER_BY_ID[t.defId]
    let auraDmg = 0, auraRate = 0, auraRangeExtra = 0, auraCamo = false
    for (let p = 0; p < 3; p++) {
      for (let i = 0; i < t.pathTiers[p]; i++) {
        const u = def.paths[p][i]
        if (u.auraDmg) auraDmg += u.auraDmg
        if (u.auraRate) auraRate += u.auraRate
        if (u.auraRange) auraRangeExtra += u.auraRange
        if (u.auraCamo) auraCamo = true
      }
    }
    return { auraDmg, auraRate, auraRangeExtra, auraCamo }
  }

  canPlace(x: number, y: number): boolean {
    if (x < 30 || y < 30 || x > W - 30 || y > H - 30) return false
    if (this.path.isOnPath(x, y, 30)) return false
    const map = getMap(this.mapId)
    for (const z of map.waterZones) {
      const dx = (x - z.x) / 1.2
      const dy = (y - z.y) / 0.85
      if (dx * dx + dy * dy < z.r * z.r) return false
    }
    for (const t of this.towers) {
      if (Math.hypot(t.x - x, t.y - y) < 44) return false
    }
    return true
  }

  tryPlace(id: TowerId, x: number, y: number): boolean {
    const cost = this.towerCost(id)
    if (this.gold < cost || !this.canPlace(x, y)) return false
    this.gold -= cost
    const t: PlacedTower = {
      uid: this.nextUid++,
      defId: id,
      x, y,
      pathTiers: [0, 0, 0],
      targeting: 'first',
      cooldown: 0,
      angle: 0,
      spent: cost,
      farmTimer: 0,
    }
    this.towers.push(t)
    this.selectedTowerUid = t.uid
    this.placing = null
    this.cb.onStat('tower', 0)
    if (id === 'coinGrove') this.cb.onStat('grove')
    return true
  }

  tryUpgrade(uid: number, path: 0 | 1 | 2): boolean {
    const t = this.towers.find((x) => x.uid === uid)
    if (!t) return false
    const tier = t.pathTiers[path]
    if (tier >= 4) return false
    const u = TOWER_BY_ID[t.defId].paths[path][tier]
    if (this.gold < u.cost) return false
    this.gold -= u.cost
    t.spent += u.cost
    t.pathTiers[path] = (tier + 1) as 0 | 1 | 2 | 3 | 4
    if (tier + 1 === 4) this.cb.onStat('tier4')
    return true
  }

  sell(uid: number): void {
    const i = this.towers.findIndex((x) => x.uid === uid)
    if (i < 0) return
    const t = this.towers[i]
    this.gold += Math.floor(t.spent * this.knowledge.sellRate)
    this.towers.splice(i, 1)
    if (this.selectedTowerUid === uid) this.selectedTowerUid = null
  }

  cycleTargeting(uid: number): void {
    const t = this.towers.find((x) => x.uid === uid)
    if (!t) return
    const order: Targeting[] = ['first', 'last', 'close', 'strong', 'weak']
    t.targeting = order[(order.indexOf(t.targeting) + 1) % order.length]
  }

  startRound(): void {
    if (this.roundActive || this.won || this.defeated) return
    if (!this.freeplay && this.round >= this.maxRounds) return
    this.round++
    if (this.freeplay) this.freeplayExtra++
    this.roundActive = true
    this.betweenRounds = false
    this.roundTime = 0
    this.spawnTimer = 0
    this.autoCountdown = 0

    let spawns = this.freeplay ? freeplayWave(this.freeplayExtra) : (WAVES[this.round] ?? [])
    this.spawnQueue = []
    for (const s of spawns) {
      for (let i = 0; i < s.count; i++) {
        this.spawnQueue.push({
          kind: s.kind,
          camo: !!s.camo,
          regen: !!s.regen,
          at: s.delay + i * s.spacing,
        })
      }
    }
    this.spawnQueue.sort((a, b) => a.at - b.at)
  }

  private spawnOrb(kind: string, camo: boolean, regen: boolean) {
    const def = ORB_DEFS[kind as keyof typeof ORB_DEFS]
    if (!def) return
    let hp = def.hp * this.hpMul
    if (this.freeplay) hp *= Math.pow(freeplayHpScale(this.freeplayExtra), this.freeplayExtra)
    this.orbs.push({
      uid: this.nextUid++,
      kind: def.kind,
      dist: 0,
      hp,
      maxHp: hp,
      slow: 0,
      slowT: 0,
      frozenT: 0,
      camo: camo || !!def.camo,
      regen: regen || !!def.regen,
      regenCd: 0,
      glueT: 0,
    })
  }

  private popOrb(orb: LiveOrb, fromBomb: boolean) {
    const def = ORB_DEFS[orb.kind]
    const cash = Math.floor(def.cash * this.cashMul)
    this.gold += cash
    this.cb.onPop(orb.kind, cash)
    this.cb.onStat('pop')
    if (orb.kind === 'ironHull') this.cb.onStat('hull')
    if (orb.kind === 'apexKeep') this.cb.onStat('apex')

    const pos = this.path.posAt(orb.dist)
    this.spawnPopFx(pos.x, pos.y, def.color, cash)

    const children = def.children
    // bomb-immune shades skip bomb child spawn? They just don't take bomb damage - handled in hit
    for (let i = 0; i < children.length; i++) {
      const ck = children[i]
      const cdef = ORB_DEFS[ck]
      let hp = cdef.hp * this.hpMul
      if (this.freeplay) hp *= Math.pow(freeplayHpScale(this.freeplayExtra), this.freeplayExtra)
      this.orbs.push({
        uid: this.nextUid++,
        kind: ck,
        dist: Math.max(0, orb.dist - i * 12),
        hp,
        maxHp: hp,
        slow: orb.slow * 0.5,
        slowT: orb.slowT * 0.5,
        frozenT: 0,
        camo: orb.camo && !!cdef.camo ? true : orb.camo && children.length <= 2 ? orb.camo : false,
        regen: orb.regen,
        regenCd: 0,
        glueT: 0,
      })
    }
    void fromBomb
  }

  private spawnPopFx(x: number, y: number, color: string, cash: number) {
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2
      this.fx.push({
        x, y,
        vx: Math.cos(a) * (40 + Math.random() * 80),
        vy: Math.sin(a) * (40 + Math.random() * 80),
        life: 0.35,
        maxLife: 0.35,
        color,
        r: 4 + Math.random() * 4,
      })
    }
    this.fx.push({
      x, y: y - 10,
      vx: 0, vy: -40,
      life: 0.6,
      maxLife: 0.6,
      color: '#ffd54f',
      r: 0,
      text: `+$${cash}`,
    })
  }

  private damageOrb(orb: LiveOrb, dmg: number, opts: { lead: boolean; bomb: boolean; freeze: number; slow: number; bossMul?: boolean }) {
    const def = ORB_DEFS[orb.kind]
    if (def.lead && !opts.lead) return false
    if (def.bombImmune && opts.bomb) return false
    if (def.freezeImmune && opts.freeze > 0) {
      // still damage but no freeze
    } else if (opts.freeze > 0 && !def.freezeImmune) {
      orb.frozenT = Math.max(orb.frozenT, opts.freeze)
    }
    if (opts.slow > 0) {
      orb.slow = Math.max(orb.slow, opts.slow)
      orb.slowT = Math.max(orb.slowT, 2.5)
    }
    let d = dmg
    if (def.isBoss && this.knowledge.bossMul) d *= 1 + this.knowledge.bossMul
    orb.hp -= d
    const pos = this.path.posAt(orb.dist)
    this.fx.push({
      x: pos.x + (Math.random() - 0.5) * 10,
      y: pos.y - 20,
      vx: 0, vy: -30,
      life: 0.4, maxLife: 0.4,
      color: '#fff',
      r: 0,
      text: `${Math.round(d)}`,
    })
    if (orb.hp <= 0) {
      this.popOrb(orb, opts.bomb)
      return true
    }
    return false
  }

  private pickTarget(t: PlacedTower, stats: ReturnType<GameEngine['statsFor']>): LiveOrb | null {
    const candidates: LiveOrb[] = []
    for (const o of this.orbs) {
      if (o.camo && !stats.camo) continue
      const pos = this.path.posAt(o.dist)
      const d = Math.hypot(pos.x - t.x, pos.y - t.y)
      if (d > stats.range) continue
      if (stats.minRange > 0 && d < stats.minRange) continue
      candidates.push(o)
    }
    if (!candidates.length) return null
    const posOf = (o: LiveOrb) => this.path.posAt(o.dist)
    switch (t.targeting) {
      case 'first': return candidates.reduce((a, b) => (a.dist > b.dist ? a : b))
      case 'last': return candidates.reduce((a, b) => (a.dist < b.dist ? a : b))
      case 'close': return candidates.reduce((a, b) => {
        const da = Math.hypot(posOf(a).x - t.x, posOf(a).y - t.y)
        const db = Math.hypot(posOf(b).x - t.x, posOf(b).y - t.y)
        return da < db ? a : b
      })
      case 'strong': return candidates.reduce((a, b) => (a.maxHp > b.maxHp ? a : b))
      case 'weak': return candidates.reduce((a, b) => (a.hp < b.hp ? a : b))
    }
  }

  private fireTower(t: PlacedTower, dt: number) {
    const stats = this.statsFor(t)
    const def = stats.def
    if (def.isSupport) return
    if (def.isFarm) {
      t.farmTimer += dt
      const interval = 3 / Math.max(0.2, 1 + (stats.rate > 0 ? stats.rate : 0))
      if (t.farmTimer >= interval) {
        t.farmTimer = 0
        const pay = Math.floor(stats.farmIncome)
        this.gold += pay
        this.fx.push({
          x: t.x, y: t.y - 30, vx: 0, vy: -20,
          life: 0.7, maxLife: 0.7, color: '#ffd54f', r: 0, text: `+$${pay}`,
        })
      }
      return
    }

    t.cooldown -= dt
    if (t.cooldown > 0) return
    const target = this.pickTarget(t, stats)
    if (!target) return

    const tpos = this.path.posAt(target.dist)
    t.angle = Math.atan2(tpos.y - t.y, tpos.x - t.x)
    const shots = 1 + stats.extraShots
    const rate = Math.max(0.15, stats.rate)
    t.cooldown = 1 / rate

    if (def.isPulse) {
      // AOE pulse
      for (let s = 0; s < shots; s++) {
        for (const o of [...this.orbs]) {
          if (o.camo && !stats.camo) continue
          const p = this.path.posAt(o.dist)
          if (Math.hypot(p.x - t.x, p.y - t.y) <= stats.range) {
            const dead = this.damageOrb(o, stats.dmg, { lead: stats.lead, bomb: false, freeze: 0, slow: 0 })
            if (dead) this.orbs = this.orbs.filter((x) => x.uid !== o.uid)
          }
        }
      }
      this.fx.push({ x: t.x, y: t.y, vx: 0, vy: 0, life: 0.25, maxLife: 0.25, color: 'rgba(46,125,50,0.35)', r: stats.range })
      return
    }

    if (def.isTrap) {
      const closest = this.path.closestDist(t.x, t.y)
      if (closest.dist < stats.range + 40) {
        for (let s = 0; s < shots; s++) {
          const pd = Math.min(this.path.totalLength - 1, closest.pathDist + s * 30)
          const p = this.path.posAt(pd)
          this.spikes.push({
            uid: this.nextUid++,
            x: p.x, y: p.y,
            hits: 5 + stats.pierce,
            dmg: stats.dmg,
            lead: stats.lead,
          })
        }
      }
      return
    }

    if (def.isBeam) {
      for (let s = 0; s < shots; s++) {
        const ang = t.angle + (s - (shots - 1) / 2) * 0.15
        // instant tick damage along beam
        let best: LiveOrb | null = null
        let bestD = Infinity
        for (const o of this.orbs) {
          if (o.camo && !stats.camo) continue
          const p = this.path.posAt(o.dist)
          const dx = p.x - t.x
          const dy = p.y - t.y
          const dist = Math.hypot(dx, dy)
          if (dist > stats.range) continue
          const dot = (dx * Math.cos(ang) + dy * Math.sin(ang)) / dist
          if (dot < 0.95) continue
          if (dist < bestD) { bestD = dist; best = o }
        }
        if (best) {
          const dead = this.damageOrb(best, stats.dmg, { lead: stats.lead, bomb: false, freeze: 0, slow: 0 })
          if (dead) this.orbs = this.orbs.filter((x) => x.uid !== best!.uid)
        }
        this.projectiles.push({
          uid: this.nextUid++,
          x: t.x, y: t.y,
          vx: Math.cos(ang) * stats.range,
          vy: Math.sin(ang) * stats.range,
          dmg: 0, pierce: 0, splash: 0, slow: 0, freeze: 0,
          lead: stats.lead, camo: stats.camo, life: 0.08,
          kind: 'beam', towerUid: t.uid, hit: new Set(),
        })
      }
      return
    }

    if (def.isRadial) {
      for (let s = 0; s < 8; s++) {
        const ang = (s / 8) * Math.PI * 2 + t.angle
        this.projectiles.push({
          uid: this.nextUid++,
          x: t.x, y: t.y,
          vx: Math.cos(ang) * 320,
          vy: Math.sin(ang) * 320,
          dmg: stats.dmg, pierce: stats.pierce, splash: 0,
          slow: 0, freeze: 0, lead: stats.lead, camo: stats.camo,
          life: stats.range / 320,
          kind: 'tack', towerUid: t.uid, hit: new Set(),
        })
      }
      return
    }

    // standard / bomb / frost / glue / chain / lob / blade
    for (let s = 0; s < shots; s++) {
      const ang = t.angle + (s - (shots - 1) / 2) * 0.12
      const speed = def.isLob ? 280 : def.isBomb ? 260 : 400
      let kind: Projectile['kind'] = 'dart'
      if (def.isBomb || def.isLob) kind = def.isLob ? 'shell' : 'bomb'
      else if (def.isFrost) kind = 'bolt'
      else if (def.isGlue) kind = 'glue'
      else if (def.isChain) kind = 'bolt'
      else if (def.id === 'gyreblade') kind = 'blade'

      this.projectiles.push({
        uid: this.nextUid++,
        x: t.x, y: t.y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        dmg: Math.max(0, stats.dmg),
        pierce: stats.pierce + (kind === 'blade' ? 2 : 0),
        splash: stats.splash,
        slow: stats.slow,
        freeze: def.isFrost ? 0.8 + stats.slow : 0,
        lead: stats.lead,
        camo: stats.camo,
        life: def.isLob ? 2.5 : (stats.range / speed) * 1.2,
        kind,
        towerUid: t.uid,
        chainLeft: def.isChain ? stats.chain : 0,
        hit: new Set(),
      })
    }
  }

  private updateProjectiles(dt: number) {
    const next: Projectile[] = []
    for (const p of this.projectiles) {
      p.life -= dt
      if (p.life <= 0) continue
      if (p.kind === 'beam') {
        next.push(p)
        continue
      }
      p.x += p.vx * dt
      p.y += p.vy * dt

      let dead = false
      for (const o of [...this.orbs]) {
        if (p.hit.has(o.uid)) continue
        if (o.camo && !p.camo) continue
        const op = this.path.posAt(o.dist)
        const r = ORB_DEFS[o.kind].r
        if (Math.hypot(op.x - p.x, op.y - p.y) > r + 8) continue
        p.hit.add(o.uid)

        if (p.splash > 0) {
          for (const o2 of [...this.orbs]) {
            if (o2.camo && !p.camo) continue
            const op2 = this.path.posAt(o2.dist)
            if (Math.hypot(op2.x - op.x, op2.y - op.y) <= p.splash) {
              const killed = this.damageOrb(o2, p.dmg, {
                lead: p.lead,
                bomb: p.kind === 'bomb' || p.kind === 'shell',
                freeze: p.freeze,
                slow: p.slow,
              })
              if (killed) this.orbs = this.orbs.filter((x) => x.uid !== o2.uid)
            }
          }
          if (this.shakeEnabled) this.shake = Math.max(this.shake, 4)
          dead = true
        } else {
          const killed = this.damageOrb(o, p.dmg || (p.kind === 'glue' ? 0 : 1), {
            lead: p.lead,
            bomb: false,
            freeze: p.freeze,
            slow: p.slow,
          })
          if (killed) this.orbs = this.orbs.filter((x) => x.uid !== o.uid)

          if (p.chainLeft && p.chainLeft > 0) {
            // chain to nearby
            let best: LiveOrb | null = null
            let bestD = 120
            for (const o2 of this.orbs) {
              if (p.hit.has(o2.uid)) continue
              if (o2.camo && !p.camo) continue
              const op2 = this.path.posAt(o2.dist)
              const d = Math.hypot(op2.x - op.x, op2.y - op.y)
              if (d < bestD) { bestD = d; best = o2 }
            }
            if (best) {
              const bp = this.path.posAt(best.dist)
              p.x = op.x
              p.y = op.y
              const dx = bp.x - op.x
              const dy = bp.y - op.y
              const len = Math.hypot(dx, dy) || 1
              p.vx = (dx / len) * 500
              p.vy = (dy / len) * 500
              p.chainLeft--
              p.life = Math.max(p.life, 0.3)
            } else {
              p.pierce--
            }
          } else {
            p.pierce--
          }
        }
        if (p.pierce <= 0) { dead = true; break }
      }
      if (!dead && p.x > -50 && p.x < W + 50 && p.y > -50 && p.y < H + 50) next.push(p)
    }
    this.projectiles = next
  }

  private updateSpikes() {
    const next: SpikePile[] = []
    for (const s of this.spikes) {
      let hits = s.hits
      for (const o of [...this.orbs]) {
        if (hits <= 0) break
        const op = this.path.posAt(o.dist)
        if (Math.hypot(op.x - s.x, op.y - s.y) > 18) continue
        const killed = this.damageOrb(o, s.dmg, { lead: s.lead, bomb: false, freeze: 0, slow: 0 })
        if (killed) this.orbs = this.orbs.filter((x) => x.uid !== o.uid)
        hits--
      }
      if (hits > 0) next.push({ ...s, hits })
    }
    this.spikes = next
  }

  update(dtFrame: number) {
    if (this.paused || this.defeated) return
    const steps = Math.min(3, this.speed)
    for (let s = 0; s < steps; s++) {
      this.tick(DT)
    }
    void dtFrame
  }

  private tick(dt: number) {
    if (this.won && !this.freeplay) return

    // spawn
    if (this.roundActive) {
      this.roundTime += dt
      while (this.spawnQueue.length && this.spawnQueue[0].at <= this.roundTime) {
        const sp = this.spawnQueue.shift()!
        this.spawnOrb(sp.kind, sp.camo, sp.regen)
      }
    }

    // move orbs
    const leaked: number[] = []
    for (const o of this.orbs) {
      if (o.frozenT > 0) {
        o.frozenT -= dt
        continue
      }
      const def = ORB_DEFS[o.kind]
      let spd = def.speed
      if (o.slowT > 0) {
        spd *= 1 - Math.min(0.85, o.slow)
        o.slowT -= dt
      }
      o.dist += spd * dt
      if (o.regen) {
        o.regenCd -= dt
        if (o.regenCd <= 0 && o.hp < o.maxHp) {
          o.hp = Math.min(o.maxHp, o.hp + 1)
          o.regenCd = 1.2
        }
      }
      if (o.dist >= this.path.totalLength) leaked.push(o.uid)
    }
    if (leaked.length) {
      let totalLoss = 0
      let leakX = W / 2
      let leakY = H / 2
      for (const id of leaked) {
        const o = this.orbs.find((x) => x.uid === id)
        if (!o) continue
        const def = ORB_DEFS[o.kind]
        // BTD6-like: leak costs lives equal to remaining HP (layer/RBE proxy), bosses hurt more
        const loss = def.isBoss
          ? Math.max(25, Math.ceil(o.hp / 8))
          : Math.max(1, Math.ceil(o.hp))
        totalLoss += loss
        this.lives -= loss
        const p = this.path.posAt(Math.min(o.dist, this.path.totalLength))
        leakX = p.x
        leakY = p.y
      }
      this.orbs = this.orbs.filter((o) => !leaked.includes(o.uid))
      if (this.shakeEnabled) this.shake = Math.min(18, 8 + totalLoss)
      if (totalLoss > 0) {
        this.fx.push({
          x: leakX, y: leakY - 20, vx: 0, vy: -40,
          life: 1.4, maxLife: 1.4, color: '#ff1744', r: 0,
          text: `−${totalLoss} ♥`,
        })
      }
      this.snapshot()
      if (this.lives <= 0) {
        this.lives = 0
        this.defeated = true
        this.cb.onDefeat()
        return
      }
    }

    for (const t of this.towers) this.fireTower(t, dt)
    this.updateProjectiles(dt)
    this.updateSpikes()

    // fx
    this.fx = this.fx.filter((f) => {
      f.life -= dt
      f.x += f.vx * dt
      f.y += f.vy * dt
      return f.life > 0
    })
    this.shake *= 0.9
    if (this.shake < 0.2) this.shake = 0

    // round end (successful clear only — defeat returns earlier)
    if (this.roundActive && this.spawnQueue.length === 0 && this.orbs.length === 0) {
      this.roundActive = false
      this.betweenRounds = true
      this.awardEndOfRoundIncome()
      // knowledge perk: extra uncapped interest on top of base EOR interest
      if (this.knowledge.interest > 0) {
        this.gold += Math.floor(this.gold * this.knowledge.interest)
      }
      if (!this.freeplay && this.round >= this.maxRounds) {
        this.won = true
        const flawless = this.lives >= this.startingLives
        let coins = this.difficulty === 'easy' ? 10 : this.difficulty === 'medium' ? 20 : 35
        if (this.doubleCash) coins += 25
        this.cb.onWin(coins, flawless)
      } else if (this.autoStart) {
        this.autoCountdown = 1.2
      }
      this.snapshot()
    }

    if (this.betweenRounds && this.autoStart && this.autoCountdown > 0 && !this.won) {
      this.autoCountdown -= dt
      if (this.autoCountdown <= 0) this.startRound()
    }

    if (this.gold > 10000) this.cb.onStat('gold10k')

    this.saveAcc += dt
    if (this.saveAcc > 4) {
      this.saveAcc = 0
      this.snapshot()
    }
  }

  continueFreeplay() {
    this.freeplay = true
    this.won = false
    this.betweenRounds = true
    this.roundActive = false
    if (this.autoStart) this.autoCountdown = 1.0
    this.snapshot()
  }


  /** BTD6-style end-of-round income: flat bonus + capped interest. Not called on defeat. */
  private awardEndOfRoundIncome() {
    // Flat + interest are NOT doubled by Double Cash (DC is pop-only)
    const roundBonus = 100 + this.round
    this.gold += roundBonus

    const interestCap = 200
    const interest = Math.min(Math.floor(this.gold * 0.1), interestCap)
    this.gold += interest

    // Floating HUD so the player sees end-of-round income
    const cx = W / 2
    const cy = H * 0.28
    this.fx.push({
      x: cx, y: cy, vx: 0, vy: -28,
      life: 2.2, maxLife: 2.2, color: '#ffd54f', r: 0,
      text: `Round bonus +$${roundBonus}`,
    })
    if (interest > 0) {
      this.fx.push({
        x: cx, y: cy + 36, vx: 0, vy: -28,
        life: 2.2, maxLife: 2.2, color: '#81c784', r: 0,
        text: `Interest +$${interest}`,
      })
    }
  }

  snapshot() {
    const snap: RunSnapshot = {
      mapId: this.mapId,
      difficulty: this.difficulty,
      doubleCash: this.doubleCash,
      gold: this.gold,
      lives: this.lives,
      round: this.round,
      freeplay: this.freeplay,
      freeplayExtra: this.freeplayExtra,
      towers: this.towers.map((t) => ({
        ...t,
        pathTiers: [...t.pathTiers] as [number, number, number],
      })),
      won: this.won,
      nextTowerUid: this.nextUid,
    }
    this.cb.onAutosave(snap)
  }

  adminSkipRound() {
    this.spawnQueue = []
    this.orbs = []
    this.roundActive = true
  }

  adminGold(n: number) { this.gold += n }
  adminLives() { this.lives = 9999 }
}
