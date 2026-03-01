import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "How Crypto Works — The Interactive Book",
    template: "%s | CryptoBook",
  },
  description:
    "An interactive, immersive learning experience for understanding cryptocurrency, blockchain, and DeFi from first principles.",
  keywords: [
    "crypto",
    "blockchain",
    "bitcoin",
    "ethereum",
    "DeFi",
    "interactive book",
    "learning",
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
