'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, FileText, ArrowRight } from 'lucide-react'
import type { Chapter } from '@/lib/content-loader'

interface SearchDialogProps {
    chapters: Chapter[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

interface SearchResult {
    chapterTitle: string
    chapterSlug: string
    sectionTitle: string
    sectionSlug: string
    snippet: string
}

function searchChapters(chapters: Chapter[], query: string): SearchResult[] {
    if (!query || query.length < 2) return []
    const lower = query.toLowerCase()
    const results: SearchResult[] = []

    for (const chapter of chapters) {
        for (const section of chapter.sections) {
            const titleMatch = section.title.toLowerCase().includes(lower)
            const contentLower = section.content.toLowerCase()
            const contentIdx = contentLower.indexOf(lower)

            if (titleMatch || contentIdx !== -1) {
                let snippet = ''
                if (contentIdx !== -1) {
                    const start = Math.max(0, contentIdx - 60)
                    const end = Math.min(section.content.length, contentIdx + query.length + 60)
                    snippet = (start > 0 ? '...' : '') +
                        section.content.slice(start, end).replace(/\n/g, ' ').replace(/[#*_`]/g, '') +
                        (end < section.content.length ? '...' : '')
                } else {
                    snippet = section.content.slice(0, 120).replace(/\n/g, ' ').replace(/[#*_`]/g, '') + '...'
                }

                results.push({
                    chapterTitle: chapter.title,
                    chapterSlug: chapter.slug,
                    sectionTitle: section.title,
                    sectionSlug: section.slug,
                    snippet,
                })
            }

            if (results.length >= 20) break
        }
        if (results.length >= 20) break
    }

    return results
}

export function SearchDialog({ chapters, open, onOpenChange }: SearchDialogProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [selectedIdx, setSelectedIdx] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    useEffect(() => {
        if (open) {
            setQuery('')
            setResults([])
            setSelectedIdx(0)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [open])

    const handleSearch = useCallback((q: string) => {
        setQuery(q)
        setSelectedIdx(0)
        setResults(searchChapters(chapters, q))
    }, [chapters])

    const navigate = useCallback((result: SearchResult) => {
        onOpenChange(false)
        router.push(`/book/${result.chapterSlug}/${result.sectionSlug}`)
    }, [onOpenChange, router])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIdx(i => Math.min(i + 1, results.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIdx(i => Math.max(i - 1, 0))
        } else if (e.key === 'Enter' && results[selectedIdx]) {
            navigate(results[selectedIdx])
        } else if (e.key === 'Escape') {
            onOpenChange(false)
        }
    }

    if (!open) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => onOpenChange(false)}
                />

                {/* Dialog */}
                <motion.div
                    className="relative w-full max-w-xl mx-4 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                >
                    {/* Search input */}
                    <div className="flex items-center gap-3 px-4 border-b border-border">
                        <Search className="w-4 h-4 text-muted shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search chapters and sections..."
                            value={query}
                            onChange={e => handleSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 py-4 bg-transparent text-foreground placeholder:text-muted-dark outline-none text-sm"
                        />
                        {query && (
                            <button onClick={() => handleSearch('')} className="p-1 rounded hover:bg-surface-light">
                                <X className="w-3.5 h-3.5 text-muted" />
                            </button>
                        )}
                        <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-surface-light border border-border text-muted-dark font-mono">ESC</kbd>
                    </div>

                    {/* Results */}
                    <div className="max-h-80 overflow-y-auto">
                        {query.length >= 2 && results.length === 0 && (
                            <div className="px-4 py-8 text-center text-muted text-sm">
                                No results found for &ldquo;{query}&rdquo;
                            </div>
                        )}
                        {results.map((result, idx) => (
                            <button
                                key={`${result.chapterSlug}/${result.sectionSlug}`}
                                onClick={() => navigate(result)}
                                onMouseEnter={() => setSelectedIdx(idx)}
                                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                                    idx === selectedIdx ? 'bg-accent/10' : 'hover:bg-surface-light'
                                }`}
                            >
                                <FileText className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-dark text-xs">{result.chapterTitle}</span>
                                        <ArrowRight className="w-3 h-3 text-muted-dark" />
                                        <span className="font-medium text-foreground truncate">{result.sectionTitle}</span>
                                    </div>
                                    <p className="text-xs text-muted mt-1 line-clamp-2">{result.snippet}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Footer */}
                    {results.length > 0 && (
                        <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-muted-dark">
                            <span><kbd className="px-1 py-0.5 rounded bg-surface-light border border-border font-mono">↑↓</kbd> navigate</span>
                            <span><kbd className="px-1 py-0.5 rounded bg-surface-light border border-border font-mono">↵</kbd> open</span>
                            <span><kbd className="px-1 py-0.5 rounded bg-surface-light border border-border font-mono">esc</kbd> close</span>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
