import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"

export type UserType = {
  id: number
  email: string
  username: string
}

export type AuthContextType = {
  accessToken: string | null
  setAccessToken: (token: string | null) => void
  logout: () => void
  initialize: (token: string | null, user?: UserType | null) => void
  user: UserType | null
  setUser: (user: UserType | null) => void
  isLoading: boolean
  refreshAccessToken: () => Promise<string | null>
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    fetch("/api/logout", { method: "POST", credentials: "include" })
  }, [])

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/refresh", {
        method: "POST",
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        const newToken = data.accessToken ?? null
        setAccessToken(newToken)
        return newToken
      }
      logout()
      return null
    } catch {
      logout()
      return null
    }
  }, [logout])

  const authenticatedFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const fetchWithToken = (token: string | null) =>
        fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
        })

      let response = await fetchWithToken(accessToken)
      if (response.status === 401 && accessToken) {
        const newToken = await refreshAccessToken()
        if (newToken) response = await fetchWithToken(newToken)
      }
      return response
    },
    [accessToken, refreshAccessToken]
  )

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      const newToken = await refreshAccessToken()
      if (cancelled || !newToken) {
        setIsLoading(false)
        return
      }
      const profileRes = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${newToken}` },
        credentials: "include",
      })
      if (cancelled) return
      if (profileRes.ok) {
        const userData = await profileRes.json()
        setUser(userData)
      }
      setIsLoading(false)
    }
    init()
    return () => { cancelled = true }
  }, [refreshAccessToken])

  const initialize = useCallback((token: string | null, userObj?: UserType | null) => {
    setAccessToken(token)
    if (userObj) setUser(userObj)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        logout,
        initialize,
        user,
        setUser,
        isLoading,
        refreshAccessToken,
        authenticatedFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
