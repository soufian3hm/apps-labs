import { supabase } from '../lib/supabase'

const POSTER_BUCKET_NAME = 'poster-images'
const VOICEOVER_BUCKET_NAME = 'voiceovers'
const SUPPORT_BUCKET_NAME = 'support-attachments'
const LANDING_PAGE_IMAGES_BUCKET_NAME = 'landing-page-images'

export interface UploadImageResult {
  success: boolean
  storagePath?: string
  publicUrl?: string
  error?: string
}

export class StorageService {
  /**
   * Upload a base64 image to Supabase Storage
   * @param base64DataUrl - Base64 data URL (e.g., "data:image/png;base64,...")
   * @param userId - User ID for folder organization
   * @returns Storage path and public URL
   */
  static async uploadPosterImage(
    base64DataUrl: string,
    userId: string
  ): Promise<UploadImageResult> {
    try {
      console.log('📦 [uploadPosterImage] Input base64DataUrl length:', base64DataUrl.length)
      console.log('📦 [uploadPosterImage] First 200 chars:', base64DataUrl.substring(0, 200))
      
      // Extract base64 data and mime type
      const matches = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/)
      if (!matches) {
        console.error('❌ [uploadPosterImage] Invalid base64 format, no matches')
        return {
          success: false,
          error: 'Invalid base64 data URL format'
        }
      }

      let mimeType = matches[1]
      const base64Data = matches[2]

      console.log('✅ [uploadPosterImage] Extracted MIME type:', mimeType)
      
      // FORCE image MIME type if it's not already an image
      if (!mimeType.startsWith('image/')) {
        console.warn('⚠️ [uploadPosterImage] Invalid MIME type detected, forcing to image/png')
        mimeType = 'image/png'
      }
      
      console.log('✅ [uploadPosterImage] Final MIME type:', mimeType)
      console.log('✅ [uploadPosterImage] Base64 data length:', base64Data.length)

      // Convert base64 to blob
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      
      // Verify PNG signature (first 8 bytes should be PNG header)
      const isPNG = byteArray.length >= 8 &&
        byteArray[0] === 0x89 && byteArray[1] === 0x50 &&
        byteArray[2] === 0x4E && byteArray[3] === 0x47
      
      console.log('🔍 [uploadPosterImage] PNG signature check:', isPNG)
      console.log('🔍 [uploadPosterImage] First 16 bytes:', Array.from(byteArray.slice(0, 16)))
      
      // Force mimeType to image/png for PNG signatures
      if (isPNG) {
        mimeType = 'image/png'
      }
      
      // Generate unique filename FIRST
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 15)
      const extension = mimeType.split('/')[1] || 'png'
      const filename = `${timestamp}-${random}.${extension}`

      // Upload to storage: {userId}/{filename}
      const storagePath = `${userId}/${filename}`

      console.log('📤 [uploadPosterImage] About to upload:', {
        storagePath,
        byteArraySize: byteArray.length,
        mimeType: mimeType,
        fileName: filename
      })
      
      // Upload Uint8Array directly to prevent FormData wrapping
      const { data, error } = await supabase.storage
        .from(POSTER_BUCKET_NAME)
        .upload(storagePath, byteArray, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ [StorageService] Upload error:', error)
        return {
          success: false,
          error: error.message
        }
      }

      console.log('✅ [uploadPosterImage] Upload successful, response data:', data)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(POSTER_BUCKET_NAME)
        .getPublicUrl(storagePath)

      console.log('✅ [uploadPosterImage] Public URL generated:', urlData.publicUrl)
      
      console.log('🔍 [uploadPosterImage] Original byte array size:', byteArray.length)
      console.log('🔍 [uploadPosterImage] Uploaded file should be:', storagePath)
      
