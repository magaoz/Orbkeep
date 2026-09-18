import { useNavigate } from 'react-router-dom'
import { ACHIEVEMENTS } from '../data/achievements'
import { MAPS } from '../data/maps'
import { CoinBadge } from '../components/CoinBadge'
import { Pressable } from '../components/Pressable'
import { useMetaStore } from '../store/metaStore'

export function Medals() {
  const navigate = useNavigate()
  const medals = useMetaStore((s) => s.medals)
  const achievements = useMetaStore((s) => s.achievements)
  const coins = useMetaStore((s) => s.coins)

  return (
    <div className="screen" style={{ background: 'linear-gradient(180deg,#e65100,#bf360c)', padding: 12, overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Pressable className="btn-wood" style={{ padding: '8px 14px' }} onPress={() => navigate('/')}>← Home</Pressable>
        <h2 style={{ margin: 0, color: '#fff' }}>Medals</h2>
        <CoinBadge amount={coins} />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0, color: '#5d4037' }}>Map Medals</h3>
        {MAPS.map((m) => {
          const med = medals[m.id]
          return (
            <div key={m.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: '1px solid #d7ccc8',
            }}>
              <strong style={{ color: '#4e342e' }}>{m.name}</strong>
              <span style={{ fontSize: 18 }}>
                {med?.easy ? '🟢' : '⚪'} {med?.medium ? '🟡' : '⚪'} {med?.hard ? '🔴' : '⚪'}
                {med?.doubleCash ? ' ⚡' : ''}
              </span>
            </div>
          )
        })}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0, color: '#5d4037' }}>Achievements</h3>
        {ACHIEVEMENTS.map((a) => {
          const done = !!achievements[a.id]
          return (
            <div key={a.id} style={{
              display: 'flex', justifyContent: 'space-between', gap: 8,
              padding: '8px 0', borderBottom: '1px solid #d7ccc8',
              opacity: done ? 1 : 0.55,
            }}>
              <div>
                <div style={{ fontWeight: 800, color: done ? '#2e7d32' : '#5d4037' }}>
                  {done ? '✓ ' : ''}{a.name}
                </div>
                <div style={{ fontSize: 12, color: '#6d4c41' }}>{a.desc}</div>
              </div>
              <div style={{ fontWeight: 900, color: '#f9a825', whiteSpace: 'nowrap' }}>+{a.coins}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
