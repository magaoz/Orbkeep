import { useEffect, useRef } from 'react'
import type { TowerId } from '../data/types'
import { paintKeeperPortrait } from '../engine/keeperArt'

export function TowerPortrait({
  id,
  size = 40,
  className,
}: {
  id: TowerId
  size?: number
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    paintKeeperPortrait(c, id)
  }, [id, size])

  return (
    <canvas
      ref={ref}
      className={className}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        display: 'block',
        borderRadius: 10,
        margin: '0 auto',
      }}
      aria-hidden
    />
  )
}
