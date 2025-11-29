export type ToneStyle = 'Energetic' | 'Commercial' | 'Funny' | 'Warm' | 'Serious' | 'Luxury'

export type Accent = 
  | 'Classical Arabic'
  | 'Libyan'
  | 'Algerian'
  | 'Tunisian'
  | 'Egyptian'
  | 'Saudi'
  | 'Iraqi'
  | 'Kuwaiti'
  | 'UAE'
  | 'Moroccan'
  | 'United States (English)'
  | 'United Kingdom (English)'
  | 'Australia (English)'
  | 'France (French)'
  | 'Canada (French)'
  | 'Spain (Spanish)'
  | 'Mexico (Spanish)'

export type ScriptLanguage = 'arabic' | 'english' | 'french' | 'spanish'

export interface FormData {
  scriptLanguage: ScriptLanguage
  productName: string
  targetAudience: string
  productFunction: string
  keyBenefits: string
  toneStyle: ToneStyle
  accent: Accent
  optionalCta: string
}

export interface VoiceOption {
  label: string
  value: string
}

export interface CustomFormState {
  toneStyle: ToneStyle
  accent: Accent
  scriptLanguage?: ScriptLanguage
}
