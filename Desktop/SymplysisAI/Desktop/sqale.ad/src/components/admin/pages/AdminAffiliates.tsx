import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { LoadingSpinner } from '../../ui/LoadingSpinner'

interface Affiliate {
  id: string
  user_id: string
  referral_code: string
  total_clicks: number
  total_signups: number
  total_payout: number
  created_at: string
  user_name?: string
  user_email?: string
}

interface Referral {
  id: string
  affiliate_id: string
  referred_user_id: string
  signup_date: string
  subscription_status: string
  commission: number
  payout_status: string
  affiliate_name?: string
}

const AdminAffiliates: React.FC = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null)
  const [activeTab, setActiveTab] = useState<'affiliates' | 'referrals'>('affiliates')

  useEffect(() => {
    loadAffiliates()
    loadReferrals()
  }, [])

  const loadAffiliates = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .order('total_payout', { ascending: false })

      if (error) throw error
      setAffiliates(data || [])
    } catch (error) {
      console.error('Error loading affiliates:', error)
    }
  }

  const loadReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .order('signup_date', { ascending: false })
        .limit(100)

      if (error) throw error
      setReferrals(data || [])
    } catch (error) {
      console.error('Error loading referrals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayout = async (affiliateId: string, amount: number) => {
    if (!window.confirm(`Process payout of $${amount.toFixed(2)}?`)) return
    
    try {
      // Create payout record
      const { error } = await supabase
        .from('payouts')
        .insert({
          affiliate_id: affiliateId,
          amount: amount,
          payment_method: 'stripe',
          status: 'pending'
        })

      if (error) throw error
      alert('Payout request created successfully')
      loadAffiliates()
    } catch (error) {
      console.error('Error processing payout:', error)
      alert('Failed to process payout')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Affiliates</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage affiliate program and payouts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('affiliates')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'affiliates'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Affiliates ({affiliates.length})
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'referrals'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Referrals ({referrals.length})
          </button>
        </div>
      </div>

      {/* Affiliates Table */}
      {activeTab === 'affiliates' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Affiliate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Referral Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Clicks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Signups</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Payout</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {affiliates.length > 0 ? (
                  affiliates.map((affiliate) => (
                    <tr key={affiliate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{affiliate.user_name || affiliate.user_id.slice(0, 8)}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{affiliate.user_email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white">
                          {affiliate.referral_code}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {affiliate.total_clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {affiliate.total_signups.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        ${affiliate.total_payout.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedAffiliate(affiliate)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View
                          </button>
                          {affiliate.total_payout > 0 && (
                            <button
                              onClick={() => handlePayout(affiliate.id, affiliate.total_payout)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              Payout
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No affiliates found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Referrals Table */}
      {activeTab === 'referrals' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Affiliate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Referred User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Signup Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subscription</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payout Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {referrals.length > 0 ? (
                  referrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {referral.affiliate_name || referral.affiliate_id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {referral.referred_user_id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(referral.signup_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          referral.subscription_status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {referral.subscription_status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        ${referral.commission.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          referral.payout_status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          referral.payout_status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {referral.payout_status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No referrals found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Affiliates</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{affiliates.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Referrals</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{referrals.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Payouts</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            ${affiliates.reduce((sum, aff) => sum + aff.total_payout, 0).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminAffiliates

