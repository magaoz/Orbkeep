import type { KnowledgeNode } from './types'

export const KNOWLEDGE: KnowledgeNode[] = [
  // Economy (col 0)
  { id: 'starter_cash', column: 0, row: 0, name: 'Starter Purse', desc: '+50 starting gold', cost: 50, effect: { startGold: 50 } },
  { id: 'interest', column: 0, row: 1, name: 'Round Interest', desc: '+2% gold at round end', cost: 80, prereq: 'starter_cash', effect: { interest: 0.02 } },
  { id: 'veteran_cash', column: 0, row: 2, name: 'Veteran Stash', desc: '+100 starting gold', cost: 120, prereq: 'interest', effect: { startGold: 100 } },
  { id: 'cheap_towers', column: 0, row: 3, name: 'Bulk Discount', desc: 'Towers cost 5% less', cost: 150, prereq: 'veteran_cash', effect: { towerDiscount: 0.05 } },
  { id: 'grove_income', column: 0, row: 4, name: 'Grove Blessing', desc: 'Coin Grove +20% income', cost: 180, prereq: 'cheap_towers', effect: { groveMul: 0.2 } },
  { id: 'pop_bonus', column: 0, row: 5, name: 'Pop Dividend', desc: '+10% cash from pops', cost: 200, prereq: 'grove_income', effect: { cashMul: 0.1 } },

  // Combat (col 1)
  { id: 'extra_lives', column: 1, row: 0, name: 'Iron Heart', desc: '+25 starting lives', cost: 50, effect: { lives: 25 } },
  { id: 'damage_up', column: 1, row: 1, name: 'Sharpened Keep', desc: '+10% tower damage', cost: 100, prereq: 'extra_lives', effect: { dmgMul: 0.1 } },
  { id: 'pierce_up', column: 1, row: 2, name: 'Deep Pierce', desc: '+1 pierce to all towers', cost: 140, prereq: 'damage_up', effect: { pierce: 1 } },
  { id: 'fire_rate', column: 1, row: 3, name: 'War Drums', desc: '+10% fire rate', cost: 160, prereq: 'pierce_up', effect: { rateMul: 0.1 } },
  { id: 'dart_lead', column: 1, row: 4, name: 'Dart Lead Tips', desc: 'Dartkeep pops lead', cost: 120, prereq: 'fire_rate', effect: { dartLead: true } },
  { id: 'global_camo', column: 1, row: 5, name: 'All-Seeing', desc: 'All towers see camo', cost: 250, prereq: 'dart_lead', effect: { globalCamo: true } },

  // Support (col 2)
  { id: 'range_up', column: 2, row: 0, name: 'Longer Arms', desc: '+10% tower range', cost: 60, effect: { rangeMul: 0.1 } },
  { id: 'sell_boost', column: 2, row: 1, name: 'Fair Trade', desc: 'Sell for 80% instead of 70%', cost: 100, prereq: 'range_up', effect: { sellRate: 0.8 } },
  { id: 'start_dart', column: 2, row: 2, name: 'Free Scout', desc: '+1 free Dartkeep credit ($200)', cost: 80, prereq: 'sell_boost', effect: { freeDartGold: 200 } },
  { id: 'xp_lives', column: 2, row: 3, name: 'Steady Guard', desc: '+15 lives', cost: 90, prereq: 'start_dart', effect: { lives: 15 } },
  { id: 'aoe_boost', column: 2, row: 4, name: 'Wider Blast', desc: '+15% splash radius', cost: 150, prereq: 'xp_lives', effect: { splashMul: 0.15 } },
  { id: 'boss_hunter', column: 2, row: 5, name: 'Boss Hunter', desc: '+20% damage vs bosses', cost: 220, prereq: 'aoe_boost', effect: { bossMul: 0.2 } },
]

export function getKnowledge(id: string): KnowledgeNode | undefined {
  return KNOWLEDGE.find((k) => k.id === id)
}
