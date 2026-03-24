'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'motion/react'
import { useLocale } from 'next-intl'
import { createClient } from '@/utils/supabase/client'
import {
  IconCheck,
  IconClock,
  IconLayers,
  IconLink,
  IconMail,
  IconMessageCircle,
  IconPalette,
  IconX,
} from '@/components/icons'
import { formatMeetingDateTime, getSafeTimeZone } from '@/lib/appslabs-meetings'
import { getAdminCopy } from '@/lib/appslabs-admin-copy'

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
  meeting_timezone?: string | null
  status: string
  created_at: string
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

export default function SmartTasksView({
  initialLeads,
  initialLogs,
  initialTasks,
}: {
  initialLeads: Lead[]
  initialLogs: EmailLog[]
  initialTasks: SmartTask[]
}) {
  const locale = useLocale()
  const copy = getAdminCopy(locale)
  const supabase = useMemo(() => createClient(), [])
  const adminTimeZone = useMemo(
    () => getSafeTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'),
    []
  )

  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [logs, setLogs] = useState<EmailLog[]>(initialLogs)
  const [tasks, setTasks] = useState<SmartTask[]>(initialTasks)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [taskModalId, setTaskModalId] = useState<string | null>(null)
  const [taskModalTitle, setTaskModalTitle] = useState('')
  const [taskModalDetails, setTaskModalDetails] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDetails, setNewTaskDetails] = useState('')
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null)
  const seededTaskLeadIds = useRef(new Set<string>())
  const initialTaskLeadIds = useRef(new Set(initialTasks.map((task) => task.lead_id)))

  const getMeetingDisplay = (lead: Pick<Lead, 'meeting_timestamp' | 'meeting_timezone' | 'meeting_date' | 'meeting_time'>) => {
    if (!lead.meeting_timestamp) {
      return {
        adminDateTime: `${lead.meeting_date} at ${lead.meeting_time}`,
        clientDateTime: `${lead.meeting_date} at ${lead.meeting_time}`,
        clientTimeZone: getSafeTimeZone(lead.meeting_timezone || 'UTC'),
        showClientReference: Boolean(lead.meeting_timezone),
      }
    }

    const meetingDate = new Date(lead.meeting_timestamp)

    if (Number.isNaN(meetingDate.getTime())) {
      return {
        adminDateTime: `${lead.meeting_date} at ${lead.meeting_time}`,
        clientDateTime: `${lead.meeting_date} at ${lead.meeting_time}`,
        clientTimeZone: getSafeTimeZone(lead.meeting_timezone || 'UTC'),
        showClientReference: Boolean(lead.meeting_timezone),
      }
    }

    const clientTimeZone = getSafeTimeZone(lead.meeting_timezone || 'UTC')

    return {
      adminDateTime: formatMeetingDateTime(meetingDate, locale, adminTimeZone),
      clientDateTime: formatMeetingDateTime(meetingDate, locale, clientTimeZone),
      clientTimeZone,
      showClientReference: clientTimeZone !== adminTimeZone,
    }
  }

  const nearestLead = useMemo(
    () =>
      [...leads]
        .filter((lead) => lead.meeting_timestamp && new Date(lead.meeting_timestamp) > new Date())
        .sort((a, b) => new Date(a.meeting_timestamp).getTime() - new Date(b.meeting_timestamp).getTime())[0] || null,
    [leads]
  )
  const nearestLeadDisplay = nearestLead ? getMeetingDisplay(nearestLead) : null

  const nearestLeadTasks = useMemo(() => {
    if (!nearestLead) return []
    return tasks
      .filter((task) => task.lead_id === nearestLead.id && !task.completed)
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      })
  }, [nearestLead, tasks])

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) || null
  const activeTask = taskModalId ? tasks.find((task) => task.id === taskModalId) || null : null

  const getLogStats = (leadId: string) => {
    const leadLogs = logs.filter((log) => log.lead_id === leadId)
    const reminders = leadLogs.filter((log) => log.email_type === 'reminder').length
    const links = leadLogs.filter((log) => log.email_type === 'meeting_link').length
    return { reminders, links, total: leadLogs.length, history: leadLogs }
  }

  const mergeTasks = (incoming: SmartTask[]) => {
    setTasks((current) => {
      const map = new Map(current.map((task) => [task.id, task]))
      for (const task of incoming) map.set(task.id, task)
      return Array.from(map.values()).sort((a, b) => {
        if (a.lead_id !== b.lead_id) return a.lead_id.localeCompare(b.lead_id)
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      })
    })
  }

  useEffect(() => {
    const channel = supabase
      .channel('appslabs-smart-tasks-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appslabs_leads' }, (payload: any) => {
        if (payload.eventType === 'DELETE') {
          setLeads((current) => current.filter((lead) => lead.id !== payload.old.id))
          return
        }

        if (payload.new) {
          setLeads((current) => {
            const next = current.filter((lead) => lead.id !== payload.new.id)
            return [payload.new as Lead, ...next].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
          })
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appslabs_email_logs' }, (payload: any) => {
        if (payload.eventType === 'DELETE') {
          setLogs((current) => current.filter((log) => log.id !== payload.old.id))
          return
        }

        if (payload.new) {
          setLogs((current) => {
            const next = current.filter((log) => log.id !== payload.new.id)
            return [...next, payload.new as EmailLog]
          })
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appslabs_smart_tasks' }, (payload: any) => {
        if (payload.eventType === 'DELETE') {
          setTasks((current) => current.filter((task) => task.id !== payload.old.id))
          return
        }

        if (payload.new) {
          mergeTasks([payload.new as SmartTask])
        }
      })

    channel.subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase])

  useEffect(() => {
    const pendingLeads = leads.filter((lead) => lead.status === 'pending')
    const unseededPendingLeads = pendingLeads.filter((lead) => {
      if (initialTaskLeadIds.current.has(lead.id)) return false
      if (seededTaskLeadIds.current.has(lead.id)) return false
      return true
    })

    if (unseededPendingLeads.length === 0) return

    for (const lead of unseededPendingLeads) {
      seededTaskLeadIds.current.add(lead.id)
    }

    const seedTasks = async () => {
      const { data, error } = await supabase
        .from('appslabs_smart_tasks')
        .upsert(
          unseededPendingLeads.map((lead) => ({
            lead_id: lead.id,
            title: 'Project analysis',
            details: null,
            sort_order: 0,
            task_type: 'analysis',
            due_at: lead.meeting_timestamp || null,
          })),
          { onConflict: 'lead_id,title' }
        )
        .select()

      if (!error && data) mergeTasks(data as SmartTask[])
    }

    void seedTasks()
  }, [leads, supabase])

  const openTaskModal = (task: SmartTask) => {
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

  const handleSaveTask = async () => {
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
    <div className="min-h-full">
      <div className="space-y-4 lg:hidden">
        <section className="rounded-[28px] border border-edge/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,238,0.98))] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.06)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-accent">Smart Tasks</p>
          <h1 className="mt-3 text-2xl font-bold text-fg">Meeting Preparation Workspace</h1>
          <p className="mt-2 text-sm leading-6 text-fg-muted">
            This mobile view stays locked on the nearest meeting so prep, notes, and lead context remain usable on one screen.
          </p>
        </section>

        {!nearestLead || !nearestLeadDisplay ? (
          <section className="rounded-[28px] border border-dashed border-edge bg-bg-alt/30 p-6 text-sm text-fg-muted">
            No upcoming meeting found yet, so there is no active smart task list to prepare.
          </section>
        ) : (
          <>
            <section className="rounded-[28px] border border-edge/70 bg-fg p-4 text-bg shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">{nearestLead.company || 'Direct Lead'}</p>
                  <h2 className="mt-2 text-xl font-bold text-white">{nearestLead.name}</h2>
                  <p className="mt-1 text-xs font-semibold text-white/70">{nearestLead.project_type} | {nearestLead.budget}</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-3 py-2 text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">Pending</p>
                  <p className="mt-1 text-2xl font-bold text-white">{nearestLeadTasks.length}</p>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-white/10 bg-white/10 p-4">
                <p className="text-sm font-bold text-white">{nearestLeadDisplay.adminDateTime}</p>
                <p className="mt-1 text-[11px] font-semibold text-white/70">
                  {copy.dashboard.clientTimezone}: {nearestLeadDisplay.clientTimeZone}
                  {nearestLeadDisplay.showClientReference ? ` | ${nearestLeadDisplay.clientDateTime}` : ''}
                </p>
                <p className="mt-3 text-sm text-white/75">Starts in {formatDistanceToNow(new Date(nearestLead.meeting_timestamp))}</p>
              </div>

              <button
                onClick={() => setSelectedLeadId(nearestLead.id)}
                className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-[11px] font-semibold tracking-[0.18em] text-fg"
              >
                SEE FULL DETAILS
              </button>
            </section>

            <section className="rounded-[28px] border border-edge bg-white/90 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.04)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-tertiary">Add New Task</p>
              <div className="mt-4 space-y-3">
                <input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title"
                  className="rounded-2xl border border-edge bg-bg-alt/60 px-4 py-3 text-sm text-fg focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <input
                  value={newTaskDetails}
                  onChange={(e) => setNewTaskDetails(e.target.value)}
                  placeholder="Short overview or what to prepare"
                  className="rounded-2xl border border-edge bg-bg-alt/60 px-4 py-3 text-sm text-fg focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                  onClick={handleAddTask}
                  disabled={savingTaskId === 'new-task'}
                  className="w-full rounded-2xl bg-accent px-4 py-3 text-[11px] font-semibold tracking-[0.18em] text-white"
                >
                  {savingTaskId === 'new-task' ? 'ADDING...' : 'ADD TASK'}
                </button>
              </div>
            </section>

            <section className="space-y-3">
              {nearestLeadTasks.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-edge bg-bg-alt/30 p-6 text-sm text-fg-muted">
                  No pending tasks remain for the nearest meeting.
                </div>
              ) : (
                nearestLeadTasks.map((task) => {
                  const countdownTarget = task.due_at || nearestLead.meeting_timestamp
                  return (
                    <div key={task.id} className="rounded-[26px] border border-edge bg-white/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.04)]">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleTask(task)}
                          disabled={savingTaskId === task.id}
                          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent text-accent transition-colors hover:bg-accent hover:text-white"
                        >
                          <IconCheck size={15} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-bold text-fg">{task.title}</h3>
                              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                                Due in {countdownTarget ? formatDistanceToNow(new Date(countdownTarget)) : 'Soon'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              disabled={savingTaskId === task.id}
                              className="rounded-xl border border-edge px-3 py-2 text-[10px] font-semibold tracking-[0.16em] text-fg-tertiary hover:bg-bg-alt"
                            >
                              DELETE
                            </button>
                          </div>

                          <p className="mt-3 line-clamp-3 text-[13px] leading-6 text-fg-muted">
                            {task.details || 'No overview added yet. Open the workspace to write the full call brief, summary, or client-facing preparation notes.'}
                          </p>

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                              onClick={() => openTaskModal(task)}
                              className="rounded-2xl bg-fg px-4 py-3 text-[10px] font-semibold tracking-[0.18em] text-bg"
                            >
                              OPEN WORKSPACE
                            </button>
                            <button
                              onClick={() => setSelectedLeadId(nearestLead.id)}
                              className="rounded-2xl border border-edge bg-white px-4 py-3 text-[10px] font-semibold tracking-[0.18em] text-fg"
                            >
                              SEE DETAILS
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </section>

            <section className="rounded-[28px] border border-edge bg-white/90 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.04)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Lead Brief</p>
              <p className="mt-3 line-clamp-5 text-[13px] leading-6 text-fg-muted">{nearestLead.message}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-bg-alt/60 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-fg-tertiary">Reminders</p>
                  <p className="mt-2 text-xl font-bold text-fg">{getLogStats(nearestLead.id).reminders}</p>
                </div>
                <div className="rounded-2xl bg-bg-alt/60 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-fg-tertiary">Links</p>
                  <p className="mt-2 text-xl font-bold text-fg">{getLogStats(nearestLead.id).links}</p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      <div className="hidden min-h-[calc(100vh-6rem)] gap-5 lg:grid xl:grid-cols-[minmax(0,1.25fr)_390px]">
        <section className="min-w-0 rounded-[30px] border border-edge/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,238,0.98))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.06)]">
          <div className="border-b border-edge/70 pb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-accent">Smart Tasks</p>
            <h1 className="mt-3 text-3xl font-bold text-fg">Meeting Preparation Workspace</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-fg-muted">
              This page locks onto the nearest upcoming meeting, shows only pending tasks that still need action, and lets you keep full overview notes in a fullscreen workspace.
            </p>
          </div>

          {!nearestLead ? (
            <div className="mt-6 rounded-[28px] border border-dashed border-edge bg-bg-alt/30 p-8 text-sm text-fg-muted">
              No upcoming meeting found yet, so there is no active smart task list to prepare.
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="rounded-[26px] border border-edge bg-white/90 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">{nearestLead.company || 'Direct Lead'}</p>
                  <h2 className="mt-2 text-2xl font-bold text-fg">{nearestLead.name}</h2>
                  <p className="mt-2 text-sm font-semibold text-fg-muted">{nearestLead.project_type} | {nearestLead.budget}</p>
                  <div className="mt-4 rounded-2xl border border-edge bg-bg-alt/50 p-4">
                    <p className="text-sm font-bold text-fg">{nearestLeadDisplay?.adminDateTime}</p>
                    <p className="mt-1 text-[11px] font-semibold text-fg-tertiary">
                      {copy.dashboard.clientTimezone}: {nearestLeadDisplay?.clientTimeZone}
                      {nearestLeadDisplay?.showClientReference ? ` | ${nearestLeadDisplay.clientDateTime}` : ''}
                    </p>
                    <p className="mt-2 line-clamp-4 text-[13px] leading-6 text-fg-muted">{nearestLead.message}</p>
                  </div>
                </div>

                <div className="rounded-[26px] border border-edge bg-fg p-5 text-bg">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">Nearest Meet</p>
                  <p className="mt-3 text-3xl font-bold">{formatDistanceToNow(new Date(nearestLead.meeting_timestamp))}</p>
                  <p className="mt-2 text-sm text-white/75">{nearestLeadDisplay?.adminDateTime}</p>
                  <div className="mt-5 rounded-2xl bg-white/10 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">Pending Tasks</p>
                    <p className="mt-2 text-2xl font-bold">{nearestLeadTasks.length}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-edge bg-white/85 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-tertiary">Add New Task</p>
                <div className="mt-4 grid gap-3 lg:grid-cols-[240px_minmax(0,1fr)_160px]">
                  <input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title"
                    className="rounded-2xl border border-edge bg-bg-alt/60 px-4 py-3 text-sm text-fg focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <input
                    value={newTaskDetails}
                    onChange={(e) => setNewTaskDetails(e.target.value)}
                    placeholder="Short overview or what to prepare"
                    className="rounded-2xl border border-edge bg-bg-alt/60 px-4 py-3 text-sm text-fg focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button
                    onClick={handleAddTask}
                    disabled={savingTaskId === 'new-task'}
                    className="rounded-2xl bg-accent px-4 py-3 text-[11px] font-semibold tracking-[0.18em] text-white"
                  >
                    {savingTaskId === 'new-task' ? 'ADDING...' : 'ADD TASK'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {nearestLeadTasks.length === 0 ? (
                  <div className="rounded-[26px] border border-dashed border-edge bg-bg-alt/30 p-8 text-sm text-fg-muted">
                    No pending tasks remain for the nearest meeting.
                  </div>
                ) : (
                  nearestLeadTasks.map((task) => {
                    const countdownTarget = task.due_at || nearestLead.meeting_timestamp
                    return (
                      <div key={task.id} className="rounded-[26px] border border-edge bg-white/95 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.04)]">
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => handleToggleTask(task)}
                            disabled={savingTaskId === task.id}
                            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent text-accent transition-colors hover:bg-accent hover:text-white"
                          >
                            <IconCheck size={15} />
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <h3 className="text-lg font-bold text-fg">{task.title}</h3>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-tertiary">
                                  <span className="flex items-center gap-1.5 text-accent">
                                    <IconClock size={13} />
                                    Due in {countdownTarget ? formatDistanceToNow(new Date(countdownTarget)) : 'Soon'}
                                  </span>
                                  <span>{task.task_type.replace('_', ' ')}</span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                disabled={savingTaskId === task.id}
                                className="rounded-xl border border-edge px-3 py-2 text-[10px] font-semibold tracking-[0.16em] text-fg-tertiary hover:bg-bg-alt"
                              >
                                DELETE
                              </button>
                            </div>

                            <p className="mt-4 line-clamp-3 text-[14px] leading-7 text-fg-muted">
                              {task.details || 'No overview added yet. Open the workspace to write the full call brief, summary, or client-facing preparation notes.'}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                onClick={() => openTaskModal(task)}
                                className="rounded-2xl bg-fg px-4 py-2.5 text-[11px] font-semibold tracking-[0.18em] text-bg"
                              >
                                OPEN FULLSCREEN
                              </button>
                              <button
                                onClick={() => setSelectedLeadId(nearestLead.id)}
                                className="rounded-2xl border border-edge bg-white px-4 py-2.5 text-[11px] font-semibold tracking-[0.18em] text-fg"
                              >
                                SEE FULL DETAILS
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </section>

        <aside className="rounded-[30px] border border-edge/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,243,237,0.98))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.06)]">
          {!nearestLead ? (
            <div className="rounded-[24px] border border-dashed border-edge bg-bg-alt/30 p-6 text-sm text-fg-muted">
              Lead brief appears here once there is a nearest upcoming meeting.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-edge bg-white/90 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">Lead Brief</p>
                <h3 className="mt-3 text-xl font-bold text-fg">{nearestLead.name}</h3>
                <p className="mt-1 text-sm font-semibold text-fg-muted">{nearestLead.company || 'Direct Lead'}</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-edge bg-bg-alt/50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-fg-tertiary">Meeting</p>
                    <p className="mt-2 text-sm font-bold text-fg">{nearestLeadDisplay?.adminDateTime}</p>
                    <p className="mt-1 text-[11px] font-semibold text-fg-tertiary">
                      {copy.dashboard.clientTimezone}: {nearestLeadDisplay?.clientTimeZone}
                      {nearestLeadDisplay?.showClientReference ? ` | ${nearestLeadDisplay.clientDateTime}` : ''}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-2xl border border-edge bg-white p-3">
                      <div className="flex items-center gap-2 text-fg-tertiary">
                        <IconLayers size={15} />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">Type</span>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-fg">{nearestLead.project_type}</p>
                    </div>
                    <div className="rounded-2xl border border-edge bg-white p-3">
                      <div className="flex items-center gap-2 text-fg-tertiary">
                        <IconPalette size={15} />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">Budget</span>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-fg">{nearestLead.budget}</p>
                    </div>
                  </div>
                  <a href={`mailto:${nearestLead.email}`} className="flex items-center gap-2 rounded-2xl border border-edge bg-white p-3 text-sm font-semibold text-fg">
                    <IconMail size={15} />
                    <span className="truncate">{nearestLead.email}</span>
                  </a>
                  <a href={`https://wa.me/${nearestLead.whatsapp.replace(/\D/g, '')}`} target="_blank" className="flex items-center gap-2 rounded-2xl border border-edge bg-white p-3 text-sm font-semibold text-fg">
                    <IconMessageCircle size={15} />
                    <span className="truncate">{nearestLead.whatsapp}</span>
                  </a>
                </div>
                <button
                  onClick={() => setSelectedLeadId(nearestLead.id)}
                  className="mt-4 w-full rounded-2xl bg-fg px-4 py-3 text-[11px] font-semibold tracking-[0.18em] text-bg"
                >
                  SEE FULL DETAILS
                </button>
              </div>

              <div className="rounded-[24px] border border-edge bg-white/90 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-tertiary">Communication</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-bg-alt/60 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-fg-tertiary">Reminders</p>
                    <p className="mt-2 text-2xl font-bold text-fg">{getLogStats(nearestLead.id).reminders}</p>
                  </div>
                  <div className="rounded-2xl bg-bg-alt/60 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-fg-tertiary">Links</p>
                    <p className="mt-2 text-2xl font-bold text-fg">{getLogStats(nearestLead.id).links}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-edge bg-white/90 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-tertiary">Client Brief</p>
                <p className="mt-3 line-clamp-6 text-[13px] leading-6 text-fg-muted">{nearestLead.message}</p>
              </div>
            </div>
          )}
        </aside>
      </div>

      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLeadId(null)}
              className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[101] flex w-full flex-col bg-surface pt-16 shadow-[-20px_0_50px_rgba(0,0,0,0.1)] lg:bottom-0 lg:left-auto lg:right-0 lg:top-0 lg:max-w-lg lg:border-l lg:pt-20"
            >
              <button onClick={() => setSelectedLeadId(null)} className="absolute left-4 top-4 rounded-full p-3 text-fg-muted hover:bg-bg-alt lg:left-8 lg:top-8">
                <IconX size={24} />
              </button>

              <div className="custom-scrollbar flex-1 overflow-y-auto px-4 pb-28 lg:px-12 lg:pb-12">
                <div className="mb-12">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">{selectedLead.company || 'Individual Client'}</p>
                  <h2 className="mb-4 text-3xl font-bold leading-tight text-fg lg:text-4xl">{selectedLead.name}</h2>
                  <div className="flex flex-wrap gap-4 text-sm font-medium text-fg-muted">
                    <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-2 hover:text-accent"><IconMail size={16} /> {selectedLead.email}</a>
                    <a href={`https://wa.me/${selectedLead.whatsapp.replace(/\D/g, '')}`} target="_blank" className="flex items-center gap-2 hover:text-accent"><IconMessageCircle size={16} /> {selectedLead.whatsapp}</a>
                  </div>
                </div>

                <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:gap-8">
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-fg-tertiary">Project Type</p>
                    <div className="flex items-center gap-2 font-bold text-fg">
                      <IconLayers size={18} className="text-accent" />
                      {selectedLead.project_type}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-fg-tertiary">Budget Range</p>
                    <div className="flex items-center gap-2 font-bold text-fg">
                      <IconPalette size={18} className="text-accent" />
                      {selectedLead.budget}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-fg-tertiary">Initial Request</p>
                    <div className="col-span-2 rounded-2xl bg-bg-alt p-6 text-sm italic leading-relaxed text-fg">
                      &quot;{selectedLead.message}&quot;
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-fg-tertiary">Internal Notes</p>
                    <div className="min-h-[150px] whitespace-pre-wrap rounded-2xl bg-bg-alt p-6 text-sm leading-relaxed text-fg">
                      {selectedLead.notes || 'No internal notes captured yet.'}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-6 border-b border-edge pb-2 text-xs font-semibold uppercase tracking-widest">Communication History ({getLogStats(selectedLead.id).total})</h4>
                  <div className="space-y-6">
                    {getLogStats(selectedLead.id).history.length === 0 ? (
                      <p className="text-xs italic text-fg-tertiary">No automated communications sent yet.</p>
                    ) : (
                      getLogStats(selectedLead.id).history
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((log) => (
                          <div key={log.id} className="flex gap-4">
                            <div className="mt-1">
                              {log.email_type === 'reminder' ? <IconClock size={16} className="text-amber-500" /> : <IconLink size={16} className="text-blue-500" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold capitalize text-fg">{log.email_type.replace('_', ' ')} Sent</p>
                              {log.meta?.link && <p className="mt-1 break-all text-xs text-accent underline">{log.meta.link}</p>}
                              <p className="mt-2 text-[10px] text-fg-tertiary">{format(new Date(log.created_at), 'MMM d, p')}</p>
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
              className="fixed inset-0 z-[111] rounded-none border border-edge bg-surface shadow-[0_30px_80px_rgba(0,0,0,0.18)] lg:inset-4 lg:rounded-[32px]"
            >
              <div className="flex h-full min-h-0 flex-col">
                <div className="flex items-center justify-between border-b border-edge px-4 py-4 lg:px-6 lg:py-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">{nearestLead.name}</p>
                    <h3 className="mt-2 text-2xl font-bold text-fg">Task Workspace</h3>
                  </div>
                  <button onClick={closeTaskModal} className="rounded-2xl border border-edge p-3 text-fg-tertiary hover:bg-bg-alt">
                    <IconX size={18} />
                  </button>
                </div>

                <div className="grid min-h-0 flex-1 gap-0 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="custom-scrollbar min-h-0 overflow-y-auto px-4 py-4 lg:px-6 lg:py-6">
                    <input
                      value={taskModalTitle}
                      onChange={(e) => setTaskModalTitle(e.target.value)}
                      placeholder="Task title"
                      className="w-full rounded-2xl border border-edge bg-bg-alt/60 px-4 py-4 text-xl font-bold text-fg focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <textarea
                      value={taskModalDetails}
                      onChange={(e) => setTaskModalDetails(e.target.value)}
                      placeholder="Add the full overview, analysis, talking points, summary, or client-facing notes here."
                      className="mt-4 h-[42vh] min-h-[260px] w-full resize-none rounded-[24px] border border-edge bg-white px-5 py-5 text-sm leading-7 text-fg focus:outline-none focus:ring-1 focus:ring-accent custom-scrollbar lg:h-[calc(100vh-280px)] lg:min-h-[320px]"
                    />
                  </div>

                  <div className="border-t border-edge bg-bg-alt/30 px-4 py-4 lg:border-l lg:border-t-0 lg:px-6 lg:py-6">
                    <div className="rounded-[24px] border border-edge bg-white p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-tertiary">Meeting Context</p>
                      <h4 className="mt-3 text-lg font-bold text-fg">{nearestLeadDisplay?.adminDateTime}</h4>
                      <p className="mt-1 text-[11px] font-semibold text-fg-tertiary">
                        {copy.dashboard.clientTimezone}: {nearestLeadDisplay?.clientTimeZone}
                        {nearestLeadDisplay?.showClientReference ? ` | ${nearestLeadDisplay.clientDateTime}` : ''}
                      </p>
                      <p className="mt-2 text-sm text-fg-muted">Starts in {formatDistanceToNow(new Date(activeTask.due_at || nearestLead.meeting_timestamp))}</p>
                      <p className="mt-4 line-clamp-6 text-[13px] leading-6 text-fg-muted">{nearestLead.message}</p>
                      <button
                        onClick={() => {
                          closeTaskModal()
                          setSelectedLeadId(nearestLead.id)
                        }}
                        className="mt-4 w-full rounded-2xl bg-fg px-4 py-3 text-[11px] font-semibold tracking-[0.18em] text-bg"
                      >
                        SEE FULL DETAILS
                      </button>
                    </div>

                    <div className="mt-4 grid gap-2">
                      <button
                        onClick={handleSaveTask}
                        disabled={savingTaskId === activeTask.id}
                        className="rounded-2xl bg-accent px-4 py-3 text-[11px] font-semibold tracking-[0.18em] text-white"
                      >
                        {savingTaskId === activeTask.id ? 'SAVING...' : 'SAVE TASK'}
                      </button>
                      <button
                        onClick={() => handleToggleTask(activeTask)}
                        disabled={savingTaskId === activeTask.id}
                        className="rounded-2xl border border-edge bg-white px-4 py-3 text-[11px] font-semibold tracking-[0.18em] text-fg"
                      >
                        MARK COMPLETE
                      </button>
                      <button
                        onClick={() => handleDeleteTask(activeTask.id)}
                        disabled={savingTaskId === activeTask.id}
                        className="rounded-2xl border border-edge bg-white px-4 py-3 text-[11px] font-semibold tracking-[0.18em] text-fg-tertiary"
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
    </div>
  )
}
