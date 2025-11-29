import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@shopify/polaris'
import '@shopify/polaris/build/esm/styles.css'
import enTranslations from '@shopify/polaris/locales/en.json'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { UserProfileProvider } from './contexts/UserProfileContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { CookieConsentProvider } from './contexts/CookieConsentContext'
import { CookieConsentPopup } from './components/CookieConsentPopup'
import { CookieSettingsModal } from './components/CookieSettingsModal'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import AuthCallback from './components/AuthCallback'
import Homepage from './components/Homepage'
import EarlyAccess from './components/EarlyAccess'
import LandingPreview from './components/LandingPreview'
import PrivacyPolicy from './components/PrivacyPolicy'
import TermsOfService from './components/TermsOfService'
import CookiePolicy from './components/CookiePolicy'
import FAQ from './components/FAQ'
import AdCopyPage from './components/features/AdCopyPage'
import LandingPagesPage from './components/features/LandingPagesPage'
import VoiceoversPage from './components/features/VoiceoversPage'
import PostersPage from './components/features/PostersPage'
import Success from './components/Success'
import Cancel from './components/Cancel'
import AdminAccess from './components/AdminAccess'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { useSEO } from './hooks/useSEO'

// Lazy load dashboard feature components for code splitting
const Home = lazy(() => import('./components/Home'))
const Settings = lazy(() => import('./components/Settings'))
const AdcopyGen = lazy(() => import('./components/AdcopyGen'))
const VoiceoverGeneratorPagePolaris = lazy(() => import('./components/VoiceoverGeneratorPagePolaris'))
const Symplysis = lazy(() => import('./components/Symplysis'))
const PosterGeneratorRestyledV2 = lazy(() => import('./components/PosterGeneratorRestyledV2'))
const UGCVideosPolaris = lazy(() => import('./components/UGCVideosPolaris'))
const EmailMakerPolaris = lazy(() => import('./components/EmailMakerPolaris'))
const ProductResearcherPolaris = lazy(() => import('./components/AIProductResearcherPolaris'))
const AffiliatePolaris = lazy(() => import('./components/AffiliatePolaris'))
const Support = lazy(() => import('./components/Support'))

// SEO Component to update meta tags
const SEOUpdater: React.FC = () => {
  useSEO()
  return null
}

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <>{children}</>
  } else {
    return <Navigate to="/login" replace />
  }
}

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <SEOUpdater />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/signup"
          element={<Signup />}
        />
        <Route
          path="/early-access"
          element={<EarlyAccess />}
        />
        {/* Legal pages - publicly accessible */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        {/* Product and Company pages - publicly accessible */}
        <Route path="/faq" element={<FAQ />} />
        {/* Feature landing pages - publicly accessible */}
        <Route path="/features/ad-copy" element={<AdCopyPage />} />
        <Route path="/features/landing-pages" element={<LandingPagesPage />} />
        <Route path="/features/voiceovers" element={<VoiceoversPage />} />
        <Route path="/features/posters" element={<PostersPage />} />
        {/* Protected routes for dashboard - using nested routes with Outlet */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navigate to="/home" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/symplysis"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* Redirect symplysis?tab= routes handled in Dashboard component */}
          <Route index element={<Navigate to="/home" replace />} />
        </Route>
        <Route
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* Dashboard nested routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/settings" element={<Navigate to="/settings/info" replace />} />
          <Route path="/settings/info" element={<Settings />} />
          <Route path="/settings/security" element={<Settings />} />
          <Route path="/settings/billing" element={<Settings />} />
          <Route path="/settings/plans" element={<Settings />} />
          <Route path="/ad-copy-generator" element={<AdcopyGen />} />
          <Route path="/ad-copy-generator/credits" element={<AdcopyGen />} />
          <Route path="/voiceover-generator" element={<VoiceoverGeneratorPagePolaris />} />
          <Route path="/voiceover-generator/credits" element={<VoiceoverGeneratorPagePolaris />} />
          <Route path="/landing-page-generator" element={<Symplysis />} />
          <Route path="/landing-page-generator/credits" element={<Symplysis />} />
          <Route path="/poster-generator" element={<PosterGeneratorRestyledV2 />} />
          <Route path="/poster-generator/credits" element={<PosterGeneratorRestyledV2 />} />
          <Route path="/ugc-videos" element={<UGCVideosPolaris />} />
          <Route path="/email-maker" element={<EmailMakerPolaris />} />
          <Route path="/product-researcher" element={<ProductResearcherPolaris />} />
          <Route path="/affiliate" element={<AffiliatePolaris />} />
          <Route path="/dashboard/affiliate" element={<AffiliatePolaris />} />
          <Route path="/support" element={<Support />} />
          {/* Legacy routes for backward compatibility */}
          <Route path="/history" element={<Navigate to="/home" replace />} />
          <Route path="/billing" element={<Navigate to="/settings/billing" replace />} />
        </Route>
        {/* Admin Access Routes */}
        <Route path="/AdminAccess/*" element={<AdminAccess />} />
        {/* Landing page preview route */}
        <Route
          path="/symplysis/:previewId"
          element={<LandingPreview />}
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* Payment success and cancel pages */}
        <Route
          path="/success"
          element={
            <ProtectedRoute>
              <Success />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cancel"
          element={
            <ProtectedRoute>
              <Cancel />
            </ProtectedRoute>
          }
        />
        {/* Catch all - redirect to homepage if not authenticated, symplysis if authenticated */}
        <Route path="/*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

const App: React.FC = () => {
  return (
    <AppProvider i18n={enTranslations}>
      <div style={{ backgroundColor: 'ghostwhite', minHeight: '100vh', width: '100vw', margin: 0, padding: 0 }}>
        <CookieConsentProvider>
          <LanguageProvider>
            <AuthProvider>
              <UserProfileProvider>
                <SubscriptionProvider>
                  <AppRoutes />
                  <CookieConsentPopup />
                  <CookieSettingsModal />
                </SubscriptionProvider>
              </UserProfileProvider>
            </AuthProvider>
          </LanguageProvider>
        </CookieConsentProvider>
      </div>
    </AppProvider>
  )
}

export default App
