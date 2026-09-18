import { useEffect, useRef, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { TOWERS, TOWER_BY_ID } from '../data/towers'
import { DIFFICULTIES } from '../data/difficulties'
import type { DifficultyId, TowerId } from '../data/types'
import { GameEngine } from '../engine/GameEngine'
import { computeView, renderGame, screenToWorld } from '../engine/render'
import { Pressable } from '../components/Pressable'
import { TowerPortrait } from '../components/TowerPortrait'
import { awardWin, useMetaStore } from '../store/metaStore'

export function Play() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as {
    mapId?: string
    difficulty?: DifficultyId
    continue?: boolean
  }

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engRef = useRef<GameEngine | null>(null)
  const viewRef = useRef({ scale: 1, ox: 0, oy: 0 })
  const [, bump] = useState(0)
  const force = useCallback(() => bump((n) => n + 1), [])

  const [overlay, setOverlay] = useState<'none' | 'victory' | 'defeat'>('none')
  const [coinsEarned, setCoinsEarned] = useState(0)
  const [selectedTray, setSelectedTray] = useState<TowerId | null>(null)
  const matchGroves = useRef(0)

  const meta = useMetaStore

  useEffect(() => {
    const settings = meta.getState().settings
    const knowledge = meta.getState().knowledge
    let mapId = state.mapId ?? 'meadow'
    let difficulty: DifficultyId = state.difficulty ?? 'easy'
    let snap = null as ReturnType<typeof meta.getState>['run']

    if (state.continue && meta.getState().run) {
      snap = meta.getState().run
      mapId = snap!.mapId
      difficulty = snap!.difficulty
    }

    const eng = new GameEngine(
      mapId,
      difficulty,
      snap ? snap.doubleCash : settings.doubleCash,
      knowledge,
      settings.autoStart,
      settings.shake,
      {
        onWin: (coins, flawless) => {
          const earned = awardWin(
            eng.mapId,
            eng.difficulty,
            eng.doubleCash,
            flawless,
            eng.round,
          )
          setCoinsEarned(earned)
          setOverlay('victory')
          force()
        },
        onDefeat: () => {
          setOverlay('defeat')
          meta.getState().clearRun()
          force()
        },
        onPop: () => {
          meta.getState().recordPop()
        },
        onStat: (key) => {
          if (key === 'tower') {
            /* handled on place */
          }
          if (key === 'grove') {
            matchGroves.current++
            if (matchGroves.current >= 3) meta.getState().tryAchievement('three_groves')
          }
          if (key === 'tier4') meta.getState().recordTier4()
          if (key === 'hull') meta.getState().recordHull()
          if (key === 'apex') meta.getState().recordApex()
          if (key === 'gold10k') meta.getState().recordGold(eng.gold)
          if (key === 'pop') { /* pops via onPop */ }
        },
        onAutosave: (s) => {
          meta.getState().saveRun(s)
          meta.getState().recordGold(s.gold)
          if (s.freeplay) meta.getState().recordFreeplay(s.round)
        },
      },
      snap,
    )
    engRef.current = eng
    meta.getState().requestPersist()
    force()

    let raf = 0
    let last = performance.now()
    let prevHud = ''
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      eng.update(dt)
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')!
        renderGame(ctx, eng, viewRef.current)
      }
      // Keep React HUD in sync — lives/gold/round change in the engine every frame
      const hudKey = [
        eng.lives, eng.gold, eng.round, eng.paused ? 1 : 0, eng.speed,
        eng.roundActive ? 1 : 0, eng.betweenRounds ? 1 : 0, eng.orbs.length,
        eng.autoCountdown.toFixed(1), eng.defeated ? 1 : 0, eng.won ? 1 : 0,
      ].join('|')
      if (hudKey !== prevHud) {
        prevHud = hudKey
        force()
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const resize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const parent = canvas.parentElement!
      canvas.width = Math.floor(parent.clientWidth * devicePixelRatio)
      canvas.height = Math.floor(parent.clientHeight * devicePixelRatio)
      viewRef.current = computeView(canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      eng.snapshot()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const eng = engRef.current

  const onCanvasPointer = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    const eng = engRef.current
    if (!canvas || !eng) return
    const world = screenToWorld(e.clientX, e.clientY, canvas, viewRef.current)

    if (eng.placing) {
      eng.placePos = world
      eng.placeValid = eng.canPlace(world.x, world.y)
      if (e.type === 'pointerup' || e.type === 'pointerdown') {
        if (e.type === 'pointerup' && eng.placeValid) {
          const id = eng.placing
          if (eng.tryPlace(id, world.x, world.y)) {
            meta.getState().recordTower(id)
            setSelectedTray(null)
          }
        }
      }
      force()
      return
    }

    if (e.type === 'pointerup' || e.type === 'click') {
      let hit: number | null = null
      for (const t of eng.towers) {
        if (Math.hypot(t.x - world.x, t.y - world.y) < 28) hit = t.uid
      }
      eng.selectedTowerUid = hit
      force()
    }
  }

  const onCanvasMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    const eng = engRef.current
    if (!canvas || !eng || !eng.placing) return
    const world = screenToWorld(e.clientX, e.clientY, canvas, viewRef.current)
    eng.placePos = world
    eng.placeValid = eng.canPlace(world.x, world.y)
  }

  const selected = eng?.towers.find((t) => t.uid === eng.selectedTowerUid)

  return (
    <div className="screen play-screen" style={{ display: 'flex', flexDirection: 'column', padding: 0, background: '#111', overflow: 'hidden' }}>
      {/* HUD top */}
      <div className="play-hud" style={{
        display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
        padding: '6px 8px', background: 'linear-gradient(180deg,#5d4037,#3e2723)',
        zIndex: 5,
      }}>
        <Pill color="#e53935">♥ {eng?.lives ?? 0}</Pill>
        <Pill color="#f9a825">$ {eng?.gold ?? 0}</Pill>
        {eng?.doubleCash && <Pill color="#ff6f00">2×</Pill>}
        <Pill color="#42a5f5">R {eng?.round ?? 0}{eng?.freeplay ? '+' : `/${eng?.maxRounds ?? 0}`}</Pill>
        <div style={{ flex: 1 }} />
        <Pressable className="btn-wood" style={{ padding: '6px 10px', fontSize: 13 }} onPress={() => {
          if (!eng) return
          eng.paused = !eng.paused
          force()
        }}>{eng?.paused ? '▶' : '❚❚'}</Pressable>
        {([1, 2, 3] as const).map((s) => (
          <Pressable
            key={s}
            className="btn-wood"
            style={{
              padding: '6px 10px', fontSize: 13,
              outline: eng?.speed === s ? '2px solid #ffd54f' : undefined,
            }}
            onPress={() => { if (eng) { eng.speed = s; force() } }}
          >{s}×</Pressable>
        ))}
        <Pressable
          className="btn-wood"
          style={{ padding: '6px 10px', fontSize: 12 }}
          onPress={() => {
            if (!eng) return
            eng.autoStart = !eng.autoStart
            meta.getState().setSetting('autoStart', eng.autoStart)
            force()
          }}
        >{eng?.autoStart ? 'Auto' : 'Hold'}</Pressable>
        <Pressable className="btn-wood" style={{ padding: '6px 10px', fontSize: 13 }} onPress={() => navigate('/')}>⌂</Pressable>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
          onPointerDown={onCanvasPointer}
          onPointerUp={onCanvasPointer}
          onPointerMove={onCanvasMove}
        />
        {/* GO button */}
        <Pressable
          className="play-go"
          onPress={() => { engRef.current?.startRound(); force() }}
          disabled={!!eng?.roundActive || (!!eng?.won && !eng.freeplay)}
          style={{
            position: 'absolute', right: 12, bottom: 12,
            width: 72, height: 72, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #81c784, #2e7d32)',
            border: '5px solid #ffd54f',
            boxShadow: '0 6px 0 #f9a825, 0 10px 20px #0008',
            color: '#fff', fontWeight: 900, fontSize: 20,
            opacity: eng?.roundActive ? 0.45 : 1,
          }}
        >
          GO
        </Pressable>
      </div>

      {/* Selected tower panel */}
      {selected && eng && (
        <div className="play-upgrade" style={{
          background: '#4e342e', color: '#fff', padding: '8px',
          display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '42%',
          overflow: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>{TOWER_BY_ID[selected.defId].name} [{selected.pathTiers.join('/')}]</strong>
            <div style={{ display: 'flex', gap: 6 }}>
              <Pressable className="btn-wood" style={{ padding: '6px 10px', fontSize: 12 }}
                onPress={() => { eng.cycleTargeting(selected.uid); force() }}>
                {selected.targeting}
              </Pressable>
              <Pressable className="btn-wood" style={{ padding: '6px 10px', fontSize: 12, background: '#c62828' }}
                onPress={() => { eng.sell(selected.uid); force() }}>
                Sell ${Math.floor(selected.spent * eng.knowledge.sellRate)}
              </Pressable>
              <Pressable className="btn-wood" style={{ padding: '6px 10px', fontSize: 12 }}
                onPress={() => { eng.selectedTowerUid = null; force() }}>✕</Pressable>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {([0, 1, 2] as const).map((p) => {
              const def = TOWER_BY_ID[selected.defId]
              const pathNames = ['DAMAGE', 'TEMPO', 'SYNERGY']
              return (
                <div key={p} style={{ background: '#3e2723', borderRadius: 10, padding: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#ffd54f', marginBottom: 4 }}>{pathNames[p]}</div>
                  {def.paths[p].map((u, ti) => {
                    const owned = selected.pathTiers[p] > ti
                    const next = selected.pathTiers[p] === ti
                    const aff = eng.gold >= u.cost
                    return (
                      <Pressable
                        key={ti}
                        disabled={owned || !next}
                        onPress={() => { eng.tryUpgrade(selected.uid, p); force() }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          marginBottom: 4, padding: '6px',
                          borderRadius: 8, border: '2px solid #5d4037',
                          background: owned ? '#2e7d32' : next && aff ? '#f9a825' : '#5d4037',
                          color: owned || (next && aff) ? '#fff' : '#bbb',
                          fontSize: 11, fontWeight: 700, opacity: !owned && !next ? 0.5 : 1,
                        }}
                      >
                        <div>{owned ? '✓ ' : ''}{u.name}</div>
                        <div style={{ fontWeight: 600, opacity: 0.85 }}>{owned ? 'Owned' : `$${u.cost}`}</div>
                      </Pressable>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tower tray */}
      <div className="play-tray" style={{
        display: 'flex', gap: 6, overflowX: 'auto',
        padding: '8px 8px calc(8px + var(--safe-bottom))',
        background: 'linear-gradient(180deg,#8d6e63,#5d4037)',
      }}>
        {TOWERS.map((t) => {
          const cost = eng?.towerCost(t.id) ?? t.cost
          const can = (eng?.gold ?? 0) >= cost
          const active = selectedTray === t.id
          return (
            <Pressable
              key={t.id}
              onPress={() => {
                if (!eng) return
                if (active) {
                  eng.placing = null
                  setSelectedTray(null)
                } else {
                  eng.placing = t.id
                  eng.selectedTowerUid = null
                  setSelectedTray(t.id)
                }
                force()
              }}
              style={{
                flex: '0 0 auto',
                width: 76,
                padding: '6px 4px',
                borderRadius: 12,
                background: active ? '#ffd54f' : can ? '#6d4c41' : '#3e2723',
                border: '2px solid #3e2723',
                color: active ? '#3e2723' : '#fff',
                opacity: can || active ? 1 : 0.55,
              }}
            >
              <TowerPortrait id={t.id} size={40} />
              <div style={{ fontSize: 10, fontWeight: 800, lineHeight: 1.1 }}>{t.name}</div>
              <div style={{ fontSize: 11, fontWeight: 700 }}>${cost}</div>
            </Pressable>
          )
        })}
      </div>

      {/* Victory */}
      {overlay === 'victory' && (
        <Overlay>
          <h2 style={{ margin: '0 0 8px', color: '#2e7d32' }}>Victory!</h2>
          <p style={{ margin: '0 0 12px' }}>You earned <strong>{coinsEarned}</strong> coins.</p>
          {eng?.doubleCash && <p style={{ color: '#e65100', fontWeight: 800 }}>Double Cash bonus applied!</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Pressable className="btn-green" style={{ padding: 14, fontSize: 18 }} onPress={() => {
              engRef.current?.continueFreeplay()
              setOverlay('none')
              force()
            }}>Continue Freeplay</Pressable>
            <Pressable className="btn-wood" style={{ padding: 12 }} onPress={() => {
              meta.getState().clearRun()
              navigate('/play', { replace: true, state: { mapId: eng?.mapId, difficulty: eng?.difficulty } })
              window.location.reload()
            }}>Restart</Pressable>
            <Pressable className="btn-wood" style={{ padding: 12 }} onPress={() => {
              meta.getState().clearRun()
              navigate('/')
            }}>Home</Pressable>
          </div>
        </Overlay>
      )}

      {/* Defeat */}
      {overlay === 'defeat' && (
        <Overlay>
          <h2 style={{ margin: '0 0 8px', color: '#c62828' }}>Defeat</h2>
          <p>The orbs breached the keep.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            <Pressable className="btn-green" style={{ padding: 14 }} onPress={() => {
              navigate('/play', { replace: true, state: { mapId: eng?.mapId, difficulty: eng?.difficulty } })
              window.location.reload()
            }}>Restart</Pressable>
            <Pressable className="btn-wood" style={{ padding: 12 }} onPress={() => navigate('/')}>Home</Pressable>
          </div>
        </Overlay>
      )}

      {/* Admin bar */}
      {meta.getState().admin && eng && (
        <div style={{
          position: 'absolute', top: 48, left: 8, zIndex: 20,
          display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: '70%',
        }}>
          <Pressable className="btn-wood" style={{ padding: '4px 8px', fontSize: 11 }} onPress={() => { eng.adminGold(5000); force() }}>+$5k</Pressable>
          <Pressable className="btn-wood" style={{ padding: '4px 8px', fontSize: 11 }} onPress={() => { eng.adminLives(); force() }}>∞♥</Pressable>
          <Pressable className="btn-wood" style={{ padding: '4px 8px', fontSize: 11 }} onPress={() => { eng.adminSkipRound(); force() }}>Skip</Pressable>
        </div>
      )}
    </div>
  )
}

function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      background: `linear-gradient(180deg, ${color}dd, ${color})`,
      color: '#fff', fontWeight: 900, fontSize: 14,
      padding: '6px 10px', borderRadius: 999,
      border: '2px solid #0004', textShadow: '0 1px 2px #0008',
    }}>{children}</span>
  )
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 30,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div className="card" style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
        {children}
      </div>
    </div>
  )
}

// silence unused
void DIFFICULTIES
