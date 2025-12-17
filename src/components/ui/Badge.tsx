import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'warning' | 'danger' | 'success' | 'info'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const variants = {
      primary: 'badge-primary',
      warning: 'badge-warning',
      danger: 'badge-danger',
      success: 'badge-success',
      info: 'badge-info'
    }

    return (
      <span
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
