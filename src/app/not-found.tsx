import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-8 h-8 text-muted" />
                </div>
                <h1 className="text-4xl font-bold mb-3">404</h1>
                <p className="text-muted mb-8">Page not found. The section you are looking for may have moved.</p>
                <Link
                    href="/book"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-dark text-white font-medium transition-colors"
                >
                    <BookOpen className="w-4 h-4" />
                    Back to Book
                </Link>
            </div>
        </div>
    )
}
