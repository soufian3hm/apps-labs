import React from 'react'
import { Header } from './landing/Header'
import { Footer } from './landing/Footer'
import { Zap, Cookie } from 'lucide-react'

const CookiePolicy: React.FC = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-400 flex h-12 w-12 items-center justify-center rounded-lg">
                <Cookie className="text-white h-7 w-7" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Cookie Policy</h1>
            </div>
            <p className="text-gray-600 text-lg">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 space-y-8">
              
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
                <p className="text-gray-700 leading-relaxed">
                  Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently and provide a better user experience.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Cookies allow websites to recognize your device, remember your preferences, and provide personalized features. They can be "persistent" (remaining on your device for a set period) or "session" (deleted when you close your browser).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Cookies</h2>
                <p className="text-gray-700 leading-relaxed">
                  Symplysis uses cookies and similar tracking technologies to enhance your experience, provide essential functionality, and improve our platform. This Cookie Policy explains what cookies we use and why.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Essential Cookies (Strictly Necessary)</h3>
                <p className="text-gray-700 leading-relaxed">
                  These cookies are essential for the Platform to function properly. Without these cookies, certain features and services cannot be provided.
                </p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-gray-700 font-semibold mb-2">Examples:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li><strong>sqale-auth-token:</strong> Stores authentication session information via Supabase to keep you logged in</li>
                    <li><strong>Session cookies:</strong> Maintain your session state while navigating the Platform</li>
                    <li><strong>Security cookies:</strong> Help detect and prevent fraudulent activity</li>
                  </ul>
                </div>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <em>These cookies cannot be disabled as they are necessary for the Platform to work.</em>
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Functional Cookies</h3>
                <p className="text-gray-700 leading-relaxed">
                  These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
                </p>
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-gray-700 font-semibold mb-2">Examples:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Language preferences</li>
                    <li>Display settings and customizations</li>
                    <li>User interface preferences</li>
                    <li>Recently used features or tools</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.3 Analytics and Performance Cookies</h3>
                <p className="text-gray-700 leading-relaxed">
                  These cookies help us understand how users interact with the Platform by collecting information about pages visited, time spent, and errors encountered.
                </p>
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-gray-700 font-semibold mb-2">Purpose:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Analyze Platform usage patterns</li>
                    <li>Identify and fix technical issues</li>
                    <li>Improve Platform performance</li>
                    <li>Measure feature effectiveness</li>
                  </ul>
                </div>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <em>All data collected is aggregated and anonymized where possible.</em>
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.4 Marketing and Advertising Cookies</h3>
                <p className="text-gray-700 leading-relaxed">
                  These cookies may be used to show you relevant advertisements and measure the effectiveness of our marketing campaigns. We may use third-party advertising services that employ cookies.
                </p>
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-gray-700 font-semibold mb-2">Purpose:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Display relevant advertisements</li>
                    <li>Measure ad campaign effectiveness</li>
                    <li>Prevent showing the same ad repeatedly</li>
                    <li>Track conversions from marketing channels</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Cookies</h2>
                <p className="text-gray-700 leading-relaxed">
                  We use trusted third-party services that may place cookies on your device. These services help us provide and improve the Platform:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-3 text-gray-700">
                  <li>
                    <strong>Supabase:</strong> Our authentication and database provider uses cookies to manage your login sessions and maintain security
                  </li>
                  <li>
                    <strong>Stripe:</strong> Our payment processor may use cookies during checkout and payment processing
                  </li>
                  <li>
                    <strong>Google Services:</strong> We use Google Gemini AI services, which may involve Google cookies for API authentication and usage tracking
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Third-party cookies are governed by the respective privacy policies of these services. We recommend reviewing their policies:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">Supabase Privacy Policy</a></li>
                  <li><a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">Stripe Privacy Policy</a></li>
                  <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">Google Privacy Policy</a></li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Local Storage and Similar Technologies</h2>
                <p className="text-gray-700 leading-relaxed">
                  In addition to cookies, we use browser local storage and session storage to store data locally on your device. This includes:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li><strong>Authentication tokens:</strong> Stored in local storage to maintain your login session</li>
                  <li><strong>User preferences:</strong> Interface settings and customizations</li>
                  <li><strong>Draft content:</strong> Temporarily saved work to prevent data loss</li>
                  <li><strong>Cache data:</strong> To improve loading times and performance</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookie Duration</h2>
                <p className="text-gray-700 leading-relaxed">
                  Different cookies have different lifespans:
                </p>
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700 font-semibold">Session Cookies</p>
                    <p className="text-gray-600 text-sm mt-1">Deleted when you close your browser</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700 font-semibold">Persistent Cookies</p>
                    <p className="text-gray-600 text-sm mt-1">Remain on your device for a specified period (typically 30 days to 1 year)</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700 font-semibold">Authentication Cookies</p>
                    <p className="text-gray-600 text-sm mt-1">May persist to keep you logged in across sessions (configurable in your account settings)</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Managing Your Cookie Preferences</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.1 Browser Settings</h3>
                <p className="text-gray-700 leading-relaxed">
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li>View and delete cookies</li>
                  <li>Block all cookies</li>
                  <li>Block third-party cookies only</li>
                  <li>Clear all cookies when you close your browser</li>
                  <li>Receive notifications before cookies are set</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Please note that blocking essential cookies will prevent you from using certain features of the Platform, including logging in and accessing your account.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.2 Browser-Specific Instructions</h3>
                <div className="mt-4 space-y-2 text-gray-700">
                  <p><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</p>
                  <p><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</p>
                  <p><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</p>
                  <p><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</p>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.3 Opt-Out Options</h3>
                <p className="text-gray-700 leading-relaxed">
                  For marketing and advertising cookies, you can opt out through:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li>Your browser's "Do Not Track" setting</li>
                  <li>Industry opt-out tools like <a href="http://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">Digital Advertising Alliance</a></li>
                  <li>Google's <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">Ad Settings</a></li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Mobile Device Identifiers</h2>
                <p className="text-gray-700 leading-relaxed">
                  When you access our Platform through a mobile device, we may collect mobile device identifiers for similar purposes as cookies. You can manage these settings through your device's privacy settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Updates to This Cookie Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of significant changes by posting the updated policy on this page and updating the "Last Updated" date.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Additional Information</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">10.1 Privacy Policy</h3>
                <p className="text-gray-700 leading-relaxed">
                  For more information about how we collect, use, and protect your personal data, please see our <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">10.2 Terms of Service</h3>
                <p className="text-gray-700 leading-relaxed">
                  Your use of the Platform is also governed by our <a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about our use of cookies or this Cookie Policy, please contact us:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700"><strong>Email:</strong> privacy@symplysis.ai</p>
                  <p className="text-gray-700 mt-2"><strong>Subject Line:</strong> Cookie Policy Inquiry</p>
                  <p className="text-gray-700 mt-2"><strong>Website:</strong> <a href="https://symplysis.ai" className="text-blue-600 hover:text-blue-700">symplysis.ai</a></p>
                </div>
              </section>

              <section className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                <div className="flex items-start space-x-3">
                  <Cookie className="text-blue-600 h-6 w-6 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Privacy Matters</h3>
                    <p className="text-gray-700 leading-relaxed">
                      We're committed to transparency about our use of cookies and similar technologies. By using Symplysis, you consent to our use of cookies as described in this policy. You can withdraw consent by adjusting your browser settings or contacting us directly.
                    </p>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default CookiePolicy
