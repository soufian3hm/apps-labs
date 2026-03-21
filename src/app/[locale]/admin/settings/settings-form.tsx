'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const [fbPixelId, setFbPixelId] = useState(initialSettings?.fb_pixel_id || '')
  const [fbPixelToken, setFbPixelToken] = useState(initialSettings?.fb_pixel_token || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    
    // UPSERT settings
    const { error } = await supabase
      .from('appslabs_settings')
      .upsert({ id: 1, fb_pixel_id: fbPixelId, fb_pixel_token: fbPixelToken, updated_at: new Date().toISOString() })

    setSaving(false)
    if (error) {
      alert('Error saving settings: ' + error.message)
    } else {
      alert('Settings updated successfully!')
    }
  }

  return (
    <div className="min-h-screen bg-bg text-fg p-6 lg:p-12">
      <div className="mx-auto max-w-[800px]">
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-edge">
          <h1 className="font-display text-3xl font-bold">Admin Settings</h1>
          <Link href="/en/admin" className="px-4 py-2 rounded-lg border border-edge bg-surface text-sm font-medium hover:text-accent transition-colors">
            &larr; Back to Kanban Board
          </Link>
        </div>

        <div className="rounded-2xl border border-edge bg-surface p-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Marketing Config</h2>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-fg mb-1.5" htmlFor="fbPixelId">
                Facebook Pixel ID
              </label>
              <input
                id="fbPixelId"
                type="text"
                value={fbPixelId}
                onChange={(e) => setFbPixelId(e.target.value)}
                placeholder="e.g. 123456789012345"
                className="w-full rounded-xl border border-edge bg-bg px-4 py-3 text-sm text-fg placeholder-fg-tertiary focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200"
              />
              <p className="mt-2 text-xs text-fg-muted">The primary Pixel ID used to track PageViews and Leads.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-fg mb-1.5" htmlFor="fbPixelToken">
                Facebook Conversions API Token <span className="text-fg-tertiary font-normal">(Optional)</span>
              </label>
              <input
                id="fbPixelToken"
                type="password"
                value={fbPixelToken}
                onChange={(e) => setFbPixelToken(e.target.value)}
                placeholder="EAAB..."
                className="w-full rounded-xl border border-edge bg-bg px-4 py-3 text-sm text-fg placeholder-fg-tertiary focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-4 px-6 py-3 bg-accent text-white font-bold rounded-xl text-sm transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {saving ? 'Saving Config...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
