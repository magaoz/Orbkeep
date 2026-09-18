import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DIFFICULTIES } from '../data/difficulties'
import { MAPS } from '../data/maps'
import type { DifficultyId } from '../data/types'
import { DoubleCashPill } from '../components/DoubleCashPill'
import { Pressable } from '../components/Pressable'
import { useMetaStore } from '../store/metaStore'
import { Path } from '../engine/Path'
import { getMapCanvas } from '../engine/mapArt'
import { useEffect, useRef } from 'react'

export function MapSelect() {
  const navigate = useNavigate()
  const [mapIdx, setMapIdx] = useState(0)
  const [diff, setDiff] = useState<DifficultyId>('easy')
  const doubleCash = useMetaStore((s) => s.settings.doubleCash)
  const medals = useMetaStore((s) => s.medals)
  const map = MAPS[mapIdx]
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const path = new Path(map.waypoints)
    const bg = getMapCanvas(map, path)
    const ctx = c.getContext('2d')!
    const resize = () => {
      const parent = c.parentElement!
      c.width = parent.clientWidth * devicePixelRatio
      c.height = parent.clientHeight * devicePixelRatio
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, c.width, c.height)
      const scale = Math.min(c.width / 1600, c.height / 900)
      const ox = (c.width - 1600 * scale) / 2
      const oy = (c.height - 900 * scale) / 2
      ctx.drawImage(bg, ox, oy, 1600 * scale, 900 * scale)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [map])

  const medal = medals[map.id]

  return (
    <div className="screen maps-screen" style={{ display: 'flex', flexDirection: 'column', background: '#1b5e20', padding: 0, overflow: 'hidden' }}>
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        <Pressable
          onPress={() => navigate('/')}
          className="btn-wood"
          style={{
            position: 'absolute',
            top: 'calc(8px + var(--safe-top))',
            left: 'calc(8px + var(--safe-left))',
            padding: '8px 14px',
            zIndex: 2,
          }}
        >
          ← Home
        </Pressable>
        <div className="card" style={{
          position: 'absolute', top: 'calc(8px + var(--safe-top))', left: '50%', transform: 'translateX(-50%)',
          padding: '6px 16px', zIndex: 2, whiteSpace: 'nowrap',
        }}>
          <div style={{ fontWeight: 900, fontSize: 16, color: '#5d4037' }}>{map.name}</div>
          <div style={{ fontSize: 11, color: '#6d4c41' }}>
            {medal?.easy ? '🟢' : '⚪'} {medal?.medium ? '🟡' : '⚪'} {medal?.hard ? '🔴' : '⚪'}
            {medal?.doubleCash ? ' 2×' : ''}
          </div>
        </div>

        {/* difficulty orbs */}
        <div style={{
          position: 'absolute',
          right: 'calc(8px + var(--safe-right))',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 2,
        }}>
          {DIFFICULTIES.map((d) => (
            <Pressable
              key={d.id}
              onPress={() => setDiff(d.id)}
              style={{
                width: 58, height: 58, borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, #fff8, ${d.color})`,
                border: diff === d.id ? '4px solid #fff' : '4px solid #0004',
                boxShadow: diff === d.id ? '0 0 0 3px #ffd54f, 0 6px 12px #0006' : '0 4px 8px #0004',
                color: '#fff', fontWeight: 900, fontSize: 10,
                textShadow: '0 1px 2px #000a',
              }}
            >
              {d.name}
            </Pressable>
          ))}
        </div>
      </div>

      <div className="maps-landscape-bar" style={{
        background: 'linear-gradient(180deg,#a1887f,#6d4c41)',
        padding: '10px 12px calc(10px + var(--safe-bottom))',
        paddingLeft: 'calc(12px + var(--safe-left))',
        paddingRight: 'calc(12px + var(--safe-right))',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <DoubleCashPill compact />
          <Pressable
            className="btn-green"
            onPress={() => navigate('/play', { state: { mapId: map.id, difficulty: diff } })}
            style={{ padding: '14px 36px', fontSize: 22, flex: 1, minWidth: 140 }}
          >
            {doubleCash ? 'PLAY 2×' : 'PLAY'}
          </Pressable>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {MAPS.map((m, i) => (
            <Pressable
              key={m.id}
              onPress={() => setMapIdx(i)}
              style={{
                flex: '0 0 auto',
                padding: '8px 12px',
                borderRadius: 12,
                background: i === mapIdx ? '#ffd54f' : '#5d4037',
                color: i === mapIdx ? '#3e2723' : '#fff',
                border: '2px solid #3e2723',
                fontWeight: 800,
                fontSize: 12,
                whiteSpace: 'nowrap',
              }}
            >
              {m.name}
            </Pressable>
          ))}
        </div>
      </div>
    </div>
  )
}
