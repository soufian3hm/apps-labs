import { loadStripe } from '@stripe/stripe-js'

// Stripe publishable key (client-side)
export const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here'

// Load Stripe instance with error handling
export const stripePromise = loadStripe(stripePublishableKey).catch(error => {
  console.warn('Stripe failed to load (likely due to ad blocker):', error)
  return null
})

// Stripe price IDs for different plans
export const STRIPE_PRICE_IDS = {
  'Meta Access': 'price_1Rx8MhEZDKfeITo4U1Z3p3jp',
  'Google Access': 'price_1Rx8NAEZDKfeITo4A6YIqZ39', 
  'TikTok Access': 'price_1Rx8NVEZDKfeITo4kmLCz6mK',
  'Snapchat Access': 'price_1Rx8NxEZDKfeITo4r1hbCYfm',
  'All Access': 'price_1Rx8OZEZDKfeITo4gHGCfQEp'
}

// Plan prices (for display purposes)
export const PLAN_PRICES = {
  'Meta Access': 100,
  'Google Access': 100,
  'TikTok Access': 100, 
  'Snapchat Access': 100,
  'All Access': 300
}

// Plan descriptions
export const PLAN_DESCRIPTIONS = {
  'Meta Access': 'Unlimited Meta agency advertising accounts with unlimited spend and replacements',
  'Google Access': 'Unlimited Google agency advertising accounts with unlimited spend and replacements',
  'TikTok Access': 'Unlimited TikTok agency advertising accounts with unlimited spend and replacements',
  'Snapchat Access': 'Unlimited Snapchat agency advertising accounts with unlimited spend and replacements',
  'All Access': 'Access to all platforms with unlimited agency advertising accounts, spend, and replacements'
}
