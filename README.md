# How Crypto Actually Works App

An interactive, visual deep-dive into cryptocurrency, blockchain technology, and decentralized finance. This project adapts the open-source book into an immersive web experience with interactive 3D diagrams and book-like navigation.

## Live Demo

https://how-crypto-works.vercel.app

## Key Features

- 15 in-depth chapters, from Bitcoin fundamentals to quantum resistance and prediction markets
- Interactive 3D diagrams (Three.js + React Three Fiber)
- Book-style navigation: table of contents, progress tracking, highlights, and search
- Fast builds with the Next.js App Router

## Tech Stack

- Next.js 14 (App Router), React 18
- Tailwind CSS v4, Framer Motion
- Three.js, @react-three/fiber, @react-three/drei
- MDX rendering: next-mdx-remote (RSC) + gray-matter
- Zustand for client state
- Runtime: Bun

## Project Structure

- src/app: routes and layouts
- src/components/book: book UI (layout, section view, highlights, search)
- src/components/diagrams: interactive diagrams
- src/components/mdx: MDX UI components (callouts, code blocks, info boxes)
- src/lib/content-loader.ts: parses chapters and sections from markdown

## Content Authoring

Content is bundled in web-app/content/Chapters for deployments. For local authoring or custom content, point to an external chapters directory via CRYPTOBOOK_CONTENT_DIR.

## Getting Started

```bash
git clone git@github.com:0xshikhar/how-crypto-works-app.git
cd how-crypto-works-app/web-app

bun install
bun run dev
```

## Scripts

```bash
bun run dev
bun run build
bun run start
bun run lint
```

## Contributing

Contributions are welcome, including:

- Content: propose new chapters, sections, or improvements to existing sections
- Diagrams: add new interactive diagrams or improve existing ones
- Reader experience: navigation, search, highlights, performance, accessibility
- Bug fixes: rendering, layout, and cross-device issues

### Proposing Topics and Content Ideas

If you want to add a new topic, open an issue with:

- The chapter/section title you’re proposing
- The intended audience level (beginner, intermediate, advanced)
- A short outline (bullets) and any references you want included
- Any diagram ideas that would make it easier to understand

### Contributing Content (Markdown)

1. Add or update markdown files in web-app/content/Chapters.
2. Keep sections focused and use headings for structure.
3. Prefer clear explanations and references over hype or price/speculation.

### Contributing Code

1. Fork the repo and create a feature branch.
2. Keep changes focused and write clear commit messages.
3. Run bun run lint before opening a PR.
4. Open a pull request with a concise summary and screenshots for UI changes.

## Roadmap

- Add optional knowledge checks/quizzes embedded in content
- Add more diagrams and interactive learning modules

## Author

Created and maintained by 0xShikhar.

## Credits

- Book/content inspiration: How Crypto Works Book (open-source): https://github.com/lawmaster10/howcryptoworksbook
