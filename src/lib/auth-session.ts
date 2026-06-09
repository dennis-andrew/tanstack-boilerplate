import { useSyncExternalStore } from 'react'

export type AuthUser = {
  _id: string
  username: string
  email: string
  role: string
  isEmailVerified: boolean
  avatar?: {
    url?: string
    localPath?: string
  }
  createdAt?: string
  updatedAt?: string
}

export type AuthSession = {
  user: AuthUser
  accessToken: string
  refreshToken?: string
}

const AUTH_STORAGE_KEY = 'tanstack-freeapi-auth'

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function readStoredSession(): AuthSession | null {
  if (!canUseStorage()) {
    return null
  }

  try {
    const value = window.localStorage.getItem(AUTH_STORAGE_KEY)
    return value ? (JSON.parse(value) as AuthSession) : null
  } catch {
    return null
  }
}

function writeStoredSession(session: AuthSession | null) {
  if (!canUseStorage()) {
    return
  }

  if (session) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

function createAuthStore() {
  const listeners = new Set<() => void>()
  let session = readStoredSession()

  const notify = () => {
    listeners.forEach((listener) => listener())
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getSnapshot() {
      return session
    },
    setSession(nextSession: AuthSession) {
      session = nextSession
      writeStoredSession(nextSession)
      notify()
    },
    updateUser(user: AuthUser) {
      if (!session) {
        return
      }

      session = {
        ...session,
        user,
      }
      writeStoredSession(session)
      notify()
    },
    clearSession() {
      session = null
      writeStoredSession(null)
      notify()
    },
    getAccessToken() {
      return session?.accessToken ?? null
    },
    isAuthenticated() {
      return Boolean(session?.accessToken)
    },
  }
}

export const authStore = createAuthStore()

export type AuthStore = typeof authStore

export function useAuthSession() {
  return useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    () => null,
  )
}
