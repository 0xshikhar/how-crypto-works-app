'use client'

import { useEffect } from 'react'
import { useBookStore } from '@/lib/store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const initTheme = useBookStore(s => s.initTheme)

    useEffect(() => {
        initTheme()
    }, [initTheme])

    return <>{children}</>
}
