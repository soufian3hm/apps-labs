'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID

export const pageview = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView')
  }
}

// Custom events
export const event = (name: string, options = {}) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', name, options)
  }
}

export function FacebookPixel({ pixelId }: { pixelId: string | null }) {
  const pathname = usePathname()

  useEffect(() => {
    if (!pixelId) return
    let fbq = (window as any).fbq
    if (!fbq) {
      // Initialize fbq manually
      ;(function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        }
        if (!f._fbq) f._fbq = n
        n.push = n
        n.loaded = !0
        n.version = '2.0'
        n.queue = []
        t = b.createElement(e)
        t.async = true
        t.src = v
        s = b.getElementsByTagName(e)[0]
        s.parentNode.insertBefore(t, s)
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')

      // Config pixel
      ;(window as any).fbq('init', pixelId)
    }
  }, [pixelId])

  useEffect(() => {
    if (pixelId) {
      pageview()
    }
  }, [pathname, pixelId])

  return null
}
