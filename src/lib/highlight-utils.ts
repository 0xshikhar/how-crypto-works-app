import type { Highlight } from '@/lib/store'

type TextPosition = {
  node: Text
  offset: number
}

function isNodeInsideRoot(root: HTMLElement, node: Node): boolean {
  return root === node || root.contains(node)
}

function getTextPositionFromOffset(root: HTMLElement, targetOffset: number): TextPosition | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let currentOffset = 0
  let lastTextNode: Text | null = null

  while (walker.nextNode()) {
    const textNode = walker.currentNode as Text
    const textLength = textNode.textContent?.length ?? 0
    lastTextNode = textNode

    if (targetOffset <= currentOffset + textLength) {
      return {
        node: textNode,
        offset: Math.max(0, targetOffset - currentOffset),
      }
    }

    currentOffset += textLength
  }

  if (targetOffset === currentOffset && lastTextNode) {
    return {
      node: lastTextNode,
      offset: lastTextNode.textContent?.length ?? 0,
    }
  }

  return null
}

function createRangeFromOffsets(root: HTMLElement, startOffset: number, endOffset: number): Range | null {
  if (startOffset < 0 || endOffset < 0 || endOffset <= startOffset) return null

  const start = getTextPositionFromOffset(root, startOffset)
  const end = getTextPositionFromOffset(root, endOffset)
  if (!start || !end) return null

  const range = document.createRange()
  try {
    range.setStart(start.node, start.offset)
    range.setEnd(end.node, end.offset)
  } catch {
    return null
  }

  if (range.collapsed) return null
  return range
}

function unwrapExistingHighlights(root: HTMLElement) {
  const marks = root.querySelectorAll('mark[data-user-highlight="true"]')
  marks.forEach((mark) => {
    const parent = mark.parentNode
    if (!parent) return

    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark)
    }
    parent.removeChild(mark)
  })
  root.normalize()
}

function createHighlightMark(highlight: Highlight): HTMLElement {
  const mark = document.createElement('mark')
  mark.setAttribute('data-user-highlight', 'true')
  mark.setAttribute('data-highlight-id', highlight.id)
  mark.className = 'user-highlight'

  const color = highlight.color
  mark.style.backgroundColor = color.startsWith('#') && color.length === 7 ? `${color}66` : color
  mark.style.color = 'inherit'
  mark.style.padding = '0 0.08em'
  mark.style.borderRadius = '0.2em'
  mark.style.setProperty('box-decoration-break', 'clone')
  mark.style.setProperty('-webkit-box-decoration-break', 'clone')

  return mark
}

function wrapRangeText(range: Range, highlight: Highlight) {
  if (range.collapsed) return

  const mark = createHighlightMark(highlight)
  const fragment = range.extractContents()
  mark.appendChild(fragment)
  range.insertNode(mark)
}

function applyMark(range: Range, highlight: Highlight) {
  if (range.collapsed) return

  const root = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
    ? (range.commonAncestorContainer as Element)
    : range.commonAncestorContainer.parentElement

  if (!root) {
    wrapRangeText(range, highlight)
    return
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []

  while (walker.nextNode()) {
    const textNode = walker.currentNode as Text
    if (!range.intersectsNode(textNode)) continue
    if (textNode.parentElement?.closest('mark')) continue
    textNodes.push(textNode)
  }

  if (textNodes.length <= 1) {
    wrapRangeText(range, highlight)
    return
  }

  textNodes.forEach((textNode) => {
    const subRange = document.createRange()
    const isFirst = textNode === range.startContainer
    const isLast = textNode === range.endContainer

    const start = isFirst ? range.startOffset : 0
    const end = isLast ? range.endOffset : (textNode.textContent?.length ?? 0)

    if (end <= start) return

    try {
      subRange.setStart(textNode, start)
      subRange.setEnd(textNode, end)
    } catch {
      return
    }

    wrapRangeText(subRange, highlight)
  })
}

function createRangeFromText(root: HTMLElement, text: string, usedRanges: Set<string>): Range | null {
  const rootText = root.textContent ?? ''
  if (!text.trim()) return null

  let startIndex = rootText.indexOf(text)
  while (startIndex !== -1) {
    const endIndex = startIndex + text.length
    const key = `${startIndex}-${endIndex}`
    if (!usedRanges.has(key)) {
      const range = createRangeFromOffsets(root, startIndex, endIndex)
      if (range) {
        usedRanges.add(key)
        return range
      }
    }
    startIndex = rootText.indexOf(text, startIndex + 1)
  }

  return null
}

export function getSelectionOffsets(root: HTMLElement, range: Range): { startOffset: number; endOffset: number } | null {
  if (!isNodeInsideRoot(root, range.startContainer) || !isNodeInsideRoot(root, range.endContainer)) {
    return null
  }

  const startRange = document.createRange()
  startRange.selectNodeContents(root)
  startRange.setEnd(range.startContainer, range.startOffset)
  const startOffset = startRange.toString().length

  const endRange = document.createRange()
  endRange.selectNodeContents(root)
  endRange.setEnd(range.endContainer, range.endOffset)
  const endOffset = endRange.toString().length

  if (endOffset <= startOffset) return null
  return { startOffset, endOffset }
}

export function renderSectionHighlights(root: HTMLElement, highlights: Highlight[]) {
  unwrapExistingHighlights(root)
  if (highlights.length === 0) return

  const usedRanges = new Set<string>()
  const anchored = highlights
    .filter((h) => typeof h.startOffset === 'number' && typeof h.endOffset === 'number')
    .sort((a, b) => (b.startOffset ?? 0) - (a.startOffset ?? 0))

  anchored.forEach((highlight) => {
    const start = highlight.startOffset
    const end = highlight.endOffset
    if (typeof start !== 'number' || typeof end !== 'number') return

    const key = `${start}-${end}`
    if (usedRanges.has(key)) return

    const range = createRangeFromOffsets(root, start, end)
    if (!range) return

    usedRanges.add(key)
    applyMark(range, highlight)
  })

  const unanchored = highlights.filter((h) => typeof h.startOffset !== 'number' || typeof h.endOffset !== 'number')
  unanchored.forEach((highlight) => {
    const range = createRangeFromText(root, highlight.text, usedRanges)
    if (range) applyMark(range, highlight)
  })
}
