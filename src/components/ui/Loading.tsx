import { cn } from '../../lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullScreen?: boolean
  text?: string
}

export function Loading({ size = 'md', className, fullScreen = false, text }: LoadingProps) {
  const sizes = {
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg'
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div className={cn(sizes[size], 'mx-auto', className)} />
          {text && <p className="mt-4 text-dark-300">{text}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className={cn(sizes[size], 'mx-auto', className)} />
        {text && <p className="mt-4 text-dark-300">{text}</p>}
      </div>
    </div>
  )
}
