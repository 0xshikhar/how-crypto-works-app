'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Highlighter, Trash2, BookOpen, ChevronRight, ExternalLink } from 'lucide-react'
import { useBookStore } from '@/lib/store'
import type { Highlight } from '@/lib/store'

function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    })
}

// Group highlights by chapter
function groupByChapter(highlights: Highlight[]) {
    const groups: Record<string, { chapterTitle: string; chapterSlug: string; items: Highlight[] }> = {}
    for (const h of highlights) {
        if (!groups[h.chapterSlug]) {
            groups[h.chapterSlug] = { chapterTitle: h.chapterTitle, chapterSlug: h.chapterSlug, items: [] }
        }
        groups[h.chapterSlug].items.push(h)
    }
    return Object.values(groups)
}

export default function HighlightsPage() {
    const { highlights, removeHighlight, loadHighlights } = useBookStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        loadHighlights()
        setMounted(true)
    }, [loadHighlights])

    if (!mounted) return null

    const grouped = groupByChapter(highlights)

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Highlighter className="w-5 h-5 text-amber-500" />
                    </div>
                    <h1 className="text-3xl font-bold">Your Highlights</h1>
                </div>
                <p className="text-muted mt-3 mb-10 max-w-2xl leading-relaxed">
                    All the passages you&apos;ve highlighted while reading. Click the reference link to jump back to the original section.
                </p>
            </motion.div>

            {highlights.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                >
                    <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-6">
                        <Highlighter className="w-8 h-8 text-muted-dark" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No highlights yet</h2>
                    <p className="text-muted max-w-sm mx-auto mb-6">
                        Select any text while reading a chapter and choose a color to save it as a highlight.
                    </p>
                    <Link
                        href="/book"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white font-medium text-sm transition-colors"
                    >
                        <BookOpen className="w-4 h-4" />
                        Start Reading
                    </Link>
                </motion.div>
            ) : (
                <div className="space-y-10">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted">{highlights.length} highlight{highlights.length !== 1 ? 's' : ''}</span>
                    </div>

                    {grouped.map(group => (
                        <div key={group.chapterSlug}>
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-accent" />
                                {group.chapterTitle}
                            </h2>

                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {group.items.map(highlight => (
                                        <motion.div
                                            key={highlight.id}
                                            layout
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="group relative rounded-xl border border-border bg-surface/50 hover:bg-surface transition-colors overflow-hidden"
                                        >
                                            {/* Color bar */}
                                            <div
                                                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                                                style={{ backgroundColor: highlight.color }}
                                            />

                                            <div className="pl-5 pr-4 py-4">
                                                {/* Highlighted text */}
                                                <blockquote
                                                    className="text-[15px] leading-relaxed mb-3 text-foreground/90"
                                                    style={{
                                                        borderLeft: 'none',
                                                        padding: 0,
                                                        margin: 0,
                                                        fontStyle: 'normal',
                                                    }}
                                                >
                                                    &ldquo;{highlight.text}&rdquo;
                                                </blockquote>

                                                {/* Meta row */}
                                                <div className="flex items-center justify-between gap-4">
                                                    <Link
                                                        href={`/book/${highlight.chapterSlug}/${highlight.sectionSlug}`}
                                                        className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors min-w-0"
                                                    >
                                                        <ChevronRight className="w-3 h-3 shrink-0" />
                                                        <span className="truncate">{highlight.sectionTitle}</span>
                                                        <ExternalLink className="w-3 h-3 shrink-0" />
                                                    </Link>

                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className="text-[11px] text-muted-dark">
                                                            {formatDate(highlight.createdAt)}
                                                        </span>
                                                        <button
                                                            onClick={() => removeHighlight(highlight.id)}
                                                            className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-error/10 transition-all"
                                                            title="Remove highlight"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 text-error" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
