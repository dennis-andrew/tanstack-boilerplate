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
import { loginWithFreeApi, signupWithFreeApi } from '#/lib/freeapi-auth'

const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(
      /^[a-z0-9._-]+$/,
      'Use lowercase letters, numbers, dots, underscores, or hyphens',
    ),
  email: z.email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
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

export const Route = createFileRoute('/signup')({
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

function SignupPage() {
  const [submitError, setSubmitError] = useState('')
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const signupMutation = useMutation({
    mutationFn: async (value: z.infer<typeof signupSchema>) => {
      await signupWithFreeApi(value)
      return loginWithFreeApi({
        identifier: value.email,
        password: value.password,
      })
    },
    onSuccess: async (session) => {
      context.auth.setSession(session)
      queryClient.setQueryData(['auth', 'current-user'], session.user)
      await navigate({ href: search.redirect, replace: true })
    },
  })

  const form = useAppForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
    validators: {
      onChange: signupSchema,
      onSubmit: signupSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError('')

      try {
        await signupMutation.mutateAsync(value)
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : 'Unable to create your account. Please try again.',
        )
      }
    },
  })

  return (
    <main className="page-wrap flex min-h-screen items-center justify-center px-4 py-12">
      <section className="island-shell w-full max-w-md rounded-2xl p-6 sm:p-8">
        <h1 className="display-title mb-6 text-4xl font-bold text-[var(--sea-ink)]">
          Create account
        </h1>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-5"
        >
          <form.AppField name="username">
            {(field) => (
              <field.TextField
                label="Username"
                autoComplete="username"
                placeholder="lowercase-name"
              />
            )}
          </form.AppField>

          <form.AppField name="email">
            {(field) => (
              <field.TextField
                label="Email"
                type="email"
                autoComplete="email"
                inputMode="email"
              />
            )}
          </form.AppField>

          <form.AppField name="password">
            {(field) => (
              <field.TextField
                label="Password"
                type="password"
                autoComplete="new-password"
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
              to="/login"
              search={{ redirect: search.redirect }}
              className="text-sm font-semibold"
            >
              Sign in instead
            </Link>
            <form.AppForm>
              <form.SubscribeButton label="Create Account" />
            </form.AppForm>
          </div>
        </form>
      </section>
    </main>
  )
}