      // Verify upload by fetching immediately
      console.log('🔍 [uploadPosterImage] Starting verification download...')
      try {
        const response = await fetch(urlData.publicUrl, { cache: 'no-cache' })
        console.log('🔍 [uploadPosterImage] Download response status:', response.status)
        console.log('🔍 [uploadPosterImage] Download response headers:', {
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length')
        })
        
        const downloadedBlob = await response.blob()
        const downloadedBuffer = await downloadedBlob.arrayBuffer()
        const downloadedArray = new Uint8Array(downloadedBuffer)
        
        console.log('🔍 [uploadPosterImage] Downloaded first 16 bytes:', Array.from(downloadedArray.slice(0, 16)))
        console.log('🔍 [uploadPosterImage] Downloaded last 16 bytes:', Array.from(downloadedArray.slice(-16)))
        console.log('🔍 [uploadPosterImage] Downloaded size:', downloadedArray.length)
        console.log('🔍 [uploadPosterImage] Original size:', byteArray.length)
        console.log('🔍 [uploadPosterImage] Size match:', downloadedArray.length === byteArray.length)
        
        // Compare first and last bytes
        const firstMatch = downloadedArray[0] === byteArray[0] && 
                          downloadedArray[1] === byteArray[1] &&
                          downloadedArray[2] === byteArray[2]
        console.log('🔍 [uploadPosterImage] First bytes match:', firstMatch)
      } catch (verifyError) {
        console.error('❌ [uploadPosterImage] Verification failed:', verifyError)
      }

      return {
        success: true,
        storagePath: data.path,
        publicUrl: urlData.publicUrl
      }
    } catch (error) {
      console.error('❌ [StorageService] Upload failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Upload support attachment image to Supabase Storage
   * @param base64DataUrl - Base64 data URL (e.g., "data:image/png;base64,...")
   * @param storagePath - Full storage path (e.g., "userId/chatId/filename")
   * @returns Storage path and public URL
   */
  static async uploadSupportImage(
    base64DataUrl: string,
    storagePath: string
  ): Promise<UploadImageResult> {
    try {
      console.log('🚀 [StorageService] Starting support image upload')
      console.log('📍 Storage path:', storagePath)
      console.log('📦 Base64 length:', base64DataUrl.length)
      console.log('📦 Base64 preview (first 100 chars):', base64DataUrl.substring(0, 100))

      // Extract base64 data and mime type
      const matches = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/)
      if (!matches) {
        console.error('❌ [StorageService] Invalid base64 format')
        return {
          success: false,
          error: 'Invalid base64 data URL format'
        }
      }

      let mimeType = matches[1]
      const base64Data = matches[2]

      console.log('✅ [StorageService] Extracted MIME type:', mimeType)
      
      // FORCE image MIME type if it's not already an image
      if (!mimeType.startsWith('image/')) {
        console.warn('⚠️ [StorageService] Invalid MIME type detected, forcing to image/png')
        mimeType = 'image/png'
      }
      
      console.log('✅ [StorageService] Final MIME type:', mimeType)
      console.log('✅ [StorageService] Base64 data length:', base64Data.length)

      // Convert base64 to blob
      console.log('🔄 [StorageService] Converting base64 to blob...')
      const byteCharacters = atob(base64Data)
      console.log('✅ [StorageService] Decoded byte characters length:', byteCharacters.length)
      
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      console.log('✅ [StorageService] Byte array created, length:', byteArray.length)
      
      console.log('📤 [StorageService] Uploading to Supabase...')
      
      // Upload Uint8Array directly to prevent FormData wrapping
      const { data, error } = await supabase.storage
        .from(SUPPORT_BUCKET_NAME)
        .upload(storagePath, byteArray, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ [StorageService] Upload error:', error)
        return {
          success: false,
          error: error.message
        }
      }

      console.log('✅ [StorageService] Upload successful, data:', data)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(SUPPORT_BUCKET_NAME)
        .getPublicUrl(storagePath)

      console.log('✅ [StorageService] Public URL generated:', urlData.publicUrl)

      return {
        success: true,
        storagePath: data.path,
        publicUrl: urlData.publicUrl
      }
    } catch (error) {
      console.error('❌ [StorageService] Upload failed with exception:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get MIME type from file extension
   */
  private static getMimeTypeFromExtension(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || ''
    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'bmp': 'image/bmp',
      'ico': 'image/x-icon'
    }
    return mimeTypes[extension] || 'image/jpeg'
  }

  /**
   * Upload landing page image to Supabase Storage (filtered by user ID)
   * Uses the same approach as uploadPosterImage - converts File to Uint8Array
   * @param file - File object from input
   * @param userId - User ID for folder organization
   * @returns Storage path and public URL
   */
  static async uploadLandingPageImage(
    file: File,
    userId: string
  ): Promise<UploadImageResult> {
    try {
      console.log('📤 [uploadLandingPageImage] Starting upload')
      console.log('📦 File name:', file.name)
      console.log('📦 File size:', file.size)
      console.log('📦 File type (original):', file.type)
      
      // Detect MIME type - use file.type if available, otherwise detect from extension
      let mimeType = file.type
      if (!mimeType || !mimeType.startsWith('image/')) {
        mimeType = this.getMimeTypeFromExtension(file.name)
        console.log('📦 File type (detected from extension):', mimeType)
      }
      
      // Validate that we have a valid image MIME type
      if (!mimeType.startsWith('image/')) {
        return {
          success: false,
          error: 'File must be an image (JPEG, PNG, GIF, WebP, or SVG)'
        }
      }
      
      // Convert File to ArrayBuffer, then to Uint8Array (exactly like uploadPosterImage)
      const arrayBuffer = await file.arrayBuffer()
      const byteArray = new Uint8Array(arrayBuffer)
      
      console.log('✅ [uploadLandingPageImage] Converted to Uint8Array, size:', byteArray.length)
      console.log('✅ [uploadLandingPageImage] MIME type:', mimeType)
      
      // Generate unique filename
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 15)
      const extension = mimeType.split('/')[1] || 'jpg'
      const filename = `${timestamp}-${random}.${extension}`
      
      // Upload to storage: {userId}/{filename}
      const storagePath = `${userId}/${filename}`
      
      console.log('📤 [uploadLandingPageImage] Uploading to:', storagePath)
      console.log('📤 [uploadLandingPageImage] Content-Type:', mimeType)
      
      // Upload Uint8Array directly (same approach as uploadPosterImage - prevents corruption)
      const { data, error } = await supabase.storage
        .from(LANDING_PAGE_IMAGES_BUCKET_NAME)
        .upload(storagePath, byteArray, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) {
        console.error('❌ [uploadLandingPageImage] Upload error:', error)
        return {
          success: false,
          error: error.message
        }
      }
      
      console.log('✅ [uploadLandingPageImage] Upload successful')
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(LANDING_PAGE_IMAGES_BUCKET_NAME)
        .getPublicUrl(storagePath)
      
      console.log('✅ [uploadLandingPageImage] Public URL:', urlData.publicUrl)
      
      return {
        success: true,
        storagePath: data.path,
        publicUrl: urlData.publicUrl
      }
    } catch (error) {
      console.error('❌ [uploadLandingPageImage] Upload failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get public URL from storage path
   * @param storagePath - Path in storage bucket
   * @returns Public URL
   */
  static getPublicUrl(storagePath: string, bucketName: string = POSTER_BUCKET_NAME): string {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath)
    
    return data.publicUrl
  }

  /**
   * Get public URL for voiceover
   * @param storagePath - Path in voiceovers bucket
   * @returns Public URL
   */
  static getVoiceoverUrl(storagePath: string): string {
    return this.getPublicUrl(storagePath, VOICEOVER_BUCKET_NAME)
  }

  /**
   * Delete image from storage
   * @param storagePath - Path in storage bucket
   * @returns Success status
   */
  static async deleteImage(storagePath: string, bucketName: string = POSTER_BUCKET_NAME): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([storagePath])

      if (error) {
        console.error('❌ [StorageService] Delete error:', error)
        return false
      }

      console.log('✅ [StorageService] Image deleted:', storagePath)
      return true
    } catch (error) {
      console.error('❌ [StorageService] Delete failed:', error)
      return false
    }
  }

  /**
   * Batch delete images from storage
   * @param storagePaths - Array of storage paths
   * @returns Success status
   */
  static async deleteImages(storagePaths: string[], bucketName: string = POSTER_BUCKET_NAME): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove(storagePaths)

      if (error) {
        console.error('❌ [StorageService] Batch delete error:', error)
        return false
      }

      console.log('✅ [StorageService] Batch deleted:', storagePaths.length, 'images')
      return true
    } catch (error) {
      console.error('❌ [StorageService] Batch delete failed:', error)
      return false
    }
  }

  /**
   * Upload audio file to Supabase Storage (for voiceovers)
   * @param base64Audio - Base64 PCM audio data (will be converted to WAV)
   * @param userId - User ID for folder organization
   * @param format - Audio format (e.g., 'mp3', 'wav') - defaults to 'wav'
   * @returns Storage path
   */
  static async uploadVoiceover(
    base64Audio: string,
    userId: string,
    format: string = 'wav'
  ): Promise<UploadImageResult> {
    try {
      // Validate input is not JSON or invalid data
      if (!base64Audio || typeof base64Audio !== 'string') {
        throw new Error('Invalid audio data: must be a base64 string')
      }

      // Check if it looks like JSON (starts with { or [)
      const trimmed = base64Audio.trim()
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        console.error('❌ [StorageService] Received JSON instead of audio data:', trimmed.substring(0, 200))
        throw new Error('Received JSON instead of audio data. Audio generation may have failed.')
      }

      // Validate it's base64 format
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
      if (!base64Regex.test(base64Audio)) {
        console.error('❌ [StorageService] Invalid base64 format:', base64Audio.substring(0, 200))
        throw new Error('Audio data is not valid base64 format')
      }

      // Decode base64 audio data
      let byteCharacters: string
      try {
        byteCharacters = atob(base64Audio)
      } catch (e) {
        console.error('❌ [StorageService] Failed to decode base64:', e)
        throw new Error('Failed to decode base64 audio data')
      }

      if (byteCharacters.length === 0) {
        throw new Error('Decoded audio data is empty')
      }

      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const rawData = new Uint8Array(byteNumbers)
      
      // Check if data already has valid WAV header (RIFF at start and WAVE at offset 8)
      const hasRIFF = rawData.length >= 4 && 
                      String.fromCharCode(rawData[0], rawData[1], rawData[2], rawData[3]) === 'RIFF'
      const hasWAVE = rawData.length >= 12 && 
                      String.fromCharCode(rawData[8], rawData[9], rawData[10], rawData[11]) === 'WAVE'
      const isAlreadyWAV = hasRIFF && hasWAVE
      
      let wavData: Uint8Array
      if (isAlreadyWAV) {
        console.log('✅ [StorageService] Audio already in WAV format, validating structure...')
        // Validate it's a complete WAV file by checking for 'data' chunk at offset 36
        const dataChunkStart = 36
        const hasDataChunk = rawData.length >= dataChunkStart + 8 &&
                            String.fromCharCode(
                              rawData[dataChunkStart], 
                              rawData[dataChunkStart + 1], 
                              rawData[dataChunkStart + 2], 
                              rawData[dataChunkStart + 3]
                            ) === 'data'
        
        if (!hasDataChunk) {
          console.warn('⚠️ [StorageService] WAV file missing data chunk, re-encoding...')
          // Extract PCM data (usually starts at byte 44 after RIFF header)
          const pcmStart = rawData.length > 44 ? 44 : rawData.length
          const pcmData = rawData.slice(pcmStart)
          if (pcmData.length === 0) {
            throw new Error('No PCM data found in WAV file')
          }
          wavData = this.convertPCMToWAV(pcmData)
        } else {
          // Verify minimum WAV file size (44 bytes header + some data)
          if (rawData.length < 44) {
            console.warn('⚠️ [StorageService] WAV file too small, re-encoding...')
            wavData = this.convertPCMToWAV(rawData.slice(44))
          } else {
            // Use existing WAV file as-is
            wavData = rawData
            console.log('✅ [StorageService] Using existing WAV file, size:', wavData.length, 'bytes')
          }
        }
      } else {
        // Convert PCM to WAV format (assuming raw PCM data)
        console.log('🔄 [StorageService] Converting PCM to WAV format, input size:', rawData.length, 'bytes')
        wavData = this.convertPCMToWAV(rawData)
      }
      
      // Final validation: ensure WAV file has proper structure
      if (wavData.length < 44) {
        throw new Error(`WAV file is too small: ${wavData.length} bytes (minimum 44 bytes)`)
      }
      
      const riffHeader = String.fromCharCode(wavData[0], wavData[1], wavData[2], wavData[3])
      const waveHeader = wavData.length >= 12 ? String.fromCharCode(wavData[8], wavData[9], wavData[10], wavData[11]) : ''
      
      if (riffHeader !== 'RIFF' || waveHeader !== 'WAVE') {
        console.error('❌ [StorageService] Generated WAV file is invalid, re-encoding from raw data...')
        // If validation fails, re-encode from the original raw data
        wavData = this.convertPCMToWAV(rawData)
        
        // Verify again after re-encoding
        const finalRiff = String.fromCharCode(wavData[0], wavData[1], wavData[2], wavData[3])
        const finalWave = String.fromCharCode(wavData[8], wavData[9], wavData[10], wavData[11])
        if (finalRiff !== 'RIFF' || finalWave !== 'WAVE') {
          throw new Error('Failed to create valid WAV file after re-encoding')
        }
      }
      
      const mimeType = format === 'wav' ? 'audio/wav' : 'audio/mpeg'
      
      // Final header verification before blob creation
      const finalRiffCheck = String.fromCharCode(wavData[0], wavData[1], wavData[2], wavData[3])
      const finalWaveCheck = String.fromCharCode(wavData[8], wavData[9], wavData[10], wavData[11])
      
      if (finalRiffCheck !== 'RIFF' || finalWaveCheck !== 'WAVE') {
        throw new Error('Invalid WAV file structure - missing RIFF/WAVE headers after encoding')
      }
      
      const blob = new Blob([wavData as BlobPart], { type: mimeType })
      
      // Validate blob is not empty
      if (blob.size === 0) {
        throw new Error('Generated audio blob is empty')
      }
      
      // Validate blob size matches array size
      if (blob.size !== wavData.length) {
        console.warn('⚠️ [StorageService] Blob size mismatch:', blob.size, 'vs', wavData.length)
      }
      
      console.log('✅ [StorageService] Created valid WAV blob, size:', blob.size, 'bytes, type:', mimeType)
      console.log('✅ [StorageService] WAV header verified - RIFF:', finalRiffCheck, 'WAVE:', finalWaveCheck)

      // Generate unique filename
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 15)
      const filename = `${timestamp}-${random}.${format}`

      // Upload to storage: {userId}/{filename}
      const storagePath = `${userId}/${filename}`

      // Create proper Blob for audio (per Supabase docs)
      const audioBlob = new Blob([wavData as BlobPart], { type: mimeType })
      
      console.log('📤 [uploadVoiceover] Uploading WAV as Blob:', {
        storagePath,
        blobSize: audioBlob.size,
        blobType: audioBlob.type
      })

      // Upload Blob directly (per Supabase audio upload docs)
      const { data, error } = await supabase.storage
        .from(VOICEOVER_BUCKET_NAME)
        .upload(storagePath, audioBlob, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ [StorageService] Voiceover upload error:', error)
        return {
          success: false,
          error: error.message
        }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(VOICEOVER_BUCKET_NAME)
        .getPublicUrl(storagePath)

      console.log('✅ [StorageService] Voiceover uploaded:', storagePath)

      return {
        success: true,
        storagePath: data.path,
        publicUrl: urlData.publicUrl
      }
    } catch (error) {
      console.error('❌ [StorageService] Voiceover upload failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Upload a Blob directly to Supabase Storage (for voiceovers)
   * @param blob - Audio blob to upload
   * @param userId - User ID for folder organization
   * @param format - Audio format (e.g., 'wav', 'mp3') - defaults to 'wav'
   * @returns Storage path and public URL
   */
  static async uploadVoiceoverBlob(
    blob: Blob,
    userId: string,
    format: string = 'wav'
  ): Promise<UploadImageResult> {
    try {
      console.log('🎵 [uploadVoiceoverBlob] Starting upload:', {
        blobSize: blob.size,
        blobType: blob.type
      })

      // Validate blob is not empty
      if (blob.size === 0) {
        throw new Error('Audio blob is empty')
      }

      const mimeType = format === 'wav' ? 'audio/wav' : 'audio/mpeg'
      
      // Convert blob to ArrayBuffer/Uint8Array to avoid multipart form data wrapping
      // Supabase can wrap Blobs in multipart forms, corrupting the file
      // Uploading as Uint8Array ensures raw binary data is stored correctly
      const arrayBuffer = await blob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      // Validate WAV structure if format is wav
      if (format === 'wav') {
        // Check for WAV header (RIFF...WAVE)
        if (uint8Array.length < 12) {
          throw new Error(`Audio file too small: ${uint8Array.length} bytes (minimum 12 bytes for WAV header)`)
        }
        
        const riffHeader = String.fromCharCode(uint8Array[0], uint8Array[1], uint8Array[2], uint8Array[3])
        const waveHeader = String.fromCharCode(uint8Array[8], uint8Array[9], uint8Array[10], uint8Array[11])
        
        if (riffHeader !== 'RIFF' || waveHeader !== 'WAVE') {
          console.error('❌ [uploadVoiceoverBlob] Invalid WAV structure:', { 
            riffHeader, 
            waveHeader,
            firstBytes: Array.from(uint8Array.slice(0, 16))
          })
          throw new Error('Invalid WAV file structure - missing RIFF/WAVE headers')
        }
        
        console.log('✅ [uploadVoiceoverBlob] WAV structure validated:', {
          size: uint8Array.length,
          riffHeader,
          waveHeader
        })
      }

      // Generate unique filename
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 15)
      const filename = `${timestamp}-${random}.${format}`
      const storagePath = `${userId}/${filename}`
      
      console.log('📤 [uploadVoiceoverBlob] Uploading as Uint8Array (raw binary):', {
        storagePath,
        dataSize: uint8Array.length,
        mimeType,
        format,
        originalBlobType: blob.type
      })

      // Upload as Uint8Array (raw binary) instead of Blob to prevent multipart form wrapping
      // This ensures the file is stored exactly as binary data without any form boundaries
      const { data, error } = await supabase.storage
        .from(VOICEOVER_BUCKET_NAME)
        .upload(storagePath, uint8Array, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ [uploadVoiceoverBlob] Upload error:', error)
        return {
          success: false,
          error: error.message
        }
      }

      console.log('✅ [uploadVoiceoverBlob] Upload successful:', storagePath)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(VOICEOVER_BUCKET_NAME)
        .getPublicUrl(storagePath)

      return {
        success: true,
        storagePath: data.path,
        publicUrl: urlData.publicUrl
      }
    } catch (error) {
      console.error('❌ [uploadVoiceoverBlob] Upload failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Convert PCM audio data to WAV format
   * @param pcmData - Raw PCM audio data
   * @param sampleRate - Sample rate (default: 24000)
   * @param numChannels - Number of channels (default: 1)
   * @returns WAV file as Uint8Array
   */
  private static convertPCMToWAV(
    pcmData: Uint8Array,
    sampleRate: number = 24000,
    numChannels: number = 1
  ): Uint8Array {
    const bytesPerSample = 2 // 16-bit
    const dataLength = pcmData.length
    const buffer = new ArrayBuffer(44 + dataLength)
    const view = new DataView(buffer)

    // Write WAV header
    // "RIFF" chunk descriptor
    this.writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + dataLength, true) // File size - 8
    this.writeString(view, 8, 'WAVE')

    // "fmt " sub-chunk
    this.writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true) // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true) // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true) // NumChannels
    view.setUint32(24, sampleRate, true) // SampleRate
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true) // ByteRate
    view.setUint16(32, numChannels * bytesPerSample, true) // BlockAlign
    view.setUint16(34, bytesPerSample * 8, true) // BitsPerSample

    // "data" sub-chunk
    this.writeString(view, 36, 'data')
    view.setUint32(40, dataLength, true) // Subchunk2Size

    // Write PCM samples
    const uint8 = new Uint8Array(buffer)
    uint8.set(pcmData, 44)

    return uint8
  }

  /**
   * Helper function to write string to DataView
   */
  private static writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
}
