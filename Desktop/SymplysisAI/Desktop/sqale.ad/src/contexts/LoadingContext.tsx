import React, { createContext, useContext, useState, useCallback } from 'react'

interface LoadingContextType {
  isPageLoading: boolean
  setPageLoaded: () => void
  setPageLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPageLoading, setIsPageLoading] = useState(false)

  const setPageLoaded = useCallback(() => {
    setIsPageLoading(false)
  }, [])

  const setPageLoading = useCallback(() => {
    setIsPageLoading(true)
  }, [])

  return (
    <LoadingContext.Provider value={{ isPageLoading, setPageLoaded, setPageLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}
