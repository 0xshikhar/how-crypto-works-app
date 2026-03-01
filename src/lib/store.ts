'use client'

import { create } from 'zustand'

interface ReadingProgress {
    [key: string]: number // "chapterSlug/sectionSlug" -> scroll percentage
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
}))
