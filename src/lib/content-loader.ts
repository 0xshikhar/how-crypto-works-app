import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface Heading {
    depth: number
    text: string
    id: string
}

export interface Section {
    slug: string
    title: string
    content: string
    headings: Heading[]
    readingTime: number // minutes
}

export interface Chapter {
    slug: string
    title: string
    order: number
    sections: Section[]
    description?: string
}

const CONTENT_DIR_CANDIDATES = [
    process.env.BOOK_CONTENT_DIR,
    path.join(process.cwd(), 'content', 'Chapters'),
    path.join(process.cwd(), 'web-app', 'content', 'Chapters'),
    path.join(process.cwd(), 'howcryptoworksbook', 'Chapters'),
    path.join(process.cwd(), '..', 'howcryptoworksbook', 'Chapters'),
].filter((value): value is string => Boolean(value))

function resolveContentDir(): string | null {
    for (const candidate of Array.from(new Set(CONTENT_DIR_CANDIDATES))) {
        if (fs.existsSync(candidate)) return candidate
    }
    return null
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

function estimateReadingTime(content: string): number {
    const words = content.replace(/[#*_`\[\]()]/g, '').split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(words / 200))
}

function extractHeadings(content: string): Heading[] {
    const headingRegex = /^(#{1,4})\s+(.+)$/gm
    const headings: Heading[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
        headings.push({
            depth: match[1].length,
            text: match[2].trim(),
            id: slugify(match[2].trim()),
        })
    }

    return headings
}

function parseChapterTitle(filename: string, content: string): string {
    // Try to extract title from the first # heading
    const titleMatch = content.match(/^#\s+(.+)$/m)
    if (titleMatch) {
        return titleMatch[1].replace(/^Chapter\s+[IVXLC]+:\s*/i, '').trim()
    }

    // Fallback: derive from filename
    const name = filename.replace(/\.md$/, '').replace(/^(ch\d+_|_)/, '')
    return name
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
}

function parseChapterOrder(filename: string): number {
    if (filename === '_preface.md') return 0
    const match = filename.match(/ch(\d+)/)
    return match ? parseInt(match[1], 10) : 99
}

function splitIntoSections(content: string, chapterTitle: string): Section[] {
    // Remove the chapter title (first # heading)
    const withoutTitle = content.replace(/^#\s+.+$/m, '').trim()

    // Split by ## headings (sections)
    const sectionRegex = /^##\s+(.+)$/gm
    const sectionMatches: { title: string; index: number }[] = []
    let match

    while ((match = sectionRegex.exec(withoutTitle)) !== null) {
        sectionMatches.push({
            title: match[1].trim(),
            index: match.index,
        })
    }

    if (sectionMatches.length === 0) {
        // No ## headings — treat entire content as one section
        return [{
            slug: slugify(chapterTitle),
            title: chapterTitle,
            content: withoutTitle,
            headings: extractHeadings(withoutTitle),
            readingTime: estimateReadingTime(withoutTitle),
        }]
    }

    const sections: Section[] = []
    for (let i = 0; i < sectionMatches.length; i++) {
        const start = sectionMatches[i].index
        const end = i + 1 < sectionMatches.length ? sectionMatches[i + 1].index : withoutTitle.length
        const sectionContent = withoutTitle.slice(start, end).trim()

        // Remove the ## heading from the section content for display  
        const contentWithoutHeading = sectionContent.replace(/^##\s+.+$/m, '').trim()

        sections.push({
            slug: slugify(sectionMatches[i].title),
            title: sectionMatches[i].title,
            content: contentWithoutHeading,
            headings: extractHeadings(contentWithoutHeading),
            readingTime: estimateReadingTime(contentWithoutHeading),
        })
    }

    return sections
}

export function getAllChapters(): Chapter[] {
    const contentDir = resolveContentDir()
    if (!contentDir) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error(
                `Chapter content directory not found. Checked: ${CONTENT_DIR_CANDIDATES.join(', ')}`
            )
        }
        return []
    }
    const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'))

    const chapters: Chapter[] = files.map(filename => {
        const filePath = path.join(contentDir, filename)
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const { content } = matter(fileContent)

        const title = parseChapterTitle(filename, content)
        const order = parseChapterOrder(filename)
        const slug = filename === '_preface.md' ? 'preface' : slugify(title)
        const sections = splitIntoSections(content, title)

        // Get first paragraph as description
        const descMatch = content.match(/^(?!#)(.+)/m)
        const description = descMatch ? descMatch[1].slice(0, 200) + '...' : ''

        return { slug, title, order, sections, description }
    })

    return chapters.sort((a, b) => a.order - b.order)
}

export function getChapter(slug: string): Chapter | undefined {
    const chapters = getAllChapters()
    return chapters.find(c => c.slug === slug)
}

export function getSection(chapterSlug: string, sectionSlug: string): { chapter: Chapter; section: Section; prevSection?: { chapter: Chapter; section: Section }; nextSection?: { chapter: Chapter; section: Section } } | undefined {
    const chapters = getAllChapters()
    const chapter = chapters.find(c => c.slug === chapterSlug)
    if (!chapter) return undefined

    const sectionIndex = chapter.sections.findIndex(s => s.slug === sectionSlug)
    if (sectionIndex === -1) return undefined

    const section = chapter.sections[sectionIndex]

    // Build prev/next across chapters
    let prevSection: { chapter: Chapter; section: Section } | undefined
    let nextSection: { chapter: Chapter; section: Section } | undefined

    if (sectionIndex > 0) {
        prevSection = { chapter, section: chapter.sections[sectionIndex - 1] }
    } else {
        const chapterIdx = chapters.findIndex(c => c.slug === chapterSlug)
        if (chapterIdx > 0) {
            const prevChapter = chapters[chapterIdx - 1]
            prevSection = { chapter: prevChapter, section: prevChapter.sections[prevChapter.sections.length - 1] }
        }
    }

    if (sectionIndex < chapter.sections.length - 1) {
        nextSection = { chapter, section: chapter.sections[sectionIndex + 1] }
    } else {
        const chapterIdx = chapters.findIndex(c => c.slug === chapterSlug)
        if (chapterIdx < chapters.length - 1) {
            const nextChapter = chapters[chapterIdx + 1]
            nextSection = { chapter: nextChapter, section: nextChapter.sections[0] }
        }
    }

    return { chapter, section, prevSection, nextSection }
}

export function getTotalSections(): number {
    return getAllChapters().reduce((sum, ch) => sum + ch.sections.length, 0)
}
