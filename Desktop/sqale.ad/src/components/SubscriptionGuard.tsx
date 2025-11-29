import React, { ReactNode } from 'react'
import { useSubscription } from '../contexts/SubscriptionContext'
import { useNavigate } from 'react-router-dom'
import { Check, Type, Layout, Mic, Image } from 'lucide-react'
import { LoadingSpinner } from './ui/LoadingSpinner'

interface SubscriptionGuardProps {
  children?: ReactNode
  featureName?: 'Ad Copy' | 'Landing Page' | 'Voiceover' | 'Poster' | string
  features?: string[]
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  featureName = 'this feature',
  features,
}) => {
  const { hasAccess, loading, subscription } = useSubscription()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <LoadingSpinner size="md" className="mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Page-specific benefits
  const benefitsMap: Record<string, string[]> = {
    'Ad Copy': [
      '250 ad copy generations per month',
      'Website scraper + smart prompt builder',
      'Tone, language, and ad network presets',
      'Save presets and view generation history',
    ],
    'Landing Page': [
      '30 landing page generations per month',
      'Drag-and-drop landing page components',
      'Live preview with export options',
      'AI rewriting of section content',
    ],
    'Voiceover': [
      '100 voiceover generations per month',
      'AI script generation',
      'Multiple voices and accents',
      'Custom script text-to-speech',
    ],
    'Poster': [
      '50 poster generations per month',
      'AI poster generation',
      'High-quality exports',
      'Brand colors and typography',
    ],
  }

  const perks = features || benefitsMap[featureName] || [
    'Access to premium-generation features',
    'Increased limits and priority performance',
    'Priority support',
  ]

  // Color theme mapping based on feature name - EXACT colors from each page (matching Home.tsx)
  const getThemeColors = (feature: string) => {
    switch (feature) {
      case 'Ad Copy':
        return {
          iconGradient: 'from-blue-500 to-indigo-600',
          iconBg: 'from-blue-50 to-blue-100',
          iconBorder: 'border-blue-200',
          iconBorderHover: 'hover:border-blue-300',
          iconText: 'text-blue-600',
          badgeBg: 'bg-blue-200',
          badgeText: 'text-blue-700',
          buttonGradient: 'from-blue-500 to-indigo-600',
          buttonHover: 'hover:from-blue-600 hover:to-indigo-700',
          checkIcon: 'text-blue-600',
          planBg: 'bg-blue-100',
          planText: 'text-blue-700'
        }
      case 'Voiceover':
        return {
          iconGradient: 'from-purple-500 to-pink-600',
          iconBg: 'from-purple-50 to-purple-100',
          iconBorder: 'border-purple-200',
          iconBorderHover: 'hover:border-purple-300',
          iconText: 'text-purple-600',
          badgeBg: 'bg-purple-200',
          badgeText: 'text-purple-700',
          buttonGradient: 'from-purple-500 to-pink-600',
          buttonHover: 'hover:from-purple-600 hover:to-pink-700',
          checkIcon: 'text-purple-600',
          planBg: 'bg-purple-100',
          planText: 'text-purple-700'
        }
      case 'Poster':
        return {
          iconGradient: 'from-orange-500 to-red-600',
          iconBg: 'from-orange-50 to-orange-100',
          iconBorder: 'border-orange-200',
          iconBorderHover: 'hover:border-orange-300',
          iconText: 'text-orange-600',
          badgeBg: 'bg-orange-200',
          badgeText: 'text-orange-700',
          buttonGradient: 'from-orange-500 to-red-600',
          buttonHover: 'hover:from-orange-600 hover:to-red-700',
          checkIcon: 'text-orange-600',
          planBg: 'bg-orange-100',
          planText: 'text-orange-700'
        }
      case 'Landing Page':
        return {
          iconGradient: 'from-green-500 to-emerald-600',
          iconBg: 'from-green-50 to-green-100',
          iconBorder: 'border-green-200',
          iconBorderHover: 'hover:border-green-300',
          iconText: 'text-green-600',
          badgeBg: 'bg-green-200',
          badgeText: 'text-green-700',
          buttonGradient: 'from-green-500 to-emerald-600',
          buttonHover: 'hover:from-green-600 hover:to-emerald-700',
          checkIcon: 'text-green-600',
          planBg: 'bg-green-100',
          planText: 'text-green-700'
        }
      default:
        return {
          iconGradient: 'from-blue-500 to-indigo-600',
          iconBg: 'from-slate-50 to-slate-100',
          iconBorder: 'border-slate-200',
          iconBorderHover: 'hover:border-slate-300',
          iconText: 'text-slate-600',
          badgeBg: 'bg-slate-200',
          badgeText: 'text-slate-700',
          buttonGradient: 'from-blue-500 to-indigo-600',
          buttonHover: 'hover:from-blue-600 hover:to-indigo-700',
          checkIcon: 'text-blue-600',
          planBg: 'bg-blue-100',
          planText: 'text-blue-700'
        }
    }
  }

  // Get icon for each feature (same as sidebar)
  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'Ad Copy':
        return Type
      case 'Landing Page':
        return Layout
      case 'Voiceover':
        return Mic
      case 'Poster':
        return Image
      default:
        return Type
    }
  }

  const theme = getThemeColors(featureName)
  const FeatureIcon = getFeatureIcon(featureName)

  if (!hasAccess) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
        <div className="max-w-2xl w-full">
          {/* Surrounding border in theme color */}
          <div className={`rounded-xl border-2 ${theme.iconBorder} ${theme.iconBorderHover} p-6 bg-white space-y-6`}>
            {/* Header */}
            <div className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <FeatureIcon className={`h-8 w-8 ${theme.iconText}`} />
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                  Subscribe to use {featureName}
                </h1>
              </div>
              <p className="text-sm text-slate-600">
                This page is available to subscribers. Choose a plan and unlock these benefits:
              </p>
            </div>

            {/* Benefits Card - Same style as Home.tsx feature balance cards */}
            <div className={`rounded-xl bg-gradient-to-br ${theme.iconBg} border ${theme.iconBorder} ${theme.iconBorderHover} p-6 hover:shadow-md transition-all`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  What you get
                </h2>
                <span className={`text-xs font-semibold ${theme.badgeText} ${theme.badgeBg} px-2 py-1 rounded-full`}>
                  {featureName}
                </span>
              </div>
              <div className="space-y-3">
                {perks.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className={`h-5 w-5 ${theme.checkIcon} mt-0.5 flex-shrink-0`} strokeWidth={2.5} />
                    <span className="text-sm text-slate-700 leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Plan */}
            {subscription && (
              <div className={`rounded-xl border ${theme.iconBorder} bg-white p-5`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Current plan:
                  </span>
                  <span className={`text-xs font-semibold ${theme.planText} ${theme.planBg} px-2 py-1 rounded-full capitalize`}>
                    {subscription.plan}
                  </span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={() => navigate('/settings/plans')}
              className={`w-full px-6 py-3.5 bg-gradient-to-r ${theme.buttonGradient} text-white ${theme.buttonHover} transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl active:scale-[0.98] rounded-xl`}
            >
              View Plans & Subscribe
            </button>
            <p className="text-xs text-slate-500 text-center mt-3">
              7-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
