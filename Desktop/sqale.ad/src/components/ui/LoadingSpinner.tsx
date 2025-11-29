import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4'
  }

  return (
    <div 
      className={`${sizeClasses[size]} border-gray-200 border-t-black rounded-full animate-spin ${className}`}
      style={{ transformOrigin: '50% 50%' }}
    ></div>
  )
}
