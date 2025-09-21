import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:-translate-y-0.5 focus:ring-red-500': variant === 'primary',
          'bg-white/90 text-gray-700 border border-gray-200 hover:bg-white hover:border-red-300 hover:text-red-600 hover:-translate-y-0.5 focus:ring-red-500': variant === 'secondary',
          'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500': variant === 'outline',
        },
        {
          'px-3 py-1.5 text-sm rounded-lg': size === 'sm',
          'px-4 py-2 text-base rounded-xl': size === 'md',
          'px-6 py-3 text-lg rounded-xl': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
