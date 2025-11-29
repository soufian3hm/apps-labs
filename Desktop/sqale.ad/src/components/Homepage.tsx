import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

// Translation Dictionary
const translations = {
  en: {
    nav_features: "Features",
    nav_why_symplysis: "Why SymplysisAI",
    nav_login: "Log in",
    nav_get_started: "Get Started Free",
    hero_new: "New",
    hero_security: "Enterprise-Grade Security Now Active",
    hero_headline: "Create Pro Marketing <br /> Content in Minutes.",
    hero_subheadline: "Symplysis consolidates ad copy, landing pages, voiceovers, and posters into one AI-powered workflow. No coding skills required.",
    cta_start: "Start Creating Free",
    cta_demo: "Watch Demo",
    trusted_by: "Trusted by fast-moving teams at",
    features_title: "Core Features",
    features_subtitle: "Replace your fragmented toolset. Symplysis unifies the workflow.",
    feature_ad_title: "AI Ad Copy Generator",
    feature_ad_desc: "Generate high-converting copy in multiple dialects. Auto-compliance checks included.",
    feature_landing_title: "Landing Page Generator",
    feature_landing_desc: "Copy product from Amazon, Etsy, or Shopify. One-click export.",
    feature_voice_title: "Voiceover Studio",
    feature_voice_desc: "30 AI voices & 20 languages. 6 tone styles.",
    feature_poster_title: "Poster Generator",
    feature_poster_desc: "Auto-resize for any social platform. 10 languages.",
    workflow_title: "Use Case:<br>Product Launch",
    step_1_title: "Generate Ad Copy",
    step_1_desc: "Create variations instantly.",
    step_2_title: "Build Landing Pages",
    step_2_desc: "Spin up HTML pages.",
    step_3_title: "Go Global",
    step_3_desc: "Translate to 40+ languages.",
    campaign_name: "New Product Campaign",
    campaign_time: "Created 2 mins ago",
    compare_title: "Why teams switch to Symplysis",
    compare_subtitle: "One platform. Save 85% on costs and 90% on time.",
    th_feature: "Feature",
    th_others: "Others",
    td_platform: "Workflow",
    td_fragmented: "Switch between 4-5 apps, lose context",
    td_allinone: "Complete campaign in one session",
    td_languages: "Localization",
    td_api: "Basic translation loses tone, context, and cultural nuances",
    td_native: "SymplysisAI understands dialects, marketing context, and cultural preferences (40+ languages)",
    td_landing_pages: "Landing Pages",
    td_dragdrop: "Hours of work, requires design skills",
    td_instant: "Complete page in 30 seconds from URL",
    td_speed: "Campaign Creation",
    td_speed_other: "2-4 hours across multiple tools",
    td_speed_sym: "5-10 minutes for complete campaign",
    td_compliance: "Ad Compliance",
    td_compliance_other: "Manual checks, risk of violations",
    td_compliance_sym: "Auto-compliance for Meta, Google, TikTok",
    td_cost: "Monthly Cost",
    td_cost_other: "$200+/mo across multiple tools",
    td_cost_sym: "7 days free, then $29/mo for everything",
    pricing_title: "Simple, transparent pricing",
    pricing_subtitle: "7-day free trial on all plans. Cancel anytime.",
    monthly: "Monthly",
    yearly_discount: "Yearly -20%",
    starter_title: "Starter",
    starter_desc: "For individuals & solopreneurs.",
    for_7_days: "for 7 days",
    cancel_anytime: "Cancel anytime",
    then: "Then",
    billed: "billed",
    annually: "annually",
    start_free_trial: "Start Free Trial",
    feat_200_ad: "200 ad copies/mo",
    feat_50_voice: "50 voiceovers/mo",
    feat_20_landing: "20 landing pages/mo",
    feat_30_poster: "30 posters/mo",
    popular: "Popular",
    premium_title: "Premium",
    premium_desc: "For growing teams & agencies.",
    feat_500_ad: "500 ad copies/mo",
    feat_200_voice: "200 voiceovers/mo",
    feat_50_landing: "50 landing pages/mo",
    feat_80_poster: "80 posters/mo",
    feat_priority: "Priority Generation",
    enterprise_title: "Enterprise",
    enterprise_desc: "For large organizations.",
    custom: "Custom",
    volume_pricing: "Contact sales for volume pricing",
    contact_sales: "Contact Sales",
    feat_unlimited: "Unlimited Everything",
    feat_custom_int: "Custom Integrations",
    feat_dedicated_support: "Dedicated Support Manager",
    feat_sla: "SLA Agreement",
    feat_sso: "SSO & Advanced Security",
    footer_cta_title: "Ready to scale your marketing?",
    footer_cta_desc: "Join thousands of creators and businesses saving time with Symplysis.",
    get_started_free: "Get Started for Free",
    footer_tagline: "The all-in-one AI marketing platform for creators and businesses.",
    nav_product: "Product",
    link_ad_copy: "Ad Copy Generator",
    link_landing: "Landing Pages",
    link_voiceover: "Voiceover Studio",
    link_poster: "Poster Maker",
    nav_resources: "Resources",
    link_about: "About",
    link_blog: "Blog",
    link_faq: "FAQ",
    link_community: "Community",
    link_help: "Help Center",
    link_api: "API Docs",
    nav_legal: "Legal",
    link_privacy: "Privacy Policy",
    link_terms: "Terms of Service",
    link_security: "Security"
  },
  ar: {
    nav_features: "المميزات",
    nav_why_symplysis: "لماذا SymplysisAI",
    nav_how_it_works: "كيف يعمل",
    nav_pricing: "الأسعار",
    nav_login: "تسجيل الدخول",
    nav_get_started: "ابدأ مجاناً",
    hero_new: "جديد",
    hero_security: "انشاء صور اعلانية بالعربية متوفر الآن",
    hero_headline: "أنشئ محتوى تسويقي <br /> احترافي في دقائق.",
    hero_subheadline: "Symplysis توحد كتابة الإعلانات، صفحات الهبوط، التعليق الصوتي، والملصقات في سير عمل واحد مدعوم بالذكاء الاصطناعي. لا حاجة لمهارات برمجية.",
    cta_start: "ابدأ الإنشاء مجاناً",
    cta_demo: "شاهد العرض التوضيحي",
    trusted_by: "موثوق به من قبل فرق سريعة النمو في",
    features_title: "الميزات الأساسية",
    features_subtitle: "استبدل أدواتك المتفرقة. Symplysis توحد سير العمل.",
    feature_ad_title: "مولد نصوص إعلانية بالذكاء الاصطناعي",
    feature_ad_desc: "أنشئ نصوصاً عالية التحويل بلهجات متعددة. فحوصات الامتثال التلقائية مشمولة.",
    feature_landing_title: "مولد صفحات الهبوط",
    feature_landing_desc: "انسخ المنتج من Amazon أو Etsy أو Shopify. تصدير بنقرة واحدة.",
    feature_voice_title: "استوديو التعليق الصوتي",
    feature_voice_desc: "30 صوت ذكاء اصطناعي و 20 لغة. 6 أنماط نبرة.",
    feature_poster_title: "مولد الملصقات",
    feature_poster_desc: "تغيير الحجم تلقائياً لأي منصة اجتماعية. 10 لغات.",
    workflow_title: "حالة الاستخدام:<br>إطلاق منتج",
    step_1_title: "توليد نص إعلاني",
    step_1_desc: "إنشاء تنويعات فورية.",
    step_2_title: "بناء صفحات الهبوط",
    step_2_desc: "إطلاق صفحات HTML.",
    step_3_title: "الانطلاق للعالمية",
    step_3_desc: "ترجمة إلى 40+ لغة.",
    campaign_name: "حملة منتج جديد",
    campaign_time: "تم الإنشاء منذ دقيقتين",
    compare_title: "لماذا تنتقل الفرق إلى Symplysis",
    compare_subtitle: "منصة واحدة. وفر 85% من التكلفة و 90% من الوقت.",
    th_feature: "الميزة",
    th_others: "الآخرون",
    td_platform: "سير العمل",
    td_fragmented: "التبديل بين 4-5 تطبيقات، فقدان السياق",
    td_allinone: "حملة كاملة في جلسة واحدة",
    td_languages: "التوطين",
    td_api: "الترجمة الأساسية تفقد النبرة والسياق والفروقات الثقافية",
    td_native: "SymplysisAI يفهم اللهجات وسياق التسويق والتفضيلات الثقافية (40+ لغة)",
    td_landing_pages: "صفحات الهبوط",
    td_dragdrop: "ساعات من العمل، يتطلب مهارات تصميم",
    td_instant: "صفحة كاملة في 30 ثانية من الرابط",
    td_speed: "إنشاء الحملة",
    td_speed_other: "2-4 ساعات عبر أدوات متعددة",
    td_speed_sym: "5-10 دقائق لحملة كاملة",
    td_compliance: "امتثال الإعلانات",
    td_compliance_other: "فحوصات يدوية، خطر الانتهاكات",
    td_compliance_sym: "امتثال تلقائي لـ Meta و Google و TikTok",
    td_cost: "التكلفة الشهرية",
    td_cost_other: "200$+ / شهرياً عبر أدوات متعددة",
    td_cost_sym: "7 أيام مجاناً، ثم 29$ / شهرياً لكل شيء",
    pricing_title: "أسعار بسيطة وواضحة",
    pricing_subtitle: "تجربة مجانية لمدة 7 أيام على جميع الخطط. الإلغاء في أي وقت.",
    monthly: "شهري",
    yearly_discount: "سنوي -20%",
    starter_title: "المبتدئ",
    starter_desc: "للأفراد وأصحاب المشاريع الفردية.",
    for_7_days: "لمدة 7 أيام",
    cancel_anytime: "إلغاء في أي وقت",
    then: "ثم",
    billed: "يتم الفوترة",
    annually: "سنوياً",
    start_free_trial: "ابدأ التجربة المجانية",
    feat_200_ad: "200 نص إعلاني/شهرياً",
    feat_50_voice: "50 تعليق صوتي/شهرياً",
    feat_20_landing: "20 صفحة هبوط/شهرياً",
    feat_30_poster: "30 ملصق/شهرياً",
    popular: "شائع",
    premium_title: "المميز",
    premium_desc: "للفرق المتنامية والوكالات.",
    feat_500_ad: "500 نص إعلاني/شهرياً",
    feat_200_voice: "200 تعليق صوتي/شهرياً",
    feat_50_landing: "50 صفحة هبوط/شهرياً",
    feat_80_poster: "80 ملصق/شهرياً",
    feat_priority: "أولوية التوليد",
    enterprise_title: "المؤسسات",
    enterprise_desc: "للمنظمات الكبيرة.",
    custom: "مخصص",
    volume_pricing: "اتصل بالمبيعات لتسعير الكميات",
    contact_sales: "اتصل بالمبيعات",
    feat_unlimited: "كل شيء غير محدود",
    feat_custom_int: "تكاملات مخصصة",
    feat_dedicated_support: "مدير دعم مخصص",
    feat_sla: "اتفاقية مستوى الخدمة (SLA)",
    feat_sso: "تسجيل دخول موحد وأمان متقدم",
    footer_cta_title: "جاهز لتوسيع نطاق تسويقك؟",
    footer_cta_desc: "انضم إلى آلاف المبدعين والشركات الذين يوفرون الوقت مع Symplysis.",
    get_started_free: "ابدأ مجاناً",
    footer_tagline: "منصة التسويق بالذكاء الاصطناعي الشاملة للمبدعين والشركات.",
    nav_product: "المنتج",
    link_ad_copy: "مولد النصوص الإعلانية",
    link_landing: "صفحات الهبوط",
    link_voiceover: "استوديو التعليق الصوتي",
    link_poster: "صانع الملصقات",
    nav_resources: "الموارد",
    link_about: "من نحن",
    link_blog: "المدونة",
    link_faq: "الأسئلة الشائعة",
    link_community: "المجتمع",
    link_help: "مركز المساعدة",
    link_api: "وثائق API",
    nav_legal: "قانوني",
    link_privacy: "سياسة الخصوصية",
    link_terms: "شروط الخدمة",
    link_security: "الأمان"
  }
}

