import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LoadingSpinner } from './ui/LoadingSpinner'

const LandingPreview: React.FC = () => {
  const { previewId } = useParams<{ previewId: string }>()
  const navigate = useNavigate()
  const [htmlContent, setHtmlContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!previewId) {
      setError('Invalid preview ID')
      return
    }

    // Try to get the HTML from sessionStorage
    const storedHtml = sessionStorage.getItem(`landing_preview_${previewId}`)
    
    if (storedHtml) {
      setHtmlContent(storedHtml)
    } else {
      setError('Preview not found or has expired')
    }
  }, [previewId])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Preview Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/symplysis')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!htmlContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen overflow-auto">
      <div 
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

export default LandingPreview
