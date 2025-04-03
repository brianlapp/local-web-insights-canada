import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuditScoreProps {
  score: number
  className?: string
}

type ScoreThreshold = {
  min: number
  max: number
  color: 'green' | 'yellow' | 'red'
  message: string
  Icon: typeof CheckCircle | typeof AlertCircle | typeof XCircle
}

const SCORE_THRESHOLDS: ScoreThreshold[] = [
  {
    min: 81,
    max: 100,
    color: 'green',
    message: 'Excellent',
    Icon: CheckCircle,
  },
  {
    min: 50,
    max: 80,
    color: 'yellow',
    message: 'Needs Improvement',
    Icon: AlertCircle,
  },
  {
    min: 0,
    max: 49,
    color: 'red',
    message: 'Critical',
    Icon: XCircle,
  },
]

const getScoreThreshold = (score: number): ScoreThreshold => {
  return (
    SCORE_THRESHOLDS.find(
      (threshold) => score >= threshold.min && score <= threshold.max
    ) ?? SCORE_THRESHOLDS[2] // Default to critical if no match
  )
}

const normalizeScore = (score: number): number => {
  return Math.min(Math.max(Math.round(score), 0), 100)
}

export function AuditScore({ score, className }: AuditScoreProps) {
  const normalizedScore = normalizeScore(score)
  const { color, message, Icon } = getScoreThreshold(normalizedScore)

  const colorStyles = {
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
  }

  const iconColors = {
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
  }

  return (
    <div
      role="status"
      data-testid="score-container"
      className={cn(
        'rounded-lg p-4 flex items-center space-x-4',
        colorStyles[color],
        className
      )}
      aria-label={`Audit score: ${normalizedScore} - ${message}`}
    >
      <Icon
        data-testid="score-icon"
        data-icon={Icon.name.toLowerCase()}
        className={cn('h-6 w-6', iconColors[color])}
        aria-hidden="true"
      />
      <div className="flex flex-col">
        <span className="text-2xl font-bold">{normalizedScore}</span>
        <span className="text-sm">{message}</span>
      </div>
    </div>
  )
} 