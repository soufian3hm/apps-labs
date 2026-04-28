import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUsageTracking } from '../hooks/useUsageTracking'
import {
  Type,
  Image,
  Layout,
  TrendingUp,
  Zap,
  Bell,
  ChevronRight,
  Activity,
  Play,
  Mic,
  Check,
  SquarePen,
  Trash2,
  Plus,
  X
} from 'lucide-react'

interface UserProfile {
  name: string
  balance: number
  company_name: string
}

interface RecentActivity {
  type: 'ad_copy' | 'voiceover' | 'poster' | 'landing_page'
  title: string
  created_at: string
  id: string
  image_url?: string
  preview?: string
}

interface UsageStats {
  ad_copies_today: number
  voiceovers_today: number
  posters_today: number
  landing_pages_today: number
  total_generations: number
}

interface FeatureBalance {
  ad_copy: number
  voiceover: number
  poster: number
  landing_page: number
}

interface Tip {
  title: string
  description: string
  category: string
}

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { getRemainingCount, loading: usageLoading } = useUsageTracking()
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats>({
    ad_copies_today: 0,
    voiceovers_today: 0,
    posters_today: 0,
    landing_pages_today: 0,
    total_generations: 0
  })
  const [featureBalance, setFeatureBalance] = useState<FeatureBalance>({
    ad_copy: 0,
    voiceover: 0,
    poster: 0,
    landing_page: 0
  })
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentTip, setCurrentTip] = useState(0)
  const [tasks, setTasks] = useState<Array<{ id: string; text: string; completed: boolean }>>([])
  const [taskInput, setTaskInput] = useState('')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadTasks = async (userId?: string) => {
    try {
      const uid = userId || (await supabase.auth.getUser()).data.user?.id
      if (!uid) return

      const { data, error } = await supabase
        .from('user_todos')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        setTasks(data.map(todo => ({
          id: todo.id,
          text: todo.text,
          completed: todo.completed
        })))
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  // Update feature balance from usage tracking
  useEffect(() => {
    // Don't update if usage tracking is still loading
    if (usageLoading) {
      return
    }

    const updateFeatureBalance = () => {
      // Use getRemainingCount which includes bonus credits
      const adCopyCredits = getRemainingCount('adcopy')
      const voiceoverCredits = getRemainingCount('voiceover')
      const posterCredits = getRemainingCount('poster')
      const landingPageCredits = getRemainingCount('landing_page')

      setFeatureBalance({
        ad_copy: adCopyCredits,
        voiceover: voiceoverCredits,
        poster: posterCredits,
        landing_page: landingPageCredits
      })
    }

    updateFeatureBalance()
    // Update every 2 seconds to reflect real-time changes
    const interval = setInterval(updateFeatureBalance, 2000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usageLoading])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      // Load all data in parallel
      await Promise.all([
        (async () => {
          // Load user profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('name, balance, company_name')
            .eq('user_id', user.id)
            .single()

          if (profile) {
            setUserProfile(profile)
          }
        })(),
        loadBackgroundData(user.id),
        loadTasks(user.id)
      ])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBackgroundData = async (userId: string) => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Get last 2 ad copies
      const { data: adCopyHistory, error: adError } = await supabase
        .from('ad_copy_history')
        .select('id, title, created_at, outputs')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(2)

      // Get last 2 posters from storage
      const { data: posterHistory, error: posterError } = await supabase
        .from('posters_uploads')
        .select('id, prompt, created_at, storage_path')
        .eq('user_id', userId)
        .not('storage_path', 'is', null)
        .order('created_at', { ascending: false })
        .limit(2)

      // Combine recent activity (only ad copies and posters)
      const activities: RecentActivity[] = []

      if (!adError && adCopyHistory) {
        activities.push(...adCopyHistory.map(item => ({
          type: 'ad_copy' as const,
          title: item.title || 'Untitled Ad Copy',
          created_at: item.created_at,
          id: item.id,
          preview: (item.outputs && item.outputs.length > 0) ? item.outputs[0].slice(0, 150) : 'No preview available'
        })))
      }

      if (!posterError && posterHistory) {
        const StorageService = (await import('../services/storageService')).StorageService
        activities.push(...posterHistory.map(item => ({
          type: 'poster' as const,
          title: item.prompt?.slice(0, 50) || 'Untitled Poster',
          created_at: item.created_at,
          id: item.id,
          image_url: item.storage_path ? StorageService.getPublicUrl(item.storage_path) : undefined
        })))
      }

      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setRecentActivity(activities)

      // Calculate usage stats
      const { count: adCopiesToday } = await supabase
        .from('ad_copy_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())

      const { count: postersToday } = await supabase
        .from('posters_uploads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())

      const { count: voiceoversToday } = await supabase
        .from('voiceover_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', today.toISOString())

      const { count: totalAdCopies } = await supabase
        .from('ad_copy_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      const { count: totalPosters } = await supabase
        .from('posters_uploads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      const { count: totalVoiceovers } = await supabase
        .from('voiceover_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      setUsageStats({
        ad_copies_today: adCopiesToday || 0,
        voiceovers_today: voiceoversToday || 0,
        posters_today: postersToday || 0,
        landing_pages_today: 0,
        total_generations: (totalAdCopies || 0) + (totalPosters || 0) + (totalVoiceovers || 0)
      })
    } catch (error) {
      console.error('Error loading background data:', error)
    }
  }

  const shortcuts = [
    {
      name: 'Ad Copy Generator',
      description: 'Create compelling ad copies',
      icon: Type,
      color: 'from-blue-500 to-indigo-600',
      path: '/symplysis?tab=ad-copy-generator'
    },
    {
      name: 'Voiceover Generator',
      description: 'Generate AI voiceovers',
      icon: Mic,
      color: 'from-purple-500 to-pink-600',
      path: '/symplysis?tab=voiceover-generator'
    },
    {
      name: 'Poster Generator',
      description: 'Design stunning posters',
      icon: Image,
      color: 'from-orange-500 to-red-600',
      path: '/poster-generator'
    },
    {
      name: 'Landing Page',
      description: 'Build landing pages',
      icon: Layout,
      color: 'from-green-500 to-teal-600',
      path: '/landing-page-generator'
    }
  ]

  const tips: Tip[] = [
    {
      title: "Write Better Headlines",
      description: "Use numbers, questions, or strong action words to grab attention instantly",
      category: "Ad Copy"
    },
    {
      title: "Voice Tone Matters",
      description: "Match your voiceover tone to your brand personality for consistent messaging",
      category: "Voiceover"
    },
    {
      title: "Color Psychology",
      description: "Red creates urgency, blue builds trust, green suggests growth",
      category: "Design"
    },
    {
      title: "A/B Test Everything",
      description: "Test headlines, images, and CTAs to find what converts best",
      category: "Strategy"
    },
    {
      title: "Keep It Simple",
      description: "Focus on one main message per ad or landing page for maximum impact",
      category: "General"
    },
    {
      title: "Mobile-First Design",
      description: "70% of users browse on mobile - ensure your content looks great on small screens",
      category: "Design"
    }
  ]

  const announcements = [
    {
      title: 'New: Voiceover History',
      description: 'Access all your generated voiceovers in the history tab',
      date: 'Today',
      icon: Bell,
      color: 'text-blue-600'
    },
    {
      title: 'Feature Update: Ad Copy Networks',
      description: 'Now supporting Meta, Google, TikTok, and Snapchat formats',
      date: 'Yesterday',
      icon: Zap,
      color: 'text-purple-600'
    }
  ]

  // Auto-advance slides
  useEffect(() => {
    if (recentActivity.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % recentActivity.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [recentActivity.length])

  // Auto-advance tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ad_copy':
        return <Type className="w-4 h-4 text-blue-600" />
      case 'voiceover':
        return <Mic className="w-4 h-4 text-purple-600" />
      case 'poster':
        return <Image className="w-4 h-4 text-orange-600" />
      case 'landing_page':
        return <Layout className="w-4 h-4 text-green-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Task board functions
  const addTask = async () => {
    if (!taskInput.trim()) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_todos')
        .insert({
          user_id: user.id,
          text: taskInput.trim(),
          completed: false
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setTasks([{ id: data.id, text: data.text, completed: data.completed }, ...tasks])
        setTaskInput('')
      }
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const toggleTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return

      const { error } = await supabase
        .from('user_todos')
        .update({ completed: !task.completed })
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ))
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('user_todos')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.filter(t => t.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const startEditing = (taskId: string, currentText: string) => {
    setEditingTaskId(taskId)
    setEditingText(currentText)
  }

  const saveEdit = async (taskId: string) => {
    if (!editingText.trim()) return

    try {
      const { error } = await supabase
        .from('user_todos')
        .update({ text: editingText.trim() })
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.map(t =>
        t.id === taskId ? { ...t, text: editingText.trim() } : t
      ))
      setEditingTaskId(null)
      setEditingText('')
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const cancelEdit = () => {
    setEditingTaskId(null)
    setEditingText('')
  }

  // Skeleton Loading State
  if (loading || usageLoading) {
    return (
      <div className="w-full bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="w-full h-full overflow-auto">
          <div className="mx-auto max-w-7xl space-y-8 p-8">
            {/* Header Skeleton */}
            <div className="space-y-2">
              <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-4 w-48 bg-slate-200 rounded-lg animate-pulse" />
            </div>

            {/* Feature Balances Skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 h-32 animate-pulse">
                    <div className="flex justify-between mb-3">
                      <div className="h-6 w-6 bg-slate-200 rounded-full" />
                      <div className="h-5 w-16 bg-slate-200 rounded-full" />
                    </div>
                    <div className="h-8 w-12 bg-slate-200 rounded-lg mb-2" />
                    <div className="h-3 w-20 bg-slate-200 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tips Skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-24 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-48 rounded-xl bg-slate-200 animate-pulse" />
            </div>

            {/* Today's Activity Skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 h-28 animate-pulse">
                    <div className="flex justify-between mb-3">
                      <div className="space-y-2">
                        <div className="h-4 w-20 bg-slate-200 rounded" />
                        <div className="h-3 w-24 bg-slate-200 rounded" />
                      </div>
                      <div className="h-5 w-5 bg-slate-200 rounded" />
                    </div>
                    <div className="h-8 w-8 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Launch Skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 h-24 animate-pulse">
                    <div className="flex justify-between mb-3">
                      <div className="h-6 w-6 bg-slate-200 rounded" />
                    </div>
                    <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                    <div className="h-3 w-40 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Creations Skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-[300px] rounded-xl bg-slate-200 animate-pulse" />
            </div>

            {/* Bottom Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse" />
                <div className="rounded-xl border border-slate-200 bg-white p-5 h-64 animate-pulse" />
              </div>
              <div className="space-y-4">
                <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse" />
                <div className="space-y-3">
                  <div className="h-24 rounded-xl bg-slate-200 animate-pulse" />
                  <div className="h-24 rounded-xl bg-slate-200 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="w-full h-full overflow-auto">
        <div className="mx-auto max-w-7xl space-y-8 p-8">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Welcome back, {userProfile?.name || 'there'}
            </h1>
            <p className="text-sm text-slate-600">
              {userProfile?.company_name && `${userProfile.company_name} • `}
              Your creative workspace
            </p>
          </div>

          {/* Feature Balances */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Available Credits</h2>
              <p className="text-sm text-slate-600 mt-1">Your feature credits</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-5 hover:shadow-md hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Type className="h-6 w-6 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700 bg-blue-200 px-2 py-1 rounded-full">Ad Copy</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">{featureBalance.ad_copy}</div>
                <p className="text-xs text-slate-600 mt-2">Credits left</p>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-5 hover:shadow-md hover:border-purple-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Mic className="h-6 w-6 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-700 bg-purple-200 px-2 py-1 rounded-full">Voiceover</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">{featureBalance.voiceover}</div>
                <p className="text-xs text-slate-600 mt-2">Credits left</p>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-5 hover:shadow-md hover:border-emerald-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Image className="h-6 w-6 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-200 px-2 py-1 rounded-full">Poster</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">{featureBalance.poster}</div>
                <p className="text-xs text-slate-600 mt-2">Credits left</p>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-5 hover:shadow-md hover:border-orange-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Layout className="h-6 w-6 text-orange-600" />
                  <span className="text-xs font-semibold text-orange-700 bg-orange-200 px-2 py-1 rounded-full">Landing</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">{featureBalance.landing_page}</div>
                <p className="text-xs text-slate-600 mt-2">Credits left</p>
              </div>
            </div>
          </div>

          {/* Pro Tips Slider */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">💡 Pro Tips</h2>
              <p className="text-sm text-slate-600 mt-1">Level up your creative game</p>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">{tips[currentTip].category}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{tips[currentTip].title}</h3>
                <p className="text-sm opacity-90">{tips[currentTip].description}</p>
                <div className="flex gap-1 mt-4">
                  {tips.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 rounded-full transition-all ${idx === currentTip ? 'bg-white w-6' : 'bg-white/40 w-1'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Today's Activity Stats */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Today's Activity</h2>
              <p className="text-sm text-slate-600 mt-1">Your daily progress</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-lg hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-slate-700">Ad Copies</div>
                    <div className="text-xs text-slate-500 mt-1">Generated today</div>
                  </div>
                  <Type className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{usageStats.ad_copies_today}</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-lg hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-slate-700">Voiceovers</div>
                    <div className="text-xs text-slate-500 mt-1">Generated today</div>
                  </div>
                  <Mic className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{usageStats.voiceovers_today}</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-lg hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-slate-700">Posters</div>
                    <div className="text-xs text-slate-500 mt-1">Generated today</div>
                  </div>
                  <Image className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{usageStats.posters_today}</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-lg hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-slate-700">Landing Pages</div>
                    <div className="text-xs text-slate-500 mt-1">Generated today</div>
                  </div>
                  <Layout className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{usageStats.landing_pages_today}</div>
              </div>
            </div>
          </div>

          {/* Quick Launch */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Quick Launch</h2>
              <p className="text-sm text-slate-600 mt-1">Start creating instantly</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {shortcuts.map((shortcut, idx) => {
                const colors = [
                  'from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300 hover:shadow-blue-100',
                  'from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300 hover:shadow-purple-100',
                  'from-emerald-50 to-emerald-100 border-emerald-200 hover:border-emerald-300 hover:shadow-emerald-100',
                  'from-orange-50 to-orange-100 border-orange-200 hover:border-orange-300 hover:shadow-orange-100'
                ]
                const iconColors = ['text-blue-600', 'text-purple-600', 'text-emerald-600', 'text-orange-600']
                return (
                  <button
                    key={shortcut.name}
                    onClick={() => navigate(shortcut.path)}
                    className={`rounded-xl bg-gradient-to-br ${colors[idx]} border p-5 text-left hover:shadow-lg transition-all group`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <shortcut.icon className={`h-6 w-6 ${iconColors[idx]} group-hover:scale-110 transition-transform`} />
                      <Play className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{shortcut.name}</div>
                    <div className="text-xs text-slate-600 mt-1">{shortcut.description}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Latest Creations - Sliding Carousel */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Latest Creations</h2>
              <p className="text-sm text-slate-600 mt-1">Your recent work</p>
            </div>

            {recentActivity.length === 0 ? (
              <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
                <div className="text-center">
                  <Activity className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                  <p className="text-sm font-medium text-slate-700">No creations yet</p>
                  <p className="text-xs text-slate-500 mt-2">Start creating to see your work here</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Main Slide */}
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-lg">
                  <div className="relative h-[300px] overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200">
                    {recentActivity[currentSlide]?.image_url && (
                      <img
                        src={recentActivity[currentSlide].image_url}
                        alt="Latest creation"
                        className="w-full h-full object-cover"
                      />
                    )}
                    {!recentActivity[currentSlide]?.image_url && (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-8">
                        <div className="text-center max-w-3xl w-full">
                          {recentActivity[currentSlide]?.type === 'ad_copy' ? (
                            <>
                              <Type className="h-12 w-12 text-blue-500 mx-auto mb-6" />
                              <p
                                className="text-slate-800 text-3xl font-bold leading-relaxed px-6"
                                style={{
                                  direction: /[\u0600-\u06FF]/.test(recentActivity[currentSlide]?.preview || '') ? 'rtl' : 'ltr',
                                  textAlign: /[\u0600-\u06FF]/.test(recentActivity[currentSlide]?.preview || '') ? 'right' : 'left'
                                }}
                              >
                                {recentActivity[currentSlide]?.preview || recentActivity[currentSlide]?.title}
                              </p>
                            </>
                          ) : (
                            <>
                              {recentActivity[currentSlide]?.type === 'voiceover' && (
                                <Mic className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                              )}
                              {recentActivity[currentSlide]?.type === 'poster' && (
                                <Image className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                              )}
                              {recentActivity[currentSlide]?.type === 'landing_page' && (
                                <Layout className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                              )}
                              <p className="text-slate-700 text-sm max-w-xs mx-auto px-4">
                                {recentActivity[currentSlide]?.preview || recentActivity[currentSlide]?.title}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        {getActivityIcon(recentActivity[currentSlide]?.type)}
                        <span className="text-xs font-semibold text-white bg-black/40 px-2 py-1 rounded-full uppercase tracking-wide">
                          {recentActivity[currentSlide]?.type.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white truncate">{recentActivity[currentSlide]?.title}</h3>
                      <p className="text-xs text-white/80 mt-1">{getRelativeTime(recentActivity[currentSlide]?.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Slide Indicators & Navigation */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-2">
                    {recentActivity.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2 rounded-full transition-all ${idx === currentSlide
                          ? 'bg-blue-500 w-8'
                          : 'bg-slate-300 w-2 hover:bg-slate-400'
                          }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-slate-500">
                    {currentSlide + 1} / {recentActivity.length}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* My Todo List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Board */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">My TODO List</h2>
                <p className="text-sm text-slate-600 mt-1">Add your tasks here</p>
              </div>

              {/* Task Board Widget */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md hover:border-slate-300 transition-all">
                <div className="mb-4">
                  {/* Add Task Input */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addTask()
                        }
                      }}
                      placeholder="Add a new task..."
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={addTask}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      title="Add task"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {tasks.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No tasks yet. Add one above!</p>
                    ) : (
                      tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-center gap-2 p-2 rounded-lg transition-all ${task.completed ? 'bg-slate-50 opacity-60' : 'bg-slate-50'
                            }`}
                        >
                          {/* Checkmark */}
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${task.completed
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-slate-300 hover:border-blue-500'
                              }`}
                            title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            {task.completed && <Check size={14} className="text-white" />}
                          </button>

                          {/* Task Text */}
                          {editingTaskId === task.id ? (
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveEdit(task.id)
                                  } else if (e.key === 'Escape') {
                                    cancelEdit()
                                  }
                                }}
                                className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                autoFocus
                              />
                              <button
                                onClick={() => saveEdit(task.id)}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                                title="Save"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300 transition-colors"
                                title="Cancel"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span
                                className={`flex-1 text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                                  }`}
                              >
                                {task.text}
                              </span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => startEditing(task.id, task.text)}
                                  className="p-1 text-slate-500 hover:text-blue-600 transition-colors"
                                  title="Edit task"
                                >
                                  <SquarePen size={14} />
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="p-1 text-slate-500 hover:text-red-600 transition-colors"
                                  title="Delete task"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Announcements */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Updates & News</h2>
                <p className="text-sm text-slate-600 mt-1">Latest announcements</p>
              </div>
              <div className="space-y-3">
                {announcements.map((announcement, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md hover:border-slate-300 transition-all"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <announcement.icon className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {announcement.title}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {announcement.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">{announcement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
