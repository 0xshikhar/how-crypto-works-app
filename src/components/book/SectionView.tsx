'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, ChevronRight, Clock, ArrowUp } from 'lucide-react'
import { useBookStore } from '@/lib/store'
import type { Highlight } from '@/lib/store'
import { HighlightPopover } from '@/components/book/HighlightPopover'
import { renderSectionHighlights } from '@/lib/highlight-utils'
import type { Chapter, Section } from '@/lib/content-loader'

interface SectionViewProps {
  chapter: Chapter
  section: Section
  content: React.ReactNode
  prevSection?: { chapter: Chapter; section: Section }
  nextSection?: { chapter: Chapter; section: Section }
}

export function SectionView({ chapter, section, content, prevSection, nextSection }: SectionViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { updateProgress, loadHighlights, highlights } = useBookStore()
  const [contentReady, setContentReady] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  const sectionHighlights = useMemo<Highlight[]>(
    () => highlights.filter(h => h.chapterSlug === chapter.slug && h.sectionSlug === section.slug),
    [chapter.slug, section.slug, highlights]
  )

  useEffect(() => { loadHighlights() }, [loadHighlights])

  useEffect(() => {
    setContentReady(false)
    const rafId = window.requestAnimationFrame(() => setContentReady(true))
    return () => window.cancelAnimationFrame(rafId)
  }, [chapter.slug, section.slug, content])

  useEffect(() => {
    if (!contentReady || !contentRef.current) return
    const rafId = window.requestAnimationFrame(() => {
      if (contentRef.current) {
        renderSectionHighlights(contentRef.current, sectionHighlights)
      }
    })
    return () => window.cancelAnimationFrame(rafId)
  }, [contentReady, sectionHighlights])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight > 0) {
        const pct = Math.min(100, (scrollTop / docHeight) * 100)
        updateProgress(chapter.slug, section.slug, pct)
      }
      setShowBackToTop(scrollTop > 300)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [chapter.slug, section.slug, updateProgress])

  const [activeId, setActiveId] = useState<string>('')
  useEffect(() => {
    if (section.headings.length === 0) return
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id) })
      },
      { rootMargin: '-20% 0% -70% 0%' }
    )
    document.querySelectorAll('h2[id], h3[id], h4[id]').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [section])

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <div ref={scrollContainerRef} className="flex-1 min-w-0">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          key={section.slug}
          className="max-w-3xl mx-auto px-6 py-10 pb-24"
        >
          <div className="flex items-center gap-1.5 text-sm text-muted mb-6">
            <Link href="/book" className="hover:text-foreground transition-colors">Book</Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted-dark" />
            <Link href={`/book/${chapter.slug}/${chapter.sections[0]?.slug}`} className="hover:text-foreground transition-colors truncate">
              {chapter.title}
            </Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight tracking-tight bg-gradient-to-r from-foreground to-muted bg-clip-text text-transparent">
            {section.title}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-muted-dark mb-8">
            <Clock className="w-3 h-3" />
            <span>{section.readingTime} min read</span>
          </div>

          <div ref={contentRef} className="prose prose-invert max-w-none">
            {content}
          </div>

          <HighlightPopover
            chapterSlug={chapter.slug}
            chapterTitle={chapter.title}
            sectionSlug={section.slug}
            sectionTitle={section.title}
            contentRootRef={contentRef}
          />

          <div className=" mt-16 pt-8 border-t border-border flex items-center justify-between gap-4">
            {prevSection ? (
              <Link
                href={`/book/${prevSection.chapter.slug}/${prevSection.section.slug}`}
                className="group flex items-center gap-3 px-5 py-4 rounded-xl border border-border bg-surface/50 hover:bg-surface hover:border-accent/30 transition-all max-w-[45%]"
              >
                <ArrowLeft className="w-4 h-4 text-muted group-hover:text-accent group-hover:-translate-x-0.5 transition-all shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-xs text-muted-dark mb-0.5">Previous</div>
                  <div className="text-sm font-medium truncate">{prevSection.section.title}</div>
                </div>
              </Link>
            ) : <div />}

            {nextSection ? (
              <Link
                href={`/book/${nextSection.chapter.slug}/${nextSection.section.slug}`}
                className="group flex items-center gap-3 px-5 py-4 rounded-xl border border-border bg-surface/50 hover:bg-surface hover:border-accent/30 transition-all max-w-[45%] ml-auto"
              >
                <div className="overflow-hidden text-right">
                  <div className="text-xs text-muted-dark mb-0.5">Next</div>
                  <div className="text-sm font-medium truncate">{nextSection.section.title}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ) : <div />}
          </div>
        </motion.article>
      </div>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-30 p-3 rounded-full bg-accent text-white shadow-lg shadow-accent/25 hover:bg-accent-dark transition-colors"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {section.headings.length > 0 && (
        <aside className="hidden xl:block w-56 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto border-l border-border px-4 py-8">
          <h3 className="text-[11px] uppercase tracking-widest font-semibold text-muted-dark mb-4">On this page</h3>
          <nav className="space-y-0.5">
            {section.headings.map(h => (
              <a
                key={h.id}
                href={`#${h.id}`}
                onClick={e => {
                  e.preventDefault()
                  document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  setActiveId(h.id)
                }}
                className={`block text-[13px] py-1 transition-colors leading-snug ${h.depth === 2 ? 'pl-0' : h.depth === 3 ? 'pl-3' : 'pl-6'} ${activeId === h.id ? 'text-accent font-medium' : 'text-muted-dark hover:text-foreground'}`}
              >
                {h.text}
              </a>
            ))}
          </nav>
        </aside>
      )}
    </div>
  )
}
