"use client"

import * as React from "react"

type Theme = "light" | "dark"
type ThemeProviderProps = React.PropsWithChildren<{
  defaultTheme?: Theme
}>

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)
const STORAGE_KEY = "theme"

function getStoredTheme(defaultTheme: Theme): Theme {
  if (typeof window === "undefined") return defaultTheme
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === "light" || stored === "dark" ? stored : defaultTheme
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return
  document.documentElement.classList.toggle("dark", theme === "dark")
  document.documentElement.style.colorScheme = theme
}

export function ThemeProvider({ children, defaultTheme = "dark" }: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => getStoredTheme(defaultTheme))

  React.useEffect(() => {
    applyTheme(theme)
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const setTheme = React.useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme)
  }, [])

  const value = React.useMemo(
    () => ({ theme, resolvedTheme: theme, setTheme }),
    [theme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    return {
      theme: "dark" as Theme,
      resolvedTheme: "dark" as Theme,
      setTheme: () => {},
    }
  }
  return context
}
