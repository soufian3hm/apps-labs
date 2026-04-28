import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString()
    const newToast: Toast = { id, message, type }
    setToasts(prev => [...prev, newToast])

    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id)
    }, 4000)

    return id
  }, [removeToast])

  return { toasts, addToast, removeToast }
}
