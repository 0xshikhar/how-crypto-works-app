'use client'

import { create } from 'zustand'

interface ReadingProgress {
    [key: string]: number // "chapterSlug/sectionSlug" -> scroll percentage
}

type Theme = 'light' | 'dark'

export interface Highlight {
    id: string
    text: string
    chapterSlug: string
    chapterTitle: string
    sectionSlug: string
    sectionTitle: string
    createdAt: number
    color: string
}

interface BookStore {
    sidebarOpen: boolean
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
    readingProgress: ReadingProgress
    completedSections: string[]
    updateProgress: (chapterSlug: string, sectionSlug: string, percentage: number) => void
    markCompleted: (chapterSlug: string, sectionSlug: string) => void
    getProgress: (chapterSlug: string, sectionSlug: string) => number
    isCompleted: (chapterSlug: string, sectionSlug: string) => boolean
    getTotalCompleted: () => number
    loadFromStorage: () => void
    theme: Theme
    toggleTheme: () => void
    initTheme: () => void
    highlights: Highlight[]
    addHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => void
    removeHighlight: (id: string) => void
    loadHighlights: () => void
}

export const useBookStore = create<BookStore>((set, get) => ({
    sidebarOpen: true,
    toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    readingProgress: {},
    completedSections: [],

    updateProgress: (chapterSlug, sectionSlug, percentage) => {
        const key = `${chapterSlug}/${sectionSlug}`
        set(state => {
            const newProgress = { ...state.readingProgress, [key]: percentage }
            if (typeof window !== 'undefined') {
                localStorage.setItem('cryptobook-progress', JSON.stringify(newProgress))
            }

            // Auto-complete at 90%+
            let newCompleted = state.completedSections
            if (percentage >= 90 && !state.completedSections.includes(key)) {
                newCompleted = [...state.completedSections, key]
                if (typeof window !== 'undefined') {
                    localStorage.setItem('cryptobook-completed', JSON.stringify(newCompleted))
                }
            }

            return { readingProgress: newProgress, completedSections: newCompleted }
        })
    },

    markCompleted: (chapterSlug, sectionSlug) => {
        const key = `${chapterSlug}/${sectionSlug}`
        set(state => {
            if (state.completedSections.includes(key)) return state
            const newCompleted = [...state.completedSections, key]
            if (typeof window !== 'undefined') {
                localStorage.setItem('cryptobook-completed', JSON.stringify(newCompleted))
            }
            return { completedSections: newCompleted }
        })
    },

    getProgress: (chapterSlug, sectionSlug) => {
        const key = `${chapterSlug}/${sectionSlug}`
        return get().readingProgress[key] || 0
    },

    isCompleted: (chapterSlug, sectionSlug) => {
        const key = `${chapterSlug}/${sectionSlug}`
        return get().completedSections.includes(key)
    },

    getTotalCompleted: () => get().completedSections.length,

    loadFromStorage: () => {
        if (typeof window === 'undefined') return
        try {
            const progress = localStorage.getItem('cryptobook-progress')
            const completed = localStorage.getItem('cryptobook-completed')
            set({
                readingProgress: progress ? JSON.parse(progress) : {},
                completedSections: completed ? JSON.parse(completed) : [],
            })
        } catch {
            // Ignore parse errors
        }
    },

    theme: 'dark',
    toggleTheme: () => {
        set(state => {
            const next: Theme = state.theme === 'dark' ? 'light' : 'dark'
            if (typeof window !== 'undefined') {
                document.documentElement.setAttribute('data-theme', next)
                localStorage.setItem('cryptobook-theme', next)
            }
            return { theme: next }
        })
    },
    initTheme: () => {
        if (typeof window === 'undefined') return
        const stored = localStorage.getItem('cryptobook-theme') as Theme | null
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const theme: Theme = stored || (prefersDark ? 'dark' : 'light')
        document.documentElement.setAttribute('data-theme', theme)
        set({ theme })
    },

    highlights: [],
    addHighlight: (highlight) => {
        const newHighlight: Highlight = {
            ...highlight,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
        }
        set(state => {
            const updated = [newHighlight, ...state.highlights]
            if (typeof window !== 'undefined') {
                localStorage.setItem('cryptobook-highlights', JSON.stringify(updated))
            }
            return { highlights: updated }
        })
    },
    removeHighlight: (id) => {
        set(state => {
            const updated = state.highlights.filter(h => h.id !== id)
            if (typeof window !== 'undefined') {
                localStorage.setItem('cryptobook-highlights', JSON.stringify(updated))
            }
            return { highlights: updated }
        })
    },
    loadHighlights: () => {
        if (typeof window === 'undefined') return
        try {
            const data = localStorage.getItem('cryptobook-highlights')
            if (data) set({ highlights: JSON.parse(data) })
        } catch {
            // Ignore
        }
    },
}))
