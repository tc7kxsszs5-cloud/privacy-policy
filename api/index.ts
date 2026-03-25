import { Hono } from 'hono'
import { trpcServer } from '@hono/trpc-server'
import { handle } from 'hono/vercel'
import { appRouter } from '../backend/trpc/app-router'

export const config = { runtime: 'edge' }

const app = new Hono().basePath('/api')

app.use('/trpc/*', trpcServer({ router: appRouter }))

app.get('/health', (c) => c.json({ ok: true }))

export default handle(app)
