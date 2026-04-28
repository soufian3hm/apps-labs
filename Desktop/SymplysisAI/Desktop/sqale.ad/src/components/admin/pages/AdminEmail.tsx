import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { AdminService, AdminUser } from '../../../services/adminService'
import { 
  Mail, 
  Users, 
  SendHorizontal as Send, 
  Eye, 
  Save, 
  Clock, 
  Settings, 
  FileText, 
  Image as ImageIcon,
  Type,
  Code,
  Palette,
  Paperclip,
  X,
  Check,
  Search,
  Filter,
  Calendar,
  Zap,
  History,
  Copy,
  Trash2,
  Plus,
  Minus
} from 'lucide-react'

interface User {
  id: string
  user_id: string
  email: string
  full_name?: string
  name?: string
  role?: string
  created_at?: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  html_content: string
  created_at: string
}

interface EmailLog {
  id: string
  recipient_email: string
  subject: string
  status: string
  sent_at: string
  opened_at?: string
  clicked_at?: string
}

const AdminEmail: React.FC = () => {
  // ============ STATE MANAGEMENT ============
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'inactive' | 'admin' | 'user'>('all')
  
  // Email Content
  const [emailSubject, setEmailSubject] = useState('')
  const [emailHtmlContent, setEmailHtmlContent] = useState('')
  const [emailPlainText, setEmailPlainText] = useState('')
  const [previewMode, setPreviewMode] = useState<'html' | 'text' | 'both'>('html')
  
  // Email Settings
  const [fromEmail, setFromEmail] = useState('')
  const [fromName, setFromName] = useState('')
  const [replyToEmail, setReplyToEmail] = useState('')
  const [replyToName, setReplyToName] = useState('')
  const [ccEmails, setCcEmails] = useState<string[]>([''])
  const [bccEmails, setBccEmails] = useState<string[]>([''])
  
  // Email Options & Toggles
  const [sendImmediately, setSendImmediately] = useState(true)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal')
  const [trackOpens, setTrackOpens] = useState(true)
  const [error, setError] = useState<string>('')
  const [trackClicks, setTrackClicks] = useState(true)
  const [unsubscribeLink, setUnsubscribeLink] = useState(true)
  const [autoPlainText, setAutoPlainText] = useState(true)
  const [includeFooter, setIncludeFooter] = useState(true)
  const [footerText, setFooterText] = useState('')
  const [testMode, setTestMode] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  
  // Attachments
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string; size: number }>>([])
  
  // Templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [templateName, setTemplateName] = useState('')
  
  // Email History/Logs
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
  const [showLogs, setShowLogs] = useState(false)
  const [logsFilter, setLogsFilter] = useState<'all' | 'sent' | 'failed' | 'pending'>('all')
  
  // UI State
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'history' | 'settings'>('compose')
  const [showUserSelector, setShowUserSelector] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  // ============ DATA FETCHING ============
  useEffect(() => {
    fetchUsers()
    fetchTemplates()
    fetchEmailLogs()
    loadEmailSettings()
  }, [])

  const fetchUsers = async () => {
    try {
      // Use AdminService which already handles fetching users with emails
      const adminUsers = await AdminService.getAllUsers()
      
      // Transform AdminUser to User interface
      const transformedUsers: User[] = adminUsers.map((adminUser: AdminUser) => ({
        id: adminUser.user_id,
        user_id: adminUser.user_id,
        email: adminUser.email,
        full_name: adminUser.name,
        name: adminUser.name,
        role: adminUser.role || 'user',
        created_at: adminUser.created_at
      }))

      setUsers(transformedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error && error.code !== 'PGRST116') throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const fetchEmailLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100)

      if (error && error.code !== 'PGRST116') throw error
      setEmailLogs(data || [])
    } catch (error) {
      console.error('Error fetching email logs:', error)
    }
  }

  const loadEmailSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('key', 'email_settings')
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data?.value) {
        const settings = data.value
        setFromEmail(settings.fromEmail || 'noreply@sqale.ad')
        setFromName(settings.fromName || 'Sqale Ad')
        setReplyToEmail(settings.replyToEmail || 'support@sqale.ad')
        setReplyToName(settings.replyToName || 'Support Team')
        setFooterText(settings.footerText || '')
      }
    } catch (error) {
      console.error('Error loading email settings:', error)
    }
  }

  // ============ USER SELECTION ============
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                         user.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(userSearchQuery.toLowerCase())
    
    const matchesFilter = userFilter === 'all' || 
                         (userFilter === 'active' && user.role !== 'inactive') ||
                         (userFilter === 'admin' && user.role === 'admin') ||
                         (userFilter === 'user' && user.role === 'user')
    
    return matchesSearch && matchesFilter
  })

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAllUsers = () => {
    setSelectedUsers(filteredUsers.map(u => u.id))
  }

  const deselectAllUsers = () => {
    setSelectedUsers([])
  }

  // ============ EMAIL COMPOSITION ============
  const insertTextAtCursor = (text: string) => {
    const textarea = document.getElementById('html-editor') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const before = emailHtmlContent.substring(0, start)
      const after = emailHtmlContent.substring(end)
      setEmailHtmlContent(before + text + after)
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + text.length, start + text.length)
      }, 0)
    }
  }

  const formatText = (tag: string) => {
    insertTextAtCursor(`<${tag}>selected text</${tag}>`)
  }

  // ============ TEMPLATE MANAGEMENT ============
  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setEmailSubject(template.subject)
      setEmailHtmlContent(template.html_content)
      setSelectedTemplate(templateId)
    }
  }

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name')
      return
    }

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: templateName,
          subject: emailSubject,
          html_content: emailHtmlContent
        })
        .select()
        .single()

      if (error) throw error

      setTemplates(prev => [data, ...prev])
      setTemplateName('')
      setShowTemplateModal(false)
      alert('Template saved successfully!')
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  // ============ EMAIL SENDING ============
  const sendEmail = async () => {
    if (!emailSubject.trim()) {
      alert('Please enter an email subject')
      return
    }

    if (!emailHtmlContent.trim()) {
      alert('Please enter email content')
      return
    }

    if (selectedUsers.length === 0 && !testMode) {
      alert('Please select at least one recipient')
      return
    }

    if (testMode && !testEmail.trim()) {
      alert('Please enter a test email address')
      return
    }

    setSending(true)
    try {
      const recipients = testMode ? [testEmail] : selectedUsers.map(id => {
        const user = users.find(u => u.id === id)
        return user?.email
      }).filter(Boolean)

      const emailData = {
        recipients,
        subject: emailSubject,
        html_content: emailHtmlContent,
        plain_text: autoPlainText ? emailPlainText : '',
        from_email: fromEmail,
        from_name: fromName,
        reply_to_email: replyToEmail,
        reply_to_name: replyToName,
        cc: ccEmails.filter(e => e.trim()),
        bcc: bccEmails.filter(e => e.trim()),
        priority,
        track_opens: trackOpens,
        track_clicks: trackClicks,
        unsubscribe_link: unsubscribeLink,
        include_footer: includeFooter,
        footer_text: footerText,
        attachments: attachments.map(a => a.url),
        scheduled_at: sendImmediately ? null : `${scheduledDate}T${scheduledTime}:00`,
        timezone
      }

      // Call email sending function
      try {
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: emailData
        })

        if (error) {
          console.error('Email function error:', error)
          // Try to extract error message from response
          let errorMessage = 'Failed to send email'
          
          // Check if error has a message
          if (error.message) {
            errorMessage = error.message
          }
          
          // Try to get error from context/response
          if (error.context) {
            try {
              // Check if there's a response body
              if (error.context.body) {
                const errorBody = typeof error.context.body === 'string' 
                  ? JSON.parse(error.context.body) 
                  : error.context.body
                errorMessage = errorBody.error || errorBody.details || errorMessage
                if (errorBody.help) {
                  errorMessage += `\n\n${errorBody.help}`
                }
              }
              
              // Check status code for more context
              if (error.context.status) {
                if (error.context.status === 500) {
                  errorMessage = 'Server error: ' + errorMessage
                } else if (error.context.status === 401) {
                  errorMessage = 'Authentication error: ' + errorMessage
                } else if (error.context.status === 400) {
                  errorMessage = 'Invalid request: ' + errorMessage
                }
              }
            } catch (e) {
              console.error('Error parsing error response:', e)
            }
          }
          
          throw new Error(errorMessage)
        }

        // Check if response contains an error
        if (data && data.error) {
          throw new Error(
            data.error + 
            (data.details ? `\n\nDetails: ${data.details}` : '') + 
            (data.help ? `\n\n${data.help}` : '')
          )
        }

        // Check if any emails failed
        if (data && data.failed && data.failed > 0) {
          const failedRecipients = data.results
            ?.filter((r: any) => !r.success)
            .map((r: any) => `${r.recipient}: ${r.error || 'Unknown error'}`)
            .join('\n')
          
          if (failedRecipients) {
            throw new Error(`Some emails failed to send:\n${failedRecipients}`)
          }
        }
      } catch (invokeError: any) {
        // Re-throw with better error message
        if (invokeError.message) {
          throw invokeError
        }
        throw new Error('Failed to invoke email function: ' + (invokeError.message || 'Unknown error'))
      }

      alert(`Email ${sendImmediately ? 'sent' : 'scheduled'} successfully!`)
      
      // Reset form if not test mode
      if (!testMode) {
        setEmailSubject('')
        setEmailHtmlContent('')
        setEmailPlainText('')
        setSelectedUsers([])
      }

      fetchEmailLogs()
    } catch (error) {
      console.error('Error sending email:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send email. Please check your email service configuration.'
      alert(errorMessage)
      setError(errorMessage)
    } finally {
      setSending(false)
    }
  }

  // ============ RENDER ============
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Email Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">Send emails to users with full control</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {[
            { id: 'compose', label: 'Compose', icon: <Mail className="w-4 h-4" /> },
            { id: 'templates', label: 'Templates', icon: <FileText className="w-4 h-4" /> },
            { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
            { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <X 
                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 cursor-pointer" 
                    onClick={() => setError('')}
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-900 mb-1">Error Sending Email</h3>
                    <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recipients */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Recipients
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowUserSelector(!showUserSelector)}
                    className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                  >
                    {showUserSelector ? 'Hide' : 'Select Users'}
                  </button>
                  {selectedUsers.length > 0 && (
                    <button
                      onClick={deselectAllUsers}
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {showUserSelector && (
                <div className="mb-4 space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value as any)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Users</option>
                      <option value="active">Active</option>
                      <option value="admin">Admins</option>
                      <option value="user">Users</option>
                    </select>
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    <div className="p-2 bg-gray-50 border-b border-gray-200 sticky top-0">
                      <button
                        onClick={selectAllUsers}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Select All ({filteredUsers.length})
                      </button>
                    </div>
                    {filteredUsers.map(user => (
                      <label
                        key={user.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || user.full_name || user.email}
                          </div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                          {user.role}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(userId => {
                  const user = users.find(u => u.id === userId)
                  return user ? (
                    <span
                      key={userId}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm"
                    >
                      {user.email}
                      <button
                        onClick={() => toggleUserSelection(userId)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null
                })}
                {selectedUsers.length === 0 && (
                  <span className="text-sm text-gray-500">No recipients selected</span>
                )}
              </div>
            </div>

            {/* Email Subject */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* HTML Editor */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  HTML Content
                </label>
                <div className="flex gap-1">
                  <button
                    onClick={() => formatText('strong')}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Bold"
                  >
                    <Type className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertTextAtCursor('<a href="">Link</a>')}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Insert Link"
                  >
                    <Type className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertTextAtCursor('<img src="" alt="" />')}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Insert Image"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => insertTextAtCursor('<ul><li>Item</li></ul>')}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Insert List"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea
                id="html-editor"
                value={emailHtmlContent}
                onChange={(e) => setEmailHtmlContent(e.target.value)}
                placeholder="Enter HTML email content..."
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            {/* Plain Text Editor */}
            {!autoPlainText && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Plain Text (Alternative)
                </label>
                <textarea
                  value={emailPlainText}
                  onChange={(e) => setEmailPlainText(e.target.value)}
                  placeholder="Enter plain text version..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Attachments */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Attachments
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => {
                  // Handle file uploads
                  const files = Array.from(e.target.files || [])
                  // Upload files and get URLs
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{att.name}</span>
                      <button
                        onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            {/* Email Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Email Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    From Email
                  </label>
                  <input
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Reply-To Email
                  </label>
                  <input
                    type="email"
                    value={replyToEmail}
                    onChange={(e) => setReplyToEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Reply-To Name
                  </label>
                  <input
                    type="text"
                    value={replyToName}
                    onChange={(e) => setReplyToName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* CC/BCC */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">CC / BCC</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">CC</label>
                  {ccEmails.map((email, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const newEmails = [...ccEmails]
                          newEmails[idx] = e.target.value
                          setCcEmails(newEmails)
                        }}
                        placeholder="cc@example.com"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      {ccEmails.length > 1 && (
                        <button
                          onClick={() => setCcEmails(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setCcEmails(prev => [...prev, ''])}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    + Add CC
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">BCC</label>
                  {bccEmails.map((email, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const newEmails = [...bccEmails]
                          newEmails[idx] = e.target.value
                          setBccEmails(newEmails)
                        }}
                        placeholder="bcc@example.com"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      {bccEmails.length > 1 && (
                        <button
                          onClick={() => setBccEmails(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setBccEmails(prev => [...prev, ''])}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    + Add BCC
                  </button>
                </div>
              </div>
            </div>

            {/* Send Options */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Send Options
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">Send Immediately</label>
                  <button
                    onClick={() => setSendImmediately(!sendImmediately)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      sendImmediately ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      sendImmediately ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {!sendImmediately && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Scheduled Date
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Scheduled Time
                      </label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Timezone
                      </label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tracking & Options */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Tracking & Options</h3>
              <div className="space-y-3">
                {[
                  { label: 'Track Opens', state: trackOpens, setter: setTrackOpens },
                  { label: 'Track Clicks', state: trackClicks, setter: setTrackClicks },
                  { label: 'Include Unsubscribe Link', state: unsubscribeLink, setter: setUnsubscribeLink },
                  { label: 'Auto-generate Plain Text', state: autoPlainText, setter: setAutoPlainText },
                  { label: 'Include Footer', state: includeFooter, setter: setIncludeFooter }
                ].map(({ label, state, setter }) => (
                  <div key={label} className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">{label}</label>
                    <button
                      onClick={() => setter(!state)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        state ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        state ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              {includeFooter && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Footer Text
                  </label>
                  <textarea
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="Footer text..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}
            </div>

            {/* Test Mode */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Test Mode</h3>
                <button
                  onClick={() => setTestMode(!testMode)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    testMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    testMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              {testMode && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Test Email
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}
            </div>

            {/* Template Selector */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Load Template</h3>
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value)
                  if (e.target.value) loadTemplate(e.target.value)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select a template...</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={sendEmail}
                disabled={sending}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : sendImmediately ? 'Send Now' : 'Schedule Email'}
              </button>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save as Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Email Templates</h2>
            <button
              onClick={() => {
                setTemplateName('')
                setEmailSubject('')
                setEmailHtmlContent('')
                setShowTemplateModal(true)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{template.subject}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadTemplate(template.id)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm"
                  >
                    Load
                  </button>
                  <button
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Email History</h2>
            <select
              value={logsFilter}
              onChange={(e) => setLogsFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Recipient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Sent At</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Opened</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Clicked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {emailLogs
                  .filter(log => logsFilter === 'all' || log.status === logsFilter)
                  .map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{log.recipient_email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.subject}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.status === 'sent' ? 'bg-green-100 text-green-700' :
                          log.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(log.sent_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {log.opened_at ? new Date(log.opened_at).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {log.clicked_at ? new Date(log.clicked_at).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Email Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default From Email
              </label>
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default From Name
              </label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              onClick={async () => {
                // Save settings
                await supabase
                  .from('admin_settings')
                  .upsert({
                    key: 'email_settings',
                    value: {
                      fromEmail,
                      fromName,
                      replyToEmail,
                      replyToName,
                      footerText
                    }
                  })
                alert('Settings saved!')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Save Template</h3>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={saveTemplate}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Email Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="mb-4">
                <strong>To:</strong> {selectedUsers.length} recipient(s)
              </div>
              <div className="mb-4">
                <strong>Subject:</strong> {emailSubject || '(No subject)'}
              </div>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: emailHtmlContent || '<p>No content</p>' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminEmail

