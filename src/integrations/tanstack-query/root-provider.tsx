import { QueryClient } from '@tanstack/react-query'

export function createRouterContext() {
  return {
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
