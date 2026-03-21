'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/en/admin')
}

export async function submitLead(formData: FormData) {
  const supabase = await createClient()
  
  // Actually we need to do this from the contact.tsx component without form action, but an API or server action is fine.
  // Wait, I am building the lead submission API
}
