'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

const COLORS = ['#C9A84C', '#ff3020', '#fc6c00', '#fec500', '#4fc96b', '#2196F3', '#9C27B0', '#e6e9ee']

export default function AssistantStar({ active }: { active?: boolean }) {
  const starRef = useRef<HTMLSpanElement>(null)
  const colorIndex = useRef(0)
  const colorStart = useRef<number | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const COLOR_DURATION = 1800
    const PULSE_DURATION = 700

    function hexToRgb(hex: string) {
      return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
      }
    }
    function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

    function animate(ts: number) {
      if (!colorStart.current) colorStart.current = ts

      // Color cycle
      const ct = Math.min((ts - colorStart.current) / COLOR_DURATION, 1)
      const from = hexToRgb(COLORS[colorIndex.current])
      const to = hexToRgb(COLORS[(colorIndex.current + 1) % COLORS.length])
      const r = Math.round(lerp(from.r, to.r, ct))
      const g = Math.round(lerp(from.g, to.g, ct))
      const b = Math.round(lerp(from.b, to.b, ct))
      const color = `rgb(${r},${g},${b})`

      // Heartbeat pulse: two quick beats then pause
      const tp = (ts % (PULSE_DURATION * 2.5)) / PULSE_DURATION
      let scale: number
      if (tp < 0.3) {
        scale = 1 + Math.sin(tp / 0.3 * Math.PI) * 0.35
      } else if (tp < 0.7) {
        scale = 1 + Math.sin((tp - 0.4) / 0.3 * Math.PI) * 0.2
      } else {
        scale = 1
      }

      if (starRef.current) {
        starRef.current.style.color = color
        starRef.current.style.transform = `scale(${scale})`
        starRef.current.style.textShadow = `0 0 ${8 + scale * 6}px rgba(${r},${g},${b},0.8)`
      }

      if (ct >= 1) {
        colorIndex.current = (colorIndex.current + 1) % COLORS.length
        colorStart.current = null
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <Link href="/assistant" title="AI Ассистент" className="flex items-center justify-center w-10 h-10">
      <span
        ref={starRef}
        className="select-none inline-block"
        style={{ fontSize: 48, lineHeight: 1, color: '#C9A84C' }}
      >
        ✦
      </span>
    </Link>
  )
}
