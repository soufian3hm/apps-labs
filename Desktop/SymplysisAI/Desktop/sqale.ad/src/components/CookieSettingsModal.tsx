import React, { useState, useEffect } from 'react'
import { X, Cookie, ShieldCheck, TrendingUp, Target, Settings as SettingsIcon, Info } from 'lucide-react'
import { useCookieConsent } from '../contexts/CookieConsentContext'
import { CookiePreferences, CookieCategory } from '../services/cookieService'

export const CookieSettingsModal: React.FC = () => {
  const { showSettings, preferences, savePreferences, closeSettings } = useCookieConsent()
  const [localPreferences, setLocalPreferences] = useState<Partial<CookiePreferences>>({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false
  })

  useEffect(() => {
    if (preferences) {
      setLocalPreferences({
        essential: preferences.essential,
        analytics: preferences.analytics,
        marketing: preferences.marketing,
        functional: preferences.functional
      })
    }
  }, [preferences, showSettings])

  if (!showSettings) return null

  const handleToggle = (category: CookieCategory) => {
    if (category === 'essential') return // Essential cookies cannot be disabled
    
    setLocalPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const handleSave = () => {
    savePreferences(localPreferences)
  }

  const handleAcceptAll = () => {
    setLocalPreferences({
      essential: true,
      analytics: true,
      marketing: true,
      functional: true
    })
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      functional: true
    })
  }

  const handleRejectAll = () => {
    setLocalPreferences({
      essential: true,
      analytics: false,
      marketing: false,
      functional: false
    })
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      functional: false
    })
  }

  const cookieCategories = [
    {
      id: 'essential' as CookieCategory,
      name: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function and cannot be switched off. They are usually set in response to actions made by you such as setting your privacy preferences, logging in, or filling in forms.',
      icon: ShieldCheck,
      required: true,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'analytics' as CookieCategory,
      name: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website and services.',
      icon: TrendingUp,
      required: false,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'marketing' as CookieCategory,
      name: 'Marketing Cookies',
      description: 'These cookies are used to deliver advertisements that are more relevant to you and your interests. They may also be used to limit the number of times you see an advertisement.',
      icon: Target,
      required: false,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'functional' as CookieCategory,
      name: 'Functional Cookies',
      description: 'These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.',
      icon: SettingsIcon,
      required: false,
      color: 'from-orange-500 to-amber-600'
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl p-2.5 shadow-lg">
              <Cookie className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Cookie Settings</h2>
              <p className="text-sm text-slate-600">Manage your cookie preferences</p>
            </div>
          </div>
          <button
            onClick={closeSettings}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 leading-relaxed">
                  We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
                  You can customize your preferences below or{' '}
                  <a href="/cookies" className="text-blue-700 hover:text-blue-800 underline font-medium">
                    read our Cookie Policy
                  </a>{' '}
                  for more information.
                </p>
              </div>
            </div>
          </div>

          {/* Cookie Categories */}
          <div className="space-y-4">
            {cookieCategories.map((category) => {
              const Icon = category.icon
              const isEnabled = localPreferences[category.id] === true
              
              return (
                <div
                  key={category.id}
                  className={`border-2 rounded-xl p-5 transition-all ${
                    isEnabled
                      ? 'border-blue-300 bg-blue-50/50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`bg-gradient-to-br ${category.color} rounded-xl p-3 shadow-md flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
                          {category.required && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleToggle(category.id)}
                        disabled={category.required}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          isEnabled
                            ? 'bg-blue-600'
                            : 'bg-slate-300'
                        } ${category.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        aria-label={`Toggle ${category.name}`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            isEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleRejectAll}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm hover:shadow-md"
            >
              Reject All
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
            >
              Accept All
            </button>
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}

