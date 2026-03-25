import { Hono } from 'hono'
import { trpcServer } from '@hono/trpc-server'
import { appRouter } from './trpc/app-router'

const app = new Hono()

app.use('/trpc/*', trpcServer({ router: appRouter }))

app.get('/health', (c) => c.json({ ok: true }))

export default {
  port: 3000,
  hostname: '0.0.0.0',
  fetch: app.fetch,
}
