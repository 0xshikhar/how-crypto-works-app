'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, ArrowRight, Layers, Check, Clock } from 'lucide-react'
import { useBookStore } from '@/lib/store'
import type { Chapter } from '@/lib/content-loader'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function BookOverview({ chapters }: { chapters: Chapter[] }) {
    const { completedSections, lastRead, getProgress } = useBookStore()
    const lastReadChapter = lastRead ? chapters.find(chapter => chapter.slug === lastRead.chapterSlug) : null
    const lastReadSection = lastReadChapter?.sections.find(section => section.slug === lastRead?.sectionSlug)
    const lastReadProgress = lastRead && lastReadChapter && lastReadSection
        ? Math.round(getProgress(lastRead.chapterSlug, lastRead.sectionSlug))
        : null

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-accent" />
                    </div>
                    <h1 className="text-3xl font-bold">How Crypto Actually Works</h1>
                </div>
                <p className="text-muted mt-3 mb-10 max-w-2xl leading-relaxed">
                    The Missing Manual — an in-depth exploration of cryptocurrency, blockchain
                    technology, DeFi, and the future of decentralized systems. 15 chapters covering
                    everything from Bitcoin fundamentals to quantum resistance.
                </p>
            </motion.div>

            {lastReadChapter && lastReadSection && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    className="mb-10"
                >
                    <Link
                        href={`/book/${lastReadChapter.slug}/${lastReadSection.slug}`}
                        className="group flex items-center gap-4 p-5 rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 via-surface/40 to-surface hover:border-accent/50 transition-all"
                    >
                        <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                            <BookOpen className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs uppercase tracking-[0.2em] text-muted-dark mb-1">Continue Reading</div>
                            <div className="text-sm text-muted-dark truncate">{lastReadChapter.title}</div>
                            <div className="text-base font-semibold text-foreground truncate">{lastReadSection.title}</div>
                        </div>
                        {typeof lastReadProgress === 'number' && (
                            <div className="hidden sm:flex items-center gap-2 text-xs text-muted">
                                <span>{lastReadProgress}% read</span>
                                <div className="w-20 h-1.5 bg-surface-light rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent rounded-full transition-all"
                                        style={{ width: `${lastReadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                        <ArrowRight className="w-4 h-4 text-muted-dark group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
                    </Link>
                </motion.div>
            )}

            <motion.div
                className="space-y-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {chapters.map((chapter, idx) => {
                    const completedCount = chapter.sections.filter(s =>
                        completedSections.includes(`${chapter.slug}/${s.slug}`)
                    ).length
                    const totalCount = chapter.sections.length
                    const readingTime = chapter.sections.reduce((sum, s) => sum + s.readingTime, 0)
                    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
                    const isComplete = completedCount === totalCount && totalCount > 0

                    return (
                        <motion.div key={chapter.slug} variants={itemVariants}>
                            <Link
                                href={`/book/${chapter.slug}/${chapter.sections[0]?.slug || ''}`}
                                className="group flex items-center gap-4 p-5 rounded-xl border border-border bg-surface/50 hover:bg-surface hover:border-accent/20 transition-all duration-300"
                            >
                                <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
                                    {isComplete ? (
                                        <Check className="w-5 h-5 text-success" />
                                    ) : idx === 0 ? (
                                        <span className="text-sm font-semibold text-muted">⟡</span>
                                    ) : (
                                        <span className="text-sm font-semibold text-muted">{idx}</span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                                            {idx === 0 ? 'Preface: ' : `Chapter ${idx}: `}
                                            {chapter.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-xs text-muted-dark flex items-center gap-1">
                                            <Layers className="w-3 h-3" />
                                            {totalCount} sections
                                        </span>
                                        <span className="text-xs text-muted-dark flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {readingTime} min
                                        </span>
                                        {completedCount > 0 && (
                                            <span className="text-xs text-accent">
                                                {completedCount}/{totalCount} completed
                                            </span>
                                        )}
                                    </div>
                                    {/* Progress bar */}
                                    {completedCount > 0 && (
                                        <div className="mt-2 h-1 bg-surface-light rounded-full overflow-hidden w-48">
                                            <div
                                                className="h-full bg-accent/60 rounded-full transition-all"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <ArrowRight className="w-4 h-4 text-muted-dark group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
                            </Link>
                        </motion.div>
                    )
                })}
            </motion.div>
        </div>
    )
}
