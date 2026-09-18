import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoubleCashPill } from '../components/DoubleCashPill'
import { Pressable } from '../components/Pressable'
import { useMetaStore } from '../store/metaStore'

export function Settings() {
  const navigate = useNavigate()
  const settings = useMetaStore((s) => s.settings)
  const setSetting = useMetaStore((s) => s.setSetting)
  const admin = useMetaStore((s) => s.admin)
  const unlockAdmin = useMetaStore((s) => s.unlockAdmin)
  const taps = useRef(0)

  return (
    <div className="screen" style={{ background: 'linear-gradient(180deg,#546e7a,#263238)', padding: 12, overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Pressable className="btn-wood" style={{ padding: '8px 14px' }} onPress={() => navigate('/')}>← Home</Pressable>
        <h2 style={{ margin: 0, color: '#fff' }}>Settings</h2>
        <div style={{ width: 72 }} />
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {([
          ['sfx', 'Sound Effects'],
          ['music', 'Music'],
          ['shake', 'Screen Shake'],
          ['autoStart', 'Auto-start Rounds'],
        ] as const).map(([k, label]) => (
          <Pressable
            key={k}
            onPress={() => setSetting(k, !settings[k])}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 12, borderRadius: 12, border: '2px solid #8d6e63',
              background: settings[k] ? '#c8e6c9' : '#ffcdd2',
              fontWeight: 800, color: '#3e2723',
            }}
          >
            <span>{label}</span>
            <span>{settings[k] ? 'ON' : 'OFF'}</span>
          </Pressable>
        ))}

        <div>
          <div style={{ fontWeight: 800, marginBottom: 8, color: '#5d4037' }}>Double Cash</div>
          <DoubleCashPill />
        </div>

        <Pressable
          onPress={() => {
            taps.current += 1
            if (taps.current >= 7) {
              unlockAdmin()
              taps.current = 0
            }
          }}
          style={{
            background: 'transparent', border: 'none',
            color: '#8d6e63', fontSize: 12, padding: 8, fontWeight: 700,
          }}
        >
          Orbkeep v1.0.3
        </Pressable>

        {admin && (
          <div style={{ borderTop: '2px dashed #8d6e63', paddingTop: 12 }}>
            <div style={{ fontWeight: 900, color: '#c62828', marginBottom: 8 }}>Admin Unlocked</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Pressable className="btn-wood" style={{ padding: '8px 12px' }}
                onPress={() => useMetaStore.getState().adminAddCoins(500)}>+500 coins</Pressable>
              <Pressable className="btn-wood" style={{ padding: '8px 12px' }}
                onPress={() => useMetaStore.getState().adminAllKnowledge()}>All Knowledge</Pressable>
              <Pressable className="btn-wood" style={{ padding: '8px 12px' }}
                onPress={() => useMetaStore.getState().adminAllMedals()}>All Medals</Pressable>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
