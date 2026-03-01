import { getChapter, getAllChapters } from '@/lib/content-loader'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateStaticParams() {
    const chapters = getAllChapters()
    return chapters.map(ch => ({ chapter: ch.slug }))
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ chapter: string }>
}): Promise<Metadata> {
    const { chapter: slug } = await params
    const chapter = getChapter(slug)
    return { title: chapter?.title || 'Chapter' }
}

export default async function ChapterPage({
    params,
}: {
    params: Promise<{ chapter: string }>
}) {
    const { chapter: slug } = await params
    const chapter = getChapter(slug)

    if (!chapter || chapter.sections.length === 0) {
        redirect('/book')
    }

    // Redirect to first section
    redirect(`/book/${slug}/${chapter.sections[0].slug}`)
}
