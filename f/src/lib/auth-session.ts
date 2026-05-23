const SESSION_KEY = "lforadio_has_refresh_session"

export function markAuthSession(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1")
  } catch {
    /* private mode vb. */
  }
}

export function clearAuthSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

/** Daha önce giriş yapıldıysa refresh çerezi olabilir */
export function hasAuthSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1"
  } catch {
    return false
  }
}
