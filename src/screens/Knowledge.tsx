import { useNavigate } from 'react-router-dom'
import { KNOWLEDGE } from '../data/knowledge'
import { CoinBadge } from '../components/CoinBadge'
import { Pressable } from '../components/Pressable'
import { useMetaStore } from '../store/metaStore'

const COLS = ['Economy', 'Combat', 'Support']

export function Knowledge() {
  const navigate = useNavigate()
  const coins = useMetaStore((s) => s.coins)
  const owned = useMetaStore((s) => s.knowledge)
  const buy = useMetaStore((s) => s.buyKnowledge)

  return (
    <div className="screen knowledge-landscape" style={{
      background: 'linear-gradient(180deg,#4a148c,#1a237e)',
      padding: 12,
      overflow: 'auto',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
        gap: 8, flexWrap: 'wrap',
      }}>
        <Pressable className="btn-wood" style={{ padding: '8px 14px' }} onPress={() => navigate('/')}>← Home</Pressable>
        <h2 style={{ margin: 0, color: '#ffd54f', textShadow: '0 2px 0 #e65100' }}>Knowledge</h2>
        <CoinBadge amount={coins} />
      </div>
      <p style={{ color: '#e1bee7', textAlign: 'center', marginTop: 0, marginBottom: 10, fontSize: 13 }}>
        Spend coins for permanent buffs. Prerequisites required.
      </p>
      <div className="knowledge-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {COLS.map((name, col) => (
          <div key={name}>
            <div style={{ textAlign: 'center', fontWeight: 900, color: '#fff', marginBottom: 8, fontSize: 13 }}>{name}</div>
            {KNOWLEDGE.filter((n) => n.column === col)
              .sort((a, b) => a.row - b.row)
              .map((n) => {
                const isOwned = !!owned[n.id]
                const prereqOk = !n.prereq || owned[n.prereq]
                const can = !isOwned && prereqOk && coins >= n.cost
                return (
                  <Pressable
                    key={n.id}
                    className="knowledge-card"
                    disabled={isOwned || !prereqOk}
                    onPress={() => buy(n.id)}
                    style={{
                      display: 'block', width: '100%', marginBottom: 8,
                      padding: 8, borderRadius: 12, textAlign: 'left',
                      background: isOwned
                        ? 'linear-gradient(180deg,#66bb6a,#2e7d32)'
                        : can
                          ? 'linear-gradient(180deg,#ffe082,#ffb300)'
                          : 'linear-gradient(180deg,#78909c,#455a64)',
                      border: '3px solid #0004',
                      color: isOwned || can ? '#1b1b1b' : '#eee',
                      opacity: !prereqOk && !isOwned ? 0.45 : 1,
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 12 }}>{n.name}</div>
                    <div style={{ fontSize: 10, margin: '4px 0' }}>{n.desc}</div>
                    <div style={{ fontWeight: 800, fontSize: 11 }}>
                      {isOwned ? 'OWNED' : `${n.cost} coins`}
                    </div>
                  </Pressable>
                )
              })}
          </div>
        ))}
      </div>
    </div>
  )
}
