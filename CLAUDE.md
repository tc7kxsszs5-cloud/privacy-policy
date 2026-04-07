# CarWrap — приложение для оклейки автомобилей

## Стек
- **React Native + Expo** (~55) с expo-router
- **Supabase** — база данных, авторизация
- **tRPC + Hono** — типизированный API (backend в `/backend/`)
- **Vercel** — деплой веб-версии
- **Zustand** — стейт менеджер
- **React Native Reanimated + Gesture Handler** — анимации и жесты
- **3D GLB viewer** — просмотр автомобилей в 3D
- **TypeScript**

## Архитектура
```
app/                  — экраны (expo-router)
  (auth)/             — авторизация
  (tabs)/             — основные вкладки (index, profile)
  catalog/            — каталог материалов
  editor/             — редактор оклейки
  orders/             — заказы
  prices/             — цены
  studio/             — студия
components/
  CarViewer/          — 3D просмотрщик автомобиля (GLB)
  editor/             — компоненты редактора
  studio/             — компоненты студии
constants/
  car-glb-map.ts      — маппинг моделей авто к GLB файлам
  glb-assets.ts       — ассеты 3D моделей
  materials-data.ts   — данные материалов для оклейки
  price-list-data.ts  — прайс-лист
  services-data.ts    — данные услуг
  editor-store.ts     — Zustand store редактора
  orders-service.ts   — сервис заказов
  studio-service.ts   — сервис студии
  supabase.ts         — клиент Supabase
  trpc.ts             — клиент tRPC
  AuthContext.tsx      — контекст авторизации
backend/
  server.ts           — Hono сервер
  trpc/               — tRPC роутеры
api/
  index.ts            — API entry point
```

## Правила кода
- API запросы — через tRPC клиент (`constants/trpc.ts`)
- Авторизация — через `AuthContext` и Supabase
- Стейт редактора — через `editor-store.ts` (Zustand)
- 3D модели — GLB файлы, маппинг в `car-glb-map.ts`
- Данные услуг и материалов — в `constants/` (статика)

## Команды
```bash
bun start          # запуск Expo
bun run ios        # iOS
bun run android    # Android
bun run web        # веб версия
vercel deploy      # деплой на Vercel
```

## Окружение
- `.env` — основные переменные
- `.env.local` — локальные переменные
- `.env.backend` — переменные бэкенда
- Supabase URL/Key — в env файлах
