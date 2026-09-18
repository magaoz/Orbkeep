import { useMetaStore } from '../store/metaStore'
import { Pressable } from './Pressable'

export function DoubleCashPill({ compact = false }: { compact?: boolean }) {
  const on = useMetaStore((s) => s.settings.doubleCash)
  const setSetting = useMetaStore((s) => s.setSetting)
  return (
    <Pressable
      onPress={() => setSetting('doubleCash', !on)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: compact ? '8px 14px' : '10px 18px',
        borderRadius: 999,
        border: '3px solid #b8860b',
        background: on
          ? 'linear-gradient(180deg,#ffe082,#ffb300)'
          : 'linear-gradient(180deg,#fff8e1,#ffe0b2)',
        boxShadow: '0 4px 0 #8d6e00, 0 6px 12px rgba(0,0,0,0.25)',
        fontWeight: 800,
        fontSize: compact ? 13 : 15,
        color: '#5d4037',
        cursor: 'pointer',
      }}
    >
      <span style={{
        background: on ? '#e65100' : '#9e9e9e',
        color: '#fff',
        borderRadius: 8,
        padding: '2px 6px',
        fontSize: 12,
      }}>2×</span>
      Double Cash {on ? 'ON' : 'OFF'}
    </Pressable>
  )
}
