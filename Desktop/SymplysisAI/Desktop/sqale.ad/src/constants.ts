import { ToneStyle, Accent, ScriptLanguage, VoiceOption } from './types'

export const SCRIPT_LANGUAGES: { label: string; value: ScriptLanguage }[] = [
  { label: 'English', value: 'english' },
  { label: 'Arabic', value: 'arabic' },
  { label: 'French', value: 'french' },
  { label: 'Spanish', value: 'spanish' }
]

export const TONE_STYLES: { label: string; value: ToneStyle }[] = [
  { label: 'Energetic', value: 'Energetic' },
  { label: 'Commercial', value: 'Commercial' },
  { label: 'Funny', value: 'Funny' },
  { label: 'Warm', value: 'Warm' },
  { label: 'Serious', value: 'Serious' },
  { label: 'Luxury', value: 'Luxury' }
]

export const ARABIC_ACCENT_OPTIONS: { label: string; value: Accent }[] = [
  { label: 'Classical Arabic', value: 'Classical Arabic' },
  { label: 'Algerian', value: 'Algerian' },
  { label: 'Moroccan', value: 'Moroccan' },
  { label: 'Libyan', value: 'Libyan' },
  { label: 'Tunisian', value: 'Tunisian' },
  { label: 'Egyptian', value: 'Egyptian' },
  { label: 'Saudi', value: 'Saudi' },
  { label: 'Iraqi', value: 'Iraqi' },
  { label: 'Kuwaiti', value: 'Kuwaiti' },
  { label: 'UAE', value: 'UAE' }
]

export const ENGLISH_ACCENT_OPTIONS: { label: string; value: Accent }[] = [
  { label: 'United States (English)', value: 'United States (English)' },
  { label: 'United Kingdom (English)', value: 'United Kingdom (English)' },
  { label: 'Australia (English)', value: 'Australia (English)' }
]

export const FRENCH_ACCENT_OPTIONS: { label: string; value: Accent }[] = [
  { label: 'France (French)', value: 'France (French)' },
  { label: 'Canada (French)', value: 'Canada (French)' }
]

export const SPANISH_ACCENT_OPTIONS: { label: string; value: Accent }[] = [
  { label: 'Spain (Spanish)', value: 'Spain (Spanish)' },
  { label: 'Mexico (Spanish)', value: 'Mexico (Spanish)' }
]

export const ALL_ACCENT_OPTIONS: { label: string; value: Accent }[] = [
  ...ARABIC_ACCENT_OPTIONS,
  ...ENGLISH_ACCENT_OPTIONS,
  ...FRENCH_ACCENT_OPTIONS,
  ...SPANISH_ACCENT_OPTIONS
]

export const VOICE_OPTIONS: VoiceOption[] = [
  { label: 'Zephyr', value: 'Zephyr' },
  { label: 'Kore', value: 'Kore' },
  { label: 'Puck', value: 'Puck' },
  { label: 'Aoede', value: 'Aoede' },
  { label: 'Charon', value: 'Charon' },
  { label: 'Fenrir', value: 'Fenrir' },
  { label: 'Achernar', value: 'Achernar' },
  { label: 'Achird', value: 'Achird' },
  { label: 'Algenib', value: 'Algenib' },
  { label: 'Algieba', value: 'Algieba' },
  { label: 'Alnilam', value: 'Alnilam' },
  { label: 'Autonoe', value: 'Autonoe' },
  { label: 'Callirrhoe', value: 'Callirrhoe' },
  { label: 'Despina', value: 'Despina' },
  { label: 'Enceladus', value: 'Enceladus' },
  { label: 'Erinome', value: 'Erinome' },
  { label: 'Gacrux', value: 'Gacrux' },
  { label: 'Iapetus', value: 'Iapetus' },
  { label: 'Laomedeia', value: 'Laomedeia' },
  { label: 'Leda', value: 'Leda' },
  { label: 'Orus', value: 'Orus' },
  { label: 'Pulcherrima', value: 'Pulcherrima' },
  { label: 'Rasalgethi', value: 'Rasalgethi' },
  { label: 'Sadachbia', value: 'Sadachbia' },
  { label: 'Sadaltager', value: 'Sadaltager' },
  { label: 'Schedar', value: 'Schedar' },
  { label: 'Sulafat', value: 'Sulafat' },
  { label: 'Umbriel', value: 'Umbriel' },
  { label: 'Vindemiatrix', value: 'Vindemiatrix' },
  { label: 'Zubenelgenubi', value: 'Zubenelgenubi' }
]
