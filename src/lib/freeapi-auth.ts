import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import type { AuthSession, AuthUser } from './auth-session'

const FREEAPI_BASE_URL = 'https://api.freeapi.app/api/v1'

type FreeApiResponse<TData> = {
  statusCode: number
  data: TData
  message: string
  success: boolean
}

type LoginResponse = {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

type RegisterResponse = {
  user: AuthUser
}

type RequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown
  token?: string | null
}

export type LoginCredentials = {
  identifier: string
  password: string
}

export type SignupCredentials = {
  username: string
  email: string
  password: string
}

export class FreeApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'FreeApiError'
    this.status = status
  }
}

const loginInputSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
})

const signupInputSchema = z.object({
  username: z.string().min(1),
  email: z.email(),
  password: z.string().min(1),
})

const tokenInputSchema = z.object({
  token: z.string().min(1),
})

async function freeApiFetch<TData>(
  path: string,
  options: RequestOptions = {},
): Promise<TData> {
  const headers = new Headers()

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(`${FREEAPI_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
    body:
      options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const payload = (await response.json().catch(() => null)) as
    | FreeApiResponse<TData>
    | null

  if (!response.ok || !payload?.success) {
    throw new FreeApiError(
      payload?.message || 'Something went wrong. Please try again.',
      response.status,
    )
  }

  return payload.data
}

const loginWithFreeApiServer = createServerFn({ method: 'POST' })
  .validator(loginInputSchema)
  .handler(async ({ data }): Promise<AuthSession> => {
    const identifier = data.identifier.trim()
    const body = identifier.includes('@')
      ? { email: identifier, password: data.password }
      : { username: identifier.toLowerCase(), password: data.password }

    const response = await freeApiFetch<LoginResponse>('/users/login', {
      method: 'POST',
      body,
    })

    return {
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    }
  })

const signupWithFreeApiServer = createServerFn({ method: 'POST' })
  .validator(signupInputSchema)
  .handler(async ({ data }): Promise<AuthUser> => {
    const response = await freeApiFetch<RegisterResponse>('/users/register', {
      method: 'POST',
      body: {
        username: data.username.trim().toLowerCase(),
        email: data.email.trim(),
        password: data.password,
      },
    })

    return response.user
  })

const getCurrentFreeApiUserServer = createServerFn({ method: 'GET' })
  .validator(tokenInputSchema)
  .handler(async ({ data }): Promise<AuthUser> => {
    return freeApiFetch<AuthUser>('/users/current-user', {
      method: 'GET',
      token: data.token,
    })
  })

const logoutFromFreeApiServer = createServerFn({ method: 'POST' })
  .validator(tokenInputSchema)
  .handler(async ({ data }): Promise<void> => {
    await freeApiFetch<Record<string, never>>('/users/logout', {
      method: 'POST',
      token: data.token,
    })
  })

export async function loginWithFreeApi(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  return loginWithFreeApiServer({ data: credentials })
}

export async function signupWithFreeApi(
  credentials: SignupCredentials,
): Promise<AuthUser> {
  return signupWithFreeApiServer({ data: credentials })
}

export async function getCurrentFreeApiUser(token: string) {
  return getCurrentFreeApiUserServer({ data: { token } })
}

export async function logoutFromFreeApi(token: string | null) {
  if (!token) {
    return
  }

  await logoutFromFreeApiServer({ data: { token } })
}
