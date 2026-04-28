import React from 'react'
import { Header } from './landing/Header'
import { Footer } from './landing/Footer'
import { Zap } from 'lucide-react'

const FAQ: React.FC = () => {
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
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Frequently Asked Questions</h1>
            </div>
            <p className="text-gray-600 text-lg">Find answers to common questions about Symplysis</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 space-y-8">
              
              {/* General Questions */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">General Questions</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">What is Symplysis?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Symplysis is an AI-powered marketing platform that helps you create professional ad copy, landing pages, voiceovers, and posters 10x faster. We combine cutting-edge AI technology with marketing expertise to deliver high-quality content in seconds.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Who is Symplysis for?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Symplysis is designed for marketers, agencies, freelancers, small businesses, and enterprises. Whether you're a solo entrepreneur or part of a large marketing team, our tools can help you create better content faster.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Do I need technical skills to use Symplysis?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      No! Symplysis is designed to be user-friendly and intuitive. You don't need any technical or design skills. Simply describe what you need, and our AI handles the rest.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">What makes Symplysis different from other AI tools?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Symplysis is specifically built for marketing professionals. We offer four specialized tools in one platform, support 100+ languages, and our AI is trained on millions of successful marketing campaigns. Plus, our content is production-ready—no additional editing required.
                    </p>
                  </div>
                </div>
              </section>

              {/* Pricing & Plans */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing & Plans</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">How much does Symplysis cost?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      We offer three plans: Starter ($29/month), Professional ($79/month), and Enterprise ($299/month). Each plan includes different usage limits and features. Check our <a href="/pricing" className="text-blue-600 hover:text-blue-700 font-medium">Pricing page</a> for detailed information.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Yes! All new users get a 7-day free trial with full access to Professional plan features. No credit card required to start your trial.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Can I change my plan later?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Yes, we offer a 30-day money-back guarantee. If you're not satisfied with Symplysis, contact us within 30 days of purchase for a full refund.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">What happens if I exceed my usage limits?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      You'll receive a notification when approaching your limit. You can either upgrade your plan or purchase additional credits as needed.
                    </p>
                  </div>
                </div>
              </section>

              {/* Features & Capabilities */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Features & Capabilities</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">What platforms does the Ad Copy Generator support?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Our Ad Copy Generator supports all major platforms including Meta (Facebook/Instagram), TikTok, Google Ads, LinkedIn, Twitter, Pinterest, and more. We optimize copy for each platform's specific requirements.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">How many languages are supported?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Symplysis supports 100+ languages. Our AI can create ad copy in 40+ languages and generate voiceovers in 100+ languages with native-level fluency.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Are the landing pages mobile-responsive?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Yes! All landing pages generated by Symplysis are fully responsive and optimized for mobile, tablet, and desktop devices.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">What voice options are available for voiceovers?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      We offer 30+ premium AI voices including male, female, and neutral options. All voices are designed to sound natural and professional.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Can I customize the AI-generated content?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Absolutely! All content can be edited and customized before export. You have full control over the final output.
                    </p>
                  </div>
                </div>
              </section>

              {/* Technical Questions */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Questions</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Is my data secure?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Yes. We use industry-standard encryption (HTTPS/TLS) and secure authentication via Supabase. Your data is encrypted in transit and at rest. See our <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a> for details.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Do you offer an API?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Yes! API access is available on Professional and Enterprise plans. Contact our sales team for detailed documentation.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">What file formats can I export?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Export formats vary by tool: Ad Copy (TXT, DOCX), Landing Pages (HTML, CSS), Voiceovers (WAV, MP3), and Posters (PNG, JPG, PDF).
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Is there a mobile app?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Currently, Symplysis is a web-based platform accessible from any device with a browser. Mobile apps are on our roadmap.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Can I integrate Symplysis with other tools?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Yes! Enterprise plans include custom integration support. We're also building native integrations with popular marketing platforms.
                    </p>
                  </div>
                </div>
              </section>

              {/* Account & Support */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account & Support</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">How do I create an account?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Simply click "Sign Up" and provide your email address. You can also sign up instantly using your Google account.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Can I have multiple users on one account?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Yes! Professional plans support up to 5 team members, and Enterprise plans support unlimited users.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">How do I cancel my subscription?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      You can cancel anytime through your account settings or by contacting support. Cancellations take effect at the end of your current billing period.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">What kind of support do you offer?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      All plans include email support. Professional plans get priority support, and Enterprise plans receive 24/7 support with a dedicated account manager.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">How quickly will I get a response from support?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      We aim to respond to all inquiries within 24 hours. Professional and Enterprise users typically receive responses within a few hours.
                    </p>
                  </div>
                </div>
              </section>

              {/* Still have questions? */}
              <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Still Have Questions?</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Can't find the answer you're looking for? Our support team is here to help!
                </p>
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-gray-700"><strong>Email:</strong> support@symplysis.ai</p>
                  <p className="text-gray-700 mt-2"><strong>Response Time:</strong> Within 24 hours</p>
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

export default FAQ
