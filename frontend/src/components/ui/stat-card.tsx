import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const statCardVariants = cva(
  'relative overflow-hidden rounded-lg border p-6 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        primary: 'bg-primary/10 border-primary/20',
        success: 'bg-success/10 border-success/20',
        warning: 'bg-warning/10 border-warning/20',
        error: 'bg-error/10 border-error/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  /** Título/label do stat */
  title: string
  /** Valor principal */
  value: string | number
  /** Descrição ou contexto adicional */
  description?: string
  /** Ícone opcional */
  icon?: React.ReactNode
  /** Variação percentual (positivo/negativo) */
  trend?: number
  /** Sufixo do valor (ex: %, unidades) */
  suffix?: string
  /** Prefixo do valor (ex: R$) */
  prefix?: string
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      variant,
      title,
      value,
      description,
      icon,
      trend,
      suffix,
      prefix,
      ...props
    },
    ref
  ) => {
    const getTrendIcon = () => {
      if (trend === undefined) return null
      if (trend > 0) return <TrendingUp className="h-4 w-4 text-success" />
      if (trend < 0) return <TrendingDown className="h-4 w-4 text-error" />
      return <Minus className="h-4 w-4 text-muted-foreground" />
    }

    const getTrendColor = () => {
      if (trend === undefined) return ''
      if (trend > 0) return 'text-success'
      if (trend < 0) return 'text-error'
      return 'text-muted-foreground'
    }

    return (
      <div
        ref={ref}
        className={cn(statCardVariants({ variant }), className)}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && (
            <div className="text-muted-foreground">{icon}</div>
          )}
        </div>

        {/* Value */}
        <div className="mt-2 flex items-baseline gap-1">
          {prefix && (
            <span className="text-lg font-medium text-muted-foreground">
              {prefix}
            </span>
          )}
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          {suffix && (
            <span className="text-lg font-medium text-muted-foreground">
              {suffix}
            </span>
          )}
        </div>

        {/* Footer: Description + Trend */}
        <div className="mt-2 flex items-center justify-between">
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend !== undefined && (
            <div className={cn('flex items-center gap-1 text-sm font-medium', getTrendColor())}>
              {getTrendIcon()}
              <span>{trend > 0 ? '+' : ''}{trend}%</span>
            </div>
          )}
        </div>

        {/* Decorative gradient */}
        {variant && variant !== 'default' && (
          <div
            className={cn(
              'absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-20 blur-2xl',
              variant === 'primary' && 'bg-primary',
              variant === 'success' && 'bg-success',
              variant === 'warning' && 'bg-warning',
              variant === 'error' && 'bg-error'
            )}
          />
        )}
      </div>
    )
  }
)
StatCard.displayName = 'StatCard'

export { StatCard, statCardVariants }
