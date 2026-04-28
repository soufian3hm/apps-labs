import React from 'react'
import { Cookie, Settings, X, Check } from 'lucide-react'
import { useCookieConsent } from '../contexts/CookieConsentContext'

export const CookieConsentPopup: React.FC = () => {
  const { showBanner, acceptAll, rejectAll, openSettings, closeBanner } = useCookieConsent()

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom duration-300">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4">
        <div className="flex flex-col gap-3">
          {/* Content */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg p-2 shadow-md">
              <Cookie className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-900 mb-1">We Value Your Privacy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We use cookies to enhance your experience.{' '}
                <a href="/cookies" className="text-blue-600 hover:text-blue-700 underline font-medium">
                  Learn more
                </a>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={acceptAll}
              className="w-full px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
            >
              <Check className="w-3 h-3" />
              Accept All
            </button>
            <div className="flex gap-2">
              <button
                onClick={openSettings}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
              >
                <Settings className="w-3 h-3" />
                Settings
              </button>
              <button
                onClick={rejectAll}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm hover:shadow-md"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

