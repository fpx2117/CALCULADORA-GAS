import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'info' | 'success' | 'warning'

interface ToastItem {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastInput {
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextValue {
  toast: (input: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const VARIANT_STYLES: Record<ToastVariant, string> = {
  info: 'border-blue-200 bg-white text-blue-950',
  success: 'border-emerald-200 bg-white text-emerald-950',
  warning: 'border-amber-200 bg-white text-amber-950',
}

const VARIANT_ICON: Record<ToastVariant, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
}

export function AppToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const removeToast = useCallback((id: number) => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, description, variant = 'info' }: ToastInput) => {
      const id = ++idRef.current
      setToasts(current => [...current, { id, title, description, variant }])
      window.setTimeout(() => removeToast(id), 4500)
    },
    [removeToast]
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-3">
        {toasts.map(item => {
          const Icon = VARIANT_ICON[item.variant]
          return (
            <div
              key={item.id}
              className={cn(
                'pointer-events-auto rounded-2xl border shadow-lg backdrop-blur px-4 py-3',
                VARIANT_STYLES[item.variant]
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  {item.description && (
                    <p className="mt-1 text-sm opacity-80">{item.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(item.id)}
                  className="rounded-md p-1 opacity-60 transition hover:opacity-100"
                  aria-label="Cerrar aviso"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useAppToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useAppToast debe usarse dentro de AppToastProvider')
  }
  return context
}
