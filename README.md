# React TanStack Boilerplate

A small React starter built around the TanStack ecosystem:

- TanStack Start and TanStack Router for file-based routing
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
  routes/                      File-based routes
  routeTree.gen.ts             Generated TanStack Router route tree
  router.tsx                   Router factory and Query integration
```

## Router

Routes live in `src/routes`. The generated `src/routeTree.gen.ts` file is imported by `src/router.tsx`.

For this boilerplate, commit `src/routeTree.gen.ts` so a fresh clone can typecheck and build immediately. Regenerate it by running the dev server or build command after adding, removing, or renaming route files.

## Query

The router context is created in `src/integrations/tanstack-query/root-provider.tsx`.

`src/router.tsx` passes that context into TanStack Router and calls `setupRouterSsrQueryIntegration`, which wraps the app in `QueryClientProvider` and wires Query cache hydration for Start.

The query demo at `src/routes/demo/tanstack-query.tsx` shows the recommended pattern:

- define shared `queryOptions`
- prefetch with `context.queryClient.ensureQueryData` in the route loader
- read cached data in the component with `useSuspenseQuery`

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

These are intentionally small examples. Keep them as reference code or remove them when starting a real app.
