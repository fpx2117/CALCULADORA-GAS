import { cn } from '@/lib/utils'

interface Props {
  currentStep: number
  steps: string[]
}

export default function StepIndicator({ currentStep, steps }: Props) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((label, idx) => {
        const stepNum = idx + 1
        const isActive = stepNum === currentStep
        const isDone = stepNum < currentStep
        return (
          <div key={stepNum} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                  isActive
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : isDone
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                )}
              >
                {isDone ? '✓' : stepNum}
              </div>
              <span
                className={cn(
                  'text-xs font-medium text-center',
                  isActive ? 'text-blue-600' : isDone ? 'text-green-600' : 'text-gray-400'
                )}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 mb-5 transition-all',
                  isDone ? 'bg-green-400' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
