import { queryOptions } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  createRoute,
  redirect,
} from '@tanstack/react-router'

import type { RouterContext } from './integrations/tanstack-query/root-provider'
import { getCurrentFreeApiUser } from './lib/freeapi-auth'
import { RootDocument } from './views/__root'
import { DashboardPage } from './views/_authenticated/dashboard'
import { AboutPage } from './views/about'
import { AddressForm } from './views/demo/form.address'
import { SimpleForm } from './views/demo/form.simple'
import {
  TanStackQueryDemo,
  todosQueryOptions,
} from './views/demo/tanstack-query'
import { HomePage } from './views/index'
import { LoginPage } from './views/login'
import { SignupPage } from './views/signup'
import appCss from './styles.css?url'

const rootRoute = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

const sanitizeRedirect = (value: unknown) => {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//')
  ) {
    return '/'
  }

  return value
}

const currentUserQueryOptions = (token: string) =>
  queryOptions({
    queryKey: ['auth', 'current-user', token],
    queryFn: () => getCurrentFreeApiUser(token),
    retry: false,
  })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  ssr: false,
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: { redirect: '/' },
      })
    }
  },
  component: HomePage,
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: sanitizeRedirect(search.redirect),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated()) {
      throw redirect({ href: search.redirect })
    }
  },
  component: LoginPage,
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: sanitizeRedirect(search.redirect),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated()) {
      throw redirect({ href: search.redirect })
    }
  },
  component: SignupPage,
})

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_authenticated',
  ssr: false,
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
})

const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboard',
  loader: async ({ context }) => {
    const token = context.auth.getAccessToken()

    if (!token) {
      throw redirect({
        to: '/login',
        search: { redirect: '/dashboard' },
      })
    }

    try {
      const user = await context.queryClient.ensureQueryData(
        currentUserQueryOptions(token),
      )
      context.auth.updateUser(user)
      return user
    } catch {
      context.auth.clearSession()
      context.queryClient.removeQueries({ queryKey: ['auth'] })
      throw redirect({
        to: '/login',
        search: { redirect: '/dashboard' },
      })
    }
  },
  component: DashboardPage,
})

const tanStackQueryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/demo/tanstack-query',
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(todosQueryOptions()),
  component: TanStackQueryDemo,
})

const addressFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/demo/form/address',
  component: AddressForm,
})

const simpleFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/demo/form/simple',
  component: SimpleForm,
})

const authenticatedRouteWithChildren = authenticatedRoute.addChildren([
  dashboardRoute,
])

export const routeTree = rootRoute.addChildren([
  indexRoute,
  authenticatedRouteWithChildren,
  aboutRoute,
  loginRoute,
  signupRoute,
  tanStackQueryRoute,
  addressFormRoute,
  simpleFormRoute,
])
