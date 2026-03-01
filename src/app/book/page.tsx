import { getAllChapters } from '@/lib/content-loader'
import { BookOverview } from '@/components/book/BookOverview'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Table of Contents',
    description: 'Explore all chapters of How Crypto Actually Works',
}

export default function BookPage() {
    const chapters = getAllChapters()
    return <BookOverview chapters={chapters} />
}
