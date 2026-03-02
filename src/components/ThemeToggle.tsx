'use client'

import { Sun, Moon } from 'lucide-react'
import { useBookStore } from '@/lib/store'

export function ThemeToggle({ className = '' }: { className?: string }) {
    const { theme, toggleTheme } = useBookStore()

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg hover:bg-surface-light transition-colors ${className}`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? (
                <Sun suppressHydrationWarning className="w-4 h-4 text-muted hover:text-foreground transition-colors" />
            ) : (
                <Moon suppressHydrationWarning className="w-4 h-4 text-muted hover:text-foreground transition-colors" />
            )}
        </button>
    )
}
