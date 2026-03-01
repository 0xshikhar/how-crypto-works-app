import { getAllChapters } from '@/lib/content-loader'
import { BookLayout } from '@/components/book/BookLayout'

export default function BookRootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const chapters = getAllChapters()

    return (
        <BookLayout chapters={chapters}>
            {children}
        </BookLayout>
    )
}
