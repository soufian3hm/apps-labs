import React from 'react'
import { Header } from './landing/Header'
import { Footer } from './landing/Footer'
import { Zap } from 'lucide-react'

const TermsOfService: React.FC = () => {
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
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Terms of Service</h1>
            </div>
            <p className="text-gray-600 text-lg">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 space-y-8">
              
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  Welcome to Symplysis! These Terms of Service ("Terms") govern your access to and use of the Symplysis platform, website, and services (collectively, the "Platform"). By accessing or using the Platform, you agree to be bound by these Terms.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  If you do not agree to these Terms, you may not access or use the Platform. These Terms apply to all users, including visitors, registered users, and subscribers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Services</h2>
                <p className="text-gray-700 leading-relaxed">
                  Symplysis is an AI-powered marketing platform that provides the following services:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li><strong>AI Ad Copy Generator:</strong> Create advertising content optimized for multiple platforms including Meta, TikTok, Google, LinkedIn, Twitter, and others, in 40+ languages</li>
                  <li><strong>Landing Page Generator:</strong> Generate HTML landing pages from scratch or by scraping competitor websites, with ready-to-deploy code</li>
                  <li><strong>AI Voiceover Studio:</strong> Generate professional voiceovers with 30+ voices in 100+ languages, exported as broadcast-quality WAV files</li>
                  <li><strong>AI Poster Generator:</strong> Create professional posters and visual designs with brand consistency and high-resolution export</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  We reserve the right to modify, suspend, or discontinue any aspect of the Platform at any time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration and Security</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Account Creation</h3>
                <p className="text-gray-700 leading-relaxed">
                  To access certain features, you must create an account by providing accurate and complete information including your email address, name, company name, and phone number.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Account Security</h3>
                <p className="text-gray-700 leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.3 Account Requirements</h3>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li>You must be at least 18 years old to create an account</li>
                  <li>You must provide accurate, current, and complete information</li>
                  <li>You may not share your account or allow others to access it</li>
                  <li>You may not create multiple accounts without authorization</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription Plans and Payments</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Subscription Plans</h3>
                <p className="text-gray-700 leading-relaxed">
                  Symplysis offers various subscription plans with different features and usage limits. Current plan details and pricing are available on our website.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Payment Processing</h3>
                <p className="text-gray-700 leading-relaxed">
                  All payments are processed securely through Stripe. By subscribing, you authorize us to charge your payment method on a recurring basis according to your chosen plan.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Billing and Renewal</h3>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li>Subscriptions automatically renew at the end of each billing period unless cancelled</li>
                  <li>You will be charged at the beginning of each billing cycle</li>
                  <li>Price changes will be communicated 30 days in advance</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.4 Cancellation and Refunds</h3>
                <p className="text-gray-700 leading-relaxed">
                  You may cancel your subscription at any time through your account settings or by contacting support. Cancellations take effect at the end of the current billing period. We do not provide refunds for partial billing periods, except as required by law or at our sole discretion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Acceptable Use Policy</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.1 Permitted Use</h3>
                <p className="text-gray-700 leading-relaxed">
                  You may use the Platform for lawful business and marketing purposes, including creating advertising content, landing pages, voiceovers, and promotional materials.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.2 Prohibited Activities</h3>
                <p className="text-gray-700 leading-relaxed mb-3">You agree NOT to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Violate any laws, regulations, or third-party rights</li>
                  <li>Generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
                  <li>Create content that promotes violence, discrimination, or hate speech</li>
                  <li>Generate misleading, deceptive, or fraudulent content</li>
                  <li>Infringe intellectual property rights of others</li>
                  <li>Attempt to reverse engineer, hack, or compromise the Platform</li>
                  <li>Use automated systems (bots, scrapers) without authorization</li>
                  <li>Resell or redistribute Platform services without permission</li>
                  <li>Bypass usage limits or restrictions</li>
                  <li>Use the Platform to spam or send unsolicited communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.1 Platform Ownership</h3>
                <p className="text-gray-700 leading-relaxed">
                  The Platform, including all software, designs, text, graphics, and other content, is owned by Symplysis or its licensors and is protected by copyright, trademark, and other intellectual property laws.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.2 Your Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  You retain ownership of any input data, URLs, or original content you provide to the Platform. By using our services, you grant us a limited license to process your content to provide the services.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.3 AI-Generated Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  Content generated by our AI tools (ad copy, landing pages, voiceovers, posters) is provided to you for your use. However, you acknowledge that:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li>AI-generated content may not be eligible for copyright protection in all jurisdictions</li>
                  <li>Similar content may be generated for other users using similar inputs</li>
                  <li>You are responsible for ensuring generated content complies with applicable laws and doesn't infringe third-party rights</li>
                  <li>You should review and modify generated content before use</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Third-Party Services and Content</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.1 AI Service Providers</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our Platform uses third-party AI services including Google Gemini and DeepSeek. Your use of these services through our Platform is subject to their respective terms and policies.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.2 Web Scraping</h3>
                <p className="text-gray-700 leading-relaxed">
                  When you provide URLs for scraping or analysis, you represent that you have the right to request such scraping and that the target websites' terms of service permit such activity. We are not responsible for any violations of third-party terms.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.3 Third-Party Links</h3>
                <p className="text-gray-700 leading-relaxed">
                  The Platform may contain links to third-party websites. We are not responsible for the content, privacy practices, or terms of third-party sites.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimers and Limitations</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">8.1 AI Content Disclaimer</h3>
                <p className="text-gray-700 leading-relaxed">
                  AI-generated content is provided "as is" without warranties. You acknowledge that:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li>AI may produce inaccurate, incomplete, or inappropriate content</li>
                  <li>Generated content may require human review and editing</li>
                  <li>We do not guarantee the quality, accuracy, or effectiveness of generated content</li>
                  <li>You are solely responsible for reviewing and approving content before use</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">8.2 Service Availability</h3>
                <p className="text-gray-700 leading-relaxed">
                  While we strive for high availability, we do not guarantee uninterrupted or error-free service. The Platform may experience downtime for maintenance, updates, or due to factors beyond our control.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">8.3 No Warranties</h3>
                <p className="text-gray-700 leading-relaxed">
                  THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, SYMPLYSIS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR USE, ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM YOUR USE OF THE PLATFORM SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
                <p className="text-gray-700 leading-relaxed">
                  You agree to indemnify, defend, and hold harmless Symplysis and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700">
                  <li>Your use of the Platform</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any laws or third-party rights</li>
                  <li>Content you generate or distribute using the Platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Privacy and Data Protection</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your use of the Platform is subject to our <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>, which describes how we collect, use, and protect your information. By using the Platform, you consent to our data practices as described in the Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">12.1 Termination by You</h3>
                <p className="text-gray-700 leading-relaxed">
                  You may terminate your account at any time by canceling your subscription and deleting your account through the Platform settings or by contacting support.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">12.2 Termination by Us</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may suspend or terminate your account immediately if you violate these Terms, engage in fraudulent activity, or for any other reason at our sole discretion. We will provide notice when reasonably possible.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">12.3 Effect of Termination</h3>
                <p className="text-gray-700 leading-relaxed">
                  Upon termination, your right to access the Platform will cease immediately. We may delete your account data in accordance with our data retention policies. Provisions that by their nature should survive termination will continue to apply.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Modifications to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on the Platform and updating the "Last Updated" date. Your continued use after changes constitutes acceptance of the modified Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Governing Law and Dispute Resolution</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">14.1 Governing Law</h3>
                <p className="text-gray-700 leading-relaxed">
                  These Terms are governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">14.2 Dispute Resolution</h3>
                <p className="text-gray-700 leading-relaxed">
                  Any disputes arising from these Terms or your use of the Platform should first be addressed through good faith negotiation. If unresolved, disputes may be resolved through binding arbitration or in courts of competent jurisdiction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">15. General Provisions</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">15.1 Entire Agreement</h3>
                <p className="text-gray-700 leading-relaxed">
                  These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and Symplysis regarding the Platform.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">15.2 Severability</h3>
                <p className="text-gray-700 leading-relaxed">
                  If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">15.3 No Waiver</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our failure to enforce any right or provision of these Terms does not constitute a waiver of that right or provision.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">15.4 Assignment</h3>
                <p className="text-gray-700 leading-relaxed">
                  You may not assign or transfer these Terms without our prior written consent. We may assign these Terms without restriction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about these Terms or need support, please contact us:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700"><strong>Email:</strong> support@symplysis.ai</p>
                  <p className="text-gray-700 mt-2"><strong>Legal:</strong> legal@symplysis.ai</p>
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

export default TermsOfService