const Homepage: React.FC = () => {
  const { language, setLanguage } = useLanguage()
  const navigate = useNavigate()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [isDark, setIsDark] = useState(false)

  // Set Arabic as default for landing page only
  useEffect(() => {
    // Set Arabic as default language for landing page if still on default English
    // This ensures landing page defaults to Arabic, but doesn't override user's choice
    if (language === 'en') {
      setLanguage('ar')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount - intentionally not including language/setLanguage to avoid loops

  // Initialize dark mode - default to light theme
  useEffect(() => {
    // Remove dark class if present
    document.documentElement.classList.remove('dark')
    // Check if user has explicitly set dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      // Ensure light mode is set
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
    }
  }, [])

  // Animation on scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate")
          observer.unobserve(entry.target)
        }
      })
    }, observerOptions)

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const setBilling = (cycle: 'monthly' | 'yearly') => {
    setBillingCycle(cycle)
    const btnMonthly = document.getElementById('btn-monthly')
    const btnYearly = document.getElementById('btn-yearly')
    const priceStarter = document.getElementById('price-starter')
    const pricePremium = document.getElementById('price-premium')

    if (!btnMonthly || !btnYearly || !priceStarter || !pricePremium) return

    const activeClasses = ['bg-purple-600', 'text-white', 'shadow', 'font-medium']
    const inactiveClasses = ['text-neutral-500', 'dark:text-neutral-400', 'hover:text-neutral-900', 'dark:hover:text-white']

    btnMonthly.className = "px-4 py-1 text-sm rounded-full transition-all duration-300"
    btnYearly.className = "px-4 py-1 text-sm rounded-full transition-all duration-300"

    if (cycle === 'yearly') {
      btnYearly.classList.add(...activeClasses)
      btnMonthly.classList.add(...inactiveClasses)
      priceStarter.innerText = '23'
      pricePremium.innerText = '39'
    } else {
      btnMonthly.classList.add(...activeClasses)
      btnYearly.classList.add(...inactiveClasses)
      priceStarter.innerText = '29'
      pricePremium.innerText = '49'
    }

    updateBillingText()
  }

  const updateBillingText = () => {
    const periods = document.querySelectorAll('.billing-period')
    const text = language === 'en'
      ? (billingCycle === 'yearly' ? 'annually' : 'monthly')
      : (billingCycle === 'yearly' ? 'سنوياً' : 'شهرياً')

    periods.forEach(el => el.textContent = text)
  }

  useEffect(() => {
    updateBillingText()
  }, [language, billingCycle])

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  const switchTab = (platform: string) => {
    console.log("Switched to " + platform)
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white antialiased selection:bg-purple-500/30 overflow-x-hidden">
      {/* Background Effect (Dark Mode Only) */}
      <div className="fixed inset-0 -z-10 hidden dark:block">
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M64 0H0v64" fill="none" stroke="white" strokeWidth="0.5"></path>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"></rect>
          </svg>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      </div>

      {/* Background Effect (Light Mode) */}
      <div className="fixed inset-0 -z-10 dark:hidden bg-white">
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-light" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M64 0H0v64" fill="none" stroke="black" strokeWidth="0.5"></path>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-light)"></rect>
          </svg>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 animate-on-scroll animate transition-colors duration-300">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="https://auth.symplysis.com/storage/v1/object/public/Logos/Symplysis%20Logo/SymplyssAI.png"
              alt="Symplysis Logo"
              className="h-8 w-auto"
            />
            <span className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">Symplysis</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-neutral-600 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-white transition-colors font-medium">{t('nav_features')}</a>
            <a href="#why-symplysis" onClick={(e) => { e.preventDefault(); document.getElementById('why-symplysis')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-neutral-600 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-white transition-colors font-medium">{t('nav_why_symplysis')}</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="hidden sm:flex text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors">
              {t('nav_login')}
            </button>
            <button onClick={() => navigate('/signup')} className="inline-flex items-center gap-2 rounded-full border-gradient bg-white dark:bg-white/5 backdrop-blur-xl px-4 py-2.5 text-sm font-medium text-neutral-900 dark:text-white/90 hover:text-purple-600 dark:hover:text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-neutral-200 dark:border-transparent">
              {t('nav_get_started')}
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pb-24 lg:pt-24">
          {/* Pill */}
          <div className="mx-auto w-fit mb-6 animate-on-scroll" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center gap-2 rounded-full border-gradient bg-white dark:bg-white/5 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-transparent shadow-sm dark:shadow-none">
              <span className="inline-flex items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                {t('hero_new')}
              </span>
              <span className="font-medium">{t('hero_security')}</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center animate-on-scroll" style={{ animationDelay: '0.2s' }}>
            <h1 className="mx-auto max-w-5xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-500 dark:from-white dark:via-white dark:to-white/60 pb-2" dangerouslySetInnerHTML={{ __html: t('hero_headline') }}></h1>
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {t('hero_subheadline')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10 items-center justify-center">
              <button onClick={() => navigate('/signup')} className="inline-flex items-center gap-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-3.5 text-sm font-bold shadow hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                {t('cta_start')}
              </button>

              <div className="inline-block group relative">
                <button className="inline-flex gap-2 border-gradient hover:text-purple-600 dark:hover:text-white transition-all hover:-translate-y-0.5 text-sm font-medium text-neutral-600 dark:text-white/80 bg-white dark:bg-white/5 rounded-full px-6 py-3.5 backdrop-blur-xl items-center hover:bg-neutral-50 dark:hover:bg-white/10 border border-neutral-200 dark:border-transparent">
                  <span className="iconify opacity-70 group-hover:opacity-100 transition-opacity rtl:rotate-180" data-icon="solar:play-circle-bold-duotone" data-width="20"></span>
                  <span>{t('cta_demo')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="mt-16 animate-on-scroll" style={{ animationDelay: '0.3s' }}>
            <div className="relative w-full max-w-5xl mx-auto border-gradient rounded-xl bg-[#0A0A0A] shadow-2xl shadow-neutral-200/50 dark:shadow-none overflow-hidden" dir="ltr">
              {/* Top Bar */}
              <div className="border-b border-white/10 p-3 flex items-center gap-2 bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <div className="ml-4 text-[10px] text-neutral-500 font-mono bg-black/50 px-2 py-0.5 rounded">symplysis.com/home</div>
              </div>

              <div className="flex min-h-[500px] md:h-[600px]">
                {/* Sidebar */}
                <div className="w-64 hidden md:flex flex-col border-r border-white/10 bg-black/40 p-4">
                  <div className="flex items-center gap-2 mb-8 px-2">
                    <span className="iconify text-purple-400" data-icon="solar:infinity-bold-duotone"></span>
                    <span className="font-semibold text-sm text-white">SymplysisAI</span>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] uppercase text-neutral-500 font-bold px-2 mb-2">AI Tools</p>
                      <ul className="space-y-1">
                        <li><Link to="/dashboard" className="flex items-center gap-2 px-2 py-1.5 bg-white/10 rounded-md text-sm text-white"><span className="iconify" data-icon="solar:widget-bold-duotone"></span> Dashboard</Link></li>
                        <li><Link to="/ad-copy-generator" className="flex items-center gap-2 px-2 py-1.5 text-neutral-400 hover:text-white text-sm"><span className="iconify" data-icon="solar:pen-new-square-bold-duotone"></span> Ad Copy</Link></li>
                        <li><Link to="/voiceover-generator" className="flex items-center gap-2 px-2 py-1.5 text-neutral-400 hover:text-white text-sm"><span className="iconify" data-icon="solar:microphone-bold-duotone"></span> Voiceover</Link></li>
                        <li><Link to="/poster-generator" className="flex items-center gap-2 px-2 py-1.5 text-neutral-400 hover:text-white text-sm"><span className="iconify" data-icon="solar:gallery-bold-duotone"></span> Poster</Link></li>
                        <li><Link to="/landing-page-generator" className="flex items-center gap-2 px-2 py-1.5 text-neutral-400 hover:text-white text-sm"><span className="iconify" data-icon="solar:laptop-minimalistic-bold-duotone"></span> Landing Page</Link></li>
                      </ul>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase text-neutral-500 font-bold px-2 mb-2">Future Tools</p>
                      <ul className="space-y-1 opacity-60">
                        <li className="flex justify-between px-2 py-1 text-sm text-neutral-500"><span>UGC Videos</span> <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 rounded">Soon</span></li>
                        <li className="flex justify-between px-2 py-1 text-sm text-neutral-500"><span>Email Maker</span> <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 rounded">Soon</span></li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">A</div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-medium text-white truncate">Ahmed</p>
                        <p className="text-[10px] text-neutral-500 truncate">ahme.ed@gmail.com</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-black/20 p-6 overflow-y-auto dashboard-scroll">
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-1 text-white">Welcome back, Ahmed</h2>
                    <p className="text-sm text-neutral-400">Your creative workspace is ready.</p>
                  </div>

                  {/* Pro Tip */}
                  <div className="mb-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-lg p-4 flex items-start gap-3">
                    <span className="iconify text-yellow-400 mt-0.5" data-icon="solar:lightbulb-bold-duotone" data-width="20"></span>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Pro Tip: Color Psychology</h3>
                      <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                        Red creates urgency, blue builds trust, green suggests growth. Use these wisely in your next campaign generation.
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <h3 className="text-sm font-medium text-neutral-400 mb-4 uppercase tracking-wide">Today's Activity</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <div className="text-neutral-400 text-xs mb-2">Ad Copies</div>
                      <div className="text-2xl font-bold text-white">0</div>
                      <div className="text-[10px] text-neutral-500 mt-1">Generated today</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <div className="text-neutral-400 text-xs mb-2">Voiceovers</div>
                      <div className="text-2xl font-bold text-white">0</div>
                      <div className="text-[10px] text-neutral-500 mt-1">Generated today</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <div className="text-neutral-400 text-xs mb-2">Posters</div>
                      <div className="text-2xl font-bold text-white">0</div>
                      <div className="text-[10px] text-neutral-500 mt-1">Generated today</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <div className="text-neutral-400 text-xs mb-2">Landing Pages</div>
                      <div className="text-2xl font-bold text-white">0</div>
                      <div className="text-[10px] text-neutral-500 mt-1">Generated today</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Logos */}
          <div className="mt-16 text-center animate-on-scroll" style={{ animationDelay: '0.4s' }}>
            <p className="text-sm text-neutral-500 font-medium mb-6">{t('trusted_by')}</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 invert dark:invert-0">
              <span className="text-lg font-bold text-white flex items-center gap-2"><span className="iconify" data-icon="solar:rocket-bold-duotone"></span> Acme Corp</span>
              <span className="text-lg font-bold text-white flex items-center gap-2"><span className="iconify" data-icon="solar:atom-bold-duotone"></span> Kinetik</span>
              <span className="text-lg font-bold text-white font-mono">//DevFlow</span>
              <span className="text-lg font-bold text-white flex items-center gap-2"><span className="iconify" data-icon="solar:bolt-bold-duotone"></span> BoltShift</span>
              <span className="text-lg font-bold text-white flex items-center gap-2"><span className="iconify" data-icon="solar:globe-bold-duotone"></span> GlobalBank</span>
            </div>
          </div>

          {/* Core Features (Bento Grid) */}
          <div id="features" className="mt-24">
            <div className="text-center mb-12 animate-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900 dark:text-white">{t('features_title')}</h2>
              <p className="text-neutral-600 dark:text-neutral-400">{t('features_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4">
              {/* Ad Copy Generator (Main Feature) */}
              <div className="md:col-span-6 lg:col-span-7 rounded-3xl border-gradient bg-white dark:bg-white/5 p-1 overflow-hidden animate-on-scroll shadow-sm dark:shadow-none">
                <div className="bg-neutral-100 dark:bg-black/20 h-full p-6 rounded-[20px]">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="iconify text-blue-600 dark:text-blue-400" data-icon="solar:pen-new-square-bold-duotone" data-width="24"></span>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('feature_ad_title')}</h3>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xs">{t('feature_ad_desc')}</p>
                    </div>
                  </div>

                  {/* Ad Preview Mockup */}
                  <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-white/10 overflow-hidden shadow-md dark:shadow-none" dir="ltr">
                    <div className="flex border-b border-neutral-200 dark:border-white/10">
                      <button className="flex-1 py-2 text-xs font-medium text-neutral-900 dark:text-white bg-neutral-100 dark:bg-white/10 border-b-2 border-blue-500" onClick={() => switchTab('meta')}>Meta</button>
                      <button className="flex-1 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white" onClick={() => switchTab('google')}>Google</button>
                      <button className="flex-1 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white" onClick={() => switchTab('tiktok')}>TikTok</button>
                    </div>
                    <div className="p-4">
                      <div id="ad-meta" className="ad-content block">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center"><span className="iconify text-white" data-icon="logos:facebook"></span></div>
                          <div>
                            <p className="text-xs font-bold text-neutral-900 dark:text-white">Symplysis Store</p>
                            <p className="text-[10px] text-neutral-500">Sponsored · <span className="iconify inline" data-icon="solar:globe-linear"></span></p>
                          </div>
                        </div>
                        <p className="text-sm mb-3 text-neutral-800 dark:text-neutral-300">Never run out of battery again. This portable charger charges your phone 3x on a single charge. Fast charging technology. 🔋</p>
                        <div className="bg-neutral-100 dark:bg-black rounded-lg overflow-hidden mb-2 border border-neutral-200 dark:border-transparent">
                          <img src="https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=200&fit=crop" alt="Charger" className="w-full h-32 object-cover opacity-90 dark:opacity-80" />
                          <div className="p-2 bg-white dark:bg-neutral-800">
                            <p className="text-xs font-bold text-neutral-800 dark:text-neutral-300">Charge 3x Faster, Stay Connected ⚡</p>
                            <button className="mt-2 w-full py-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white text-xs rounded font-bold hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors">Shop Now</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Landing Page Generator */}
              <div className="md:col-span-6 lg:col-span-5 rounded-3xl border-gradient bg-white dark:bg-white/5 p-1 overflow-hidden animate-on-scroll shadow-sm dark:shadow-none" style={{ animationDelay: '0.1s' }}>
                <div className="bg-neutral-100 dark:bg-black/20 h-full p-6 rounded-[20px] flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="iconify text-purple-600 dark:text-purple-400" data-icon="solar:laptop-minimalistic-bold-duotone" data-width="24"></span>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('feature_landing_title')}</h3>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">{t('feature_landing_desc')}</p>

                  <div className="mt-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl p-3 relative shadow-md dark:shadow-none" dir="ltr">
                    <div className="absolute -top-3 left-4 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] px-2 py-0.5 rounded border border-green-200 dark:border-green-500/50">Importing from URL...</div>
                    <div className="text-[10px] text-neutral-500 font-mono mb-2 truncate">amazon.com/fleximove-relief-cream</div>
                    <div className="bg-neutral-100 dark:bg-white/5 rounded p-2 flex gap-3">
                      <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop" className="w-12 h-12 rounded bg-white/10 object-cover" alt="Product" />
                      <div>
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">FlexiMove Pro Relief Cream™</p>
                        <p className="text-[10px] text-yellow-500 dark:text-yellow-400">★★★★★ <span className="text-neutral-500">| 12,347 Customers</span></p>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-xs font-bold text-green-600 dark:text-green-400">$29.99</span>
                          <span className="text-[10px] text-neutral-500 line-through">$59.99</span>
                          <span className="text-[9px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-1 rounded">SAVE 50%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voiceover Studio */}
              <div className="md:col-span-3 lg:col-span-4 rounded-3xl border-gradient bg-white dark:bg-white/5 p-6 animate-on-scroll shadow-sm dark:shadow-none" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="iconify text-pink-500 dark:text-pink-400" data-icon="solar:microphone-bold-duotone" data-width="24"></span>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{t('feature_voice_title')}</h3>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">{t('feature_voice_desc')}</p>
                <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-3 border border-neutral-200 dark:border-white/5" dir="ltr">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-neutral-800 dark:text-white">Tone: Energetic</span>
                    <span className="iconify text-neutral-500" data-icon="solar:settings-linear"></span>
                  </div>
                  <div className="flex items-center gap-1 h-8">
                    <div className="w-1 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                    <div className="w-1 h-5 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-8 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-4 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <div className="w-1 h-6 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Poster Generator */}
              <div className="md:col-span-3 lg:col-span-4 rounded-3xl border-gradient bg-white dark:bg-white/5 p-6 animate-on-scroll shadow-sm dark:shadow-none" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="iconify text-yellow-500 dark:text-yellow-400" data-icon="solar:gallery-bold-duotone" data-width="24"></span>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{t('feature_poster_title')}</h3>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">{t('feature_poster_desc')}</p>
                <div className="relative h-24 bg-neutral-900 rounded-lg overflow-hidden border border-white/5 group" dir="ltr">
                  <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop" className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform" alt="Poster" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs border border-white/20 text-white">3 Pro Templates</span>
                  </div>
                </div>
              </div>

              {/* Use Case / Workflow */}
              <div className="md:col-span-6 lg:col-span-4 rounded-3xl border-gradient bg-white dark:bg-gradient-to-br dark:from-purple-900/20 dark:to-black p-6 animate-on-scroll shadow-sm dark:shadow-none" style={{ animationDelay: '0.4s' }}>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-white" dangerouslySetInnerHTML={{ __html: t('workflow_title') }}></h3>
                  <span className="iconify text-purple-600 dark:text-purple-400 rtl:flip-x" data-icon="solar:rocket-bold-duotone" data-width="24"></span>
                </div>

                <div className="space-y-4 relative">
                  <div className="absolute left-3 top-2 bottom-2 w-px bg-neutral-200 dark:bg-white/10 rtl:right-3 rtl:left-auto"></div>

                  <div className="relative pl-8 rtl:pl-0 rtl:pr-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-purple-600 text-[10px] flex items-center justify-center border border-white/20 font-bold text-white rtl:right-0 rtl:left-auto">1</div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">{t('step_1_title')}</p>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{t('step_1_desc')}</p>
                  </div>
                  <div className="relative pl-8 rtl:pl-0 rtl:pr-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[10px] flex items-center justify-center border border-neutral-300 dark:border-white/20 font-bold text-neutral-700 dark:text-white rtl:right-0 rtl:left-auto">2</div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">{t('step_2_title')}</p>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{t('step_2_desc')}</p>
                  </div>
                  <div className="relative pl-8 rtl:pl-0 rtl:pr-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[10px] flex items-center justify-center border border-neutral-300 dark:border-white/20 font-bold text-neutral-700 dark:text-white rtl:right-0 rtl:left-auto">3</div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">{t('step_3_title')}</p>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{t('step_3_desc')}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-white/10">
                  <div className="bg-neutral-100 dark:bg-white/5 rounded p-2 text-[10px] flex justify-between items-center">
                    <span className="text-neutral-500 dark:text-neutral-400">{t('campaign_name')}</span>
                    <span className="text-green-600 dark:text-green-400">{t('campaign_time')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <section id="why-symplysis" className="mt-24 animate-on-scroll">
            <div className="bg-white dark:bg-white/5 rounded-3xl p-6 md:p-12 border border-neutral-200 dark:border-white/10 shadow-sm dark:shadow-none">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">{t('compare_title')}</h2>
                <p className="text-neutral-600 dark:text-neutral-400 mt-2">{t('compare_subtitle')}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse rtl:text-right">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-white/10">
                      <th className="py-4 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">{t('th_feature')}</th>
                      <th className="py-4 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">{t('th_others')}</th>
                      <th className="py-4 px-4 text-sm font-bold text-purple-600 dark:text-purple-400">Symplysis</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-neutral-200 dark:border-white/5 hover:bg-neutral-50 dark:hover:bg-white/[0.02]">
                      <td className="py-4 px-4 font-medium text-neutral-900 dark:text-white">{t('td_platform')}</td>
                      <td className="py-4 px-4 text-neutral-500 dark:text-neutral-400">{t('td_fragmented')}</td>
                      <td className="py-4 px-4 font-bold text-neutral-900 dark:text-white flex items-center gap-2"><span className="iconify text-green-500 dark:text-green-400" data-icon="solar:check-circle-bold"></span> <span>{t('td_allinone')}</span></td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-white/5 hover:bg-neutral-50 dark:hover:bg-white/[0.02]">
                      <td className="py-4 px-4 font-medium text-neutral-900 dark:text-white">{t('td_landing_pages')}</td>
                      <td className="py-4 px-4 text-neutral-500 dark:text-neutral-400">{t('td_dragdrop')}</td>
                      <td className="py-4 px-4 font-bold text-neutral-900 dark:text-white flex items-center gap-2"><span className="iconify text-green-500 dark:text-green-400" data-icon="solar:check-circle-bold"></span> <span>{t('td_instant')}</span></td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-white/5 hover:bg-neutral-50 dark:hover:bg-white/[0.02]">
                      <td className="py-4 px-4 font-medium text-neutral-900 dark:text-white">{t('td_speed')}</td>
                      <td className="py-4 px-4 text-neutral-500 dark:text-neutral-400">{t('td_speed_other')}</td>
                      <td className="py-4 px-4 font-bold text-neutral-900 dark:text-white flex items-center gap-2"><span className="iconify text-green-500 dark:text-green-400" data-icon="solar:check-circle-bold"></span> <span>{t('td_speed_sym')}</span></td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-white/5 hover:bg-neutral-50 dark:hover:bg-white/[0.02]">
                      <td className="py-4 px-4 font-medium text-neutral-900 dark:text-white">{t('td_compliance')}</td>
                      <td className="py-4 px-4 text-neutral-500 dark:text-neutral-400">{t('td_compliance_other')}</td>
                      <td className="py-4 px-4 font-bold text-neutral-900 dark:text-white flex items-center gap-2"><span className="iconify text-green-500 dark:text-green-400" data-icon="solar:check-circle-bold"></span> <span>{t('td_compliance_sym')}</span></td>
                    </tr>
                    <tr className="hover:bg-neutral-50 dark:hover:bg-white/[0.02]">
                      <td className="py-4 px-4 font-medium text-neutral-900 dark:text-white">{t('td_cost')}</td>
                      <td className="py-4 px-4 text-red-500 dark:text-red-400">{t('td_cost_other')}</td>
                      <td className="py-4 px-4 font-bold text-neutral-900 dark:text-white text-lg">{t('td_cost_sym')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="mt-24 animate-on-scroll">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">{t('pricing_title')}</h2>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">{t('pricing_subtitle')}</p>

              <div className="mt-6 inline-flex bg-neutral-100 dark:bg-white/10 rounded-full p-1 border border-neutral-200 dark:border-white/10">
                <button id="btn-monthly" onClick={() => setBilling('monthly')} className="px-4 py-1 text-sm rounded-full text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all duration-300">{t('monthly')}</button>
                <button id="btn-yearly" onClick={() => setBilling('yearly')} className="px-4 py-1 text-sm rounded-full bg-purple-600 text-white shadow font-medium transition-all duration-300">{t('yearly_discount')}</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Starter */}
              <div className="p-8 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-purple-300 dark:hover:border-white/20 transition-colors flex flex-col shadow-sm dark:shadow-none">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{t('starter_title')}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t('starter_desc')}</p>
                <div className="mt-4 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-neutral-900 dark:text-white">$0</span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{t('for_7_days')}</span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1 flex items-center gap-1"><span className="iconify" data-icon="solar:check-circle-bold" data-width="12"></span> <span>{t('cancel_anytime')}</span></p>
                  <p className="text-[11px] text-neutral-500 mt-3 pt-3 border-t border-neutral-100 dark:border-white/5">
                    {t('then')} <span className="text-neutral-700 dark:text-neutral-300 font-bold text-sm">$<span id="price-starter">23</span></span>/mo {t('billed')} <span className="billing-period">{t('annually')}</span>
                  </p>
                </div>
                <button onClick={() => navigate('/signup')} className="w-full py-2 rounded-lg border border-neutral-200 dark:border-white/20 hover:bg-neutral-100 dark:hover:bg-white dark:hover:text-black text-neutral-900 dark:text-white transition-colors text-sm font-bold mb-6">{t('start_free_trial')}</button>
                <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
                  <li className="flex gap-2"><span className="iconify text-purple-600 dark:text-purple-400" data-icon="solar:check-read-linear"></span> <span>{t('feat_200_ad')}</span></li>
                  <li className="flex gap-2"><span className="iconify text-purple-600 dark:text-purple-400" data-icon="solar:check-read-linear"></span> <span>{t('feat_50_voice')}</span></li>
                  <li className="flex gap-2"><span className="iconify text-purple-600 dark:text-purple-400" data-icon="solar:check-read-linear"></span> <span>{t('feat_20_landing')}</span></li>
                  <li className="flex gap-2"><span className="iconify text-purple-600 dark:text-purple-400" data-icon="solar:check-read-linear"></span> <span>{t('feat_30_poster')}</span></li>
                </ul>
              </div>

              {/* Premium */}
              <div className="relative p-8 rounded-2xl border border-purple-300 dark:border-purple-500/50 bg-white dark:bg-gradient-to-b dark:from-purple-900/20 dark:to-black hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-shadow flex flex-col shadow-lg dark:shadow-none">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md">{t('popular')}</div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{t('premium_title')}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t('premium_desc')}</p>
                <div className="mt-4 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-neutral-900 dark:text-white">$0</span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{t('for_7_days')}</span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1 flex items-center gap-1"><span className="iconify" data-icon="solar:check-circle-bold" data-width="12"></span> <span>{t('cancel_anytime')}</span></p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-3 pt-3 border-t border-neutral-100 dark:border-white/10">
                    {t('then')} <span className="text-neutral-900 dark:text-white font-bold text-sm">$<span id="price-premium">39</span></span>/mo {t('billed')} <span className="billing-period">{t('annually')}</span>
                  </p>
                </div>
                <button onClick={() => navigate('/signup')} className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors text-sm font-bold mb-6 shadow-lg shadow-purple-900/20">{t('start_free_trial')}</button>
                <ul className="space-y-3 text-sm text-neutral-700 dark:text-white">
                  <li className="flex gap-2"><span className="iconify text-green-500 dark:text-green-400" data-icon="solar:check-read-linear"></span> <span>{t('feat_500_ad')}</span></li>
                  <li className="flex gap-2"><span className="iconify text-green-500 dark:text-green-400" data-icon="solar:check-read-linear"></span> <span>{t('feat_200_voice')}</span></li>
                  <li className="flex gap-2"><span className="iconify text-green-500 dark:text-green-400" data-icon="solar:check-read-linear"></span> <span>{t('feat_50_landing')}</span></li>
                  <li className="flex gap-2"><span className="iconify text-green-500 dark:text-green-400" data-icon="solar:check-read-linear"></span> <span>{t('feat_80_poster')}</span></li>
                  <li className="flex gap-2"><span className="iconify text-green-500 dark:text-green-400" data-icon="solar:check-read-linear"></span> <span>{t('feat_priority')}</span></li>
                </ul>
              </div>

              {/* Enterprise */}
              <div className="p-8 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-purple-300 dark:hover:border-white/20 transition-colors flex flex-col shadow-sm dark:shadow-none">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{t('enterprise_title')}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{t('enterprise_desc')}</p>
                <div className="mt-4 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-neutral-900 dark:text-white">{t('custom')}</span>
                  </div>
                  <p className="text-xs text-neutral-500 font-medium mt-1 opacity-0 select-none">Placeholder</p>
                  <p className="text-[11px] text-neutral-500 mt-3 pt-3 border-t border-neutral-100 dark:border-white/5">
                    {t('volume_pricing')}
                  </p>
                </div>
                <button onClick={() => navigate('/support')} className="w-full py-2 rounded-lg border border-neutral-200 dark:border-white/20 hover:bg-neutral-100 dark:hover:bg-white dark:hover:text-black text-neutral-900 dark:text-white transition-colors text-sm font-bold mb-6">{t('contact_sales')}</button>
                <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
                  <li className="flex gap-2"><span className="iconify text-purple-600 dark:text-purple-400" data-icon="solar:check-read-linear"></span> <span>{t('feat_unlimited')}</span></li>
                  <li className="flex gap-2"><span className="iconify text-purple-600 dark:text-purple-400" data-icon="solar:check-read-linear"></span> <span>{t('feat_custom_int')}</span></li>
                  <li className="flex gap-2"><span className="iconify text-purple-600 dark:text-purple-400" data-icon="solar:check-read-linear"></span> <span>{t('feat_dedicated_support')}</span></li>
                  <li className="flex gap-2"><span className="iconify text-purple-600 dark:text-purple-400" data-icon="solar:check-read-linear"></span> <span>{t('feat_sla')}</span></li>
                  <li className="flex gap-2"><span className="iconify text-purple-600 dark:text-purple-400" data-icon="solar:check-read-linear"></span> <span>{t('feat_sso')}</span></li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA Footer */}
          <div className="mt-24 text-center animate-on-scroll">
            <h2 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-white">{t('footer_cta_title')}</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">{t('footer_cta_desc')}</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => navigate('/signup')} className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full font-bold hover:opacity-90 transition-opacity shadow-lg">{t('get_started_free')}</button>
              <button onClick={() => navigate('/support')} className="px-6 py-3 border border-neutral-200 dark:border-white/20 rounded-full font-bold text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors">{t('contact_sales')}</button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-32 mb-24">
          <div className="rounded-3xl border-gradient p-8 sm:p-12 backdrop-blur bg-white dark:bg-white/[0.02] border border-neutral-200 dark:border-transparent shadow-sm dark:shadow-none">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {/* Brand */}
              <div className="md:col-span-2">
                <Link to="/" className="flex items-center gap-2 mb-4">
                  <img
                    src="https://auth.symplysis.com/storage/v1/object/public/Logos/Symplysis%20Logo/SymplyssAI.png"
                    alt="Symplysis Logo"
                    className="h-8 w-auto"
                  />
                  <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">Symplysis</span>
                </Link>
                <p className="text-sm text-neutral-600 dark:text-neutral-500 leading-relaxed max-w-xs">
                  {t('footer_tagline')}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-600 mt-6">© 2025 Symplysis Inc. All rights reserved.</p>

                {/* Controls Row: Language + Theme */}
                <div className="mt-6 flex items-center gap-4">
                  {/* Language Selector */}
                  <div className="flex items-center gap-2 bg-neutral-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-white/10">
                    <button onClick={() => setLanguage('en')} className={`text-xs font-medium transition-colors ${language === 'en' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-purple-400'}`} id="lang-en">English</button>
                    <span className="text-neutral-300 dark:text-neutral-700">|</span>
                    <button onClick={() => setLanguage('ar')} className={`text-xs font-medium transition-colors ${language === 'ar' ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-purple-400'}`} id="lang-ar">العربية</button>
                  </div>

                  {/* Theme Toggle */}
                  <button onClick={toggleTheme} className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors text-neutral-600 dark:text-yellow-400" aria-label="Toggle Theme">
                    <span id="theme-icon" className="iconify" data-icon={isDark ? "solar:sun-bold-duotone" : "solar:moon-bold-duotone"} data-width="16"></span>
                  </button>
                </div>
              </div>

              {/* Links */}
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">{t('nav_product')}</h4>
                <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <li><Link to="/features/ad-copy" className="hover:text-purple-600 dark:hover:text-white transition-colors">{t('link_ad_copy')}</Link></li>
                  <li><Link to="/features/landing-pages" className="hover:text-purple-600 dark:hover:text-white transition-colors">{t('link_landing')}</Link></li>
                  <li><Link to="/features/voiceovers" className="hover:text-purple-600 dark:hover:text-white transition-colors">{t('link_voiceover')}</Link></li>
                  <li><Link to="/features/posters" className="hover:text-purple-600 dark:hover:text-white transition-colors">{t('link_poster')}</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">{t('nav_resources')}</h4>
                <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <li><Link to="/faq" className="hover:text-purple-600 dark:hover:text-white transition-colors">{t('link_faq')}</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">{t('nav_legal')}</h4>
                <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <li><Link to="/privacy" className="hover:text-purple-600 dark:hover:text-white transition-colors">{t('link_privacy')}</Link></li>
                  <li><Link to="/terms" className="hover:text-purple-600 dark:hover:text-white transition-colors">{t('link_terms')}</Link></li>
                  <li><Link to="/cookies" className="hover:text-purple-600 dark:hover:text-white transition-colors">{t('link_security')}</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </main>

    </div>
  )
}

export default Homepage
