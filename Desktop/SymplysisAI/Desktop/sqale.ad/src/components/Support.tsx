import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  MessageSquare,
  Mail,
  SendHorizontal,
  Copy,
  Check,
  ExternalLink,
  Cpu,
  User,
  Paperclip as Attachment,
  Instagram,
  Clock,
  X,
  Twitter,
  History,
  HelpCircle,
  Users,
  BookOpen,
  Loader2
} from 'lucide-react'
import { LoadingSpinner } from './ui/LoadingSpinner'

interface SupportMessage {
  id: string
  chat_id: string
  sender: 'user' | 'agent' | 'ai'
  message: string
  image_url?: string
  created_at: string
}

interface SupportChat {
  id: string
  user_id: string
  assigned_agent?: string
  status: 'active' | 'resolved' | 'waiting'
  created_at: string
  updated_at?: string
}

const Support: React.FC = () => {
  const { user } = useAuth()
  const [currentChat, setCurrentChat] = useState<SupportChat | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [productImage, setProductImage] = useState<string>('')
  const [showClosedChats, setShowClosedChats] = useState(false)
  const [closedChats, setClosedChats] = useState<SupportChat[]>([])
  const [loadingClosedChats, setLoadingClosedChats] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [chatExpanded, setChatExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (user) {
      loadOrCreateChat()
    }
  }, [user])

  useEffect(() => {
    if (currentChat) {
      loadMessages()
      // Only subscribe to real-time updates for active/waiting chats, not resolved ones
      if (currentChat.status !== 'resolved') {
        return subscribeToMessages()
      }
    }
  }, [currentChat])

  useEffect(() => {
    // Only auto-scroll if user is near the bottom (within 100px)
    const scrollContainer = messagesEndRef.current?.closest('.overflow-y-auto') as HTMLElement
    if (scrollContainer) {
      const isNearBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 100
      if (isNearBottom || messages.length === 0) {
        setTimeout(() => {
          scrollToBottom()
        }, 100)
      }
    } else if (messages.length > 0) {
      // Fallback: scroll if no container found
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [messages])

  const loadOrCreateChat = async () => {
    if (!user) return

    try {
      const { data: existingChat, error: fetchError } = await supabase
        .from('support_chats')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'waiting'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingChat && !fetchError) {
        setCurrentChat(existingChat)
      } else {
        const { data: resolvedChat } = await supabase
          .from('support_chats')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'resolved')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (resolvedChat) {
          const { data: newChat, error: createError } = await supabase
            .from('support_chats')
            .insert({
              user_id: user.id,
              status: 'active'
            })
            .select()
            .single()

          if (createError) throw createError
          if (newChat) {
            setCurrentChat(newChat)
          }
        } else {
          const { data: newChat, error: createError } = await supabase
            .from('support_chats')
            .insert({
              user_id: user.id,
              status: 'active'
            })
            .select()
            .single()

          if (createError) throw createError
          if (newChat) {
            setCurrentChat(newChat)
          }
        }
      }
    } catch (error) {
      console.error('Error loading/creating chat:', error)
    }
  }

  const loadMessages = async () => {
    if (!currentChat) return

    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('chat_id', currentChat.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      if (data) setMessages(data)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const subscribeToMessages = () => {
    if (!currentChat) return

    const channel = supabase
      .channel(`support_messages:${currentChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `chat_id=eq.${currentChat.id}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as SupportMessage])
          // Delay scroll to ensure DOM is updated
          setTimeout(() => {
            scrollToBottom()
          }, 50)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleCopy = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(itemId)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !productImage || !currentChat || !user) return

    setIsTyping(true)

    try {
      let imageUrl: string | undefined

      if (productImage) {
        console.log('🖼️ [Support] Starting image upload process')
        
        try {
          const timestamp = Date.now()
          const random = Math.random().toString(36).substring(2, 15)
          const extension = productImage.split(';')[0].split('/')[1] || 'png'
          const filename = `${timestamp}-${random}.${extension}`
          const storagePath = `${user.id}/${currentChat.id}/${filename}`

          const { StorageService } = await import('../services/storageService')
          const uploadResult = await StorageService.uploadSupportImage(productImage, storagePath)

          if (!uploadResult.success || !uploadResult.publicUrl) {
            throw new Error(uploadResult.error || 'Failed to upload image')
          }

          imageUrl = uploadResult.publicUrl
        } catch (error) {
          console.error('❌ [Support] Error uploading image:', error)
          alert('Failed to upload image. Please try again.')
          setIsTyping(false)
          return
        }
      }

      const { data: userMessage, error: messageError } = await supabase
        .from('support_messages')
        .insert({
          chat_id: currentChat.id,
          sender: 'user',
          message: messageInput.trim(),
          image_url: imageUrl
        })
        .select()
        .single()

      if (messageError) throw messageError

      if (userMessage) {
        setMessages((prev) => [...prev, userMessage])
        // Delay scroll to ensure DOM is updated
        setTimeout(() => {
          scrollToBottom()
        }, 50)
      }

      setMessageInput('')
      setProductImage('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      await supabase
        .from('support_chats')
        .update({ status: 'waiting', assigned_agent: null })
        .eq('id', currentChat.id)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setProductImage(base64)
    }
    reader.onerror = () => {
      alert('Failed to read file')
    }
    reader.readAsDataURL(file)
  }

  const scrollToBottom = () => {
    // Use requestAnimationFrame to ensure DOM is updated before scrolling
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        // Find the scrollable parent container
        const scrollContainer = messagesEndRef.current.closest('.overflow-y-auto')
        if (scrollContainer) {
          // Scroll only the container, not the entire page
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          })
        } else {
          // Fallback: scroll the element into view but prevent page scroll
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          })
        }
      }
    })
  }

  const loadClosedChats = async () => {
    if (!user) return

    setLoadingClosedChats(true)
    try {
      const { data, error } = await supabase
        .from('support_chats')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'resolved')
        .order('updated_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setClosedChats(data || [])
    } catch (err) {
      console.error('Failed to load closed chats:', err)
    } finally {
      setLoadingClosedChats(false)
    }
  }

  const viewClosedChat = async (chat: SupportChat) => {
    try {
      setCurrentChat(chat)
      setShowClosedChats(false)
      
      // Load messages for the selected chat
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
      
      // Scroll to bottom after messages load
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    } catch (err) {
      console.error('Failed to load closed chat:', err)
      alert('Failed to load chat')
    }
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

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const getGroupedMessages = () => {
    const grouped: { [key: string]: SupportMessage[] } = {}
    messages.forEach((msg) => {
      const date = formatDate(msg.created_at)
      if (!grouped[date]) grouped[date] = []
      grouped[date].push(msg)
    })
    return grouped
  }

  // Render chat component
  const renderChat = () => (
    <div className="flex-1 min-w-0 flex flex-col bg-gradient-to-br from-gray-50 to-white h-full overflow-hidden">
      {/* Chat Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 ring-2 ring-white">
              <MessageSquare size={24} />
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Live Support</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
              </span>
              <span className="text-xs text-gray-400">• Avg response &lt; 5 min</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowClosedChats(true)
              loadClosedChats()
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            title="Chat History"
          >
            <History size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
            <BookOpen size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar min-h-0" style={{ scrollBehavior: 'smooth', overscrollBehavior: 'contain' }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700">Start a conversation</p>
              <p className="text-xs text-gray-500 mt-2">Our support team is here to help!</p>
            </div>
          </div>
        ) : (
          Object.entries(getGroupedMessages()).map(([date, dateMessages]) => (
            <React.Fragment key={date}>
              <div className="flex justify-center py-4">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest bg-gray-100/50 px-3 py-1 rounded-full">{date}</span>
              </div>
              {dateMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender !== 'user' && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border bg-green-50 text-green-600 border-green-100">
                      AG
                    </div>
                  )}
                  <div className={`flex flex-col gap-1 max-w-[85%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`inline-flex ${
                      message.sender === 'user'
                        ? 'bg-blue-600 rounded-2xl rounded-br-none text-sm text-white shadow-md shadow-blue-500/20'
                        : 'bg-white border border-gray-100 rounded-2xl rounded-bl-none text-sm text-gray-700 shadow-sm'
                    } ${message.image_url && !message.message.trim() ? 'p-2' : 'px-5 py-3.5'}`}>
                      {message.image_url && (
                        <img
                          src={message.image_url}
                          alt="Attachment"
                          className={`rounded-lg ${message.message.trim() ? 'mb-2 max-w-[50%]' : 'max-w-[300px]'} h-auto`}
                        />
                      )}
                      {message.message.trim() && (
                        <p className="whitespace-pre-wrap">{message.message}</p>
                      )}
                    </div>
                    <span className={`text-[10px] text-gray-400 ${message.sender === 'user' ? 'text-right' : 'text-left'} mt-0.5`}>
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  {message.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0" style={{ marginBottom: '23px' }}>
                      <User size={14} />
                    </div>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))
        )}
        {isTyping && (
          <div className="flex items-end gap-3">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-[10px] font-bold shrink-0 border border-green-100">AG</div>
            <div className="flex flex-col gap-1 max-w-[85%]">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-5 py-3.5 shadow-sm">
                <div className="flex gap-1 items-center">
                  <Loader2 size={14} className="text-gray-400 animate-spin" />
                  <span className="text-xs text-gray-500">Agent is typing...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-6 pt-4 bg-white border-t border-gray-100 flex-shrink-0">
        <div className="flex flex-col gap-3">
          {/* Image Preview */}
          {productImage && (
            <div className="relative inline-block">
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

          {/* Input Bar */}
          <div className="relative flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Upload image"
            >
              <Attachment size={20} />
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Type your message..."
              className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={(!messageInput.trim() && !productImage) || isTyping}
              className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-xl transition-all shadow-md shadow-blue-500/30 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendHorizontal size={16} className="transform rotate-90" />
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button 
              onClick={() => setMessageInput('I have a question about pricing...')}
              className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-600 transition-colors border border-gray-100"
            >
              Pricing questions
            </button>
            <button 
              onClick={() => setMessageInput('I\'m experiencing a technical issue...')}
              className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-600 transition-colors border border-gray-100"
            >
              Technical issue
            </button>
            <button 
              onClick={() => setMessageInput('I\'d like to request a feature...')}
              className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-600 transition-colors border border-gray-100"
            >
              Feature request
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-[10px] text-gray-400">Powered by Symplysis</p>
          </div>
        </div>
      </div>
    </div>
  )

  // Render support channels
  const renderSupportChannels = () => (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0 space-y-4 relative z-10">
      {/* Telegram */}
      <div className="group relative overflow-hidden rounded-2xl bg-white p-4 ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-blue-500/20 cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500">
              <SendHorizontal size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Telegram</h3>
              <p className="text-xs text-gray-500">@symplysis</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">Fastest</span>
        </div>
        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-50">
          <span className="text-green-600 font-medium flex items-center gap-1">
            <Clock size={12} />
            &lt; 10 min
          </span>
          <a
            href="https://t.me/symplysis"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium"
            onClick={(e) => {
              e.stopPropagation()
              handleCopy('@symplysis', 'telegram')
            }}
          >
            Open
          </a>
        </div>
      </div>

      {/* Email */}
      <div className="group relative overflow-hidden rounded-2xl bg-white p-4 ring-1 ring-gray-900/5 transition-all hover:shadow-md cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Email</h3>
              <p className="text-xs text-gray-500 truncate max-w-[150px]">support@symplysis.com</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-50">
          <span className="text-gray-400 font-medium flex items-center gap-1">
            <Clock size={12} />
            &lt; 24h
          </span>
          <button
            onClick={() => handleCopy('support@symplysis.com', 'email')}
            className="text-blue-600 hover:underline font-medium"
          >
            {copiedItem === 'email' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Social Channels Section */}
      <div className="bg-white rounded-2xl p-4 ring-1 ring-gray-900/5">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Social Channels</h3>
        <div className="space-y-2">
          {/* Instagram */}
          <div 
            onClick={() => window.open('https://instagram.com/symplysis.ai', '_blank')}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white flex items-center justify-center shrink-0">
                <Instagram size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">@symplysis.ai</p>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock size={10} />
                  &lt; 24h
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-400 group-hover:text-blue-600 transition-colors">Visit</span>
          </div>

          {/* Twitter */}
          <div 
            onClick={() => window.open('https://twitter.com/symplysis', '_blank')}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                <Twitter size={14} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">@symplysis</p>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock size={10} />
                  &lt; 24h
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-400 group-hover:text-blue-600 transition-colors">Visit</span>
          </div>

          {/* TikTok */}
          <div 
            onClick={() => window.open('https://tiktok.com/@symplysis', '_blank')}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                <Users size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">@symplysis</p>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock size={10} />
                  &lt; 48h
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-400 group-hover:text-blue-600 transition-colors">Visit</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#F3F4F6] overflow-hidden relative">
      {/* Mesh Gradient Background - Blue/Indigo Theme */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(147, 51, 234, 0.15) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(14, 165, 233, 0.15) 0px, transparent 50%)
          `,
          filter: 'blur(40px)',
          animation: 'pulseMesh 10s ease-in-out infinite alternate'
        }}
      />

      <style>{`
        @keyframes pulseMesh {
          0% { opacity: 0.8; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.05); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.1); border-radius: 20px; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.1) transparent; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Main Modal Container */}
      <div className="relative w-full max-w-7xl h-[92vh] mx-4 md:mx-8 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-blue-500/10 ring-1 ring-white/60 border border-white overflow-hidden flex flex-col lg:flex-row z-10">
        
        {/* Left Side: Contact Channels (40%) */}
        <div className="lg:w-2/5 flex flex-col bg-white/40 relative overflow-hidden border-r border-white/50 min-h-0">
          {/* Fixed Header */}
          <div className="p-8 pb-4 relative z-10 bg-white/40 backdrop-blur-sm flex-shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold tracking-wide uppercase mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Support Center
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-950 mb-2">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Touch</span>
            </h1>
            <p className="text-sm text-gray-500 font-medium">Select a channel below.</p>
          </div>

          {/* Scrollable Contact List */}
          {renderSupportChannels()}
        </div>

        {/* Right Side: Live Support Chat (60%) - Desktop */}
        {!isMobile && renderChat()}

        {/* Mobile Layout */}
        {isMobile && (
          <div className={`flex-1 overflow-hidden relative ${chatExpanded ? 'overflow-hidden' : ''}`}>
            {/* Chat Bubble Button (when collapsed) */}
            {!chatExpanded && (
              <button
                onClick={() => setChatExpanded(true)}
                className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-40"
                aria-label="Open chat"
              >
                <MessageSquare size={24} />
              </button>
            )}

            {/* Expanded Chat (full screen) */}
            {chatExpanded && (
              <div className="fixed inset-0 bg-white z-50 flex flex-col h-full">
                {/* Chat Header with Close Button */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 ring-2 ring-white">
                        <MessageSquare size={24} />
                      </div>
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Live Support</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowClosedChats(true)
                        loadClosedChats()
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                      title="Chat History"
                    >
                      <History size={20} />
                    </button>
                    <button
                      onClick={() => setChatExpanded(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Messages Area - Mobile */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0" style={{ scrollBehavior: 'smooth', overscrollBehavior: 'contain' }}>
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-sm font-medium text-gray-700">Start a conversation</p>
                        <p className="text-xs text-gray-500 mt-2">Our support team is here to help!</p>
                      </div>
                    </div>
                  ) : (
                    Object.entries(getGroupedMessages()).map(([date, dateMessages]) => (
                      <React.Fragment key={date}>
                        <div className="flex justify-center py-2">
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest bg-gray-100/50 px-3 py-1 rounded-full">{date}</span>
                        </div>
                        {dateMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            {message.sender !== 'user' && (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border bg-green-50 text-green-600 border-green-100">
                                AG
                              </div>
                            )}
                            <div className={`flex flex-col gap-1 max-w-[75%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                              <div className={`inline-flex ${
                                message.sender === 'user'
                                  ? 'bg-blue-600 rounded-2xl rounded-br-none text-sm text-white shadow-md'
                                  : 'bg-white border border-gray-100 rounded-2xl rounded-bl-none text-sm text-gray-700 shadow-sm'
                              } ${message.image_url && !message.message.trim() ? 'p-2' : 'px-4 py-3'}`}>
                                {message.image_url && (
                                  <img
                                    src={message.image_url}
                                    alt="Attachment"
                                    className={`rounded-lg ${message.message.trim() ? 'mb-2 max-w-[50%]' : 'max-w-[250px]'} h-auto`}
                                  />
                                )}
                                {message.message.trim() && (
                                  <p className="whitespace-pre-wrap">{message.message}</p>
                                )}
                              </div>
                              <span className={`text-[10px] text-gray-400 ${message.sender === 'user' ? 'text-right' : 'text-left'} mt-0.5`}>
                                {formatTime(message.created_at)}
                              </span>
                            </div>
                            {message.sender === 'user' && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0" style={{ marginBottom: '23px' }}>
                                <User size={14} />
                              </div>
                            )}
                          </div>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                  {isTyping && (
                    <div className="flex items-end gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-[10px] font-bold shrink-0 border border-green-100">AG</div>
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                        <div className="flex gap-1 items-center">
                          <Loader2 size={14} className="text-gray-400 animate-spin" />
                          <span className="text-xs text-gray-500">Agent is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area - Mobile */}
                <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
                  <div className="flex flex-col gap-2">
                    {productImage && (
                      <div className="relative inline-block">
                        <img
                          src={productImage}
                          alt="Preview"
                          className="rounded-lg max-w-[150px] max-h-[150px] object-cover"
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
                    <div className="relative flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <Attachment size={18} />
                      </button>
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        placeholder="Type your message..."
                        className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={(!messageInput.trim() && !productImage) || isTyping}
                        className="text-white bg-blue-600 hover:bg-blue-700 p-1.5 rounded-xl transition-all shadow-md shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <SendHorizontal size={16} className="transform rotate-90" />
                      </button>
                    </div>
                    {/* Quick Actions - Mobile */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                      <button 
                        onClick={() => setMessageInput('I have a question about pricing...')}
                        className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-600 transition-colors border border-gray-100"
                      >
                        Pricing questions
                      </button>
                      <button 
                        onClick={() => setMessageInput('I\'m experiencing a technical issue...')}
                        className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-600 transition-colors border border-gray-100"
                      >
                        Technical issue
                      </button>
                      <button 
                        onClick={() => setMessageInput('I\'d like to request a feature...')}
                        className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-600 transition-colors border border-gray-100"
                      >
                        Feature request
                      </button>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400">Powered by Symplysis</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Support Channels (below chat on mobile) */}
            {!chatExpanded && (
              <div className="flex-1 overflow-y-auto bg-white/40 backdrop-blur-sm">
                <div className="p-8 pb-4 relative z-10 bg-white/40 backdrop-blur-sm flex-shrink-0">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold tracking-wide uppercase mb-4">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Support Center
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-950 mb-2">
                    Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Touch</span>
                  </h1>
                  <p className="text-sm text-gray-500 font-medium">Select a channel below.</p>
                </div>
                {renderSupportChannels()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Closed Chats History Modal */}
      {showClosedChats && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <History size={18} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">Chat History</h3>
              </div>
              <button
                onClick={() => setShowClosedChats(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar min-h-0">
              {loadingClosedChats ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 animate-pulse">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : closedChats.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <History className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                    <p className="text-sm font-medium text-slate-700">No closed chats</p>
                    <p className="text-xs text-slate-500 mt-2">Your resolved chats will appear here</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {closedChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => viewClosedChat(chat)}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold bg-green-100 text-green-700">
                              Resolved
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(chat.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            Closed on {new Date(chat.updated_at || chat.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                          <ExternalLink size={14} className="text-slate-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Support
