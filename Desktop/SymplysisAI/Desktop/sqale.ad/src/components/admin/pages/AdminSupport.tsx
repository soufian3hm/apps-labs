import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'
import {
  MessageSquare,
  SendHorizontal,
  X,
  CheckCircle,
  Clock,
  User,
  Mail,
  Plus,
  Search,
  Filter,
  Image as ImageIcon,
  Paperclip
} from 'lucide-react'
import { LoadingSpinner } from '../../ui/LoadingSpinner'

interface SupportChat {
  id: string
  user_id: string
  assigned_agent?: string
  status: 'active' | 'resolved' | 'waiting'
  created_at: string
  updated_at: string
  user_name?: string
  user_email?: string
  last_message?: string
  last_message_time?: string
  message_count?: number
}

interface SupportMessage {
  id: string
  chat_id: string
  sender: 'user' | 'agent' | 'ai'
  message: string
  image_url?: string
  created_at: string
}

const AdminSupport: React.FC = () => {
  const { user } = useAuth()
  const [chats, setChats] = useState<SupportChat[]>([])
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showNewTicketModal, setShowNewTicketModal] = useState(false)
  const [newTicketUserId, setNewTicketUserId] = useState('')
  const [productImage, setProductImage] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChats()
    
    // Subscribe to real-time updates for chats
    const chatsChannel = supabase
      .channel('admin_support_chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_chats'
        },
        () => {
          loadChats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(chatsChannel)
    }
  }, [])

  useEffect(() => {
    if (!selectedChat) return

    // Subscribe to real-time updates for messages in the selected chat
    const messagesChannel = supabase
      .channel(`admin_support_messages_${selectedChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `chat_id=eq.${selectedChat.id}`
        },
        (payload) => {
          const newMessage = payload.new as SupportMessage
          setMessages((prev) => {
            // Check if message already exists to avoid duplicates
            if (prev.some(m => m.id === newMessage.id)) {
              return prev
            }
            return [...prev, newMessage]
          })
          scrollToBottom()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_chats',
          filter: `id=eq.${selectedChat.id}`
        },
        (payload) => {
          // Update the selected chat if it changes
          const updatedChat = payload.new as SupportChat
          setSelectedChat(updatedChat)
          // Reload chats to update the list
          loadChats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesChannel)
    }
  }, [selectedChat])

  useEffect(() => {
    if (selectedChat) {
      loadMessages()
    }
  }, [selectedChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChats = async () => {
    try {
      setLoading(true)
      
      // Fetch all support chats
      const { data: chatsData, error: chatsError } = await supabase
        .from('support_chats')
        .select('*')
        .order('updated_at', { ascending: false })

      if (chatsError) throw chatsError

      // Fetch all users info at once using admin function
      let allUsers: any[] = []
      try {
        const { data: usersData, error: usersError } = await supabase.rpc('get_all_users_for_admin')
        if (!usersError && usersData) {
          allUsers = usersData
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }

      // Create a map of user_id to user info for quick lookup
      const usersMap = new Map(allUsers.map((u: any) => [u.user_id, u]))

      // Fetch all messages at once for all chats
      const chatIds = (chatsData || []).map(c => c.id)
      let messagesMap = new Map<string, any[]>()
      if (chatIds.length > 0) {
        const { data: allMessages } = await supabase
          .from('support_messages')
          .select('chat_id, message, created_at')
          .in('chat_id', chatIds)
          .order('created_at', { ascending: false })

        // Group messages by chat_id
        if (allMessages) {
          allMessages.forEach((msg: any) => {
            if (!messagesMap.has(msg.chat_id)) {
              messagesMap.set(msg.chat_id, [])
            }
            messagesMap.get(msg.chat_id)!.push(msg)
          })
        }
      }

      // Count messages per chat (already have them in messagesMap)
      const messageCountsMap = new Map<string, number>()
      for (const chatId of chatIds) {
        const messages = messagesMap.get(chatId) || []
        messageCountsMap.set(chatId, messages.length)
      }

      // Combine all data
      const chatsWithUserInfo = (chatsData || []).map((chat) => {
        const userInfo = usersMap.get(chat.user_id)
        const messages = messagesMap.get(chat.id) || []
        const lastMessage = messages[0] || null

        return {
          ...chat,
          user_email: userInfo?.email || 'N/A',
          user_name: userInfo?.name || userInfo?.email?.split('@')[0] || 'User',
          last_message: lastMessage?.message || '',
          last_message_time: lastMessage?.created_at || chat.updated_at,
          message_count: messageCountsMap.get(chat.id) || 0
        }
      })

      setChats(chatsWithUserInfo)
    } catch (error) {
      console.error('Error loading chats:', error)
      alert('Failed to load support chats')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!selectedChat) return

    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('chat_id', selectedChat.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
      alert('Failed to load messages')
    }
  }

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !productImage) || !selectedChat || !user) return

    setSending(true)
    try {
      let imageUrl: string | undefined

      // Upload image if present (using StorageService like PosterGenerator)
      if (productImage) {
        console.log('🖼️ [AdminSupport] Starting image upload process')
        console.log('🖼️ [AdminSupport] Product image exists, length:', productImage.length)
        
        try {
          // Generate unique filename
          const timestamp = Date.now()
          const random = Math.random().toString(36).substring(2, 15)
          const extension = productImage.split(';')[0].split('/')[1] || 'png'
          const filename = `${timestamp}-${random}.${extension}`
          const storagePath = `${selectedChat.user_id}/${selectedChat.id}/${filename}`

          console.log('📝 [AdminSupport] Generated filename:', filename)
          console.log('📝 [AdminSupport] Full storage path:', storagePath)

          // Use StorageService (same as PosterGenerator)
          const { StorageService } = await import('../../../services/storageService')
          console.log('✅ [AdminSupport] StorageService imported')
          
          const uploadResult = await StorageService.uploadSupportImage(productImage, storagePath)
          console.log('📊 [AdminSupport] Upload result:', uploadResult)

          if (!uploadResult.success || !uploadResult.publicUrl) {
            console.error('❌ [AdminSupport] Upload failed:', uploadResult.error)
            throw new Error(uploadResult.error || 'Failed to upload image')
          }

          imageUrl = uploadResult.publicUrl
          console.log('✅ [AdminSupport] Image URL set:', imageUrl)
        } catch (error) {
          console.error('❌ [AdminSupport] Error uploading image:', error)
          alert('Failed to upload image. Please try again.')
          setSending(false)
          return
        }
      }

      const { data: newMessageData, error } = await supabase
        .from('support_messages')
        .insert({
          chat_id: selectedChat.id,
          sender: 'agent',
          message: newMessage.trim() || '',
          image_url: imageUrl
        })
        .select()
        .single()

      if (error) throw error

      // Add message to state immediately so it shows right away
      if (newMessageData) {
        setMessages((prev) => [...prev, newMessageData])
        scrollToBottom()
      }

      // Update chat updated_at
      await supabase
        .from('support_chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedChat.id)

      setNewMessage('')
      setProductImage('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      loadChats()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      console.log('❌ [Admin] No file selected')
      return
    }

    console.log('📁 [Admin] File selected:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    if (!file.type.startsWith('image/')) {
      console.error('❌ [Admin] Invalid file type:', file.type)
      alert('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      console.error('❌ [Admin] File too large:', file.size)
      alert('Image size must be less than 5MB')
      return
    }

    console.log('✅ [Admin] File validation passed')
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      console.log('📸 [Admin] Image converted to base64, length:', base64.length)
      console.log('📸 [Admin] Base64 preview (first 100 chars):', base64.substring(0, 100))
      setProductImage(base64)
    }
    reader.onerror = (error) => {
      console.error('❌ [Admin] FileReader error:', error)
      alert('Failed to read file')
    }
    reader.readAsDataURL(file)
  }

  const handleCloseChat = async (chatId: string) => {
    if (!window.confirm('Are you sure you want to close this chat?')) return

    try {
      const { error } = await supabase
        .from('support_chats')
        .update({ status: 'resolved' })
        .eq('id', chatId)

      if (error) throw error

      if (selectedChat?.id === chatId) {
        setSelectedChat(null)
        setMessages([])
      }
      loadChats()
    } catch (error) {
      console.error('Error closing chat:', error)
      alert('Failed to close chat')
    }
  }

  const handleReopenChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('support_chats')
        .update({ status: 'active' })
        .eq('id', chatId)

      if (error) throw error
      loadChats()
    } catch (error) {
      console.error('Error reopening chat:', error)
      alert('Failed to reopen chat')
    }
  }

  const handleCreateNewTicket = async () => {
    if (!newTicketUserId.trim()) {
      alert('Please enter a user ID or email')
      return
    }

    try {
      let userId = newTicketUserId.trim()
      
      // If it looks like an email, try to find the user
      if (newTicketUserId.includes('@')) {
        try {
          const { data: usersData } = await supabase.rpc('get_all_users_for_admin')
          const foundUser = usersData?.find((u: any) => u.email === newTicketUserId.trim())
          if (foundUser) {
            userId = foundUser.user_id
          } else {
            alert('User not found with that email')
            return
          }
        } catch (error) {
          console.error('Error fetching users:', error)
          alert('Failed to find user. Please use user ID instead.')
          return
        }
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(userId)) {
        alert('Invalid user ID format')
        return
      }

      // Create new chat
      const { data: newChat, error } = await supabase
        .from('support_chats')
        .insert({
          user_id: userId,
          status: 'active',
          assigned_agent: user?.id
        })
        .select()
        .single()

      if (error) throw error

      setShowNewTicketModal(false)
      setNewTicketUserId('')
      loadChats()
      if (newChat) {
        setSelectedChat(newChat)
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Failed to create ticket: ' + (error as Error).message)
    }
  }

  const filteredChats = chats.filter(chat => {
    if (filterStatus !== 'all' && chat.status !== filterStatus) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        chat.user_email?.toLowerCase().includes(query) ||
        chat.user_name?.toLowerCase().includes(query) ||
        chat.last_message?.toLowerCase().includes(query)
      )
    }
    return true
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-200px)] space-x-6">
      {/* Left Sidebar - Chat List */}
      <div className="w-1/3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Support Chats</h2>
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Plus size={14} />
              New Ticket
            </button>
          </div>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user or message..."
              className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="waiting">Waiting</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 border-b border-slate-200 cursor-pointer transition-colors ${
                  selectedChat?.id === chat.id
                    ? 'bg-blue-50'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {chat.user_name}
                      </h3>
                      {chat.message_count && chat.message_count > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                          {chat.message_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{chat.user_email}</p>
                    {chat.last_message && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{chat.last_message}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    chat.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    chat.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {chat.status}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatTime(chat.last_message_time || chat.updated_at)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p>No chats found</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Chat View */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedChat.user_name}</h3>
                  <p className="text-sm text-slate-500">{selectedChat.user_email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedChat.status}
                    onChange={(e) => {
                      if (e.target.value === 'resolved') {
                        handleCloseChat(selectedChat.id)
                      } else if (selectedChat.status === 'resolved' && e.target.value !== 'resolved') {
                        handleReopenChat(selectedChat.id)
                      } else {
                        supabase
                          .from('support_chats')
                          .update({ status: e.target.value as any })
                          .eq('id', selectedChat.id)
                          .then(() => loadChats())
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="waiting">Waiting</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button
                    onClick={() => handleCloseChat(selectedChat.id)}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle size={14} />
                    Close
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[75%] ${message.sender === 'agent' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'agent'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : message.sender === 'ai'
                        ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                        : 'bg-gradient-to-br from-slate-400 to-slate-500'
                    }`}>
                      {message.sender === 'agent' ? (
                        <User size={14} className="text-white" />
                      ) : message.sender === 'ai' ? (
                        <MessageSquare size={14} className="text-white" />
                      ) : (
                        <User size={14} className="text-white" />
                      )}
                  </div>
                    <div className={`rounded-xl px-4 py-2.5 shadow-sm ${
                      message.sender === 'agent'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'bg-white border border-slate-200 text-slate-900'
                    }`}>
                      {message.image_url && (
                        <img
                          src={message.image_url}
                          alt="Attachment"
                          className="rounded-lg mb-2 max-w-full h-auto"
                        />
                      )}
                      <p className={`text-sm whitespace-pre-wrap ${
                        message.sender === 'agent' ? 'text-white' : 'text-slate-900'
                      }`}>
                        {message.message}
                      </p>
                      <p className={`text-xs mt-1.5 ${
                        message.sender === 'agent' ? 'text-blue-100' : 'text-slate-500'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-200 bg-white">
              {productImage && (
                <div className="mb-3 relative inline-block">
                  <img
                    src={productImage}
                    alt="Preview"
                    className="rounded-lg max-w-[200px] max-h-[200px] object-cover"
                  />
                  <button
                    onClick={() => {
                      setProductImage('')
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-slate-900"
                  title="Upload image"
                >
                  <Paperclip size={18} />
                </button>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type your message..."
                  rows={1}
                  className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && !productImage) || sending}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {sending ? (
                    <LoadingSpinner size="sm" className="text-white" />
                  ) : (
                    <SendHorizontal size={18} />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <p>Select a chat to view conversation</p>
            </div>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Create New Ticket</h3>
              <button
                onClick={() => {
                  setShowNewTicketModal(false)
                  setNewTicketUserId('')
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  User ID or Email
                </label>
                <input
                  type="text"
                  value={newTicketUserId}
                  onChange={(e) => setNewTicketUserId(e.target.value)}
                  placeholder="user@example.com or user-id"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateNewTicket}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Ticket
                </button>
                <button
                  onClick={() => {
                    setShowNewTicketModal(false)
                    setNewTicketUserId('')
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSupport
