import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@/backend/trpc/app-router'

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'https://backend-three-mauve-67.vercel.app/api/trpc',
    }),
  ],
})
