import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from './ui/LoadingSpinner'

const testimonials = [
  "I kept losing momentum — even watching competitors scale — all because I was waiting for content to be ready. So I built Symplysis to make content instant.",
  "While others were scaling fast, I was still waiting on my team to prepare content. That's why I built Symplysis — to remove the wait and speed up growth.",
  "I saw competitors growing quicker simply because their content was ready sooner. I built Symplysis so no one, including me, ever waits again.",
  "Content delays held me back while others scaled. Symplysis is the solution I built to make content instant and keep the momentum on my side."
]

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signInWithGoogle } = useAuth()

  const selectedTestimonial = useMemo(() => {
    return testimonials[Math.floor(Math.random() * testimonials.length)]
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    
    try {
      await signInWithGoogle()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50/30">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg overflow-hidden">
              <img 
                src="https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/Logos/symplysis.png" 
                alt="Logo" 
                className="h-full w-full object-cover"
              />
            </div>
            <h2 className="mt-8 text-3xl font-bold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-3 text-gray-600">
              Sign in to your Symplysis account to continue
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" className="mr-3 text-white" />
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-2xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visual Content */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-2xl px-8 text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Symplysis
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your all-in-one AI creative suite: ad copy, landing pages, posters, voiceovers, and more
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-2xl bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600">Generate ad copy, landing pages, posters, and voiceovers in seconds</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-2xl bg-indigo-100 mb-4">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Platform</h3>
              <p className="text-gray-600">Optimized for Meta, Google, TikTok, LinkedIn, and Snapchat</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-2xl bg-purple-100 mb-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">40+ Languages</h3>
              <p className="text-gray-600">Create content in 40+ languages with native-level fluency</p>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
            <p className="text-gray-700 italic">
              "{selectedTestimonial}"
            </p>
            <div className="mt-4 flex items-center justify-center">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                SH
              </div>
              <div className="ml-3 text-left">
                <p className="text-sm font-medium text-gray-900">Soufiane Hadjmoussa</p>
                <p className="text-sm text-gray-600">Founder, SymplysisAI</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
