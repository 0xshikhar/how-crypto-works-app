# 📖 How Crypto Works App

[](#-how-crypto-works-app)

An interactive, visual deep-dive into cryptocurrency, blockchain technology, and decentralized finance. This project adapts the open-source book into an immersive web experience with interactive 3D diagrams and book-like navigation.

[![Live Demo](https://img.shields.io/badge/Live-Demo-2ea44f?style=for-the-badge)](https://how-crypto-works.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Tech Stack](https://img.shields.io/badge/Tech-Next.js_14-blueviolet?style=for-the-badge)](#tech-stack)

[Key Features](#key-features) • [Tech Stack](#tech-stack) • [Project Structure](#project-structure) • [Getting Started](#getting-started) • [Contributing](#contributing) • [Roadmap](#roadmap) • [Credits](#credits)

---

## Key Features

[](#key-features)

- **15 in-depth chapters**, from Bitcoin fundamentals to quantum resistance and prediction markets
- **Interactive 3D diagrams** powered by Three.js + React Three Fiber
- **Book-style navigation** with table of contents, progress tracking, highlights, and search

---

## Tech Stack

[](#tech-stack)

| Category    | Technology                                         |
| ----------- | -------------------------------------------------- |
| Framework   | Next.js 14 (App Router), React 18                  |
| Styling     | Tailwind CSS v4, Framer Motion                     |
| 3D Graphics | Three.js, @react-three/fiber, @react-three/drei    |
| Content     | MDX rendering: next-mdx-remote (RSC) + gray-matter |
| State       | Zustand for client state                           |
| Runtime     | Bun                                                |

---

## Project Structure

[](#project-structure)

```
how-crypto-works-app/
├── content/Chapters/       # All markdown files for the book
├── src/app/               # Routes and layouts
├── src/components/
│   ├── book/              # Book UI (layout, section view, highlights, search)
│   ├── diagrams/          # Interactive diagrams
│   └── mdx/               # MDX UI components (callouts, code blocks, info boxes)
└── src/lib/
    └── content-loader.ts   # Parses chapters and sections from markdown
```

---

## Getting Started

[](#getting-started)

```bash
# Clone the repository
git clone git@github.com:0xshikhar/how-crypto-works-app.git

# Navigate to the web-app directory
cd how-crypto-works-app

# Install dependencies
bun install

# Start the development server
bun run dev
```

### Available Scripts

[](#available-scripts)

| Command         | Description              |
| --------------- | ------------------------ |
| `bun run dev`   | Start development server |
| `bun run build` | Build for production     |
| `bun run start` | Start production server  |
| `bun run lint`  | Run linting              |

---

## Content Authoring

[](#content-authoring)

Content is bundled in `web-app/content/Chapters` for deployments. For local authoring or custom content, point to an external chapters directory via `BOOK_CONTENT_DIR`.

---

## Contributing

[](#contributing)

Contributions are welcome, including:

- **Content**: Propose new chapters, sections, or improvements to existing sections
- **Diagrams**: Add new interactive diagrams or improve existing ones
- **Reader experience**: Navigation, search, highlights, performance, accessibility
- **Bug fixes**: Rendering, layout, and cross-device issues

### Proposing Topics and Content Ideas

[](#proposing-topics-and-content-ideas)

If you want to add a new topic, open an issue with:

- The chapter/section title you're proposing
- The intended audience level (beginner, intermediate, advanced)
- A short outline (bullets) and any references you want included
- Any diagram ideas that would make it easier to understand

### Contributing Code

[](#contributing-code)

1. Fork the repo and create a feature branch
2. Keep changes focused and write clear commit messages
3. Run `bun run lint` before opening a PR
4. Open a pull request with a concise summary and screenshots (optional) for UI changes

---

## Roadmap

[](#roadmap)

- [ ] Add more topics/information around blockchain/crypto
- [ ] Add optional knowledge checks/quizzes embedded in content
- [ ] Add more diagrams and interactive learning modules

---

## Credits

[](#credits)

- Book/content inspiration: [How Crypto Works Book](https://github.com/lawmaster10/howcryptoworksbook) (open-source)

---

## Author

[](#author)

Created and maintained by [0xShikhar](https://x.com/0xshikhar)

> [!NOTE]
> Feel free to use this project for learning and contribution. Star the repo if you find it useful!

---

## License

<a rel="license" href="https://creativecommons.org/licenses/by-nc-nd/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-nd/4.0/88x31.png" /></a>

This book content is licensed under a <a rel="license" href="https://creativecommons.org/licenses/by-nc-nd/4.0/">Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License</a>. Individual contributions are licensed under CC-BY; the compiled book is published under CC-BY-NC-ND.
