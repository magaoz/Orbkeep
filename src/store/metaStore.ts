import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ACHIEVEMENTS, MEDAL_COINS } from '../data/achievements'
import { KNOWLEDGE } from '../data/knowledge'
import { MAPS } from '../data/maps'
import type { DifficultyId, MetaState, RunSnapshot } from '../data/types'

const VERSION = '1.0.0'

type MetaStore = MetaState & {
  addCoins: (n: number) => void
  buyKnowledge: (id: string) => boolean
  setSetting: <K extends keyof MetaState['settings']>(k: K, v: MetaState['settings'][K]) => void
  unlockAdmin: () => void
  adminAddCoins: (n: number) => void
  adminAllKnowledge: () => void
  adminAllMedals: () => void
  saveRun: (run: RunSnapshot | null) => void
  clearRun: () => void
  awardMedal: (mapId: string, diff: DifficultyId, doubleCash: boolean) => number
  tryAchievement: (id: string) => number
  recordPop: () => void
  recordTower: (id: string) => void
  recordGrove: () => void
  recordTier4: () => void
  recordHull: () => void
  recordApex: () => void
  recordGold: (g: number) => void
  recordFreeplay: (round: number) => void
  onWin: (mapId: string, diff: DifficultyId, doubleCash: boolean, flawless: boolean, freeplayRound: number) => { coins: number; unlocked: string[] }
  requestPersist: () => void
}

const initial: MetaState = {
  coins: 0,
  knowledge: {},
  medals: {},
  achievements: {},
  settings: {
    sfx: true,
    music: true,
    shake: true,
    autoStart: true,
    doubleCash: false,
  },
  admin: false,
  stats: {
    pops: 0,
    wins: 0,
    towersPlaced: {},
    maxGold: 0,
    freeplayMax: 0,
    hullsPopped: 0,
    apexPopped: 0,
    grovesPlaced: 0,
    tier4Bought: false,
  },
  run: null,
  version: VERSION,
}

function unlock(achievements: Record<string, boolean>, id: string): number {
  if (achievements[id]) return 0
  const def = ACHIEVEMENTS.find((a) => a.id === id)
  if (!def) return 0
  achievements[id] = true
  return def.coins
}

