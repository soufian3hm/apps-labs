import React, { useState, useEffect } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSubscription } from '../contexts/SubscriptionContext'
import { User, Lock, CreditCard, Crown, Eye, EyeOff, ArrowRight, Zap, Check, FileText, Cookie } from 'lucide-react'
import { validatePassword, checkPasswordRequirements, getPasswordStrengthColor, getPasswordStrengthBgColor } from '../utils/passwordValidation'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from './ui/Toast'
import { useCookieConsent } from '../contexts/CookieConsentContext'

type SettingsTab = 'info' | 'security' | 'billing' | 'plans'
type BillingPeriod = 'monthly' | 'yearly'

const Settings: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToast()
  const { subscription } = useSubscription()
  const { openSettings: openCookieSettings } = useCookieConsent()
  const [loading, setLoading] = useState(true)
  
  // Get tab from URL path
  const pathTab = location.pathname.split('/settings/')[1] || 'info'
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    (['info', 'security', 'billing', 'plans'].includes(pathTab) ? pathTab : 'info') as SettingsTab
  )
  
  // Update active tab when URL changes
  useEffect(() => {
    const pathTab = location.pathname.split('/settings/')[1] || 'info'
    if (['info', 'security', 'billing', 'plans'].includes(pathTab)) {
      setActiveTab(pathTab as SettingsTab)
    }
    
    // Check for success query parameter
    const searchParams = new URLSearchParams(location.search)
    if (searchParams.get('success') === 'true' && pathTab === 'plans') {
      addToast('Subscription updated successfully!', 'success')
      // Remove success parameter from URL
      navigate('/settings/plans', { replace: true })
    }
  }, [location.pathname, location.search, navigate, addToast])
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const countries = [
    { code: 'af', name: 'Afghanistan' },
    { code: 'ax', name: 'Åland Islands' },
    { code: 'al', name: 'Albania' },
    { code: 'dz', name: 'Algeria' },
    { code: 'as', name: 'American Samoa' },
    { code: 'ad', name: 'Andorra' },
    { code: 'ao', name: 'Angola' },
    { code: 'ai', name: 'Anguilla' },
    { code: 'aq', name: 'Antarctica' },
    { code: 'ag', name: 'Antigua & Barbuda' },
    { code: 'ar', name: 'Argentina' },
    { code: 'am', name: 'Armenia' },
    { code: 'aw', name: 'Aruba' },
    { code: 'au', name: 'Australia' },
    { code: 'at', name: 'Austria' },
    { code: 'az', name: 'Azerbaijan' },
    { code: 'bs', name: 'Bahamas' },
    { code: 'bh', name: 'Bahrain' },
    { code: 'bd', name: 'Bangladesh' },
    { code: 'bb', name: 'Barbados' },
    { code: 'by', name: 'Belarus' },
    { code: 'be', name: 'Belgium' },
    { code: 'bz', name: 'Belize' },
    { code: 'bj', name: 'Benin' },
    { code: 'bm', name: 'Bermuda' },
    { code: 'bt', name: 'Bhutan' },
    { code: 'bo', name: 'Bolivia' },
    { code: 'ba', name: 'Bosnia & Herzegovina' },
    { code: 'bw', name: 'Botswana' },
    { code: 'br', name: 'Brazil' },
    { code: 'bn', name: 'Brunei' },
    { code: 'bg', name: 'Bulgaria' },
    { code: 'bf', name: 'Burkina Faso' },
    { code: 'bi', name: 'Burundi' },
    { code: 'kh', name: 'Cambodia' },
    { code: 'cm', name: 'Cameroon' },
    { code: 'ca', name: 'Canada' },
    { code: 'cv', name: 'Cape Verde' },
    { code: 'ky', name: 'Cayman Islands' },
    { code: 'cf', name: 'Central African Republic' },
    { code: 'td', name: 'Chad' },
    { code: 'cl', name: 'Chile' },
    { code: 'cn', name: 'China' },
    { code: 'co', name: 'Colombia' },
    { code: 'km', name: 'Comoros' },
    { code: 'cg', name: 'Congo - Brazzaville' },
    { code: 'cd', name: 'Congo - Kinshasa' },
    { code: 'ck', name: 'Cook Islands' },
    { code: 'cr', name: 'Costa Rica' },
    { code: 'ci', name: 'Côte d\'Ivoire' },
    { code: 'hr', name: 'Croatia' },
    { code: 'cu', name: 'Cuba' },
    { code: 'cw', name: 'Curaçao' },
    { code: 'cy', name: 'Cyprus' },
    { code: 'cz', name: 'Czechia' },
    { code: 'dk', name: 'Denmark' },
    { code: 'dj', name: 'Djibouti' },
    { code: 'dm', name: 'Dominica' },
    { code: 'do', name: 'Dominican Republic' },
    { code: 'ec', name: 'Ecuador' },
    { code: 'eg', name: 'Egypt' },
    { code: 'sv', name: 'El Salvador' },
    { code: 'gq', name: 'Equatorial Guinea' },
    { code: 'er', name: 'Eritrea' },
    { code: 'ee', name: 'Estonia' },
    { code: 'sz', name: 'Eswatini' },
    { code: 'et', name: 'Ethiopia' },
    { code: 'fk', name: 'Falkland Islands' },
    { code: 'fo', name: 'Faroe Islands' },
    { code: 'fj', name: 'Fiji' },
    { code: 'fi', name: 'Finland' },
    { code: 'fr', name: 'France' },
    { code: 'gf', name: 'French Guiana' },
    { code: 'pf', name: 'French Polynesia' },
    { code: 'ga', name: 'Gabon' },
    { code: 'gm', name: 'Gambia' },
    { code: 'ge', name: 'Georgia' },
    { code: 'de', name: 'Germany' },
    { code: 'gh', name: 'Ghana' },
    { code: 'gi', name: 'Gibraltar' },
    { code: 'gr', name: 'Greece' },
    { code: 'gl', name: 'Greenland' },
    { code: 'gd', name: 'Grenada' },
    { code: 'gp', name: 'Guadeloupe' },
    { code: 'gu', name: 'Guam' },
    { code: 'gt', name: 'Guatemala' },
    { code: 'gg', name: 'Guernsey' },
    { code: 'gn', name: 'Guinea' },
    { code: 'gw', name: 'Guinea-Bissau' },
    { code: 'gy', name: 'Guyana' },
    { code: 'ht', name: 'Haiti' },
    { code: 'hn', name: 'Honduras' },
    { code: 'hk', name: 'Hong Kong SAR China' },
    { code: 'hu', name: 'Hungary' },
    { code: 'is', name: 'Iceland' },
    { code: 'in', name: 'India' },
    { code: 'id', name: 'Indonesia' },
    { code: 'ir', name: 'Iran' },
    { code: 'iq', name: 'Iraq' },
    { code: 'ie', name: 'Ireland' },
    { code: 'im', name: 'Isle of Man' },
    { code: 'il', name: 'Israel' },
    { code: 'it', name: 'Italy' },
    { code: 'jm', name: 'Jamaica' },
    { code: 'jp', name: 'Japan' },
    { code: 'je', name: 'Jersey' },
    { code: 'jo', name: 'Jordan' },
    { code: 'kz', name: 'Kazakhstan' },
    { code: 'ke', name: 'Kenya' },
    { code: 'ki', name: 'Kiribati' },
    { code: 'kw', name: 'Kuwait' },
    { code: 'kg', name: 'Kyrgyzstan' },
    { code: 'la', name: 'Laos' },
    { code: 'lv', name: 'Latvia' },
    { code: 'lb', name: 'Lebanon' },
    { code: 'ls', name: 'Lesotho' },
    { code: 'lr', name: 'Liberia' },
    { code: 'ly', name: 'Libya' },
    { code: 'li', name: 'Liechtenstein' },
    { code: 'lt', name: 'Lithuania' },
    { code: 'lu', name: 'Luxembourg' },
    { code: 'mo', name: 'Macao SAR China' },
    { code: 'mg', name: 'Madagascar' },
    { code: 'mw', name: 'Malawi' },
    { code: 'my', name: 'Malaysia' },
    { code: 'mv', name: 'Maldives' },
    { code: 'ml', name: 'Mali' },
    { code: 'mt', name: 'Malta' },
    { code: 'mh', name: 'Marshall Islands' },
    { code: 'mq', name: 'Martinique' },
    { code: 'mr', name: 'Mauritania' },
    { code: 'mu', name: 'Mauritius' },
    { code: 'yt', name: 'Mayotte' },
    { code: 'mx', name: 'Mexico' },
    { code: 'fm', name: 'Micronesia' },
    { code: 'md', name: 'Moldova' },
    { code: 'mc', name: 'Monaco' },
    { code: 'mn', name: 'Mongolia' },
    { code: 'me', name: 'Montenegro' },
    { code: 'ms', name: 'Montserrat' },
    { code: 'ma', name: 'Morocco' },
    { code: 'mz', name: 'Mozambique' },
    { code: 'mm', name: 'Myanmar (Burma)' },
    { code: 'na', name: 'Namibia' },
    { code: 'nr', name: 'Nauru' },
    { code: 'np', name: 'Nepal' },
    { code: 'nl', name: 'Netherlands' },
    { code: 'nc', name: 'New Caledonia' },
    { code: 'nz', name: 'New Zealand' },
    { code: 'ni', name: 'Nicaragua' },
    { code: 'ne', name: 'Niger' },
    { code: 'ng', name: 'Nigeria' },
    { code: 'nu', name: 'Niue' },
    { code: 'nf', name: 'Norfolk Island' },
    { code: 'kp', name: 'North Korea' },
    { code: 'mk', name: 'North Macedonia' },
    { code: 'mp', name: 'Northern Mariana Islands' },
    { code: 'no', name: 'Norway' },
    { code: 'om', name: 'Oman' },
    { code: 'pk', name: 'Pakistan' },
    { code: 'pw', name: 'Palau' },
    { code: 'ps', name: 'Palestinian Territories' },
    { code: 'pa', name: 'Panama' },
    { code: 'pg', name: 'Papua New Guinea' },
    { code: 'py', name: 'Paraguay' },
    { code: 'pe', name: 'Peru' },
    { code: 'ph', name: 'Philippines' },
    { code: 'pn', name: 'Pitcairn Islands' },
    { code: 'pl', name: 'Poland' },
    { code: 'pt', name: 'Portugal' },
    { code: 'pr', name: 'Puerto Rico' },
    { code: 'qa', name: 'Qatar' },
    { code: 're', name: 'Réunion' },
    { code: 'ro', name: 'Romania' },
    { code: 'ru', name: 'Russia' },
    { code: 'rw', name: 'Rwanda' },
    { code: 'ws', name: 'Samoa' },
    { code: 'sm', name: 'San Marino' },
    { code: 'st', name: 'São Tomé & Príncipe' },
    { code: 'sa', name: 'Saudi Arabia' },
    { code: 'sn', name: 'Senegal' },
    { code: 'rs', name: 'Serbia' },
    { code: 'sc', name: 'Seychelles' },
    { code: 'sl', name: 'Sierra Leone' },
    { code: 'sg', name: 'Singapore' },
    { code: 'sx', name: 'Sint Maarten' },
    { code: 'sk', name: 'Slovakia' },
    { code: 'si', name: 'Slovenia' },
    { code: 'sb', name: 'Solomon Islands' },
    { code: 'so', name: 'Somalia' },
    { code: 'za', name: 'South Africa' },
    { code: 'gs', name: 'South Georgia & South Sandwich Islands' },
    { code: 'kr', name: 'South Korea' },
    { code: 'ss', name: 'South Sudan' },
    { code: 'es', name: 'Spain' },
    { code: 'lk', name: 'Sri Lanka' },
    { code: 'bl', name: 'St. Barthélemy' },
    { code: 'sh', name: 'St. Helena' },
    { code: 'kn', name: 'St. Kitts & Nevis' },
    { code: 'lc', name: 'St. Lucia' },
    { code: 'mf', name: 'St. Martin' },
    { code: 'pm', name: 'St. Pierre & Miquelon' },
    { code: 'vc', name: 'St. Vincent & Grenadines' },
    { code: 'sd', name: 'Sudan' },
    { code: 'sr', name: 'Suriname' },
    { code: 'sj', name: 'Svalbard & Jan Mayen' },
    { code: 'se', name: 'Sweden' },
    { code: 'ch', name: 'Switzerland' },
    { code: 'sy', name: 'Syria' },
    { code: 'tw', name: 'Taiwan' },
    { code: 'tj', name: 'Tajikistan' },
    { code: 'tz', name: 'Tanzania' },
    { code: 'th', name: 'Thailand' },
    { code: 'tl', name: 'Timor-Leste' },
    { code: 'tg', name: 'Togo' },
    { code: 'tk', name: 'Tokelau' },
    { code: 'to', name: 'Tonga' },
    { code: 'tt', name: 'Trinidad & Tobago' },
    { code: 'tn', name: 'Tunisia' },
    { code: 'tr', name: 'Turkey' },
    { code: 'tm', name: 'Turkmenistan' },
    { code: 'tc', name: 'Turks & Caicos Islands' },
    { code: 'tv', name: 'Tuvalu' },
    { code: 'um', name: 'U.S. Outlying Islands' },
    { code: 'vi', name: 'U.S. Virgin Islands' },
    { code: 'ug', name: 'Uganda' },
    { code: 'ua', name: 'Ukraine' },
    { code: 'ae', name: 'United Arab Emirates' },
    { code: 'gb', name: 'United Kingdom' },
    { code: 'us', name: 'United States' },
    { code: 'uy', name: 'Uruguay' },
    { code: 'uz', name: 'Uzbekistan' },
    { code: 'vu', name: 'Vanuatu' },
    { code: 'va', name: 'Vatican City' },
    { code: 've', name: 'Venezuela' },
    { code: 'vn', name: 'Vietnam' },
    { code: 'wf', name: 'Wallis & Futuna' },
    { code: 'eh', name: 'Western Sahara' },
    { code: 'ye', name: 'Yemen' },
    { code: 'zm', name: 'Zambia' },
    { code: 'zw', name: 'Zimbabwe' },
  ]

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setEmail(user.email || '')

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('name, country')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        setName(profile.name)
        setCountry(profile.country || '')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('user_profiles')
        .update({ name, country })
        .eq('user_id', user.id)

      addToast('Settings saved successfully!', 'success')
    } catch (error) {
      console.error('Error saving settings:', error)
      addToast('Failed to save settings', 'error')
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required')
      return
    }

    const validation = validatePassword(newPassword)
    if (!validation.isValid) {
      setPasswordError(validation.errors[0])
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (oldPassword === newPassword) {
      setPasswordError('New password must be different from old password')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        setPasswordError('User not found')
        return
      }

      // Verify the old password by attempting to sign in
      // We get a fresh session to verify credentials
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      })

      if (signInError) {
        setPasswordError('Current password is incorrect')
        return
      }

      // Old password is correct, now update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setPasswordError(updateError.message)
        return
      }

      // Success - clear form
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordError('')
      addToast('Password updated successfully!', 'success')
    } catch (error) {
      console.error('Error changing password:', error)
      setPasswordError('An error occurred. Please try again.')
    }
  }

  const handleBillingPortal = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        addToast('Please log in first', 'error')
        return
      }

      // Get customer ID from user_profiles
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single()

      if (profileError || !profileData?.stripe_customer_id) {
        addToast('No billing information found. Please subscribe to a plan first.', 'info')
        return
      }

      // Call Stripe customer portal edge function
      const { data: session } = await supabase.auth.getSession()
      const response = await fetch(
        'https://bmceibdtgypgsfiyumcr.supabase.co/functions/v1/stripe-create-portal-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            customerId: profileData.stripe_customer_id,
            returnUrl: `${window.location.origin}/settings/billing`,
          }),
        }
      )

      const data = await response.json()

      if (data.url) {
        // Redirect to Stripe Customer Portal
        window.location.href = data.url
      } else {
        addToast(data.error || 'Failed to open billing portal', 'error')
      }
    } catch (error) {
      console.error('Error opening billing portal:', error)
      addToast('Failed to open billing portal. Please try again.', 'error')
    }
  }

  const handleUpgrade = async (plan: 'starter' | 'premium', period: BillingPeriod) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        addToast('Please log in to upgrade', 'error')
        return
      }

      // Get user profile with subscription info
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id, subscription_plan, subscription_status, stripe_subscription_id, stripe_customer_id')
        .eq('user_id', user.id)
        .single()

      if (profileError || !profileData) {
        addToast('Failed to load user profile', 'error')
        return
      }

      // Check if user already has an active subscription
      const hasActiveSubscription = profileData.subscription_status === 'active' && 
                                    profileData.subscription_plan !== 'free' &&
                                    profileData.stripe_subscription_id
      
      // Check if user has a failed/expired subscription (can retry payment)
      const hasExpiredSubscription = (profileData.subscription_status === 'expired' || 
                                      profileData.subscription_status === 'inactive') &&
                                     profileData.subscription_plan !== 'free' &&
                                     profileData.stripe_subscription_id

      // Price IDs mapping
      const priceIds: Record<string, Record<BillingPeriod, string>> = {
        starter: {
          monthly: 'price_1SVthAGpLghpVB8NqKHaHHBf',
          yearly: 'price_1SVthMGpLghpVB8NVoOtrqBD'
        },
        premium: {
          monthly: 'price_1SVthGGpLghpVB8Ni8Qg0N0l',
          yearly: 'price_1SVthQGpLghpVB8NL470yujG'
        }
      }

      const priceId = priceIds[plan][period]
      const successUrl = `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`
      const cancelUrl = `${window.location.origin}/cancel`

      // If user has expired subscription with same plan, they can retry payment
      // In this case, we should update the existing subscription instead of creating new one
      if (hasExpiredSubscription && profileData.subscription_plan === plan) {
        // User is retrying payment for the same plan
        // Redirect to billing portal to update payment method
        addToast('Please update your payment method in the billing portal to retry payment', 'info')
        handleBillingPortal()
        return
      }
      
      // If user has active subscription, we need to handle upgrade/downgrade differently
      let subscriptionUpdated = false
      if (hasActiveSubscription) {
        // For existing subscriptions, we should update the subscription instead of creating new checkout
        // This prevents double billing and properly handles prorating
        try {
          const response = await fetch(
            'https://bmceibdtgypgsfiyumcr.supabase.co/functions/v1/stripe-update-subscription',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              },
              body: JSON.stringify({
                userId: profileData.user_id,
                subscriptionId: profileData.stripe_subscription_id,
                newPriceId: priceId,
                newPlanName: plan,
                billingPeriod: period,
              }),
            }
          )

          const data = await response.json()

          if (data.success) {
            subscriptionUpdated = true
            addToast(`Successfully ${plan === 'premium' ? 'upgraded' : 'downgraded'} to ${plan}!`, 'success')
            // Refresh subscription data
            setTimeout(() => {
              window.location.reload()
            }, 1500)
            return // Exit early if update succeeded
          } else {
            // Fallback to checkout if update fails (e.g., edge function doesn't exist yet)
            addToast('Updating subscription... Redirecting to checkout', 'info')
          }
        } catch (error) {
          console.error('Error updating subscription:', error)
          // Fallback to checkout if update fails
        }
      }

      // If no active subscription OR update failed, create new checkout session
      if (!hasActiveSubscription || !subscriptionUpdated) {
      const response = await fetch(
        'https://bmceibdtgypgsfiyumcr.supabase.co/functions/v1/stripe-create-checkout-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            userId: profileData.user_id,
            planName: plan,
            priceId: priceId,
            successUrl: successUrl,
            cancelUrl: cancelUrl,
          }),
        }
      )

      const data = await response.json()

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        addToast(data.error || 'Failed to create checkout session', 'error')
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      addToast('Failed to initiate payment. Please try again.', 'error')
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-8 w-full">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Personal Information</h3>
              <p className="text-sm text-slate-600">Update your profile details and preferences</p>
            </div>
            <div className="h-[1px] w-full bg-slate-200" />
            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-900">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus-visible:outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-900">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="flex h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-900">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus-visible:outline-none"
                  >
                    <option value="">Select country...</option>
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-200 h-11 px-6 shadow-md transition-all active:scale-[98%]"
              >
                <span>Save Changes</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </form>

          </div>
        )
      case 'security': {
        const passwordValidation = validatePassword(newPassword)
        const passwordReqs = checkPasswordRequirements(newPassword)
        
        return (
          <div className="space-y-8 w-full">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Security Settings</h3>
              <p className="text-sm text-slate-600">Manage your password and account security</p>
            </div>
            <div className="h-[1px] w-full bg-slate-200" />
            <form className="space-y-6" onSubmit={handlePasswordChange}>
              {passwordError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                  <div className="text-red-600 mt-0.5"><Zap className="h-4 w-4" /></div>
                  <p className="text-sm text-red-800 font-medium">{passwordError}</p>
                </div>
              )}
              <div className="space-y-3">
                <label className="font-semibold text-sm text-slate-900" htmlFor="old-password">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    id="old-password"
                    name="oldPassword"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="Enter your current password"
                    className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 pr-10 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-default disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="font-semibold text-sm text-slate-900" htmlFor="new-password">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="new-password"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setShowPasswordRequirements(true)}
                    onBlur={() => setTimeout(() => setShowPasswordRequirements(false), 200)}
                    autoComplete="new-password"
                    placeholder="New password"
                    className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 pr-10 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-default disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            getPasswordStrengthBgColor(passwordValidation.strength)
                          }`}
                          style={{ 
                            width: 
                              passwordValidation.strength === 'strong' ? '100%' :
                              passwordValidation.strength === 'good' ? '75%' :
                              passwordValidation.strength === 'fair' ? '50%' : '25%'
                          }}
                        />
                      </div>
                      <span className={`text-xs font-semibold capitalize ${
                        getPasswordStrengthColor(passwordValidation.strength)
                      }`}>
                        {passwordValidation.strength}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Password Requirements Checklist */}
                {(showPasswordRequirements || newPassword) && (
                  <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs font-semibold text-slate-700 mb-3">Password requirements:</p>
                    <ul className="space-y-2">
                      {passwordReqs.map((req, index) => (
                        <li key={index} className="flex items-center gap-2 text-xs">
                          {req.met ? (
                            <svg className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4 text-slate-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className={req.met ? 'text-slate-700 font-medium' : 'text-slate-500'}>
                            {req.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <label className="font-semibold text-sm text-slate-900" htmlFor="confirm-password">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm-password"
                    name="newPasswordConfirmed"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 pr-10 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-default disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-200 h-11 px-6 shadow-md transition-all active:scale-[98%]"
              >
                <span>Update Password</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </form>
          </div>
        )
      }
      case 'billing':
        // Check if subscription exists but payment failed
        const hasFailedPayment = subscription?.plan !== 'free' && 
                                 subscription?.status === 'expired' && 
                                 subscription?.endDate && 
                                 new Date(subscription.endDate) < new Date()
        
        return (
          <div className="space-y-12 w-full">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Billing & Payment</h3>
              <p className="text-sm text-slate-600">Manage your payment methods and billing information</p>
            </div>
            <div className="h-[1px] w-full bg-slate-200" />
            
            {/* Payment Failed Warning */}
            {hasFailedPayment && (
              <div className="rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 p-4 flex items-start gap-3">
                <div className="rounded-lg bg-gradient-to-br from-orange-500 to-red-600 p-2 flex-shrink-0">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-slate-900 mb-1">Payment Failed</h4>
                  <p className="text-sm text-slate-700 mb-3">
                    We couldn't process your last payment. Please update your payment method to continue your subscription.
                  </p>
                  <button
                    onClick={handleBillingPortal}
                    className="inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-lg hover:shadow-orange-200 h-10 px-4 shadow-md transition-all active:scale-[98%]"
                  >
                    <span>Update Payment Method</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Credit Card Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">Payment Methods</h4>
                  <p className="text-xs text-slate-600">Add and manage your credit cards</p>
                </div>
              </div>
              <button
                onClick={handleBillingPortal}
                className="inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:shadow-md h-10 px-4 shadow-sm transition-all active:scale-[98%]"
              >
                <span>Manage Cards</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>

            {/* Invoices Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-3">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">Invoices</h4>
                  <p className="text-xs text-slate-600">View and download your invoices</p>
                </div>
              </div>
              <button
                onClick={handleBillingPortal}
                className="inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:shadow-md h-10 px-4 shadow-sm transition-all active:scale-[98%]"
              >
                <span>View Invoices</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>

          </div>
        )
      case 'plans':
        // Calculate prices based on billing period
        const getPrice = (basePrice: number) => {
          if (billingPeriod === 'yearly') {
            return Math.round(basePrice * 0.8) // 20% discount for yearly
          }
          return basePrice
        }
        
        const starterPrice = getPrice(29)
        const premiumPrice = getPrice(49)
        
        return (
          <div className="space-y-8 w-full">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Upgrade Your Plan</h3>
              <p className="text-sm text-slate-600">Choose the perfect plan for your creative needs</p>
            </div>
            <div className="h-[1px] w-full bg-slate-200" />
            
            {/* Billing Period Tabs */}
            <div className="flex w-full justify-center overflow-x-auto">
              <div className="inline-flex items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-700 gap-1">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md py-1 text-sm font-semibold transition-all px-5 ${
                    billingPeriod === 'monthly'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'hover:text-slate-900 text-slate-600'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md py-1 text-sm font-semibold transition-all px-5 ${
                    billingPeriod === 'yearly'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'hover:text-slate-900 text-slate-600'
                  }`}
                >
                  Yearly Billing
                </button>
              </div>
            </div>
            
            {/* Plans Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-8">
              {/* Starter Plan - $29 */}
              <div className="relative flex w-full flex-col group">
                {subscription?.plan === 'starter' && 
                 subscription?.status === 'active' && 
                 subscription?.billingPeriod === billingPeriod && (
                  <div className="absolute -top-3 left-0 flex items-center gap-1 z-20">
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                      <span className="text-xs font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Current Plan
                      </span>
                    </div>
                  </div>
                )}
                <div className="relative z-10 flex h-full flex-col rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg hover:border-slate-300 transition-all">
                  <div className="flex flex-col p-6 rounded-t-xl">
                    <h3 className="text-xl font-bold text-slate-900">Starter</h3>
                    <div className="mt-4 flex flex-col">
                      <div className="flex items-baseline gap-x-2">
                        <div className="relative h-8 overflow-hidden">
                          <p 
                            key={starterPrice}
                            className="text-3xl font-bold text-slate-900 animate-in slide-in-from-bottom-2 fade-in duration-300"
                          >
                            ${starterPrice}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">/month</span>
                      </div>
                      {billingPeriod === 'yearly' && (
                        <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1"><Zap className="h-3 w-3" />Save 20% with yearly</p>
                      )}
                      <p className="text-xs font-semibold text-blue-600 mt-2 flex items-center gap-1"><Zap className="h-3 w-3" />7-day free trial</p>
                      <p className="text-xs font-medium text-slate-600 mt-3">Perfect for individuals</p>
                    </div>
                    <button
                      onClick={() => handleUpgrade('starter', billingPeriod)}
                      disabled={subscription?.plan === 'starter' && subscription?.status === 'active' && subscription?.billingPeriod === billingPeriod}
                      className={`inline-flex items-center justify-center rounded-lg text-sm font-semibold h-10 px-4 mt-5 transition-all ${
                        subscription?.plan === 'starter' && subscription?.status === 'active' && subscription?.billingPeriod === billingPeriod
                          ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:shadow-md active:scale-[98%]'
                      }`}
                    >
                      <span>{subscription?.plan === 'starter' && subscription?.status === 'active' && subscription?.billingPeriod === billingPeriod ? 'Current Plan' : 'Start Free Trial'}</span>
                      {!(subscription?.plan === 'starter' && subscription?.status === 'active' && subscription?.billingPeriod === billingPeriod) && <ArrowRight className="ml-2 h-4 w-4" />}
                    </button>
                  </div>
                  <div className="h-[1px] w-full bg-slate-200" />
                  <div className="flex flex-1 flex-col gap-3 px-6 py-5 text-sm">
                    <p className="font-semibold text-slate-900">What's included:</p>
                    <ul className="flex flex-col gap-2">
                      <li className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">Ad Copy: 200 generations/month</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">Landing Page: 20 generations/month</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">Voiceover: 50 generations/month</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">Poster: 30 generations/month</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">Email support</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Premium Plan - $49 (Most Popular) */}
              <div className="relative flex w-full flex-col group">
                {subscription?.plan === 'premium' && 
                 subscription?.status === 'active' && 
                 subscription?.billingPeriod === billingPeriod && (
                  <div className="absolute -top-3 left-0 flex items-center gap-1 z-20">
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                      <span className="text-xs font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Current Plan
                      </span>
                    </div>
                  </div>
                )}
                <div className="relative z-10 flex h-full flex-col rounded-xl border border-slate-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg hover:border-slate-300 transition-all">
                  <div className="absolute top-4 right-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white">Most Popular</span>
                  </div>
                  <div className="flex flex-col p-6 rounded-t-xl">
                    <h3 className="text-xl font-bold text-slate-900">Premium</h3>
                    <div className="mt-4 flex flex-col">
                      <div className="flex items-baseline gap-x-2">
                        <div className="relative h-8 overflow-hidden">
                          <p 
                            key={premiumPrice}
                            className="text-3xl font-bold text-slate-900 animate-in slide-in-from-bottom-2 fade-in duration-300"
                          >
                            ${premiumPrice}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">/month</span>
                      </div>
                      {billingPeriod === 'yearly' && (
                        <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1"><Zap className="h-3 w-3" />Save 20% with yearly</p>
                      )}
                      <p className="text-xs font-semibold text-purple-600 mt-2 flex items-center gap-1"><Zap className="h-3 w-3" />7-day free trial</p>
                      <p className="text-xs font-medium text-slate-600 mt-3">Best for growing businesses</p>
                    </div>
                    <button
                      onClick={() => handleUpgrade('premium', billingPeriod)}
                      disabled={subscription?.plan === 'premium' && subscription?.status === 'active' && subscription?.billingPeriod === billingPeriod}
                      className={`inline-flex items-center justify-center rounded-lg text-sm font-semibold h-10 px-4 mt-5 shadow-md transition-all ${
                        subscription?.plan === 'premium' && subscription?.status === 'active' && subscription?.billingPeriod === billingPeriod
                          ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-200 active:scale-[98%]'
                      }`}
                    >
                      <span>{subscription?.plan === 'premium' && subscription?.status === 'active' && subscription?.billingPeriod === billingPeriod ? 'Current Plan' : 'Start Free Trial'}</span>
                      {!(subscription?.plan === 'premium' && subscription?.status === 'active' && subscription?.billingPeriod === billingPeriod) && <ArrowRight className="ml-2 h-4 w-4" />}
                    </button>
                  </div>
                  <div className="h-[1px] w-full bg-slate-200" />
                  <div className="flex flex-1 flex-col gap-3 px-6 py-5 text-sm">
                    <p className="font-semibold text-slate-900">Everything in Starter, plus:</p>
                    <ul className="flex flex-col gap-2">
                      <li className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">Ad Copy: 500 generations/month</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">Landing Page: 50 generations/month</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">Voiceover: 200 generations/month</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">Poster: 80 generations/month</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">Priority support</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">Advanced analytics</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Enterprise Plan - Contact Us */}
              <div className="relative flex w-full flex-col group">
                {subscription?.plan === 'enterprise' && subscription?.status === 'active' && (
                  <div className="absolute -top-3 left-0 flex items-center gap-1 z-20">
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white">
                      <span className="text-xs font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Current Plan
                      </span>
                    </div>
                  </div>
                )}
                <div className="relative z-10 flex h-full flex-col rounded-xl border border-slate-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg hover:border-slate-300 transition-all">
                  <div className="absolute top-4 right-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white">Custom</span>
                  </div>
                  <div className="flex flex-col p-6 rounded-t-xl">
                    <h3 className="text-xl font-bold text-slate-900">Enterprise</h3>
                    <div className="mt-4 flex flex-col">
                      <div className="flex items-baseline gap-x-2">
                        <p className="text-3xl font-bold text-slate-900">Custom</p>
                      </div>
                      <p className="text-xs font-medium text-slate-600 mt-3">Tailored to your needs</p>
                    </div>
                    <button
                      onClick={() => window.location.href = '/support'}
                      className="inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-lg hover:shadow-orange-200 h-10 px-4 mt-5 shadow-md transition-all active:scale-[98%]"
                    >
                      <span>Contact Sales</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                  <div className="h-[1px] w-full bg-slate-200" />
                  <div className="flex flex-1 flex-col gap-3 px-6 py-5 text-sm">
                    <p className="font-semibold text-slate-900">Custom enterprise solution:</p>
                    <ul className="flex flex-col gap-2">
                      <li className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">Unlimited everything</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">Custom integrations</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">Dedicated account manager</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">24/7 priority support</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">Custom training</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">SLA guarantees</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700">Advanced security & compliance</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="flex h-full w-full flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl space-y-8 p-8">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Account Settings</h1>
            <p className="text-sm text-slate-600">Manage your profile, security, billing, and subscription preferences</p>
          </div>
          <div className="h-[1px] w-full bg-slate-200" />

          {/* Sidebar + Content Layout */}
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            {/* Sidebar Navigation */}
            <aside className="lg:w-1/5 lg:sticky lg:top-8 h-fit">
              <nav className="flex flex-wrap gap-2 lg:flex-col lg:space-y-2">
                <button
                  onClick={() => navigate('/settings/info')}
                  className={`inline-flex items-center whitespace-nowrap rounded-lg text-sm font-medium transition-all h-11 px-4 py-2 justify-start ${
                    activeTab === 'info'
                      ? 'bg-slate-100 text-slate-900 border border-slate-200'
                      : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                  }`}
                >
                  <User className="mr-2 h-5 w-5" />
                  Personal Info
                </button>
                <button
                  onClick={() => navigate('/settings/security')}
                  className={`inline-flex items-center whitespace-nowrap rounded-lg text-sm font-medium transition-all h-11 px-4 py-2 justify-start ${
                    activeTab === 'security'
                      ? 'bg-slate-100 text-slate-900 border border-slate-200'
                      : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                  }`}
                >
                  <Lock className="mr-2 h-5 w-5" />
                  Security
                </button>
                <button
                  onClick={() => navigate('/settings/plans')}
                  className={`inline-flex items-center whitespace-nowrap rounded-lg text-sm font-medium transition-all h-11 px-4 py-2 justify-start ${
                    activeTab === 'plans'
                      ? 'bg-slate-100 text-slate-900 border border-slate-200'
                      : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                  }`}
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Plans
                </button>
                <button
                  onClick={() => navigate('/settings/billing')}
                  className={`inline-flex items-center whitespace-nowrap rounded-lg text-sm font-medium transition-all h-11 px-4 py-2 justify-start ${
                    activeTab === 'billing'
                      ? 'bg-slate-100 text-slate-900 border border-slate-200'
                      : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                  }`}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Billing
                </button>
              </nav>
            </aside>

            {/* Tab Content */}
            <div className="flex-1">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default Settings
