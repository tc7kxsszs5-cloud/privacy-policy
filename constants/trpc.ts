import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@/backend/trpc/app-router'

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.EXPO_PUBLIC_API_URL}/trpc`,
    }),
  ],
})
