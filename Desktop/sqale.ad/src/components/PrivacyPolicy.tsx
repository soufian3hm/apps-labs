import React from 'react'
import { Header } from './landing/Header'
import { Footer } from './landing/Footer'
import { Zap } from 'lucide-react'

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-400 flex h-12 w-12 items-center justify-center rounded-lg">
                <Zap className="text-white h-7 w-7" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Privacy Policy</h1>
            </div>
            <p className="text-gray-600 text-lg">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 space-y-8">
              
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  Welcome to Symplysis ("we," "our," or "us"). We are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI marketing platform at symplysis.ai (the "Platform").
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  By using Symplysis, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our Platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Personal Information</h3>
                <p className="text-gray-700 leading-relaxed">When you create an account, we collect:</p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li>Email address</li>
                  <li>Name</li>
                  <li>Company name</li>
                  <li>Phone number and country code</li>
                  <li>Billing information (address, city, state, postal code, country, tax number)</li>
                  <li>Company ID (generated internally)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Authentication Data</h3>
                <p className="text-gray-700 leading-relaxed">
                  We use Supabase for authentication services. This includes your login credentials and session tokens. If you sign up with Google OAuth, we receive basic profile information from Google.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Payment Information</h3>
                <p className="text-gray-700 leading-relaxed">
                  Payment processing is handled by Stripe. We store your Stripe customer ID and subscription details but never directly store your credit card numbers. Stripe's privacy policy governs the collection and use of your payment information.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.4 Content and Usage Data</h3>
                <p className="text-gray-700 leading-relaxed">
                  When you use our AI marketing tools, we collect:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li>URLs you provide for web scraping and content analysis</li>
                  <li>Generated content (ad copy, landing pages, voiceovers, posters)</li>
                  <li>Content preferences and customization settings</li>
                  <li>Project data and creative assets</li>
                  <li>Usage patterns and feature interactions</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.5 Technical Information</h3>
                <p className="text-gray-700 leading-relaxed">
                  We automatically collect:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Device information</li>
                  <li>Operating system</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Log data (timestamps, page views, interactions)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-3">We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Provide Services:</strong> Generate AI content (ads, landing pages, voiceovers, posters) using third-party AI services including Google Gemini and DeepSeek APIs</li>
                  <li><strong>Process Payments:</strong> Handle subscriptions and billing through Stripe</li>
                  <li><strong>Improve Platform:</strong> Analyze usage patterns to enhance features and user experience</li>
                  <li><strong>Communicate:</strong> Send service updates, newsletters, and promotional materials (with your consent)</li>
                  <li><strong>Security:</strong> Protect against fraud, abuse, and security threats</li>
                  <li><strong>Legal Compliance:</strong> Comply with legal obligations and enforce our terms</li>
                  <li><strong>Support:</strong> Respond to your requests and provide customer support</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. AI Processing and Third-Party Services</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 AI Service Providers</h3>
                <p className="text-gray-700 leading-relaxed">
                  We use the following AI services to power our platform:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li><strong>Google Gemini:</strong> For content generation, text-to-speech, and image analysis</li>
                  <li><strong>DeepSeek:</strong> For advanced content generation and analysis</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  When you use our services, your input data and generated content may be processed by these AI providers. We recommend reviewing their respective privacy policies.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Other Third-Party Services</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Supabase:</strong> Database and authentication infrastructure</li>
                  <li><strong>Stripe:</strong> Payment processing</li>
                  <li><strong>Web Scraping:</strong> We may scrape publicly available web content from URLs you provide</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies and Tracking Technologies</h2>
                <p className="text-gray-700 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience. See our <a href="/cookies" className="text-blue-600 hover:text-blue-700 font-medium">Cookie Policy</a> for detailed information.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Essential cookies include:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li>Authentication tokens (stored as "sqale-auth-token")</li>
                  <li>Session management cookies</li>
                  <li>Security and fraud prevention cookies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Sharing and Disclosure</h2>
                <p className="text-gray-700 leading-relaxed mb-3">We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (AI processing, payments, hosting)</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect rights and safety</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or sale of assets</li>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>We do not sell your personal information to third parties.</strong>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Security</h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement industry-standard security measures to protect your data, including:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li>Encryption in transit (HTTPS/TLS)</li>
                  <li>Encryption at rest for sensitive data</li>
                  <li>Secure authentication via Supabase</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication requirements</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your personal information for as long as necessary to:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li>Provide our services to you</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes and enforce agreements</li>
                  <li>Maintain backup and business records</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  When you delete your account, we will delete or anonymize your personal information within 90 days, except where retention is required by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Your Rights and Choices</h2>
                <p className="text-gray-700 leading-relaxed mb-3">Depending on your location, you may have the following rights:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Receive your data in a portable format</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Restrict Processing:</strong> Limit how we use your data</li>
                  <li><strong>Object:</strong> Object to certain data processing activities</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  To exercise these rights, please contact us at privacy@symplysis.ai
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. International Data Transfers</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We ensure appropriate safeguards are in place for such transfers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our Platform is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. California Privacy Rights</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect and how we use it, and the right to request deletion of your personal information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. GDPR Compliance</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you are located in the European Economic Area (EEA), we process your personal data based on the following legal grounds:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li><strong>Contract Performance:</strong> To provide services under our Terms of Service</li>
                  <li><strong>Consent:</strong> When you have given explicit consent</li>
                  <li><strong>Legitimate Interests:</strong> For improving our services and security</li>
                  <li><strong>Legal Obligations:</strong> To comply with applicable laws</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to This Privacy Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of the Platform after changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700"><strong>Email:</strong> privacy@symplysis.ai</p>
                  <p className="text-gray-700 mt-2"><strong>Website:</strong> <a href="https://symplysis.ai" className="text-blue-600 hover:text-blue-700">symplysis.ai</a></p>
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

export default PrivacyPolicy
