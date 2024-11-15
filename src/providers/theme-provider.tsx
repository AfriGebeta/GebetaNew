//@ts-nocheck
'use client'

import {createContext, useContext, useEffect, useState} from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
                                  children,
                                  defaultTheme = 'system',
                                  storageKey = 'ui-theme',
                                  ...props
                              }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(() => {
        // Only run on client side
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem(storageKey) as Theme
            return savedTheme || defaultTheme
        }
        return defaultTheme
    })

    useEffect(() => {
        const root = window.document.documentElement

        // Function to update theme
        const updateTheme = (newTheme: Theme) => {
            root.classList.remove('light', 'dark')

            if (newTheme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                root.classList.add(systemTheme)
            } else {
                root.classList.add(newTheme)
            }
        }

        // Initial theme setup
        updateTheme(theme)

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleSystemThemeChange = () => {
            if (theme === 'system') {
                updateTheme('system')
            }
        }

        mediaQuery.addEventListener('change', handleSystemThemeChange)
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }, [theme])

    const value = {
        theme,
        setTheme: (newTheme: Theme) => {
            localStorage.setItem(storageKey, newTheme)
            setTheme(newTheme)
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider')

    return context
}