import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Detailing Time — Студия оклейки автомобилей в Москве',
  description: 'Профессиональная оклейка, тонировка, полировка и детейлинг автомобилей. Москва, ул. Маршала Прошлякова, 14к2. Звоните: +7 (495) 411-10-03',
  keywords: 'оклейка авто, тонировка, детейлинг, PPF, Москва, vinyl wrap',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
