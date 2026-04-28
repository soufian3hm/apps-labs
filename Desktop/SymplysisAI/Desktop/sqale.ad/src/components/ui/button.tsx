import * as React from "react"
import { cn } from "lib/utils"

type ButtonVariant = 'default' | 'ghost' | 'outline' | 'secondary' | 'link'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const getVariantClasses = (variant: ButtonVariant = 'default'): string => {
  switch (variant) {
    case 'default':
      return 'bg-black text-white hover:bg-black/90'
    case 'ghost':
      return 'hover:bg-gray-100 hover:text-gray-900'
    case 'outline':
      return 'border border-gray-300 bg-white hover:bg-gray-50'
    case 'secondary':
      return 'bg-gray-200 text-gray-900 hover:bg-gray-300'
    case 'link':
      return 'text-black underline'
    default:
      return ''
  }
}

const getSizeClasses = (size: ButtonSize = 'default'): string => {
  switch (size) {
    case 'sm':
      return 'h-8 px-3 text-sm rounded-md'
    case 'lg':
      return 'h-11 px-8 rounded-md'
    case 'icon':
      return 'h-10 w-10'
    case 'default':
    default:
      return 'h-10 px-4 py-2 rounded-md'
  }
}

// Helper function to get button classes
const buttonVariants = (options?: { variant?: ButtonVariant; size?: ButtonSize }) => {
  const variant = options?.variant || 'default'
  const size = options?.size || 'default'
  return cn(
    'inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    getVariantClasses(variant),
    getSizeClasses(size)
  )
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((
  { className, variant = 'default', size = 'default', ...props },
  ref,
) => {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size }),
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
export type { ButtonProps }
