'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, ChevronRight } from 'lucide-react'
import { MDXRemote } from 'next-mdx-remote'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { useBookStore } from '@/lib/store'
import { mdxComponents } from '@/lib/mdx-components'
import type { Chapter, Section } from '@/lib/content-loader'

interface SectionViewProps {
  chapter: Chapter
  section: Section
  prevSection?: { chapter: Chapter; section: Section }
  nextSection?: { chapter: Chapter; section: Section }
}

function MDXContent({ content }: { content: string }) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null)

  useEffect(() => {
    const serializeMdx = async () => {
      const serialized = await serialize(content, {
        mdxOptions: { remarkPlugins: [], rehypePlugins: [] },
      })
      setMdxSource(serialized)
    }
    serializeMdx()
  }, [content])

  if (!mdxSource) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-4 bg-surface-light rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
        ))}
      </div>
    )
  }

  return <MDXRemote {...mdxSource} components={mdxComponents} />
}

export function SectionView({ chapter, section, prevSection, nextSection }: SectionViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { markCompleted, isCompleted, updateProgress } = useBookStore()
  const isComplete = isCompleted(chapter.slug, section.slug)

  // Track scroll progress on window scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight > 0) {
        const pct = Math.min(100, (scrollTop / docHeight) * 100)
        updateProgress(chapter.slug, section.slug, pct)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [chapter.slug, section.slug, updateProgress])

  // Active heading tracking via IntersectionObserver
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
      {/* Main content */}
      <div ref={scrollContainerRef} className="flex-1 min-w-0">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          key={section.slug}
          className="max-w-3xl mx-auto px-6 py-10 pb-24"
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-muted mb-6">
            <Link href="/book" className="hover:text-foreground transition-colors">Book</Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted-dark" />
            <Link href={`/book/${chapter.slug}/${chapter.sections[0]?.slug}`} className="hover:text-foreground transition-colors truncate">
              {chapter.title}
            </Link>
          </div>

          {/* Section title */}
          <h1 className="text-3xl md:text-4xl font-extrabold mb-8 leading-tight tracking-tight bg-gradient-to-r from-foreground to-muted bg-clip-text text-transparent">
            {section.title}
          </h1>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <MDXContent content={section.content} />
          </div>

          {/* Mark complete */}
          <div className="mt-16 pt-8 border-t border-border">
            <button
              onClick={() => markCompleted(chapter.slug, section.slug)}
              className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${isComplete
                  ? 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 cursor-default'
                  : 'bg-surface border border-border hover:border-accent/40 hover:bg-surface-light'
                }`}
            >
              <Check className={`w-4 h-4 ${isComplete ? 'text-[#22c55e]' : 'text-muted'}`} />
              {isComplete ? 'Section Completed ✓' : 'Mark as Complete'}
            </button>
          </div>

          {/* Prev / Next navigation */}
          <div className="mt-10 flex items-center justify-between gap-4">
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

      {/* Right TOC sidebar */}
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
                className={`block text-[13px] py-1 transition-colors leading-snug ${h.depth === 2 ? 'pl-0' : h.depth === 3 ? 'pl-3' : 'pl-6'
                  } ${activeId === h.id
                    ? 'text-accent font-medium'
                    : 'text-muted-dark hover:text-foreground'
                  }`}
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
