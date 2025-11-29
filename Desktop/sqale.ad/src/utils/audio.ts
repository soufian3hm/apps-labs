/**
 * Decode base64 string to Uint8Array
 * Custom implementation to adhere to Google GenAI guidelines
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

/**
 * Add WAV header to PCM audio data
 * Converts raw PCM to a valid WAV file format
 */
export function encodeWAV(samples: Uint8Array, sampleRate: number = 24000, numChannels: number = 1): Uint8Array {
  const bytesPerSample = 2 // 16-bit
  const dataLength = samples.length
  const buffer = new ArrayBuffer(44 + dataLength)
  const view = new DataView(buffer)

  // Write WAV header
  // "RIFF" chunk descriptor
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true) // File size - 8
  writeString(view, 8, 'WAVE')

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true) // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true) // NumChannels
  view.setUint32(24, sampleRate, true) // SampleRate
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true) // ByteRate
  view.setUint16(32, numChannels * bytesPerSample, true) // BlockAlign
  view.setUint16(34, bytesPerSample * 8, true) // BitsPerSample

  // "data" sub-chunk
  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true) // Subchunk2Size

  // Write PCM samples
  const uint8 = new Uint8Array(buffer)
  uint8.set(samples, 44)

  return uint8
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

/**
 * Decode raw PCM Uint8Array data into an AudioBuffer
 * Custom implementation for raw PCM data from Gemini TTS
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  // For Gemini TTS, the audio is typically 16-bit PCM
  const audioBuffer = ctx.createBuffer(
    numChannels,
    data.length / 2, // 16-bit = 2 bytes per sample
    sampleRate
  )

  // Convert Uint8Array to Float32Array
  const channelData = audioBuffer.getChannelData(0)
  const view = new DataView(data.buffer)

  for (let i = 0; i < channelData.length; i++) {
    // Read 16-bit signed integer and convert to float (-1.0 to 1.0)
    const int16 = view.getInt16(i * 2, true) // true = little-endian
    channelData[i] = int16 / 32768.0
  }

  return audioBuffer
}

/**
 * Play audio from base64 data using Web Audio API
 */
export async function playAudio(base64Audio: string): Promise<void> {
  try {
    // Initialize AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    const audioContext = new AudioContextClass()

    // Decode base64 to Uint8Array
    const audioData = decode(base64Audio)

    // Decode PCM data to AudioBuffer
    const audioBuffer = await decodeAudioData(audioData, audioContext)

    // Create source and play
    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContext.destination)
    source.start(0)
  } catch (error) {
    console.error('Error playing audio:', error)
    throw error
  }
}
