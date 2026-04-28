import { supabase } from '../lib/supabase'

export interface SupportExecutive {
  id: string
  user_id: string
  name: string
  role: string
  working_hours: string
  email: string
  whatsapp?: string
  telegram?: string
  wechat?: string
  profile_image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export class SupportService {
  static async getSupportExecutives(userId: string): Promise<SupportExecutive[]> {
    try {
      const { data, error } = await supabase
        .from('support_executives')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching support executives:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getSupportExecutives:', error)
      throw error
    }
  }

  static async getSupportExecutive(userId: string, executiveId: string): Promise<SupportExecutive | null> {
    try {
      const { data, error } = await supabase
        .from('support_executives')
        .select('*')
        .eq('user_id', userId)
        .eq('id', executiveId)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching support executive:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in getSupportExecutive:', error)
      throw error
    }
  }

  static async createSupportExecutive(executiveData: Omit<SupportExecutive, 'id' | 'created_at' | 'updated_at'>): Promise<SupportExecutive> {
    try {
      const { data, error } = await supabase
        .from('support_executives')
        .insert([executiveData])
        .select()
        .single()

      if (error) {
        console.error('Error creating support executive:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in createSupportExecutive:', error)
      throw error
    }
  }

  static async updateSupportExecutive(
    userId: string, 
    executiveId: string, 
    updates: Partial<Omit<SupportExecutive, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<SupportExecutive> {
    try {
      const { data, error } = await supabase
        .from('support_executives')
        .update(updates)
        .eq('user_id', userId)
        .eq('id', executiveId)
        .select()
        .single()

      if (error) {
        console.error('Error updating support executive:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateSupportExecutive:', error)
      throw error
    }
  }

  static async deleteSupportExecutive(userId: string, executiveId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('support_executives')
        .delete()
        .eq('user_id', userId)
        .eq('id', executiveId)

      if (error) {
        console.error('Error deleting support executive:', error)
        throw error
      }
    } catch (error) {
      console.error('Error in deleteSupportExecutive:', error)
      throw error
    }
  }

  static async deactivateSupportExecutive(userId: string, executiveId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('support_executives')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('id', executiveId)

      if (error) {
        console.error('Error deactivating support executive:', error)
        throw error
      }
    } catch (error) {
      console.error('Error in deactivateSupportExecutive:', error)
      throw error
    }
  }
}
