import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const spinnerVariants = cva('animate-spin text-muted-foreground', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      default: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export interface SpinnerProps
  extends React.HTMLAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {
  /** Texto acessível para screen readers */
  label?: string
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, label = 'Carregando...', ...props }, ref) => {
    return (
      <>
        <Loader2
          ref={ref}
          className={cn(spinnerVariants({ size }), className)}
          {...props}
        />
        <span className="sr-only">{label}</span>
      </>
    )
  }
)
Spinner.displayName = 'Spinner'

export interface LoadingProps extends VariantProps<typeof spinnerVariants> {
  /** Texto visível abaixo do spinner */
  text?: string
  /** Centralizar na tela inteira */
  fullScreen?: boolean
  /** Altura mínima do container */
  minHeight?: string
}

function Loading({
  size = 'lg',
  text = 'Carregando...',
  fullScreen = false,
  minHeight = '400px',
}: LoadingProps) {
  const containerClass = fullScreen
    ? 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm'
    : ''

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        containerClass
      )}
      style={{ minHeight: fullScreen ? '100vh' : minHeight }}
    >
      <Spinner size={size} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}

export { Spinner, Loading, spinnerVariants }
