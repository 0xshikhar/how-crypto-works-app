import { Children, isValidElement } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import type { MDXComponents } from 'mdx/types'
import { cn } from '@/lib/utils'

/* eslint-disable @next/next/no-img-element */

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function getTextContent(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') return String(child)
      if (isValidElement<{ children?: ReactNode }>(child)) return getTextContent(child.props.children)
      return ''
    })
    .join('')
}

type HeadingWithIdProps = {
  level: 2 | 3 | 4
  children?: ReactNode
} & HTMLAttributes<HTMLHeadingElement>

function HeadingWithId({ level, children, id: providedId, ...props }: HeadingWithIdProps) {
  const text = getTextContent(children)
  const id = providedId ?? slugify(text)
  const Tag = `h${level}` as 'h2' | 'h3' | 'h4'

  const classes = {
    2: 'text-2xl font-bold mt-10 mb-4 pb-2 border-b border-border scroll-mt-20',
    3: 'text-xl font-semibold mt-8 mb-3 scroll-mt-20',
    4: 'text-base font-semibold mt-6 mb-2 text-muted scroll-mt-20',
  }

  return (
    <Tag id={id} className={cn(classes[level], 'group')} {...props}>
      <a href={`#${id}`} className="no-underline hover:text-accent transition-colors">
        {children}
      </a>
    </Tag>
  )
}

export const mdxComponentsRsc: MDXComponents = {
  h1: ({ children, ...props }) => (
    <h1 className="text-3xl md:text-4xl font-extrabold mt-2 mb-6 leading-tight tracking-tight" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => <HeadingWithId level={2} {...props}>{children}</HeadingWithId>,
  h3: ({ children, ...props }) => <HeadingWithId level={3} {...props}>{children}</HeadingWithId>,
  h4: ({ children, ...props }) => <HeadingWithId level={4} {...props}>{children}</HeadingWithId>,
  p: ({ children, ...props }) => (
    <p className="mb-5 leading-[1.85] text-foreground/85 text-[1.0625rem]" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc pl-6 mb-5 space-y-1.5 marker:text-accent" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal pl-6 mb-5 space-y-1.5 marker:text-accent" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-foreground/85 leading-relaxed" {...props}>{children}</li>
  ),
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="text-accent hover:text-accent-light border-b border-accent/30 hover:border-accent transition-colors"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
  code: ({ children, className, ...props }) => {
    if (!className) {
      return (
        <code className="px-1.5 py-0.5 rounded-md bg-surface-light text-accent-light text-[0.875em] font-mono" {...props}>
          {children}
        </code>
      )
    }
    return <code className={cn('font-mono text-foreground/90', className)}>{children}</code>
  },
  pre: ({ children, ...props }) => (
    <pre className="my-6 rounded-xl overflow-x-auto border border-border bg-surface p-4 text-sm leading-relaxed" {...props}>
      {children}
    </pre>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="my-6 pl-4 border-l-[3px] border-accent/60 italic text-muted bg-accent/5 py-3 pr-4 rounded-r-xl" {...props}>
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-border" />,
  table: ({ children, ...props }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-sm" {...props}>{children}</table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-surface" {...props}>{children}</thead>
  ),
  th: ({ children, ...props }) => (
    <th className="px-4 py-3 text-left font-semibold border-b border-border" {...props}>{children}</th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-4 py-3 border-b border-border/50 text-foreground/80" {...props}>{children}</td>
  ),
  img: ({ src, alt, ...props }) => (
    <img src={src} alt={alt} className="rounded-xl my-6 max-w-full border border-border" {...props} />
  ),
}
