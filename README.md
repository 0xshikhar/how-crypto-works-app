# How Crypto Actually Works

<!-- make it tag How Crypto Works Book -->

[![Inspired from How Crypto Works Book](https://img.shields.io/badge/Inspired%20from-How%20Crypto%20Works%20Book-0ea5e9?style=flat&logo=github)](https://github.com/lawmaster10/howcryptoworksbook)

An interactive, visual deep-dive into cryptocurrency, blockchain technology, and decentralized finance.
This project adapts the open-source book into an immersive web experience with 3D diagrams, quizzes, and book-like navigation.

- Live preview: https://how-crypto-works.vercel.app

## Features (v1.0.0)

- 15 in-depth chapters (Bitcoin to quantum resistance and prediction markets)
- Interactive 3D diagrams (Three.js + React Three Fiber)
- Book-like navigation (TOC, progress tracking, highlights)
- Embedded quizzes (MDX-powered components)
- Fast static builds (Next.js App Router SSG)

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Tailwind CSS (v4) + Framer Motion
- Three.js + @react-three/fiber + @react-three/drei
- MDX rendering: `next-mdx-remote` (RSC) + `gray-matter`
- State: Zustand
- Runtime: Bun

## Getting Started

```bash
cd web-app
bun install
bun run dev
```

Content is bundled in `web-app/content/Chapters` for deployments. For local authoring, you can also point to an external chapters directory via `CRYPTOBOOK_CONTENT_DIR`.

## Project Structure

- `src/app`: routes + layouts
- `src/components/book`: book UI (layout, section view, highlights)
- `src/components/diagrams`: 3D diagrams
- `src/components/mdx`: MDX UI components
- `src/lib/content-loader.ts`: parses chapters/sections from markdown

## Credits

- Inspired from [How Crypto Works Book](https://github.com/lawmaster10/howcryptoworksbook)