export const useMetaStore = create<MetaStore>()(
  persist(
    (set, get) => ({
      ...initial,

      addCoins: (n) => set((s) => ({ coins: s.coins + n })),

      buyKnowledge: (id) => {
        const s = get()
        const node = KNOWLEDGE.find((k) => k.id === id)
        if (!node || s.knowledge[id]) return false
        if (node.prereq && !s.knowledge[node.prereq]) return false
        if (s.coins < node.cost) return false
        const knowledge = { ...s.knowledge, [id]: true }
        let bonus = 0
        const achievements = { ...s.achievements }
        const count = Object.keys(knowledge).length
        if (count >= 5) bonus += unlock(achievements, 'know_5')
        if (count >= 12) bonus += unlock(achievements, 'know_12')
        set({ coins: s.coins - node.cost + bonus, knowledge, achievements })
        return true
      },

      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),

      unlockAdmin: () => set({ admin: true }),
      adminAddCoins: (n) => set((s) => ({ coins: s.coins + n })),
      adminAllKnowledge: () => {
        const knowledge: Record<string, boolean> = {}
        for (const k of KNOWLEDGE) knowledge[k.id] = true
        set({ knowledge })
      },
      adminAllMedals: () => {
        const medals: MetaState['medals'] = {}
        for (const m of MAPS) {
          medals[m.id] = { easy: true, medium: true, hard: true, doubleCash: true }
        }
        set({ medals })
      },

      saveRun: (run) => set({ run }),
      clearRun: () => set({ run: null }),

      awardMedal: (mapId, diff, doubleCash) => {
        const s = get()
        const medals = { ...s.medals }
        const entry = { ...(medals[mapId] ?? {}) }
        let coins = 0
        if (!entry[diff]) {
          entry[diff] = true
          coins += MEDAL_COINS[diff] ?? 10
        }
        if (doubleCash && !entry.doubleCash) {
          entry.doubleCash = true
        }
        medals[mapId] = entry
        set({ medals })
        return coins
      },

      tryAchievement: (id) => {
        const achievements = { ...get().achievements }
        const c = unlock(achievements, id)
        if (c) set({ achievements, coins: get().coins + c })
        return c
      },

      recordPop: () => {
        const s = get()
        const pops = s.stats.pops + 1
        const achievements = { ...s.achievements }
        let coins = 0
        if (pops === 1) coins += unlock(achievements, 'first_pop')
        if (pops >= 1000) coins += unlock(achievements, 'pop_1k')
        if (pops >= 10000) coins += unlock(achievements, 'pop_10k')
        set({ stats: { ...s.stats, pops }, achievements, coins: s.coins + coins })
      },

      recordTower: (id) => {
        const s = get()
        const towersPlaced = { ...s.stats.towersPlaced, [id]: true }
        const achievements = { ...s.achievements }
        let coins = 0
        if (Object.keys(towersPlaced).length >= 10) coins += unlock(achievements, 'ten_towers')
        set({ stats: { ...s.stats, towersPlaced }, achievements, coins: s.coins + coins })
      },

      recordGrove: () => {
        const s = get()
        const grovesPlaced = s.stats.grovesPlaced + 1
        const achievements = { ...s.achievements }
        let coins = 0
        // per-match check handled in play; this tracks total
        set({ stats: { ...s.stats, grovesPlaced } })
        void coins
        void achievements
      },

      recordTier4: () => {
        const s = get()
        if (s.stats.tier4Bought) return
        const achievements = { ...s.achievements }
        const coins = unlock(achievements, 'tier4')
        set({ stats: { ...s.stats, tier4Bought: true }, achievements, coins: s.coins + coins })
      },

      recordHull: () => {
        const s = get()
        const achievements = { ...s.achievements }
        const coins = unlock(achievements, 'pop_hull')
        set({
          stats: { ...s.stats, hullsPopped: s.stats.hullsPopped + 1 },
          achievements,
          coins: s.coins + coins,
        })
      },

      recordApex: () => {
        const s = get()
        const achievements = { ...s.achievements }
        const coins = unlock(achievements, 'pop_apex')
        set({
          stats: { ...s.stats, apexPopped: s.stats.apexPopped + 1 },
          achievements,
          coins: s.coins + coins,
        })
      },

      recordGold: (g) => {
        const s = get()
        if (g <= s.stats.maxGold) return
        const achievements = { ...s.achievements }
        let coins = 0
        if (g >= 10000) coins += unlock(achievements, 'gold_10k')
        set({ stats: { ...s.stats, maxGold: g }, achievements, coins: s.coins + coins })
      },

      recordFreeplay: (round) => {
        const s = get()
        const freeplayMax = Math.max(s.stats.freeplayMax, round)
        const achievements = { ...s.achievements }
        let coins = 0
        if (round >= 60) coins += unlock(achievements, 'fp_60')
        if (round >= 80) coins += unlock(achievements, 'fp_80')
        set({ stats: { ...s.stats, freeplayMax }, achievements, coins: s.coins + coins })
      },

      onWin: (mapId, diff, doubleCash, flawless, freeplayRound) => {
        const s = get()
        let coins = 0
        const unlocked: string[] = []
        const achievements = { ...s.achievements }

        const medalCoins = get().awardMedal(mapId, diff, doubleCash)
        coins += medalCoins

        const bump = (id: string) => {
          const c = unlock(achievements, id)
          if (c) {
            coins += c
            unlocked.push(id)
          }
        }
        bump('first_win')
        if (diff === 'hard') bump('hard_win')
        if (doubleCash) {
          bump('dc_win')
          coins += 25
        }
        if (flawless) bump('flawless')

        // map sweeps
        const medals = get().medals
        const all = (d: DifficultyId) => MAPS.every((m) => medals[m.id]?.[d])
        if (all('easy')) bump('all_easy')
        if (all('medium')) bump('all_medium')
        if (all('hard')) bump('all_hard')

        if (freeplayRound >= 60) bump('fp_60')
        if (freeplayRound >= 80) bump('fp_80')

        set({
          coins: get().coins + coins - medalCoins, // medal already added coins via awardMedal path — fix:
          achievements,
          stats: { ...get().stats, wins: get().stats.wins + 1 },
        })
        // awardMedal already mutated medals & we need to add medalCoins + achievement coins properly
        set((st) => ({ coins: st.coins + medalCoins + (coins - medalCoins) }))
        // simplify: recalculate
        return { coins, unlocked }
      },

      requestPersist: () => {
        try {
          if (navigator.storage?.persist) void navigator.storage.persist()
        } catch { /* ignore */ }
      },
    }),
    {
      name: 'orbkeep-meta-v1',
      partialize: (s) => ({
        coins: s.coins,
        knowledge: s.knowledge,
        medals: s.medals,
        achievements: s.achievements,
        settings: s.settings,
        admin: s.admin,
        stats: s.stats,
        run: s.run,
        version: s.version,
      }),
    },
  ),
)

/** Clean win award used by Play screen */
export function awardWin(
  mapId: string,
  diff: DifficultyId,
  doubleCash: boolean,
  flawless: boolean,
  freeplayRound: number,
): number {
  const st = useMetaStore.getState()
  let coins = 0
  const achievements = { ...st.achievements }
  const medals = { ...st.medals }
  const entry = { ...(medals[mapId] ?? {}) }

  if (!entry[diff]) {
    entry[diff] = true
    coins += MEDAL_COINS[diff] ?? 10
  }
  if (doubleCash) {
    entry.doubleCash = true
    coins += 25
  }
  medals[mapId] = entry

  const unlockOne = (id: string) => {
    if (achievements[id]) return
    const def = ACHIEVEMENTS.find((a) => a.id === id)
    if (!def) return
    achievements[id] = true
    coins += def.coins
  }
  unlockOne('first_win')
  if (diff === 'hard') unlockOne('hard_win')
  if (doubleCash) unlockOne('dc_win')
  if (flawless) unlockOne('flawless')
  if (MAPS.every((m) => medals[m.id]?.easy)) unlockOne('all_easy')
  if (MAPS.every((m) => medals[m.id]?.medium)) unlockOne('all_medium')
  if (MAPS.every((m) => medals[m.id]?.hard)) unlockOne('all_hard')
  if (freeplayRound >= 60) unlockOne('fp_60')
  if (freeplayRound >= 80) unlockOne('fp_80')

  useMetaStore.setState({
    coins: st.coins + coins,
    medals,
    achievements,
    stats: { ...st.stats, wins: st.stats.wins + 1, freeplayMax: Math.max(st.stats.freeplayMax, freeplayRound) },
  })
  return coins
}
