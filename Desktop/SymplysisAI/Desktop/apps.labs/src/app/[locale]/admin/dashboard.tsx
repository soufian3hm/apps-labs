'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { formatDistanceToNow, format } from 'date-fns'

type Lead = {
  id: string
  name: string
  company: string
  email: string
  whatsapp: string
  budget: string
  project_type: string
  message: string
  meeting_date: string
  meeting_time: string
  meeting_timestamp: string
  status: string
  created_at: string
}

export default function AdminDashboard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [sending, setSending] = useState<string | null>(null)
  
  const supabase = createClient()

  const handleSendReminder = async (leadId: string, email: string) => {
    setSending(leadId)
    try {
      const response = await fetch('/api/email/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, email }),
      })
      
      if (!response.ok) throw new Error('Failed to send reminder')
      
      alert('Reminder sent successfully!')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSending(null)
    }
  }

  return (
    <div className="min-h-screen bg-bg text-fg p-6 lg:p-12">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <form action="/auth/signout" method="post">
            <button className="px-4 py-2 rounded-lg border border-edge bg-surface text-sm font-medium hover:text-accent transition-colors">
              Sign out
            </button>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead) => {
            const meetDate = lead.meeting_timestamp ? new Date(lead.meeting_timestamp) : null
            const isFuture = meetDate ? meetDate > new Date() : false

            return (
              <div key={lead.id} className="rounded-2xl border border-edge bg-surface p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-fg">{lead.name}</h3>
                    <p className="text-sm text-fg-muted">{lead.company || 'No company'}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    lead.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                    lead.status === 'contacted' ? 'bg-blue-500/10 text-blue-600' :
                    lead.status === 'completed' ? 'bg-[#10b981]/10 text-[#10b981]' :
                    'bg-red-500/10 text-red-600'
                  }`}>
                    {lead.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-6 flex-1">
                  <p><span className="font-medium text-fg-muted">Email:</span> <a href={`mailto:${lead.email}`} className="text-accent underline">{lead.email}</a></p>
                  <p><span className="font-medium text-fg-muted">WhatsApp:</span> <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} className="text-accent underline" target="_blank">{lead.whatsapp}</a></p>
                  <p><span className="font-medium text-fg-muted">Budget:</span> {lead.budget}</p>
                  <p><span className="font-medium text-fg-muted">Type:</span> {lead.project_type}</p>
                  
                  <div className="mt-4 pt-4 border-t border-edge">
                    <p className="font-medium text-fg-muted mb-1">Message:</p>
                    <p className="text-fg text-sm italic border-l-2 border-accent pl-3">&quot;{lead.message}&quot;</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-edge">
                    <p className="font-bold text-fg-muted mb-2">Meeting Scheduled</p>
                    <div className="bg-bg rounded-lg p-3 border border-edge">
                      <p className="font-semibold text-accent">{lead.meeting_date} at {lead.meeting_time}</p>
                      {meetDate && (
                        <p className={`text-xs mt-1 font-medium ${isFuture ? 'text-blue-500' : 'text-red-500'}`}>
                          {isFuture ? `In ${formatDistanceToNow(meetDate)}` : `Passed ${formatDistanceToNow(meetDate)} ago`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSendReminder(lead.id, lead.email)}
                  disabled={sending === lead.id}
                  className="w-full mt-auto py-3 bg-fg text-bg font-bold rounded-xl text-sm transition-colors hover:bg-fg/90 disabled:opacity-50"
                >
                  {sending === lead.id ? 'Sending...' : 'Send Reminder Email'}
                </button>
              </div>
            )
          })}
          
          {leads.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-edge rounded-2xl">
              <p className="text-fg-muted font-medium">No leads in the database yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
