import { getSection, getAllChapters } from '@/lib/content-loader'
import { notFound } from 'next/navigation'
import { SectionView } from '@/components/book/SectionView'
import type { Metadata } from 'next'

export async function generateStaticParams() {
    const chapters = getAllChapters()
    const params: { chapter: string; section: string }[] = []
    for (const ch of chapters) {
        for (const sec of ch.sections) {
            params.push({ chapter: ch.slug, section: sec.slug })
        }
    }
    return params
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ chapter: string; section: string }>
}): Promise<Metadata> {
    const { chapter, section } = await params
    const data = getSection(chapter, section)
    return {
        title: data ? `${data.section.title} — ${data.chapter.title}` : 'Section',
    }
}

export default async function SectionPage({
    params,
}: {
    params: Promise<{ chapter: string; section: string }>
}) {
    const { chapter: chapterSlug, section: sectionSlug } = await params
    const data = getSection(chapterSlug, sectionSlug)

    if (!data) {
        notFound()
    }

    return (
        <SectionView
            chapter={data.chapter}
            section={data.section}
            prevSection={data.prevSection}
            nextSection={data.nextSection}
        />
    )
}
