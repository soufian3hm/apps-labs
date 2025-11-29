import { supabase } from '../lib/supabase'

export interface TelegramNotificationData {
  platform: string
  accountName: string
  accountId: string
  accountType: string
  timezone: string
  businessManagerIds: string[]
  domains: string[]
  initialTopUp: number
  currency: string
  userEmail: string
  userName?: string
  facebookPages?: Array<{ name: string; url: string }>
  additionalNotes?: string
}

export class TelegramService {
  static async sendAdAccountCreationNotification(data: TelegramNotificationData): Promise<void> {
    try {
      // Use the Edge Function instead of direct Telegram API
      const { error } = await supabase.functions.invoke('telegram-notify', {
        body: { data }
      })

      if (error) {
        console.error('Failed to send Telegram notification via Edge Function:', error)
        // Fallback to direct method if Edge Function fails
        await this.sendDirectMessage(data)
      } else {
        console.log('Telegram notification sent successfully via Edge Function')
      }
    } catch (error) {
      console.error('Failed to send Telegram notification:', error)
      // Fallback to direct method
      await this.sendDirectMessage(data)
    }
  }

  // Fallback method using direct Telegram API (for development/testing)
  private static async sendDirectMessage(data: TelegramNotificationData): Promise<void> {
    const BOT_TOKEN = process.env.REACT_APP_TELEGRAM_BOT_TOKEN
    const CHAT_ID = process.env.REACT_APP_TELEGRAM_CHAT_ID

    if (!BOT_TOKEN || !CHAT_ID) {
      console.warn('Telegram bot token or chat ID not configured for fallback')
      return
    }

    try {
      const message = this.formatAdAccountCreationMessage(data)
      await this.sendMessage(message, BOT_TOKEN, CHAT_ID)
    } catch (error) {
      console.error('Failed to send Telegram notification via fallback:', error)
    }
  }

  private static formatAdAccountCreationMessage(data: TelegramNotificationData): string {
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    let message = `🚀 NEW AD ACCOUNT CREATED

📅 Time: ${timestamp} UTC
👤 User: ${data.userName || 'N/A'} (${data.userEmail})

📋 Account Details:
• Platform: ${data.platform.toUpperCase()}
• Account Name: ${data.accountName}
• Account ID: ${data.accountId}
• Account Type: ${data.accountType}
• Timezone: ${data.timezone}
• Currency: ${data.currency}
• Initial Top-up: $${data.initialTopUp.toFixed(2)} ${data.currency}

`

    if (data.businessManagerIds && data.businessManagerIds.length > 0) {
      message += `🏢 Business Manager IDs:
`
      data.businessManagerIds.forEach((bmId, index) => {
        message += `• ${index + 1}. ${bmId}
`
      })
      message += `
`
    }

    if (data.domains && data.domains.length > 0) {
      message += `🔗 Advertising Links:
`
      data.domains.forEach((domain, index) => {
        message += `• ${index + 1}. ${domain}
`
      })
      message += `
`
    }

    if (data.facebookPages && data.facebookPages.length > 0) {
      message += `📘 Facebook Pages:
`
      data.facebookPages.forEach((page, index) => {
        message += `• ${index + 1}. ${page.name} - ${page.url}
`
      })
      message += `
`
    }

    if (data.additionalNotes) {
      message += `📝 Additional Notes:
${data.additionalNotes}

`
    }

    message += `✅ Status: Pending Review
🆔 Request ID: ${data.accountId}

---
Sqale Ad Account Management System`

    return message
  }

  private static async sendMessage(message: string, botToken: string, chatId: string): Promise<void> {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: true
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Telegram API error: ${errorData.description || response.statusText}`)
    }
  }

  // Method to send simple notifications
  static async sendSimpleNotification(title: string, message: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('telegram-notify', {
        body: { 
          text: `🔔 ${title}\n\n${message}\n\n---\nSqale System`
        }
      })

      if (error) {
        console.error('Failed to send simple notification via Edge Function:', error)
        // Fallback to direct method
        await this.sendDirectSimpleNotification(title, message)
      }
    } catch (error) {
      console.error('Failed to send simple notification:', error)
      await this.sendDirectSimpleNotification(title, message)
    }
  }

  // Method to send error notifications
  static async sendErrorNotification(error: string, context?: string): Promise<void> {
    try {
      const timestamp = new Date().toLocaleString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })

      let message = `❌ SYSTEM ERROR\n\n`
      message += `📅 Time: ${timestamp} UTC\n`
      if (context) {
        message += `📍 Context: ${context}\n`
      }
      message += `🚨 Error: ${error}\n\n`
      message += `---\nSqale System`

      const { error: edgeError } = await supabase.functions.invoke('telegram-notify', {
        body: { text: message }
      })

      if (edgeError) {
        console.error('Failed to send error notification via Edge Function:', edgeError)
        await this.sendDirectErrorNotification(error, context)
      }
    } catch (error) {
      console.error('Failed to send error notification:', error)
      await this.sendDirectErrorNotification(String(error), context)
    }
  }

  // Fallback methods for direct Telegram API
  private static async sendDirectSimpleNotification(title: string, message: string): Promise<void> {
    const BOT_TOKEN = process.env.REACT_APP_TELEGRAM_BOT_TOKEN
    const CHAT_ID = process.env.REACT_APP_TELEGRAM_CHAT_ID

    if (!BOT_TOKEN || !CHAT_ID) {
      console.warn('Telegram bot token or chat ID not configured for fallback')
      return
    }

    try {
      const formattedMessage = `🔔 ${title}\n\n${message}\n\n---\nSqale System`
      await this.sendMessage(formattedMessage, BOT_TOKEN, CHAT_ID)
    } catch (error) {
      console.error('Failed to send simple notification via fallback:', error)
    }
  }

  private static async sendDirectErrorNotification(error: string, context?: string): Promise<void> {
    const BOT_TOKEN = process.env.REACT_APP_TELEGRAM_BOT_TOKEN
    const CHAT_ID = process.env.REACT_APP_TELEGRAM_CHAT_ID

    if (!BOT_TOKEN || !CHAT_ID) {
      console.warn('Telegram bot token or chat ID not configured for fallback')
      return
    }

    try {
      const timestamp = new Date().toLocaleString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })

      let message = `❌ SYSTEM ERROR\n\n`
      message += `📅 Time: ${timestamp} UTC\n`
      if (context) {
        message += `📍 Context: ${context}\n`
      }
      message += `🚨 Error: ${error}\n\n`
      message += `---\nSqale System`

      await this.sendMessage(message, BOT_TOKEN, CHAT_ID)
    } catch (error) {
      console.error('Failed to send error notification via fallback:', error)
    }
  }
}
