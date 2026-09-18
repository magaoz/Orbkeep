import { useNavigate } from 'react-router-dom'
import { CoinBadge } from '../components/CoinBadge'
import { DoubleCashPill } from '../components/DoubleCashPill'
import { Pressable } from '../components/Pressable'
import { useMetaStore } from '../store/metaStore'

/** Visible build stamp — bump when shipping so players know they got the update. */
export const HOME_BUILD_STAMP = 'v1.0.4'

export function Home() {
  const navigate = useNavigate()
  const coins = useMetaStore((s) => s.coins)
  const run = useMetaStore((s) => s.run)

  return (
    <div className="screen home-screen">
      {/* Decorative sky blobs — pointer-events none, never affect layout */}
      <div className="home-deco home-deco-a" aria-hidden />
      <div className="home-deco home-deco-b" aria-hidden />

      <header className="home-top">
        <CoinBadge amount={coins} />
        <div className="home-top-spacer" />
        <span className="home-build" aria-label={`Build ${HOME_BUILD_STAMP}`}>
          {HOME_BUILD_STAMP}
        </span>
        <Pressable
          className="round-btn home-settings"
          onPress={() => navigate('/settings')}
          style={{ background: 'linear-gradient(180deg,#b0bec5,#546e7a)', fontSize: 28 }}
          aria-label="Settings"
        >
          ⚙
        </Pressable>
      </header>

      <main className="home-main">
        <h1 className="title-3d home-title">ORBKEEP</h1>
        <p className="home-tagline">Place keepers. Pop the orbs.</p>

        <Pressable
          className="home-play"
          onPress={() => navigate('/maps')}
        >
          PLAY
        </Pressable>

        <div className="home-actions">
          <DoubleCashPill />
          {run && !run.won && (
            <Pressable
              className="btn-wood home-continue"
              onPress={() => navigate('/play', { state: { continue: true } })}
            >
              Continue Keep — R{run.round}
            </Pressable>
          )}
        </div>
      </main>

      <nav className="home-dock" aria-label="Main menu">
        {[
          { to: '/knowledge', label: 'Knowledge', bg: '#7e57c2', icon: '✦' },
          { to: '/medals', label: 'Medals', bg: '#fb8c00', icon: '🏅' },
          { to: '/install', label: 'Install', bg: '#29b6f6', icon: '⇩' },
          { to: '/settings', label: 'Settings', bg: '#78909c', icon: '⚙' },
        ].map((b) => (
          <Pressable
            key={b.to}
            className="home-dock-item"
            onPress={() => navigate(b.to)}
          >
            <span
              className="round-btn"
              style={{ background: `linear-gradient(180deg, ${b.bg}cc, ${b.bg})` }}
            >
              {b.icon}
            </span>
            <span className="home-dock-label">{b.label}</span>
          </Pressable>
        ))}
      </nav>
    </div>
  )
}
