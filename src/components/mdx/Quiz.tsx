'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuizProps {
  question: string
  options: string[]
  answer: string
  explanation?: string
}

export function Quiz({ question, options, answer, explanation }: QuizProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  const isCorrect = selected === answer
  const hasAnswered = selected !== null

  const reset = () => {
    setSelected(null)
    setRevealed(false)
  }

  return (
    <div className="my-8 rounded-2xl border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border bg-surface-light/50">
        <HelpCircle className="w-4 h-4 text-accent shrink-0" />
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">Quick Check</span>
      </div>

      <div className="px-5 py-5">
        <p className="font-medium text-foreground mb-5 leading-relaxed">{question}</p>

        <div className="space-y-2.5">
          {options.map((opt) => {
            const isSelected = selected === opt
            const isAnswer = opt === answer
            const showResult = hasAnswered

            let cls = 'border-border bg-surface/50 hover:bg-surface hover:border-border-light text-foreground cursor-pointer'
            if (showResult && isAnswer) cls = 'border-[#22c55e]/60 bg-[#22c55e]/10 text-[#22c55e] cursor-default'
            else if (showResult && isSelected && !isAnswer) cls = 'border-red-500/60 bg-red-500/10 text-red-400 cursor-default'
            else if (showResult) cls = 'border-border/50 text-muted-dark cursor-default opacity-60'

            return (
              <button
                key={opt}
                onClick={() => { if (!hasAnswered) { setSelected(opt); setRevealed(true) } }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-200',
                  cls
                )}
              >
                <span className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                  showResult && isAnswer ? 'border-[#22c55e]' :
                    showResult && isSelected ? 'border-red-500' :
                      isSelected ? 'border-accent' : 'border-muted-dark'
                )}>
                  {showResult && isAnswer && <CheckCircle className="w-3.5 h-3.5 text-[#22c55e]" />}
                  {showResult && isSelected && !isAnswer && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                </span>
                {opt}
              </button>
            )
          })}
        </div>

        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className={cn(
                'mt-4 px-4 py-3 rounded-xl text-sm flex items-start gap-2',
                isCorrect ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-red-500/10 text-red-400'
              )}>
                {isCorrect
                  ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                <div>
                  <span className="font-medium">{isCorrect ? 'Correct!' : 'Not quite.'}</span>
                  {!isCorrect && <span className="ml-1">The answer is: <strong>{answer}</strong></span>}
                  {explanation && <p className="mt-1 text-current/80 text-xs">{explanation}</p>}
                </div>
              </div>
              <button
                onClick={reset}
                className="mt-3 text-xs text-muted-dark hover:text-foreground transition-colors underline underline-offset-2"
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
