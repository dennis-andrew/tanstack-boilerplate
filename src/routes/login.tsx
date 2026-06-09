import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'

import { useAppForm } from '#/hooks/demo.form'
import { loginWithFreeApi } from '#/lib/freeapi-auth'

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
})

function sanitizeRedirect(value: unknown) {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//')
  ) {
    return '/'
  }

  return value
}

export const Route = createFileRoute('/login')({
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

function LoginPage() {
  const [submitError, setSubmitError] = useState('')
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const loginMutation = useMutation({
    mutationFn: loginWithFreeApi,
    onSuccess: async (session) => {
      context.auth.setSession(session)
      queryClient.setQueryData(['auth', 'current-user'], session.user)
      await navigate({ href: search.redirect, replace: true })
    },
  })

  const form = useAppForm({
    defaultValues: {
      identifier: '',
      password: '',
    },
    validators: {
      onChange: loginSchema,
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError('')

      try {
        await loginMutation.mutateAsync(value)
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : 'Unable to sign in. Please try again.',
        )
      }
    },
  })

  return (
    <main className="page-wrap flex min-h-screen items-center justify-center px-4 py-12">
      <section className="island-shell w-full max-w-md rounded-2xl p-6 sm:p-8">
        <h1 className="display-title mb-6 text-4xl font-bold text-[var(--sea-ink)]">
          Sign in
        </h1>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-5"
        >
          <form.AppField name="identifier">
            {(field) => (
              <field.TextField
                label="Email or Username"
                autoComplete="username"
              />
            )}
          </form.AppField>

          <form.AppField name="password">
            {(field) => (
              <field.TextField
                label="Password"
                type="password"
                autoComplete="current-password"
              />
            )}
          </form.AppField>

          {submitError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600">
              {submitError}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-4">
            <Link
              to="/signup"
              search={{ redirect: search.redirect }}
              className="text-sm font-semibold"
            >
              Create account
            </Link>
            <form.AppForm>
              <form.SubscribeButton label="Sign In" />
            </form.AppForm>
          </div>
        </form>
      </section>
    </main>
  )
}
