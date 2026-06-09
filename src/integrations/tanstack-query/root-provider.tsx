import { QueryClient } from '@tanstack/react-query'

import { authStore } from '#/lib/auth-session'

export function createRouterContext() {
  return {
    auth: authStore,
    queryClient: new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30 * 1000,
          refetchOnWindowFocus: false,
        },
      },
    }),
  }
}

export type RouterContext = ReturnType<typeof createRouterContext>
