'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BookOpen, Menu, X, ChevronRight, Home,
    ChevronDown, Check, Circle, Search, Highlighter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBookStore } from '@/lib/store'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SearchDialog } from '@/components/book/SearchDialog'
import type { Chapter } from '@/lib/content-loader'

interface BookLayoutProps {
    chapters: Chapter[]
    children: React.ReactNode
}

export function BookLayout({ chapters, children }: BookLayoutProps) {
    const pathname = usePathname()
    const { sidebarOpen, setSidebarOpen, loadFromStorage, completedSections, highlights, loadHighlights } = useBookStore()
    const [expandedChapters, setExpandedChapters] = useState<string[]>([])
    const [searchOpen, setSearchOpen] = useState(false)

    useEffect(() => {
        loadFromStorage()
        loadHighlights()
    }, [loadFromStorage, loadHighlights])

    // Keyboard shortcut: Cmd/Ctrl+K for search
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setSearchOpen(prev => !prev)
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    // Auto-expand current chapter
    useEffect(() => {
        const parts = pathname.split('/')
        if (parts.length >= 3) {
            const currentChapter = parts[2]
            if (currentChapter && !expandedChapters.includes(currentChapter)) {
                setExpandedChapters(prev => [...prev, currentChapter])
            }
        }
    }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

    const toggleChapter = (slug: string) => {
        setExpandedChapters(prev =>
            prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
        )
    }

    const totalSections = chapters.reduce((sum, ch) => sum + ch.sections.length, 0)
    const progressPercent = totalSections > 0
        ? Math.round((completedSections.length / totalSections) * 100)
        : 0

    return (
        <div className="min-h-screen bg-background flex">
            {/* Mobile overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        className="fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen w-72 bg-surface border-r border-border flex flex-col"
                        initial={{ x: -288 }}
                        animate={{ x: 0 }}
                        exit={{ x: -288 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        {/* Sidebar header */}
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <Link href="/" className="flex items-center gap-2.5 group">
                                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                                    <BookOpen className="w-4 h-4 text-accent" />
                                </div>
                                <span className="font-semibold text-sm">CryptoBook</span>
                            </Link>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-1.5 rounded-lg hover:bg-surface-light transition-colors"
                            >
                                <X className="w-4 h-4 text-muted" />
                            </button>
                        </div>

                        {/* Progress */}
                        <div className="px-4 py-3 border-b border-border">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-muted">Progress</span>
                                <span className="text-xs text-accent font-medium">{progressPercent}%</span>
                            </div>
                            <div className="h-1.5 bg-surface-light rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto py-2 px-2">
                            <Link
                                href="/book"
                                className={cn(
                                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5',
                                    pathname === '/book'
                                        ? 'bg-accent/10 text-accent'
                                        : 'text-muted hover:text-foreground hover:bg-surface-light'
                                )}
                            >
                                <Home className="w-4 h-4" />
                                Overview
                            </Link>
                            <Link
                                href="/book/highlights"
                                className={cn(
                                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mb-1',
                                    pathname === '/book/highlights'
                                        ? 'bg-amber-500/10 text-amber-500'
                                        : 'text-muted hover:text-foreground hover:bg-surface-light'
                                )}
                            >
                                <Highlighter className="w-4 h-4" />
                                Highlights
                                {highlights.length > 0 && (
                                    <span className="ml-auto text-[11px] px-1.5 py-0.5 rounded-full bg-surface-light text-muted-dark">
                                        {highlights.length}
                                    </span>
                                )}
                            </Link>

                            {chapters.map((chapter, idx) => {
                                const isExpanded = expandedChapters.includes(chapter.slug)
                                const isActiveChapter = pathname.includes(`/book/${chapter.slug}`)
                                const chapterCompleted = chapter.sections.every(s =>
                                    completedSections.includes(`${chapter.slug}/${s.slug}`)
                                )

                                return (
                                    <div key={chapter.slug} className="mb-0.5">
                                        <button
                                            onClick={() => toggleChapter(chapter.slug)}
                                            className={cn(
                                                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all group',
                                                isActiveChapter
                                                    ? 'bg-accent/10 text-accent'
                                                    : 'text-muted hover:text-foreground hover:bg-surface-light'
                                            )}
                                        >
                                            <ChevronDown
                                                className={cn(
                                                    'w-3.5 h-3.5 shrink-0 transition-transform duration-200',
                                                    !isExpanded && '-rotate-90'
                                                )}
                                            />
                                            <span className="text-xs font-medium text-muted-dark shrink-0">
                                                {idx === 0 ? '⟡' : `${idx}.`}
                                            </span>
                                            <span className="truncate text-left flex-1">{chapter.title}</span>
                                            {chapterCompleted && (
                                                <Check className="w-3.5 h-3.5 text-success shrink-0" />
                                            )}
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="ml-5 border-l border-border pl-2 py-1">
                                                        {chapter.sections.map(section => {
                                                            const sectionPath = `/book/${chapter.slug}/${section.slug}`
                                                            const isActive = pathname === sectionPath
                                                            const isComplete = completedSections.includes(`${chapter.slug}/${section.slug}`)

                                                            return (
                                                                <Link
                                                                    key={section.slug}
                                                                    href={sectionPath}
                                                                    onClick={() => {
                                                                        if (window.innerWidth < 1024) setSidebarOpen(false)
                                                                    }}
                                                                    className={cn(
                                                                        'flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors',
                                                                        isActive
                                                                            ? 'bg-accent/10 text-accent font-medium'
                                                                            : 'text-muted-dark hover:text-foreground hover:bg-surface-light'
                                                                    )}
                                                                >
                                                                    {isComplete ? (
                                                                        <Check className="w-3 h-3 text-success shrink-0" />
                                                                    ) : (
                                                                        <Circle className={cn(
                                                                            'w-2 h-2 shrink-0',
                                                                            isActive ? 'text-accent fill-accent' : 'text-muted-dark'
                                                                        )} />
                                                                    )}
                                                                    <span className="truncate">{section.title}</span>
                                                                </Link>
                                                            )
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )
                            })}
                        </nav>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main content area */}
            <div className="flex-1 min-w-0">
                {/* Top bar */}
                <header className="sticky top-0 z-20 h-14 bg-background/80 backdrop-blur-xl border-b border-border flex items-center px-4 gap-3">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-surface-light transition-colors"
                    >
                        <Menu className="w-4 h-4 text-muted" />
                    </button>

                    {/* Breadcrumb */}
                    <Breadcrumb pathname={pathname} chapters={chapters} />

                    {/* Global progress + actions */}
                    <div className="ml-auto flex items-center gap-1.5">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface/50 hover:bg-surface-light transition-colors text-muted text-xs"
                        >
                            <Search className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Search</span>
                            <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-surface-light border border-border font-mono">⌘K</kbd>
                        </button>
                        <ThemeToggle />
                        <span className="text-xs text-muted hidden sm:block ml-1">{progressPercent}%</span>
                        <div className="w-16 h-1.5 bg-surface-light rounded-full overflow-hidden">
                            <div
                                className="h-full bg-accent rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </header>
                <SearchDialog chapters={chapters} open={searchOpen} onOpenChange={setSearchOpen} />

                {/* Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    )
}

function Breadcrumb({ pathname, chapters }: { pathname: string; chapters: Chapter[] }) {
    const parts = pathname.split('/').filter(Boolean)

    if (parts.length <= 1) {
        return (
            <div className="flex items-center gap-1 text-sm">
                <BookOpen className="w-3.5 h-3.5 text-accent" />
                <span className="text-muted">Book</span>
            </div>
        )
    }

    const chapterSlug = parts[1]
    const sectionSlug = parts[2]
    const chapter = chapters.find(c => c.slug === chapterSlug)
    const section = chapter?.sections.find(s => s.slug === sectionSlug)

    return (
        <div className="flex items-center gap-1.5 text-sm min-w-0">
            <Link href="/book" className="text-muted hover:text-foreground transition-colors shrink-0">
                Book
            </Link>
            {chapter && (
                <>
                    <ChevronRight className="w-3 h-3 text-muted-dark shrink-0" />
                    <Link
                        href={`/book/${chapter.slug}/${chapter.sections[0]?.slug || ''}`}
                        className="text-muted hover:text-foreground transition-colors truncate"
                    >
                        {chapter.title}
                    </Link>
                </>
            )}
            {section && (
                <>
                    <ChevronRight className="w-3 h-3 text-muted-dark shrink-0 hidden sm:block" />
                    <span className="text-foreground truncate hidden sm:block">{section.title}</span>
                </>
            )}
        </div>
    )
}
