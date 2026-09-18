import type { Vec2 } from '../data/types'

export class Path {
  readonly points: Vec2[]
  readonly cumulative: number[]
  readonly totalLength: number

  constructor(points: Vec2[]) {
    this.points = points
    this.cumulative = [0]
    let total = 0
    for (let i = 1; i < points.length; i++) {
      total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
      this.cumulative.push(total)
    }
    this.totalLength = total
  }

  posAt(dist: number): Vec2 {
    if (dist <= 0) return { ...this.points[0] }
    if (dist >= this.totalLength) return { ...this.points[this.points.length - 1] }
    let lo = 0
    let hi = this.cumulative.length - 1
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1
      if (this.cumulative[mid] <= dist) lo = mid
      else hi = mid
    }
    const a = this.points[lo]
    const b = this.points[hi]
    const segLen = this.cumulative[hi] - this.cumulative[lo]
    const t = segLen > 0 ? (dist - this.cumulative[lo]) / segLen : 0
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
  }

  closestDist(x: number, y: number): { dist: number; pathDist: number } {
    let best = Infinity
    let bestPath = 0
    for (let i = 1; i < this.points.length; i++) {
      const a = this.points[i - 1]
      const b = this.points[i]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const len2 = dx * dx + dy * dy
      let t = len2 > 0 ? ((x - a.x) * dx + (y - a.y) * dy) / len2 : 0
      t = Math.max(0, Math.min(1, t))
      const px = a.x + dx * t
      const py = a.y + dy * t
      const d = Math.hypot(x - px, y - py)
      if (d < best) {
        best = d
        bestPath = this.cumulative[i - 1] + Math.sqrt(len2) * t
      }
    }
    return { dist: best, pathDist: bestPath }
  }

  isOnPath(x: number, y: number, radius = 28): boolean {
    return this.closestDist(x, y).dist < radius
  }
}
