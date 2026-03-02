'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, ArrowRight, Blocks, Shield, Zap, Globe, Github, Twitter } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'

const HeroScene = dynamic(() => import('@/components/three/HeroScene'), { ssr: false })

const features = [
    {
        icon: Blocks,
        title: 'Interactive 3D Diagrams',
        description: 'Explore blockchain concepts with rotatable, zoomable 3D visualizations',
    },
    {
        icon: BookOpen,
        title: 'Book-Like Navigation',
        description: 'Seamless chapter-by-chapter reading with progress tracking',
    },
    {
        icon: Shield,
        title: '15 In-Depth Chapters',
        description: 'From Bitcoin basics to quantum resistance and prediction markets',
    },
    {
        icon: Zap,
        title: 'Interactive Quizzes',
        description: 'Test your understanding with embedded quizzes throughout',
    },
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function HomePage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Theme toggle */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle className="bg-surface/50 backdrop-blur-sm border border-border" />
            </div>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* 3D Background */}
                <div className="absolute inset-0 z-0">
                    <Suspense fallback={null}>
                        <HeroScene />
                    </Suspense>
                </div>

                {/* Gradient overlays */}
                <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/80 via-background/40 to-background" />
                <div className="absolute inset-0 z-[1] bg-gradient-to-r from-background/60 via-transparent to-background/60" />

                {/* Content */}
                <motion.div
                    className="relative z-10 max-w-4xl mx-auto px-6 text-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    <motion.div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md mb-8 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Globe className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-100 font-medium tracking-wide">The Missing Manual for Crypto</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[1.05] drop-shadow-2xl">
                        <span className="text-white">
                            How Crypto
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent filter drop-shadow-[0_0_30px_rgba(129,140,248,0.4)]">
                            Actually Works
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                        An interactive deep-dive into cryptocurrency, blockchain technology,
                        and decentralized finance — with <strong className="text-white font-semibold shadow-black drop-shadow-md">3D visualizations</strong>, quizzes, and
                        book-like navigation.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/book">
                            <motion.button
                                className="group relative flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg transition-all duration-300 shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_40px_rgba(79,70,229,0.6)] overflow-hidden"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                <BookOpen className="w-5 h-5 relative z-10" />
                                <span className="relative z-10">Start Reading</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                            </motion.button>
                        </Link>

                        <a href="https://github.com/0xshikhar/how-crypto-works-app" target="_blank" rel="noopener noreferrer">
                            <motion.button
                                className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-white font-medium text-lg transition-all duration-300"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Github className="w-5 h-5 group-hover:text-white transition-colors" />
                                View Source
                            </motion.button>
                        </a>
                    </div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                >
                    <motion.div
                        className="w-6 h-10 rounded-full border-2 border-muted/30 flex items-start justify-center p-2"
                        animate={{ y: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="relative py-32 px-6 bg-zinc-950">
                {/* Subtle top border glow */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-900/50 to-transparent opacity-50" />

                <motion.div
                    className="max-w-6xl mx-auto relative z-10"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.h2
                        variants={itemVariants}
                        className="text-4xl md:text-5xl font-extrabold text-center mb-4 tracking-tight"
                    >
                        Learn Crypto the{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">Right Way</span>
                    </motion.h2>
                    <motion.p
                        variants={itemVariants}
                        className="text-zinc-400 text-center mb-20 max-w-xl mx-auto text-lg font-light"
                    >
                        Not just documentation — an immersive visual learning experience
                    </motion.p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature) => (
                            <motion.div
                                key={feature.title}
                                variants={itemVariants}
                                className="group relative p-8 rounded-[2rem] border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl hover:bg-zinc-900/80 hover:border-blue-500/30 transition-all duration-500"
                                whileHover={{ y: -8 }}
                            >
                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 group-hover:bg-blue-900/30 border border-zinc-700/50 group-hover:border-blue-700/50 flex items-center justify-center mb-6 transition-colors duration-500">
                                    <feature.icon className="w-7 h-7 text-blue-400 group-hover:text-blue-300 transition-colors duration-500" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-white tracking-tight">{feature.title}</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed font-light">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="border-t border-zinc-900 bg-zinc-950 py-10 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
                    <p className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                        Built from{' '}
                        <a
                            href="https://github.com/lawmaster10/howcryptoworksbook"
                            className="text-blue-400 hover:text-blue-300 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            How Crypto Works Book
                        </a>
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-sm text-zinc-600 font-mono bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">v1.0.0</span>
                        <a href="https://github.com/0xshikhar/how-crypto-works-app" className="text-zinc-500 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="https://twitter.com/0xshikhar" className="text-zinc-500 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                            <Twitter className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
