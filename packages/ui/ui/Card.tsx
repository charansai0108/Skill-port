import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated'
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-300 ease-in-out',
        {
          'bg-white border border-gray-200 shadow-sm': variant === 'default',
          'bg-white/95 backdrop-blur-xl border border-white/30 shadow-lg hover:bg-white hover:border-red-400/40 hover:shadow-xl': variant === 'glass',
          'bg-white shadow-lg hover:shadow-xl hover:-translate-y-1': variant === 'elevated',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
