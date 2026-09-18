import type { AchievementDef } from './types'

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_pop', name: 'First Pop', desc: 'Pop your first orb', coins: 5 },
  { id: 'first_win', name: 'First Victory', desc: 'Win any map', coins: 25 },
  { id: 'hard_win', name: 'Hard Keep', desc: 'Win on Hard', coins: 50 },
  { id: 'dc_win', name: 'Double Trouble', desc: 'Win with Double Cash', coins: 30 },
  { id: 'flawless', name: 'Flawless', desc: 'Win without losing a life', coins: 40 },
  { id: 'all_easy', name: 'Easy Sweep', desc: 'Beat all maps on Easy', coins: 40 },
  { id: 'all_medium', name: 'Medium Sweep', desc: 'Beat all maps on Medium', coins: 60 },
  { id: 'all_hard', name: 'Hard Sweep', desc: 'Beat all maps on Hard', coins: 100 },
  { id: 'pop_1k', name: 'Pop 1,000', desc: 'Pop 1,000 orbs total', coins: 15 },
  { id: 'pop_10k', name: 'Pop 10,000', desc: 'Pop 10,000 orbs total', coins: 40 },
  { id: 'gold_10k', name: 'Loaded', desc: 'Hold $10,000 in a match', coins: 25 },
  { id: 'ten_towers', name: 'Keeper Collector', desc: 'Place 10 different towers', coins: 30 },
  { id: 'tier4', name: 'Maxed Path', desc: 'Buy a tier-4 upgrade', coins: 20 },
  { id: 'know_5', name: 'Student', desc: 'Unlock 5 Knowledge nodes', coins: 20 },
  { id: 'know_12', name: 'Scholar', desc: 'Unlock 12 Knowledge nodes', coins: 50 },
  { id: 'fp_60', name: 'Freeplay 60', desc: 'Reach freeplay round 60+', coins: 25 },
  { id: 'fp_80', name: 'Freeplay 80', desc: 'Reach freeplay round 80+', coins: 50 },
  { id: 'three_groves', name: 'Grove Trio', desc: 'Place 3 Coin Groves in one match', coins: 20 },
  { id: 'pop_hull', name: 'Hullbreaker', desc: 'Pop an Iron Hull', coins: 15 },
  { id: 'pop_apex', name: 'Apex Slayer', desc: 'Pop an Apex Keep', coins: 40 },
]

export const MEDAL_COINS: Record<string, number> = {
  easy: 10,
  medium: 20,
  hard: 35,
}
