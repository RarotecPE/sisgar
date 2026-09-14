"use client"

import { useEffect, useRef } from "react"

const SESSION_CHECK_INTERVAL_MS = 30_000

function isProtectedInternalApi(input: RequestInfo | URL) {
  if (typeof window === "undefined") return false

  const rawUrl =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url

  const url = new URL(rawUrl, window.location.origin)
  return (
    url.origin === window.location.origin &&
    url.pathname.startsWith("/api/") &&
    !url.pathname.startsWith("/api/auth/")
  )
}

function currentLoginUrl() {
  const nextPath = `${window.location.pathname}${window.location.search}`
  return `/login?next=${encodeURIComponent(nextPath || "/dashboard")}`
}

export function SessionGuard() {
  const redirectingRef = useRef(false)

  useEffect(() => {
    const expireSession = async () => {
      if (redirectingRef.current) return
      redirectingRef.current = true

      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Accept: "application/json" },
      }).catch(() => null)

      window.location.href = currentLoginUrl()
    }

    const checkSession = async () => {
      if (redirectingRef.current) return

      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        })
        const payload = await response.json().catch(() => null)

        if (!response.ok || !payload?.authenticated) {
          await expireSession()
        }
      } catch {
        await expireSession()
      }
    }

    const originalFetch = window.fetch.bind(window)
    window.fetch = async (input, init) => {
      const response = await originalFetch(input, init)

      if (response.status === 401 && isProtectedInternalApi(input)) {
        void expireSession()
      }

      return response
    }

    const handleFocus = () => void checkSession()
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void checkSession()
    }

    void checkSession()
    const intervalId = window.setInterval(() => void checkSession(), SESSION_CHECK_INTERVAL_MS)
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.fetch = originalFetch
      window.clearInterval(intervalId)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  return null
}
