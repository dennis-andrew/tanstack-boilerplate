import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { logoutFromFreeApi } from '#/lib/freeapi-auth'

const dashboardRouteApi = getRouteApi('/_authenticated/dashboard')

export function DashboardPage() {
  const user = dashboardRouteApi.useLoaderData()
  const context = dashboardRouteApi.useRouteContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const logoutMutation = useMutation({
    mutationFn: () => logoutFromFreeApi(context.auth.getAccessToken()),
    onSettled: async () => {
      context.auth.clearSession()
      queryClient.removeQueries({ queryKey: ['auth'] })
      await navigate({
        to: '/login',
        search: { redirect: '/' },
        replace: true,
      })
    },
  })

  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          Welcome, {user.username}.
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          Your saved session was verified with FreeAPI before this page was
          shown.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="island-shell rounded-2xl p-5">
          <p className="island-kicker mb-2">Username</p>
          <p className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
            {user.username}
          </p>
        </article>
        <article className="island-shell rounded-2xl p-5">
          <p className="island-kicker mb-2">Email</p>
          <p className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
            {user.email}
          </p>
        </article>
        <article className="island-shell rounded-2xl p-5">
          <p className="island-kicker mb-2">Role</p>
          <p className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
            {user.role}
          </p>
        </article>
      </section>

      <div className="mt-6">
        <button
          type="button"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
          className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)] disabled:opacity-50"
        >
          {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </main>
  )
}
