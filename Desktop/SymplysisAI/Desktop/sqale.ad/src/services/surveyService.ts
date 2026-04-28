import { supabase } from '../lib/supabase'

export interface UserSurvey {
  id: string
  user_id: string
  
  // Company Address Information
  street_address?: string
  city?: string
  state_province?: string
  postal_code?: string
  country?: string
  
  // Survey Questions
  user_type?: string
  user_type_other?: string
  current_platforms?: string[]
  current_platforms_other?: string
  monthly_ad_spend?: string
  main_goal?: string[]
  main_goal_other?: string
  manages_ads_for?: string
  
  setup_completed: boolean
  created_at: string
  updated_at: string
}

export interface SurveyFormData {
  // Company Address Information
  street_address?: string
  city?: string
  state_province?: string
  postal_code?: string
  country?: string
  
  // Survey Questions
  user_type?: string
  user_type_other?: string
  current_platforms?: string[]
  current_platforms_other?: string
  monthly_ad_spend?: string
  main_goal?: string[]
  main_goal_other?: string
  manages_ads_for?: string
}

export class SurveyService {
  static async saveSurveyData(userId: string, surveyData: SurveyFormData): Promise<UserSurvey> {
    try {
      const { data, error } = await supabase
        .from('user_survey')
        .upsert({
          user_id: userId,
          ...surveyData,
          setup_completed: true
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving survey data:', error)
      throw error
    }
  }

  static async getSurveyData(userId: string): Promise<UserSurvey | null> {
    try {
      const { data, error } = await supabase
        .from('user_survey')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error fetching survey data:', error)
      return null
    }
  }

  static async isSetupCompleted(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_survey')
        .select('setup_completed')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data?.setup_completed || false
    } catch (error) {
      console.error('Error checking setup status:', error)
      return false
    }
  }

  static async updateUserProfileFromSurvey(userId: string, surveyData: SurveyFormData): Promise<void> {
    try {
      // Update user_profiles table with survey data
      const profileUpdates: any = {}
      
      if (surveyData.street_address) {
        profileUpdates.street_address = surveyData.street_address
      }
      if (surveyData.city) {
        profileUpdates.city = surveyData.city
      }
      if (surveyData.state_province) {
        profileUpdates.state_province = surveyData.state_province
      }
      if (surveyData.postal_code) {
        profileUpdates.postal_code = surveyData.postal_code
      }
      if (surveyData.country) {
        profileUpdates.country = surveyData.country
      }

      if (Object.keys(profileUpdates).length > 0) {
        const { error } = await supabase
          .from('user_profiles')
          .update(profileUpdates)
          .eq('user_id', userId)

        if (error) throw error
      }
    } catch (error) {
      console.error('Error updating user profile from survey:', error)
      throw error
    }
  }
}
