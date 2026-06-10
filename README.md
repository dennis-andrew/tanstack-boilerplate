# React TanStack Boilerplate

A small React starter built around the TanStack ecosystem:

- TanStack Start and TanStack Router for code-based routing
- TanStack Query for route-aware data fetching and cache hydration
- TanStack Form for typed, reusable form components
- Tailwind CSS for styling
- Vitest for tests

## Getting Started

```bash
npm install
npm run dev
```

The dev server starts on port `3000` by default. If that port is busy, Vite will choose the next available port.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
npm test
```

`npm test` is configured with `--passWithNoTests` so a fresh boilerplate does not fail before tests are added.

## Project Structure

```text
src/
  components/                  Shared UI components
  hooks/                       App-specific TanStack Form hooks
  integrations/tanstack-query/ Query client context and devtools setup
  views/                       Page components and route UI
  routeTree.ts                 Central code-based route config
  router.tsx                   Router factory and Query integration
```

## Router

Routes are defined with TanStack Router's code-based API in `src/routeTree.ts`. Page components live under `src/views` and are imported into that central route config.

When adding a route, export the page component from `src/views`, create its `createRoute` entry in `src/routeTree.ts`, and add it to the correct parent's `addChildren` call.

TanStack Start still emits a generated helper for its tooling, but `vite.config.ts` points that output to the ignored `.tanstack/routeTree.gen.ts` file and uses `src/tanstack-start-root.tsx` as a minimal virtual root. The app imports `src/routeTree.ts`.

## Query

The router context is created in `src/integrations/tanstack-query/root-provider.tsx`.

`src/router.tsx` passes that context into TanStack Router and calls `setupRouterSsrQueryIntegration`, which wraps the app in `QueryClientProvider` and wires Query cache hydration for Start.

The query demo at `src/views/demo/tanstack-query.tsx` shows the recommended pattern:

- define shared `queryOptions`
- prefetch with `context.queryClient.ensureQueryData` in the route loader
- read cached data in the component with `useSuspenseQuery`

## Auth

This boilerplate includes a basic FreeAPI-backed auth flow:

- `/` is private and renders the existing home page after login
- `/login` is public
- `/signup` is public
- `/dashboard` is private

Auth-related code lives in:

```text
src/lib/auth-session.ts       Local session storage and auth store
src/lib/freeapi-auth.ts       FreeAPI auth client
src/routeTree.ts              Private route guard and route loaders
src/views/index.tsx           Protected home page
src/views/login.tsx           Login form
src/views/signup.tsx          Signup form
src/views/_authenticated/     Protected route views
```

The `_authenticated` route is a pathless private layout. Routes registered under it in `src/routeTree.ts` are protected by the same guard while keeping their public URLs clean. For example, `src/views/_authenticated/dashboard.tsx` renders at `/dashboard`.

FreeAPI is used as the demo backend with `https://api.freeapi.app/api/v1`. The login response stores the bearer token in `localStorage`; protected loaders verify it with `/users/current-user`.

Because this starter uses a browser-stored token instead of an HTTP-only app cookie, private browser-token routes use `ssr: false`. That lets guards and loaders read `localStorage` on direct page reloads. For production SSR auth, replace this with a server-readable cookie/session flow.

## Forms

Form components are registered through `src/hooks/demo.form.ts`.

Use `form.AppField` in route components and render shared field controls like `field.TextField`, `field.TextArea`, and `field.Select`. The shared field components wire labels, ids, names, touched state, and error messages consistently.

## Dependency Policy

Package versions are pinned in `package.json` and `package-lock.json` so this boilerplate installs reproducibly. Upgrade intentionally with `npm install <package>@<version>` and run:

```bash
npm run typecheck
npm run build
npm test
```

## Demo Routes

- `/demo/tanstack-query`
- `/demo/form/simple`
- `/demo/form/address`
- `/login`
- `/signup`
- `/dashboard`

These are intentionally small examples. Keep them as reference code or remove them when starting a real app.

## Code-Based Routing

TanStack Router does not require file-based routing. This starter uses code-based routing so the route hierarchy is explicit in `src/routeTree.ts`.

Common route patterns:

- `src/routeTree.ts` creates the root route and all child route objects
- `src/views/__root.tsx` exports the root document shell
- `src/views/index.tsx` exports `HomePage`; `src/routeTree.ts` maps it to `path: '/'`
- `src/views/login.tsx` exports `LoginPage`; `src/routeTree.ts` maps it to `path: '/login'`
- `src/routeTree.ts` uses `id: '_authenticated'` for the pathless private layout route
- `src/views/_authenticated/dashboard.tsx` exports `DashboardPage`; `src/routeTree.ts` maps it under the private layout at `path: '/dashboard'`

If a page needs route data, search params, or route context, use `getRouteApi` in the page component. Keep `createRoute`, guards, loaders, and route hierarchy in `src/routeTree.ts`.
