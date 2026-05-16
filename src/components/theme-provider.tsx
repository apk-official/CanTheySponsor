import React, { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} })

export function ThemeProvider({ children = null }) {
  const [theme, setTheme] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark")

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)