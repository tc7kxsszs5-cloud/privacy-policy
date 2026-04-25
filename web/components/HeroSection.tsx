'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const HERO_COLORS = [
  '#C9A84C',
  '#ff3020',
  '#fc6c00',
  '#fec500',
  '#4fc96b',
  '#2196F3',
  '#9C27B0',
  '#e6e9ee',
]

export default function HeroSection() {
  const textRef = useRef<HTMLSpanElement>(null)
  const indexRef = useRef(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const DURATION = 2000

    function hexToRgb(hex: string) {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return { r, g, b }
    }

    function lerp(a: number, b: number, t: number) {
      return Math.round(a + (b - a) * t)
    }

    function animate(ts: number) {
      if (!startRef.current) startRef.current = ts
      const progress = Math.min((ts - startRef.current) / DURATION, 1)
      const from = hexToRgb(HERO_COLORS[indexRef.current])
      const to = hexToRgb(HERO_COLORS[(indexRef.current + 1) % HERO_COLORS.length])
      const r = lerp(from.r, to.r, progress)
      const g = lerp(from.g, to.g, progress)
      const b = lerp(from.b, to.b, progress)
      if (textRef.current) {
        textRef.current.style.color = `rgb(${r},${g},${b})`
      }
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        indexRef.current = (indexRef.current + 1) % HERO_COLORS.length
        startRef.current = null
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <Image src="/presale.jpg" alt="hero" fill className="object-cover opacity-25" priority />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-transparent to-[#0a0a0a]" />
      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-32">
        <p className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-6">
          Студия оклейки автомобилей · Москва
        </p>
        <h1 className="text-6xl md:text-8xl font-black leading-none mb-10">
          Создай<br />свой<br />
          <span ref={textRef} style={{ color: '#C9A84C' }}>стиль</span>
        </h1>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/configurator"
            className="bg-[#C9A84C] text-black font-bold px-8 py-4 rounded-2xl text-lg hover:bg-[#b8963e] transition-colors"
          >
            3D Конфигуратор
          </Link>
          <Link
            href="/ai-wrap"
            className="border border-[#C9A84C]/40 text-[#C9A84C] font-bold px-8 py-4 rounded-2xl text-lg hover:border-[#C9A84C] transition-colors"
          >
            AI примерка ✦
          </Link>
          <a
            href="tel:+74954111003"
            className="border border-[#333] text-white font-bold px-8 py-4 rounded-2xl text-lg hover:border-[#555] transition-colors"
          >
            +7 (495) 411-10-03
          </a>
        </div>
        <p className="text-[#555] text-sm mt-6">Ежедневно 10:00 – 20:00 · Москва, ул. Маршала Прошлякова, 14к2</p>
      </div>
    </section>
  )
}
