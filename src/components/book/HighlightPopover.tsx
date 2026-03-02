'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Highlighter } from 'lucide-react'
import { useBookStore } from '@/lib/store'
import { getSelectionOffsets } from '@/lib/highlight-utils'

const HIGHLIGHT_COLORS = [
    { name: 'yellow', value: '#fbbf24' },
    { name: 'green', value: '#34d399' },
    { name: 'blue', value: '#60a5fa' },
    { name: 'pink', value: '#f472b6' },
    { name: 'purple', value: '#a78bfa' },
]

interface HighlightPopoverProps {
    chapterSlug: string
    chapterTitle: string
    sectionSlug: string
    sectionTitle: string
    contentRootRef: RefObject<HTMLElement | null>
}

export function HighlightPopover({
    chapterSlug,
    chapterTitle,
    sectionSlug,
    sectionTitle,
    contentRootRef,
}: HighlightPopoverProps) {
    const [show, setShow] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [selectedText, setSelectedText] = useState('')
    const [selectionOffsets, setSelectionOffsets] = useState<{ startOffset: number; endOffset: number } | null>(null)
    const popoverRef = useRef<HTMLDivElement>(null)
    const addHighlight = useBookStore(s => s.addHighlight)

    const handleSelection = useCallback(() => {
        const selection = window.getSelection()
        if (!selection || selection.isCollapsed || !selection.toString().trim()) {
            // Small delay to allow click-on-popover to register
            setTimeout(() => setShow(false), 150)
            return
        }

        const text = selection.toString().trim()
        if (text.length < 3) return

        const range = selection.getRangeAt(0)
        const root = contentRootRef.current
        if (!root || !root.contains(range.commonAncestorContainer)) {
            setShow(false)
            return
        }

        const offsets = getSelectionOffsets(root, range)
        if (!offsets) {
            setShow(false)
            return
        }

        const rect = range.getBoundingClientRect()

        setSelectedText(text)
        setSelectionOffsets(offsets)
        setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + window.scrollY - 8,
        })
        setShow(true)
    }, [contentRootRef])

    useEffect(() => {
        document.addEventListener('mouseup', handleSelection)
        document.addEventListener('touchend', handleSelection)
        return () => {
            document.removeEventListener('mouseup', handleSelection)
            document.removeEventListener('touchend', handleSelection)
        }
    }, [handleSelection])

    const handleHighlight = (color: string) => {
        addHighlight({
            text: selectedText,
            chapterSlug,
            chapterTitle,
            sectionSlug,
            sectionTitle,
            color,
            startOffset: selectionOffsets?.startOffset,
            endOffset: selectionOffsets?.endOffset,
        })
        window.getSelection()?.removeAllRanges()
        setSelectionOffsets(null)
        setShow(false)
    }

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    ref={popoverRef}
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="fixed z-50 -translate-x-1/2"
                    style={{
                        left: position.x,
                        top: position.y - window.scrollY,
                        transform: 'translate(-50%, -100%)',
                    }}
                >
                    <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-surface border border-border shadow-xl backdrop-blur-sm">
                        <Highlighter className="w-3.5 h-3.5 text-muted mr-1" />
                        {HIGHLIGHT_COLORS.map(color => (
                            <button
                                key={color.name}
                                onClick={() => handleHighlight(color.value)}
                                className="w-5 h-5 rounded-full border-2 border-transparent hover:border-foreground/30 transition-all hover:scale-110"
                                style={{ backgroundColor: color.value }}
                                title={`Highlight ${color.name}`}
                            />
                        ))}
                    </div>
                    {/* Arrow */}
                    <div className="flex justify-center">
                        <div className="w-2 h-2 bg-surface border-r border-b border-border rotate-45 -mt-1" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
