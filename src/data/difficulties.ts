import type { DifficultyDef } from './types'

export const DIFFICULTIES: DifficultyDef[] = [
  { id: 'easy', name: 'Easy', lives: 200, startGold: 800, rounds: 40, hpMul: 0.85, cashMul: 1, color: '#3ecf5a' },
  { id: 'medium', name: 'Medium', lives: 150, startGold: 650, rounds: 50, hpMul: 1.0, cashMul: 1, color: '#f0c040' },
  { id: 'hard', name: 'Hard', lives: 100, startGold: 500, rounds: 60, hpMul: 1.2, cashMul: 0.9, color: '#e04545' },
]
