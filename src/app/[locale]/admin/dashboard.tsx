'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { formatDistanceToNow, format } from 'date-fns'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { motion, AnimatePresence } from 'motion/react'
import { 
  IconMail, 
  IconMessageCircle, 
  IconSend, 
  IconClock,
  IconEye,
  IconFileText,
  IconCheck,
  IconLink,
  IconChevronDown,
  IconX,
  IconLayers,
  IconPalette
} from '@/components/icons'

type Lead = {
  id: string
  column_id: string | null
  name: string
  company: string
  email: string
  whatsapp: string
  budget: string
  project_type: string
  message: string
  notes: string | null
  meeting_date: string
  meeting_time: string
  meeting_timestamp: string
  status: string
  created_at: string
}

type Column = {
  id: string
  title: string
  position: number
  color: string
}

type EmailLog = {
  id: string
  lead_id: string
  email_type: string
  meta: any
  created_at: string
}

type SmartTask = {
  id: string
  lead_id: string
  title: string
  details: string | null
  completed: boolean
  sort_order: number
  task_type: string
  due_at: string | null
  created_at: string
  updated_at: string
}

export default function AdminDashboard({ 
  initialLeads, 
  initialColumns,
  initialLogs,
  initialTasks
}: { 
  initialLeads: Lead[], 
  initialColumns: Column[],
  initialLogs: EmailLog[]
  initialTasks: SmartTask[]
}) {
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [logs, setLogs] = useState<EmailLog[]>(initialLogs)
  const [tasks, setTasks] = useState<SmartTask[]>(initialTasks)
  
  const [sending, setSending] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [editingColumn, setEditingColumn] = useState<string | null>(null)
  const [columnTitle, setColumnTitle] = useState('')
  
  const [showNotes, setShowNotes] = useState<string | null>(null)
  const [noteValue, setNoteValue] = useState('')
  const [savingNote, setSavingNote] = useState<string | null>(null)

  const [activeActions, setActiveActions] = useState<string | null>(null)
  const [meetLink, setMeetLink] = useState('')
  const [showLinkInput, setShowLinkInput] = useState<string | null>(null)

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDetails, setNewTaskDetails] = useState('')
  const [taskModalId, setTaskModalId] = useState<string | null>(null)
  const [taskModalTitle, setTaskModalTitle] = useState('')
  const [taskModalDetails, setTaskModalDetails] = useState('')
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null)
  const seededTaskLeadIds = useRef(new Set<string>())

  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  const closeInlinePanels = () => {
    setShowNotes(null)
    setActiveActions(null)
    setShowLinkInput(null)
  }

  const toggleNotes = (lead: Lead) => {
    const nextLeadId = showNotes === lead.id ? null : lead.id
    closeInlinePanels()
    setSelectedLeadId(null)
    setNoteValue(lead.notes || '')
    setShowNotes(nextLeadId)
  }

  const toggleActions = (leadId: string) => {
    const nextLeadId = activeActions === leadId ? null : leadId
    closeInlinePanels()
    setSelectedLeadId(null)
    setActiveActions(nextLeadId)
  }

  const toggleLinkInput = (leadId: string) => {
    const nextLeadId = showLinkInput === leadId ? null : leadId
    setShowNotes(null)
    setSelectedLeadId(null)
    setShowLinkInput(nextLeadId)
    setActiveActions(leadId)
  }

  const logEmail = async (leadId: string, type: string, meta: any = {}) => {
    const { data } = await supabase.from('appslabs_email_logs')
      .insert({ lead_id: leadId, email_type: type, meta })
      .select()
      .single()
    
    if (data) setLogs([...logs, data])
  }

  const mergeTasks = (incoming: SmartTask[]) => {
    setTasks((current) => {
      const map = new Map(current.map((task) => [task.id, task]))
      for (const task of incoming) {
        map.set(task.id, task)
      }
      return Array.from(map.values()).sort((a, b) => {
        if (a.lead_id !== b.lead_id) return a.lead_id.localeCompare(b.lead_id)
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      })
    })
  }

  const handleSendReminder = async (leadId: string, email: string) => {
    setSending(leadId)
    closeInlinePanels()
    try {
      const response = await fetch('/api/email/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, email }),
      })
      if (!response.ok) throw new Error('Failed to send reminder')
      await logEmail(leadId, 'reminder')
      alert('Reminder sent successfully!')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSending(null)
    }
  }

  const handleSendMeetLink = async (leadId: string, email: string) => {
    const trimmedMeetLink = meetLink.trim()
    if (!trimmedMeetLink) return alert('Please enter a meeting link')
    setSending(leadId)
    closeInlinePanels()
    try {
      const response = await fetch('/api/email/meeting-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, email, meetingLink: trimmedMeetLink }),
      })
      if (!response.ok) throw new Error('Failed to send link')
      await logEmail(leadId, 'meeting_link', { link: trimmedMeetLink })
      alert('Meeting link sent successfully!')
      setMeetLink('')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSending(null)
    }
  }

  const saveNote = async (leadId: string) => {
    setSavingNote(leadId)
    const { error } = await supabase.from('appslabs_leads')
      .update({ notes: noteValue })
      .eq('id', leadId)
    
    if (!error) {
      setLeads(leads.map(l => l.id === leadId ? { ...l, notes: noteValue } : l))
    }
    setSavingNote(null)
  }

  const updateColumnTitle = async (colId: string) => {
    const { error } = await supabase
      .from('appslabs_kanban_columns')
      .update({ title: columnTitle })
      .eq('id', colId)

    if (!error) {
      setColumns(columns.map(c => c.id === colId ? { ...c, title: columnTitle } : c))
      setEditingColumn(null)
    }
  }

  const onDragEnd = async (result: any) => {
    const { destination, draggableId } = result
    if (!destination) return
    
    const newLeads = Array.from(leads)
    const lead = newLeads.find(l => l.id === draggableId)
    if (lead) {
      lead.column_id = destination.droppableId
      setLeads([...newLeads])
      await supabase.from('appslabs_leads')
        .update({ column_id: destination.droppableId })
        .eq('id', draggableId)
    }
  }

  const getLogStats = (leadId: string) => {
    const leadLogs = logs.filter(l => l.lead_id === leadId)
    const reminders = leadLogs.filter(l => l.email_type === 'reminder').length
    const links = leadLogs.filter(l => l.email_type === 'meeting_link').length
    return { reminders, links, total: leadLogs.length, history: leadLogs }
  }

  const selectedLead = leads.find(l => l.id === selectedLeadId)
  const nearestLead = [...leads]
    .filter((lead) => lead.meeting_timestamp && new Date(lead.meeting_timestamp) > new Date())
    .sort((a, b) => new Date(a.meeting_timestamp).getTime() - new Date(b.meeting_timestamp).getTime())[0] || null

  const nearestLeadTasks = nearestLead
    ? tasks
        .filter((task) => task.lead_id === nearestLead.id && !task.completed)
        .sort((a, b) => {
          if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        })
    : []

  const activeTask = taskModalId ? tasks.find((task) => task.id === taskModalId) || null : null

  useEffect(() => {
    if (!nearestLead) return
    if (tasks.some((task) => task.lead_id === nearestLead.id)) return
    if (seededTaskLeadIds.current.has(nearestLead.id)) return

    seededTaskLeadIds.current.add(nearestLead.id)

    const defaults = [
      { title: 'Project analyzed', sort_order: 0, task_type: 'analysis' },
      { title: 'Summary built', sort_order: 1, task_type: 'summary' },
      { title: 'Client talking points', sort_order: 2, task_type: 'call_prep' },
      { title: 'Overview ready', sort_order: 3, task_type: 'overview' },
    ]

    const seedTasks = async () => {
      const { data, error } = await supabase
        .from('appslabs_smart_tasks')
        .upsert(
          defaults.map((task) => ({
            lead_id: nearestLead.id,
            title: task.title,
            sort_order: task.sort_order,
            task_type: task.task_type,
            due_at: nearestLead.meeting_timestamp || null,
          })),
          { onConflict: 'lead_id,title' }
        )
        .select()

      if (!error && data) {
        mergeTasks(data as SmartTask[])
      }
    }

    void seedTasks()
  }, [nearestLead, supabase, tasks])

  if (!mounted) return null

  const openTaskModal = (task: SmartTask) => {
    closeInlinePanels()
    setSelectedLeadId(null)
    setTaskModalId(task.id)
    setTaskModalTitle(task.title)
    setTaskModalDetails(task.details || '')
  }

  const closeTaskModal = () => {
    setTaskModalId(null)
    setTaskModalTitle('')
    setTaskModalDetails('')
  }

  const handleAddTask = async () => {
    const trimmedTitle = newTaskTitle.trim()
    const trimmedDetails = newTaskDetails.trim()

    if (!nearestLead) return alert('No upcoming meeting found')
    if (!trimmedTitle) return alert('Please enter a task title')

    setSavingTaskId('new-task')
    try {
      const { data, error } = await supabase
        .from('appslabs_smart_tasks')
        .insert({
          lead_id: nearestLead.id,
          title: trimmedTitle,
          details: trimmedDetails || null,
          sort_order: tasks.filter((task) => task.lead_id === nearestLead.id).length,
          task_type: 'custom',
          due_at: nearestLead.meeting_timestamp || null,
        })
        .select()
        .single()

      if (error) throw error
      mergeTasks([data as SmartTask])
      setNewTaskTitle('')
      setNewTaskDetails('')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSavingTaskId(null)
    }
  }

  const handleToggleTask = async (task: SmartTask) => {
    setSavingTaskId(task.id)
    try {
      const { data, error } = await supabase
        .from('appslabs_smart_tasks')
        .update({ completed: !task.completed })
        .eq('id', task.id)
        .select()
        .single()

      if (error) throw error
      mergeTasks([data as SmartTask])
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSavingTaskId(null)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    setSavingTaskId(taskId)
    try {
      const { error } = await supabase.from('appslabs_smart_tasks').delete().eq('id', taskId)
      if (error) throw error
      setTasks((current) => current.filter((task) => task.id !== taskId))
      if (taskModalId === taskId) closeTaskModal()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSavingTaskId(null)
    }
  }

  const handleSaveTaskModal = async () => {
    if (!activeTask) return

    const trimmedTitle = taskModalTitle.trim()
    if (!trimmedTitle) return alert('Task title is required')

    setSavingTaskId(activeTask.id)
    try {
      const { data, error } = await supabase
        .from('appslabs_smart_tasks')
        .update({
          title: trimmedTitle,
          details: taskModalDetails.trim() || null,
        })
        .eq('id', activeTask.id)
        .select()
        .single()

      if (error) throw error
      mergeTasks([data as SmartTask])
      closeTaskModal()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSavingTaskId(null)
    }
  }

  return (
    <div className="relative flex h-screen w-full min-w-0 flex-col overflow-x-hidden overflow-y-hidden bg-bg">
      <header className="z-40 flex-shrink-0 border-b border-edge bg-bg/90 px-6 py-5 backdrop-blur-md md:px-8">
        <div>
          <h1 className="text-2xl font-black font-display tracking-tight cursor-default">Lead Pipeline</h1>
        </div>
      </header>

      <div className="flex-1 min-w-0 overflow-hidden px-4 pb-4 pt-3 md:px-6 md:pb-6 md:pt-4">
        <div className="flex h-full min-w-0 gap-4">
          <div className="min-w-0 flex-1 overflow-hidden">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="h-full w-full max-w-full overflow-x-auto overflow-y-hidden custom-scrollbar">
                <div className="flex h-full min-w-max items-start gap-5 pb-2">
                {columns.map((col) => {
              const colLeads = leads.filter(l => (l.column_id === col.id) || (col.position === 1 && !l.column_id))
              
              return (
                <div key={col.id} className="w-[340px] flex flex-col h-full rounded-[28px] border border-edge/60 bg-gradient-to-b from-bg-alt/80 to-surface/80 shadow-[0_20px_60px_rgba(0,0,0,0.04)]">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 group">
                      <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: col.color }} />
                      
                      {editingColumn === col.id ? (
                        <input
                          autoFocus
                          value={columnTitle}
                          onChange={(e) => setColumnTitle(e.target.value)}
                          onBlur={() => updateColumnTitle(col.id)}
                          onKeyDown={(e) => e.key === 'Enter' && updateColumnTitle(col.id)}
                          className="bg-surface border border-accent rounded px-1.5 py-0.5 text-xs font-black uppercase tracking-tighter w-full focus:outline-none"
                        />
                      ) : (
                        <h2 
                          onClick={() => { setEditingColumn(col.id); setColumnTitle(col.title); }}
                          className="text-xs font-black uppercase tracking-[0.22em] text-fg-muted hover:text-fg cursor-pointer"
                        >
                          {col.title}
                        </h2>
                      )}
                      
                      <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-black text-fg-muted">{colLeads.length}</span>
                    </div>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex-1 overflow-y-auto px-3 pb-4 space-y-4 custom-scrollbar"
                      >
                        {colLeads.map((lead, index) => {
                          const stats = getLogStats(lead.id)
                          const meetingDate = lead.meeting_timestamp ? new Date(lead.meeting_timestamp) : null
                          const isUpcoming = meetingDate ? meetingDate > new Date() : false
                          return (
                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`
                                    relative overflow-hidden rounded-[24px] border p-4 shadow-[0_18px_45px_rgba(0,0,0,0.06)] transition-all
                                    ${snapshot.isDragging ? 'z-50 rotate-1 border-accent/40 bg-surface shadow-2xl ring-2 ring-accent/40' : 'border-edge/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,248,243,0.98))] hover:-translate-y-0.5 hover:border-accent/30'}
                                  `}
                                >
                                  <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: col.color }} />

                                  <div className="mb-4 flex items-start justify-between gap-3 pt-2">
                                    <div className="min-w-0 flex-1">
                                      <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-accent">
                                          {lead.company || 'Direct'}
                                        </span>
                                        <span className="rounded-full border border-edge bg-white/80 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-fg-muted">
                                          {lead.status}
                                        </span>
                                      </div>
                                      <h3 className="text-base font-black leading-tight text-fg">{lead.name}</h3>
                                      <p className="mt-1 text-[11px] font-medium text-fg-muted">
                                        {lead.project_type} | {lead.budget}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button 
                                        onClick={() => {
                                          closeInlinePanels()
                                          setSelectedLeadId(lead.id)
                                        }}
                                        className="rounded-xl border border-edge bg-white/80 p-2 text-fg-tertiary transition-all hover:border-accent/20 hover:text-fg"
                                        title="View Details"
                                      >
                                        <IconEye size={14} />
                                      </button>
                                      <button 
                                        onClick={() => toggleNotes(lead)}
                                        className={`rounded-xl border p-2 transition-all ${
                                          showNotes === lead.id
                                            ? 'border-accent bg-accent text-white'
                                            : 'border-edge bg-white/80 text-fg-tertiary hover:border-accent/20 hover:text-fg'
                                        }`}
                                        title="Toggle Notes"
                                      >
                                        <IconFileText size={14} />
                                      </button>
                                    </div>
                                  </div>

                                  <AnimatePresence>
                                    {showNotes === lead.id && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="mb-4 rounded-2xl border border-edge bg-white/80 p-4">
                                          <div className="mb-2 flex items-center justify-between">
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fg-tertiary">Quick Notes</p>
                                            <button onClick={() => setShowNotes(null)} className="rounded-lg p-1 text-fg-tertiary hover:bg-bg-alt">
                                              <IconX size={14} />
                                            </button>
                                          </div>
                                          <textarea
                                            value={noteValue}
                                            onChange={(e) => setNoteValue(e.target.value)}
                                            placeholder="Type project notes..."
                                            className="h-28 w-full resize-none rounded-xl border border-edge bg-bg-alt/70 p-3 text-xs text-fg focus:outline-none focus:ring-1 focus:ring-accent custom-scrollbar"
                                          />
                                          <button 
                                            onClick={() => saveNote(lead.id)}
                                            disabled={savingNote === lead.id}
                                            className="mt-3 w-full rounded-xl bg-fg py-2.5 text-[10px] font-black tracking-[0.18em] text-bg transition-colors hover:opacity-90"
                                          >
                                            {savingNote === lead.id ? 'SAVING...' : 'SAVE NOTES'}
                                          </button>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  <div className="mb-4 grid gap-3">
                                    <div className="rounded-2xl border border-edge bg-bg-alt/50 p-3">
                                      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-fg-tertiary">
                                        Meeting
                                      </p>
                                      <p className="text-sm font-bold text-fg">
                                        {lead.meeting_date} at {lead.meeting_time}
                                      </p>
                                      <p className={`mt-1 text-[11px] font-semibold ${isUpcoming ? 'text-accent' : 'text-fg-tertiary'}`}>
                                        {meetingDate ? (isUpcoming ? `Starts in ${formatDistanceToNow(meetingDate)}` : `Started ${formatDistanceToNow(meetingDate)} ago`) : 'Time pending'}
                                      </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <a
                                        href={`mailto:${lead.email}`}
                                        className="rounded-2xl border border-edge bg-white/80 p-3 transition-colors hover:border-accent/20"
                                      >
                                        <div className="mb-2 flex items-center gap-2 text-fg-tertiary">
                                          <IconMail size={14} />
                                          <span className="text-[10px] font-black uppercase tracking-[0.16em]">Email</span>
                                        </div>
                                        <p className="truncate text-[11px] font-semibold text-fg">{lead.email}</p>
                                      </a>
                                      <a
                                        href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        className="rounded-2xl border border-edge bg-white/80 p-3 transition-colors hover:border-accent/20"
                                      >
                                        <div className="mb-2 flex items-center gap-2 text-fg-tertiary">
                                          <IconMessageCircle size={14} />
                                          <span className="text-[10px] font-black uppercase tracking-[0.16em]">WhatsApp</span>
                                        </div>
                                        <p className="truncate text-[11px] font-semibold text-fg">{lead.whatsapp}</p>
                                      </a>
                                    </div>

                                    <div className="rounded-2xl border border-edge bg-white/70 p-3">
                                      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-fg-tertiary">Brief</p>
                                      <p className="line-clamp-3 text-[12px] leading-5 text-fg-muted">
                                        {lead.message}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-3 border-t border-edge/60 pt-4">
                                    <div className="rounded-2xl border border-edge bg-white/80 p-2">
                                      <button
                                        onClick={() => toggleActions(lead.id)}
                                        className={`flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-[10px] font-black tracking-[0.18em] transition-all ${
                                          activeActions === lead.id
                                            ? 'bg-accent text-white'
                                            : 'bg-fg text-bg hover:opacity-90'
                                        }`}
                                      >
                                        <IconSend size={14} />
                                        {sending === lead.id ? 'SENDING...' : 'SEND EMAIL'}
                                        <IconChevronDown size={12} className={`ml-auto transition-transform ${activeActions === lead.id ? 'rotate-180' : ''}`} />
                                      </button>

                                      <AnimatePresence>
                                        {activeActions === lead.id && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="mt-2 grid gap-2 rounded-xl bg-bg-alt/60 p-2">
                                              <button 
                                                onClick={() => handleSendReminder(lead.id, lead.email)}
                                                className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 text-[11px] font-bold text-fg transition-colors hover:border-accent/20 hover:bg-surface"
                                              >
                                                <IconClock size={16} className="text-amber-500" />
                                                Send Reminder
                                              </button>
                                              <button 
                                                onClick={() => toggleLinkInput(lead.id)}
                                                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[11px] font-bold transition-colors ${
                                                  showLinkInput === lead.id ? 'bg-accent text-white' : 'bg-white text-fg hover:bg-surface'
                                                }`}
                                              >
                                                <IconLink size={16} className={showLinkInput === lead.id ? 'text-white' : 'text-blue-500'} />
                                                Send Meeting Link
                                              </button>

                                              <AnimatePresence>
                                                {showLinkInput === lead.id && (
                                                  <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                  >
                                                    <div className="rounded-xl border border-edge bg-white p-3">
                                                      <input 
                                                        autoFocus
                                                        value={meetLink}
                                                        onChange={(e) => setMeetLink(e.target.value)}
                                                        placeholder="Meeting URL..."
                                                        className="w-full rounded-xl border border-edge bg-bg-alt/70 px-3 py-2.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-accent"
                                                      />
                                                      <div className="mt-2 flex gap-2">
                                                        <button
                                                          onClick={() => handleSendMeetLink(lead.id, lead.email)}
                                                          className="flex-1 rounded-xl bg-accent py-2.5 text-[10px] font-black tracking-[0.18em] text-white"
                                                        >
                                                          SEND LINK
                                                        </button>
                                                        <button
                                                          onClick={() => setShowLinkInput(null)}
                                                          className="rounded-xl border border-edge px-3 text-fg-tertiary hover:bg-bg-alt"
                                                        >
                                                          <IconX size={12} />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </motion.div>
                                                )}
                                              </AnimatePresence>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>

                                    <div className="flex items-center justify-between px-1 pt-1">
                                      <div className="flex items-center gap-3 text-fg-tertiary">
                                        <div className="flex items-center gap-1.5">
                                          <IconClock size={11} />
                                          <span className="text-[10px] font-black">{stats.reminders}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <IconLink size={11} />
                                          <span className="text-[10px] font-black">{stats.links}</span>
                                        </div>
                                      </div>
                                      <div className="text-[10px] font-bold text-fg-tertiary">
                                        {formatDistanceToNow(new Date(lead.created_at))} ago
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          )
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
                })}
                </div>
              </div>
            </DragDropContext>
          </div>

          <aside className="hidden h-full w-[390px] shrink-0 overflow-hidden rounded-[28px] border border-edge/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,245,239,0.98))] shadow-[0_24px_60px_rgba(0,0,0,0.06)] xl:flex xl:flex-col">
            <div className="border-b border-edge/70 px-5 py-5">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-accent">Smart Tasks</p>
              <h2 className="mt-2 text-xl font-black text-fg">Nearest Meeting Action List</h2>
              <p className="mt-1 text-sm text-fg-muted">Only pending tasks are shown here so the next call stays actionable.</p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar">
              {!nearestLead ? (
                <div className="rounded-3xl border border-dashed border-edge bg-bg-alt/40 p-6 text-sm text-fg-muted">
                  No upcoming meeting found. As soon as a lead has the nearest future meeting, this panel will build its checklist automatically.
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-[24px] border border-edge bg-white/90 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">{nearestLead.company || 'Direct Lead'}</p>
                        <h3 className="mt-2 text-lg font-black text-fg">{nearestLead.name}</h3>
                        <p className="mt-1 text-xs font-semibold text-fg-muted">{nearestLead.project_type} | {nearestLead.budget}</p>
                      </div>
                      <div className="rounded-2xl bg-accent/10 px-3 py-2 text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-accent">Nearest Meet</p>
                        <p className="mt-1 text-sm font-bold text-fg">{formatDistanceToNow(new Date(nearestLead.meeting_timestamp))}</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-edge bg-bg-alt/60 p-4">
                      <p className="text-sm font-bold text-fg">{nearestLead.meeting_date} at {nearestLead.meeting_time}</p>
                      <p className="mt-2 line-clamp-3 text-[13px] leading-6 text-fg-muted">{nearestLead.message}</p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <a href={`mailto:${nearestLead.email}`} className="rounded-2xl border border-edge bg-white px-3 py-3 text-[12px] font-semibold text-fg transition-colors hover:border-accent/20">
                        {nearestLead.email}
                      </a>
                      <button
                        onClick={() => {
                          closeInlinePanels()
                          setSelectedLeadId(nearestLead.id)
                        }}
                        className="rounded-2xl bg-fg px-3 py-3 text-[12px] font-black tracking-[0.14em] text-bg"
                      >
                        SEE FULL DETAILS
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-edge bg-white/85 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fg-tertiary">Add Task</p>
                    <input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Task title"
                      className="mt-3 w-full rounded-2xl border border-edge bg-bg-alt/60 px-4 py-3 text-sm text-fg focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <textarea
                      value={newTaskDetails}
                      onChange={(e) => setNewTaskDetails(e.target.value)}
                      placeholder="Overview / notes / summary"
                      className="mt-3 h-28 w-full resize-none rounded-2xl border border-edge bg-bg-alt/60 px-4 py-3 text-sm text-fg focus:outline-none focus:ring-1 focus:ring-accent custom-scrollbar"
                    />
                    <button
                      onClick={handleAddTask}
                      disabled={savingTaskId === 'new-task'}
                      className="mt-3 w-full rounded-2xl bg-accent px-4 py-3 text-[11px] font-black tracking-[0.18em] text-white"
                    >
                      {savingTaskId === 'new-task' ? 'ADDING...' : 'ADD TASK'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {nearestLeadTasks.length === 0 ? (
                      <div className="rounded-[24px] border border-dashed border-edge bg-bg-alt/30 p-5 text-sm text-fg-muted">
                        No pending tasks for this meeting.
                      </div>
                    ) : (
                      nearestLeadTasks.map((task) => {
                        const countdownTarget = task.due_at || nearestLead.meeting_timestamp
                        return (
                          <div key={task.id} className="rounded-[24px] border border-edge bg-white/90 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.04)]">
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => handleToggleTask(task)}
                                disabled={savingTaskId === task.id}
                                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent text-accent transition-colors hover:bg-accent hover:text-white"
                              >
                                <IconCheck size={14} />
                              </button>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h4 className="text-sm font-black text-fg">{task.title}</h4>
                                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                                      Due in {countdownTarget ? formatDistanceToNow(new Date(countdownTarget)) : 'Soon'}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    disabled={savingTaskId === task.id}
                                    className="rounded-xl border border-edge px-2.5 py-1.5 text-[10px] font-black tracking-[0.14em] text-fg-tertiary hover:bg-bg-alt"
                                  >
                                    DELETE
                                  </button>
                                </div>
                                <p className="mt-3 line-clamp-3 text-[13px] leading-6 text-fg-muted">
                                  {task.details || 'No task overview yet. Open workspace to add your notes, summary, or client-facing brief.'}
                                </p>
                                <button
                                  onClick={() => openTaskModal(task)}
                                  className="mt-3 rounded-xl bg-fg px-3 py-2 text-[10px] font-black tracking-[0.16em] text-bg"
                                >
                                  OPEN WORKSPACE
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* DETAILED SIDEBAR */}
      <AnimatePresence>
        {selectedLeadId && selectedLead && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedLeadId(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-surface border-l border-edge shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[101] flex flex-col pt-20"
            >
              <button 
                onClick={() => setSelectedLeadId(null)}
                className="absolute top-8 left-8 p-3 rounded-full hover:bg-bg-alt text-fg-muted transition-colors"
              >
                <IconX size={24} />
              </button>

              <div className="flex-1 overflow-y-auto px-12 pb-12 custom-scrollbar">
                <div className="mb-12">
                  <p className="text-accent font-black text-xs uppercase tracking-[0.2em] mb-3">{selectedLead.company || 'Individual Client'}</p>
                  <h2 className="text-4xl font-black font-display text-fg leading-tight mb-4">{selectedLead.name}</h2>
                  <div className="flex flex-wrap gap-4 text-sm text-fg-muted font-medium">
                    <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-2 hover:text-accent"><IconMail size={16} /> {selectedLead.email}</a>
                    <a href={`https://wa.me/${selectedLead.whatsapp.replace(/\D/g, '')}`} target="_blank" className="flex items-center gap-2 hover:text-accent"><IconMessageCircle size={16} /> {selectedLead.whatsapp}</a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-16">
                  <div>
                    <p className="text-[10px] font-black text-fg-tertiary uppercase tracking-widest mb-2">Project Type</p>
                    <div className="flex items-center gap-2 text-fg font-bold">
                      <IconLayers size={18} className="text-accent" />
                      {selectedLead.project_type}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-fg-tertiary uppercase tracking-widest mb-2">Budget Range</p>
                    <div className="flex items-center gap-2 text-fg font-bold">
                      <IconPalette size={18} className="text-accent" />
                      {selectedLead.budget}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-fg-tertiary uppercase tracking-widest mb-2">Initial Request</p>
                    <div className="col-span-2 bg-bg-alt rounded-2xl p-6 text-sm text-fg italic leading-relaxed">
                      &quot;{selectedLead.message}&quot;
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-black text-fg-tertiary uppercase tracking-widest mb-2">Internal Notes</p>
                    <div className="bg-bg-alt rounded-2xl p-6 text-sm text-fg leading-relaxed whitespace-pre-wrap min-h-[150px]">
                      {selectedLead.notes || 'No internal notes captured yet.'}
                    </div>
                  </div>
                </div>

                {/* Email Timeline */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-6 pb-2 border-b border-edge">Communication History ({getLogStats(selectedLeadId).total})</h4>
                  <div className="space-y-6">
                    {getLogStats(selectedLeadId).history.length === 0 ? (
                      <p className="text-xs text-fg-tertiary italic">No automated communications sent yet.</p>
                    ) : (
                      getLogStats(selectedLeadId).history.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(log => (
                        <div key={log.id} className="flex gap-4">
                          <div className="mt-1">
                            {log.email_type === 'reminder' ? <IconClock size={16} className="text-amber-500" /> : <IconLink size={16} className="text-blue-500" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-fg capitalize">{log.email_type.replace('_', ' ')} Sent</p>
                            {log.meta?.link && (
                              <p className="text-xs text-accent mt-1 break-all underline">{log.meta.link}</p>
                            )}
                            <p className="text-[10px] text-fg-tertiary mt-2">{format(new Date(log.created_at), 'MMM d, p')}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeTask && nearestLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm"
              onClick={closeTaskModal}
            />
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              className="fixed inset-4 z-[111] rounded-[32px] border border-edge bg-surface shadow-[0_30px_80px_rgba(0,0,0,0.18)]"
            >
              <div className="flex h-full min-h-0 flex-col">
                <div className="flex items-center justify-between border-b border-edge px-6 py-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">{nearestLead.name}</p>
                    <h3 className="mt-2 text-2xl font-black text-fg">Task Workspace</h3>
                  </div>
                  <button onClick={closeTaskModal} className="rounded-2xl border border-edge p-3 text-fg-tertiary hover:bg-bg-alt">
                    <IconX size={18} />
                  </button>
                </div>

                <div className="grid min-h-0 flex-1 gap-0 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="min-h-0 overflow-y-auto px-6 py-6 custom-scrollbar">
                    <input
                      value={taskModalTitle}
                      onChange={(e) => setTaskModalTitle(e.target.value)}
                      placeholder="Task title"
                      className="w-full rounded-2xl border border-edge bg-bg-alt/60 px-4 py-4 text-xl font-black text-fg focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <textarea
                      value={taskModalDetails}
                      onChange={(e) => setTaskModalDetails(e.target.value)}
                      placeholder="Add the full overview, analysis, talking points, summary, or client-facing notes here."
                      className="mt-4 h-[calc(100vh-280px)] min-h-[320px] w-full resize-none rounded-[24px] border border-edge bg-white px-5 py-5 text-sm leading-7 text-fg focus:outline-none focus:ring-1 focus:ring-accent custom-scrollbar"
                    />
                  </div>

                  <div className="border-l border-edge bg-bg-alt/30 px-6 py-6">
                    <div className="rounded-[24px] border border-edge bg-white p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fg-tertiary">Meeting Context</p>
                      <h4 className="mt-3 text-lg font-black text-fg">{nearestLead.meeting_date} at {nearestLead.meeting_time}</h4>
                      <p className="mt-2 text-sm text-fg-muted">Starts in {formatDistanceToNow(new Date(activeTask.due_at || nearestLead.meeting_timestamp))}</p>
                      <p className="mt-4 line-clamp-6 text-[13px] leading-6 text-fg-muted">{nearestLead.message}</p>
                      <button
                        onClick={() => {
                          closeTaskModal()
                          setSelectedLeadId(nearestLead.id)
                        }}
                        className="mt-4 w-full rounded-2xl bg-fg px-4 py-3 text-[11px] font-black tracking-[0.18em] text-bg"
                      >
                        SEE FULL DETAILS
                      </button>
                    </div>

                    <div className="mt-4 grid gap-2">
                      <button
                        onClick={handleSaveTaskModal}
                        disabled={savingTaskId === activeTask.id}
                        className="rounded-2xl bg-accent px-4 py-3 text-[11px] font-black tracking-[0.18em] text-white"
                      >
                        {savingTaskId === activeTask.id ? 'SAVING...' : 'SAVE TASK'}
                      </button>
                      <button
                        onClick={() => handleToggleTask(activeTask)}
                        disabled={savingTaskId === activeTask.id}
                        className="rounded-2xl border border-edge bg-white px-4 py-3 text-[11px] font-black tracking-[0.18em] text-fg"
                      >
                        MARK COMPLETE
                      </button>
                      <button
                        onClick={() => handleDeleteTask(activeTask.id)}
                        disabled={savingTaskId === activeTask.id}
                        className="rounded-2xl border border-edge bg-white px-4 py-3 text-[11px] font-black tracking-[0.18em] text-fg-tertiary"
                      >
                        DELETE TASK
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }
      `}</style>
    </div>
  )
}
