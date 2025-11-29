import React, { useState, useEffect } from 'react'
import { LoadingSpinner } from '../../ui/LoadingSpinner'

interface SystemSetting {
  key: string
  value: string | boolean
  type: 'string' | 'boolean' | 'number'
  category: string
  description: string
}

const AdminSystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('general')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      
      // Mock settings - in real implementation, these would come from a settings table
      const mockSettings: SystemSetting[] = [
        { key: 'environment', value: 'production', type: 'string', category: 'general', description: 'Environment mode' },
        { key: 'maintenance_mode', value: false, type: 'boolean', category: 'general', description: 'Enable maintenance mode' },
        { key: 'ai_model', value: 'gpt-4o', type: 'string', category: 'ai', description: 'Default AI model' },
        { key: 'rate_limit_requests', value: '100', type: 'number', category: 'api', description: 'API rate limit per minute' },
        { key: 'stripe_enabled', value: true, type: 'boolean', category: 'payments', description: 'Enable Stripe payments' },
        { key: 'affiliate_enabled', value: true, type: 'boolean', category: 'features', description: 'Enable affiliate program' },
      ]
      
      setSettings(mockSettings)
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // In a real implementation, you would save settings to a settings table
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => prev.map(setting => 
      setting.key === key ? { ...setting, value } : setting
    ))
  }

  const categories = ['general', 'ai', 'api', 'payments', 'features']
  const filteredSettings = settings.filter(s => s.category === activeTab)

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Configure system environment and features</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`px-4 py-2 rounded-xl transition-colors capitalize ${
                activeTab === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Settings List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 space-y-6">
          {filteredSettings.length > 0 ? (
            filteredSettings.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{setting.description}</p>
                </div>
                <div className="ml-4">
                  {setting.type === 'boolean' ? (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setting.value as boolean}
                        onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  ) : setting.type === 'string' ? (
                    <select
                      value={setting.value as string}
                      onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {setting.key === 'environment' && (
                        <>
                          <option value="production">Production</option>
                          <option value="staging">Staging</option>
                          <option value="development">Development</option>
                        </>
                      )}
                      {setting.key === 'ai_model' && (
                        <>
                          <option value="gpt-4o">GPT-4o</option>
                          <option value="gpt-4">GPT-4</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                          <option value="gemini-pro">Gemini Pro</option>
                        </>
                      )}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={setting.value as string}
                      onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No settings found for this category</p>
            </div>
          )}
        </div>
      </div>

      {/* API Keys Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Keys Management</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Supabase</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Service role key</p>
            </div>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
              View/Edit
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Stripe</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Secret key</p>
            </div>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
              View/Edit
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">OpenAI</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">API key</p>
            </div>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
              View/Edit
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Vision AI</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">API key</p>
            </div>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
              View/Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSystemSettings

