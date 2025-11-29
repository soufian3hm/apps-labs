export class SeeDreamService {
  private apiKey: string
  private baseUrl: string = 'https://api.piapi.ai/api/v1/task'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateImage(prompt: string, options?: {
    model?: string
    width?: number
    height?: number
    steps?: number
    guidance?: number
  }): Promise<{ imageUrl: string; taskId: string }> {
    try {
      const requestBody = {
        model: 'seedream',
        task_type: 'seedream_4',
        input: {
          prompt: prompt,
          width: options?.width || 1024,
          height: options?.height || 1024,
          image_num: 1,
          steps: options?.steps || 30,
          guidance_scale: options?.guidance || 7.5
        }
      }
      
      console.log('SeeDream API Request:', {
        url: this.baseUrl,
        apiKey: this.apiKey.substring(0, 8) + '...',
        body: requestBody
      })
      
      // Create generation task
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`SeeDream API error: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      console.log('SeeDream API response:', data)
      
      // Check for task_id in response
      if (data.data && data.data.task_id) {
        const result = await this.pollForResult(data.data.task_id)
        return {
          imageUrl: result.output.image_url,
          taskId: data.data.task_id
        }
      }

      throw new Error('Unexpected API response format')
    } catch (error) {
      console.error('SeeDream generation error:', error)
      throw error
    }
  }

  private async pollForResult(taskId: string, maxAttempts: number = 60): Promise<any> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, {
          headers: {
            'x-api-key': this.apiKey
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to poll task: ${response.status}`)
        }

        const data = await response.json()
        console.log(`Poll attempt ${attempt + 1}:`, data.data?.status)

        if (data.data?.status === 'completed' && data.data?.output?.image_url) {
          return data.data
        }

        if (data.data?.status === 'failed') {
          throw new Error('Image generation failed')
        }

        // Wait 3 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 3000))
      } catch (error) {
        console.error(`Polling attempt ${attempt + 1} failed:`, error)
        if (attempt === maxAttempts - 1) throw error
      }
    }

    throw new Error('Polling timeout: Image generation took too long')
  }

  async generateMultipleImages(
    prompt: string, 
    count: number,
    options?: {
      model?: string
      width?: number
      height?: number
      steps?: number
      guidance?: number
    }
  ): Promise<Array<{ imageUrl: string; taskId: string }>> {
    const promises = Array.from({ length: count }, () => 
      this.generateImage(prompt, options)
    )

    try {
      const results = await Promise.all(promises)
      return results
    } catch (error) {
      console.error('Batch generation error:', error)
      throw error
    }
  }
}

export default SeeDreamService
