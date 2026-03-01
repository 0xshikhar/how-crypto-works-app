'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, ArrowRight, Blocks, Shield, Zap, Globe } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

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
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface/50 backdrop-blur-sm mb-8"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Globe className="w-4 h-4 text-accent" />
                        <span className="text-sm text-muted">The Missing Manual for Crypto</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                        <span className="bg-gradient-to-r from-foreground via-foreground to-muted bg-clip-text text-transparent">
                            How Crypto
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-accent via-accent-light to-blue-300 bg-clip-text text-transparent">
                            Actually Works
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
                        An interactive deep-dive into cryptocurrency, blockchain technology,
                        and decentralized finance — with 3D visualizations, quizzes, and
                        book-like navigation.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/book">
                            <motion.button
                                className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-accent hover:bg-accent-dark text-white font-semibold text-lg transition-all duration-300 shadow-lg shadow-accent/25 hover:shadow-accent/40"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <BookOpen className="w-5 h-5" />
                                Start Reading
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </Link>
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
            <section className="py-24 px-6">
                <motion.div
                    className="max-w-6xl mx-auto"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.h2
                        variants={itemVariants}
                        className="text-3xl md:text-4xl font-bold text-center mb-4"
                    >
                        Learn Crypto the{' '}
                        <span className="text-accent">Right Way</span>
                    </motion.h2>
                    <motion.p
                        variants={itemVariants}
                        className="text-muted text-center mb-16 max-w-xl mx-auto"
                    >
                        Not just documentation — an immersive visual learning experience
                    </motion.p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature) => (
                            <motion.div
                                key={feature.title}
                                variants={itemVariants}
                                className="group p-6 rounded-2xl border border-border bg-surface/50 hover:bg-surface hover:border-accent/30 transition-all duration-300"
                                whileHover={{ y: -4 }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                                    <feature.icon className="w-6 h-6 text-accent" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                <p className="text-sm text-muted leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-8 px-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <p className="text-sm text-muted">
                        Built from{' '}
                        <a
                            href="https://github.com"
                            className="text-accent hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            How Crypto Works Book
                        </a>
                    </p>
                    <p className="text-sm text-muted-dark">Interactive Edition</p>
                </div>
            </footer>
        </div>
    )
}
