import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { LoadingSpinner } from '../../ui/LoadingSpinner'

interface ContentItem {
  id: string
  category: 'ad_template' | 'voiceover_script' | 'landing_block'
  title: string
  description: string
  content: string
  version: number
  created_at: string
  updated_at: string
  created_by?: string
}

const AdminContentLibrary: React.FC = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadContentItems()
  }, [])

  const loadContentItems = async () => {
    try {
      setLoading(true)
      // In a real implementation, you would have a content_library table
      // For now, we'll use mock data or fetch from existing tables
      setContentItems([])
    } catch (error) {
      console.error('Error loading content items:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = contentItems.filter(item => {
    if (selectedCategory === 'all') return true
    return item.category === selectedCategory
  })

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'ad_template': return 'Ad Templates'
      case 'voiceover_script': return 'Voiceover Scripts'
      case 'landing_block': return 'Landing Blocks'
      default: return category
    }
  }

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'ad_template', label: 'Ad Templates' },
    { id: 'voiceover_script', label: 'Voiceover Scripts' },
    { id: 'landing_block', label: 'Landing Blocks' }
  ]

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Library</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage templates, scripts, and blocks</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          + Add Content
        </button>
      </div>

      {/* Category Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-xl transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {getCategoryLabel(item.category)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">v{item.version}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Updated {new Date(item.updated_at).toLocaleDateString()}</span>
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                    Archive
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
          <p className="text-gray-500 dark:text-gray-400">No content items found. Click "Add Content" to create one.</p>
        </div>
      )}

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Content</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="ad_template">Ad Template</option>
                  <option value="voiceover_script">Voiceover Script</option>
                  <option value="landing_block">Landing Block</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Enter description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
                <textarea
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  rows={10}
                  placeholder="Enter content"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  Save
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedItem.title}</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{getCategoryLabel(selectedItem.category)} • v{selectedItem.version}</p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedItem.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Content</label>
                <pre className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white overflow-x-auto">
                  {selectedItem.content}
                </pre>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Created {new Date(selectedItem.created_at).toLocaleString()}
                  {selectedItem.updated_at !== selectedItem.created_at && (
                    <> • Updated {new Date(selectedItem.updated_at).toLocaleString()}</>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
                    Archive
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminContentLibrary

