import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Store, Zap, TrendingUp, Target, BookOpen, Trash2, Settings2, Blocks, ClipboardList, Music2, Brain, Waypoints, X, RefreshCcw, Save, Settings } from 'lucide-react';
import Flag from 'react-world-flags';
import { TextShimmer } from './ui/text-shimmer';
import { supabase } from '../lib/supabase';
import { DeepSeekService } from '../services/deepseekService';
import { GeminiService } from '../services/geminiService';
import { useUsageTracking } from '../hooks/useUsageTracking';
import { useSubscription } from '../contexts/SubscriptionContext';
import { SubscriptionGuard } from './SubscriptionGuard';
import AdCopyPremiumGate from './AdCopyPremiumGate';
import CreditPurchaseModal from './CreditPurchaseModal';
import { LoadingSpinner } from './ui/LoadingSpinner';

const AdcopyGen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasAccess, loading: subscriptionLoading } = useSubscription();
  const { canGenerate, incrementUsage, refreshUsage, loading: usageLoading } = useUsageTracking();

  // Check if mobile to account for mobile header
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // All your state variables here
  const [smartInput, setSmartInput] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [textInput, setTextInput] = useState('');
  const [webpageUrl, setWebpageUrl] = useState('');
  const [textLoading, setTextLoading] = useState(false);
  const [scrapingLoading, setScrapingLoading] = useState(false);
  const [parsedAdCopies, setParsedAdCopies] = useState<string[]>([]);
  const [webpageParsedAdCopies, setWebpageParsedAdCopies] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedTone, setSelectedTone] = useState('Expert');
  const [customTone, setCustomTone] = useState('');
  const [showLanguageSlideout, setShowLanguageSlideout] = useState(false);
  const [showToneSlideout, setShowToneSlideout] = useState(false);
  const [showNetworkSlideout, setShowNetworkSlideout] = useState(false);
  const [showAiProviderSlideout, setShowAiProviderSlideout] = useState(false);
  const [aiProvider, setAiProvider] = useState('deepseek');
  const [adCopyQuantity, setAdCopyQuantity] = useState(3);
  const [selectedAdNetwork, setSelectedAdNetwork] = useState('General');
  const [generatedWithNetwork, setGeneratedWithNetwork] = useState('General');
  const [noEmojis, setNoEmojis] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [generationPhase, setGenerationPhase] = useState<'scraping' | 'generating' | null>(null);
  const [urlHover, setUrlHover] = useState(false);
  const [savedPresets, setSavedPresets] = useState<any[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'settings' | 'history'>('settings');
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyBanner, setHistoryBanner] = useState<string | null>(null);
  const [historyActive, setHistoryActive] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isEditingPresets, setIsEditingPresets] = useState(false);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [scrapedContent, setScrapedContent] = useState('');
  const [visionAIOcrCache, setVisionAIOcrCache] = useState<{ [key: string]: { text: string; timestamp: number } }>({});
  const [showCachedContentModal, setShowCachedContentModal] = useState(false);
  const [cachedContentToDisplay, setCachedContentToDisplay] = useState('');
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  // Check if URL contains /credits and open modal
  useEffect(() => {
    if (location.pathname === '/ad-copy-generator/credits') {
      setShowCreditModal(true);
    }
  }, [location.pathname]);

  // Close mobile settings when slideouts open
  useEffect(() => {
    if (showLanguageSlideout || showToneSlideout || showNetworkSlideout || showAiProviderSlideout) {
      setShowMobileSettings(false);
    }
  }, [showLanguageSlideout, showToneSlideout, showNetworkSlideout, showAiProviderSlideout]);

  // Prevent body scroll when component is mounted
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalHtmlHeight = document.documentElement.style.height;

    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.documentElement.style.height = originalHtmlHeight;
    };
  }, []);

  // Language options
  const languageOptions = ['English', 'Arabic', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Chinese', 'Japanese'];

  // Helper functions
  const decrementCopies = () => setAdCopyQuantity((q) => Math.max(1, q - 1));
  const incrementCopies = () => setAdCopyQuantity((q) => Math.min(10, q + 1));

  // Filter function to remove HTML tags/patterns from scraped content
  const filterScrapedContent = (content: string): string => {
    if (!content) return content;
    
    // Remove HTML tags, attributes, and patterns - only single words/patterns, not entire lines
    let filtered = content;
    
    // Remove opening HTML tags
    filtered = filtered.replace(/<!DOCTYPE/gi, '');
    filtered = filtered.replace(/<html/gi, '');
    filtered = filtered.replace(/<head/gi, '');
    filtered = filtered.replace(/<header/gi, '');
    filtered = filtered.replace(/<body/gi, '');
    filtered = filtered.replace(/<div/gi, '');
    filtered = filtered.replace(/<meta/gi, '');
    filtered = filtered.replace(/<title/gi, '');
    filtered = filtered.replace(/<a(?=\s|>|$)/gi, ''); // <a followed by space, >, or end of string
    filtered = filtered.replace(/<h[1-6]/gi, ''); // <h1, <h2, <h3, <h4, <h5, <h6
    filtered = filtered.replace(/<form/gi, '');
    filtered = filtered.replace(/<ul/gi, '');
    filtered = filtered.replace(/<li/gi, '');
    filtered = filtered.replace(/<nav/gi, '');
    filtered = filtered.replace(/<link/gi, '');
    filtered = filtered.replace(/<img/gi, '');
    filtered = filtered.replace(/<input/gi, '');
    filtered = filtered.replace(/<button/gi, '');
    filtered = filtered.replace(/<select/gi, '');
    filtered = filtered.replace(/<option/gi, '');
    filtered = filtered.replace(/<i\s/gi, ' '); // <i followed by space
    filtered = filtered.replace(/<i>/gi, ' '); // <i> tag
    filtered = filtered.replace(/<p\s/gi, ' '); // <p followed by space
    filtered = filtered.replace(/<p>/gi, ' '); // <p> tag
    filtered = filtered.replace(/<span/gi, '');
    filtered = filtered.replace(/<strong/gi, '');
    filtered = filtered.replace(/<main/gi, '');
    filtered = filtered.replace(/<flash/gi, '');
    filtered = filtered.replace(/<cart-side-summary/gi, '');
    filtered = filtered.replace(/<product-show/gi, '');
    filtered = filtered.replace(/<section/gi, '');
    filtered = filtered.replace(/<svg/gi, '');
    filtered = filtered.replace(/<path/gi, '');
    filtered = filtered.replace(/<label/gi, '');
    
    // Remove closing HTML tags
    filtered = filtered.replace(/<\/head/gi, '');
    filtered = filtered.replace(/<\/html/gi, '');
    filtered = filtered.replace(/<\/header/gi, '');
    filtered = filtered.replace(/<\/body/gi, '');
    filtered = filtered.replace(/<\/div/gi, '');
    filtered = filtered.replace(/<\/a/gi, '');
    filtered = filtered.replace(/<\/h[1-6]/gi, ''); // </h1, </h2, etc.
    filtered = filtered.replace(/<\/form/gi, '');
    filtered = filtered.replace(/<\/ul/gi, '');
    filtered = filtered.replace(/<\/li/gi, '');
    filtered = filtered.replace(/<\/nav/gi, '');
    filtered = filtered.replace(/<\/p/gi, '');
    filtered = filtered.replace(/<\/span/gi, '');
    filtered = filtered.replace(/<\/strong/gi, '');
    filtered = filtered.replace(/<\/i/gi, '');
    filtered = filtered.replace(/<\/title/gi, '');
    filtered = filtered.replace(/<\/main/gi, '');
    filtered = filtered.replace(/<\/flash/gi, '');
    filtered = filtered.replace(/<\/cart-side-summary/gi, '');
    filtered = filtered.replace(/<\/product-show/gi, '');
    filtered = filtered.replace(/<\/section/gi, '');
    filtered = filtered.replace(/<\/svg/gi, '');
    filtered = filtered.replace(/<\/path/gi, '');
    filtered = filtered.replace(/<\/label/gi, '');
    
    // Remove HTML attributes (only the attribute name with =)
    filtered = filtered.replace(/dir=/gi, '');
    filtered = filtered.replace(/lang=/gi, '');
    filtered = filtered.replace(/charset=/gi, '');
    filtered = filtered.replace(/http-equiv=/gi, '');
    filtered = filtered.replace(/content=/gi, '');
    filtered = filtered.replace(/name=/gi, '');
    filtered = filtered.replace(/property=/gi, '');
    filtered = filtered.replace(/id=/gi, '');
    filtered = filtered.replace(/class=/gi, '');
    filtered = filtered.replace(/style=/gi, '');
    filtered = filtered.replace(/href=/gi, '');
    filtered = filtered.replace(/src=/gi, '');
    filtered = filtered.replace(/alt=/gi, '');
    filtered = filtered.replace(/type=/gi, '');
    filtered = filtered.replace(/rel=/gi, '');
    filtered = filtered.replace(/:class=/gi, '');
    filtered = filtered.replace(/v-if=/gi, '');
    filtered = filtered.replace(/@click=/gi, '');
    filtered = filtered.replace(/action=/gi, '');
    filtered = filtered.replace(/method=/gi, '');
    filtered = filtered.replace(/placeholder=/gi, '');
    filtered = filtered.replace(/value=/gi, '');
    filtered = filtered.replace(/required/gi, '');
    filtered = filtered.replace(/selected/gi, '');
    filtered = filtered.replace(/title=/gi, '');
    filtered = filtered.replace(/aria-label=/gi, '');
    filtered = filtered.replace(/data-name=/gi, '');
    filtered = filtered.replace(/:initial-cart=/gi, '');
    filtered = filtered.replace(/:product=/gi, '');
    filtered = filtered.replace(/:sections=/gi, '');
    filtered = filtered.replace(/:product-settings=/gi, '');
    filtered = filtered.replace(/:reviews=/gi, '');
    filtered = filtered.replace(/:is-preview=/gi, '');
    filtered = filtered.replace(/:customer-country-code=/gi, '');
    filtered = filtered.replace(/:form-settings=/gi, '');
    filtered = filtered.replace(/view-content-event-/gi, '');
    filtered = filtered.replace(/is-express-checkout-enabled/gi, '');
    filtered = filtered.replace(/data-/gi, '');
    filtered = filtered.replace(/data-animate=/gi, '');
    filtered = filtered.replace(/data-boxed=/gi, '');
    filtered = filtered.replace(/data-dest=/gi, '');
    filtered = filtered.replace(/viewBox=/gi, '');
    filtered = filtered.replace(/preserveAspectRatio=/gi, '');
    filtered = filtered.replace(/sizes=/gi, '');
    filtered = filtered.replace(/srcSet=/gi, '');
    filtered = filtered.replace(/inputMode=/gi, '');
    filtered = filtered.replace(/for=/gi, '');
    filtered = filtered.replace(/forId-/gi, '');
    filtered = filtered.replace(/xmlns=/gi, '');
    filtered = filtered.replace(/version=/gi, '');
    
    // Remove HTML comments
    filtered = filtered.replace(/<!--/g, '');
    filtered = filtered.replace(/-->/g, '');
    
    // Remove bracket patterns
    filtered = filtered.replace(/\[SCRIPT\]/gi, '');
    filtered = filtered.replace(/\[STYLE\]/gi, '');
    
    // Remove HTML entities
    filtered = filtered.replace(/&quot/gi, '');
    filtered = filtered.replace(/&nbsp/gi, '');
    filtered = filtered.replace(/&lt;/gi, '');
    filtered = filtered.replace(/&gt;/gi, '');
    
    // Remove standalone >, </, and / characters
    filtered = filtered.replace(/>/g, ' ');
    filtered = filtered.replace(/<\//g, ' ');
    filtered = filtered.replace(/\s\/\s/g, ' '); // Standalone / with spaces
    filtered = filtered.replace(/\s\/$/g, ' '); // / at end of word
    filtered = filtered.replace(/^\s*\//g, ' '); // / at start
    
    // Remove common HTML attribute values (only when they appear as standalone quoted strings or values)
    // These are HTML-specific values that shouldn't be in content
    filtered = filtered.replace(/"rtl"/gi, '');
    filtered = filtered.replace(/"ar"/gi, '');
    filtered = filtered.replace(/"utf-8"/gi, '');
    filtered = filtered.replace(/"X-UA-Compatible"/gi, '');
    filtered = filtered.replace(/"IE=edge"/gi, '');
    filtered = filtered.replace(/"viewport"/gi, '');
    filtered = filtered.replace(/"width=device-width"/gi, '');
    filtered = filtered.replace(/"initial-scale=1"/gi, '');
    filtered = filtered.replace(/"theme-color"/gi, '');
    filtered = filtered.replace(/"#FFF"/gi, '');
    filtered = filtered.replace(/"stylesheet"/gi, '');
    filtered = filtered.replace(/"icon"/gi, '');
    filtered = filtered.replace(/"image\/png"/gi, '');
    filtered = filtered.replace(/"image\/jpeg"/gi, '');
    filtered = filtered.replace(/"GET"/gi, '');
    filtered = filtered.replace(/"POST"/gi, '');
    filtered = filtered.replace(/"search"/gi, '');
    filtered = filtered.replace(/"submit"/gi, '');
    filtered = filtered.replace(/"hidden"/gi, '');
    filtered = filtered.replace(/"collections"/gi, '');
    filtered = filtered.replace(/"collection"/gi, '');
    filtered = filtered.replace(/"width=device-width, initial-scale=1"/gi, '');
    filtered = filtered.replace(/"msapplication-navbutton-color"/gi, '');
    filtered = filtered.replace(/"apple-mobile-web-app-capable"/gi, '');
    filtered = filtered.replace(/"yes"/gi, '');
    filtered = filtered.replace(/"apple-mobile-web-app-status-bar-style"/gi, '');
    filtered = filtered.replace(/"black-translucent"/gi, '');
    filtered = filtered.replace(/"format-detection"/gi, '');
    filtered = filtered.replace(/"telephone=no"/gi, '');
    filtered = filtered.replace(/"csrf-token"/gi, '');
    filtered = filtered.replace(/"product:brand"/gi, '');
    filtered = filtered.replace(/"product:availability"/gi, '');
    filtered = filtered.replace(/"in stock"/gi, '');
    filtered = filtered.replace(/"product:condition"/gi, '');
    filtered = filtered.replace(/"new"/gi, '');
    filtered = filtered.replace(/"product:price:amount"/gi, '');
    filtered = filtered.replace(/"3500"/gi, '');
    filtered = filtered.replace(/"product:price:currency"/gi, '');
    filtered = filtered.replace(/"DZD"/gi, '');
    filtered = filtered.replace(/"product:sale_price:currency"/gi, '');
    filtered = filtered.replace(/"product:sale_price:amount"/gi, '');
    filtered = filtered.replace(/"2900"/gi, '');
    filtered = filtered.replace(/"product:retailer_item_id"/gi, '');
    filtered = filtered.replace(/"og:title"/gi, '');
    filtered = filtered.replace(/"og:url"/gi, '');
    filtered = filtered.replace(/"og:price:amount"/gi, '');
    filtered = filtered.replace(/"og:price:currency"/gi, '');
    filtered = filtered.replace(/"twitter:title"/gi, '');
    filtered = filtered.replace(/"twitter:description"/gi, '');
    filtered = filtered.replace(/"text-align: center;"/gi, '');
    filtered = filtered.replace(/"color: rgb\(255, 255, 255\);"/gi, '');
    filtered = filtered.replace(/"background-color: #ffffff;border-bottom: 1px solid #f0f0f0;"/gi, '');
    filtered = filtered.replace(/"background-color: #D0021BFF;"/gi, '');
    filtered = filtered.replace(/"width=device-width, initial-scale=1, maximum-scale=1"/gi, '');
    filtered = filtered.replace(/"description"/gi, '');
    filtered = filtered.replace(/"keywords"/gi, '');
    filtered = filtered.replace(/"canonical"/gi, '');
    filtered = filtered.replace(/"root"/gi, '');
    filtered = filtered.replace(/"og:description"/gi, '');
    filtered = filtered.replace(/"og:image"/gi, '');
    filtered = filtered.replace(/"og:type"/gi, '');
    filtered = filtered.replace(/"product"/gi, '');
    filtered = filtered.replace(/"material-icons"/gi, '');
    filtered = filtered.replace(/"local_fire_department"/gi, '');
    filtered = filtered.replace(/"wys"/gi, '');
    filtered = filtered.replace(/"Order_Form"/gi, '');
    filtered = filtered.replace(/"auto_awesome"/gi, '');
    filtered = filtered.replace(/"text"/gi, '');
    filtered = filtered.replace(/"numeric"/gi, '');
    filtered = filtered.replace(/"notifications_active"/gi, '');
    filtered = filtered.replace(/"Untitled link"/gi, '');
    filtered = filtered.replace(/"data:image\/x-icon;,"/gi, '');
    filtered = filtered.replace(/"version="1.1""/gi, '');
    filtered = filtered.replace(/"xmlns="http:\/\/www\.w3\.org\/2000\/svg""/gi, '');
    filtered = filtered.replace(/"width="1024""/gi, '');
    filtered = filtered.replace(/"height="1024""/gi, '');
    filtered = filtered.replace(/"viewBox="0 0 1024 1024""/gi, '');
    filtered = filtered.replace(/"d="M[^"]*""/gi, ''); // SVG path data
    
    // Remove common HTML/CSS class and ID names (only standalone words)
    filtered = filtered.replace(/\b"app"\b/gi, '');
    filtered = filtered.replace(/\b"container"\b/gi, '');
    filtered = filtered.replace(/\b"header-wrapper"\b/gi, '');
    filtered = filtered.replace(/\b"notice-bar"\b/gi, '');
    filtered = filtered.replace(/\b"desktop-notice-bar"\b/gi, '');
    filtered = filtered.replace(/\b"mobile-notice-bar"\b/gi, '');
    filtered = filtered.replace(/\b"fr-view"\b/gi, '');
    filtered = filtered.replace(/\b"app-header"\b/gi, '');
    filtered = filtered.replace(/\b"main-bar"\b/gi, '');
    filtered = filtered.replace(/\b"header-container"\b/gi, '');
    filtered = filtered.replace(/\b"header-center"\b/gi, '');
    filtered = filtered.replace(/\b"header-element"\b/gi, '');
    filtered = filtered.replace(/\b"header-brand"\b/gi, '');
    filtered = filtered.replace(/\b"overlay"\b/gi, '');
    filtered = filtered.replace(/\b"side-navigation"\b/gi, '');
    filtered = filtered.replace(/\b"navigation-brand"\b/gi, '');
    filtered = filtered.replace(/\b"navigation-search"\b/gi, '');
    filtered = filtered.replace(/\b"search-input"\b/gi, '');
    filtered = filtered.replace(/\b"list-unstyled"\b/gi, '');
    filtered = filtered.replace(/\b"navigation-list"\b/gi, '');
    filtered = filtered.replace(/\b"search-form"\b/gi, '');
    filtered = filtered.replace(/\b"search-select"\b/gi, '');
    filtered = filtered.replace(/\b"search-submit"\b/gi, '');
    filtered = filtered.replace(/\b"page-wrapper"\b/gi, '');
    filtered = filtered.replace(/\b"single-product"\b/gi, '');
    
    // Remove Vue.js and component patterns
    filtered = filtered.replace(/toggleNavigation\(\)/gi, '');
    filtered = filtered.replace(/showSearch/gi, '');
    filtered = filtered.replace(/showNavigation/gi, '');
    
    // Remove common HTML/Vue component text patterns
    filtered = filtered.replace(/\b"nk"\b/gi, ''); // link pattern
    filtered = filtered.replace(/\b"er"\b/gi, ''); // header pattern
    filtered = filtered.replace(/\b"button"\b/gi, '');
    filtered = filtered.replace(/\b"option"\b/gi, '');
    filtered = filtered.replace(/\b"select"\b/gi, '');
    filtered = filtered.replace(/"yc yc-search"/gi, '');
    filtered = filtered.replace(/"ath"/gi, ''); // path pattern
    filtered = filtered.replace(/"label"/gi, '');
    
    // Remove common CSS class names (LightFunnels/React patterns)
    filtered = filtered.replace(/"pSyxI"/gi, '');
    filtered = filtered.replace(/"Rgl6R"/gi, '');
    filtered = filtered.replace(/"UJmEj"/gi, '');
    filtered = filtered.replace(/"r1BQ1"/gi, '');
    filtered = filtered.replace(/"AxhkF"/gi, '');
    filtered = filtered.replace(/"TZLH7"/gi, '');
    filtered = filtered.replace(/"nR5Hd"/gi, '');
    filtered = filtered.replace(/"P5eKV"/gi, '');
    filtered = filtered.replace(/"UN3mK"/gi, '');
    filtered = filtered.replace(/"_wGVU"/gi, '');
    filtered = filtered.replace(/"xYwyu"/gi, '');
    filtered = filtered.replace(/"wszYD"/gi, '');
    filtered = filtered.replace(/"bvOhf"/gi, '');
    filtered = filtered.replace(/"xitAe"/gi, '');
    filtered = filtered.replace(/"PbjKC"/gi, '');
    filtered = filtered.replace(/"Qsx7X"/gi, '');
    filtered = filtered.replace(/"Gh94d"/gi, '');
    filtered = filtered.replace(/"HLZ5F"/gi, '');
    filtered = filtered.replace(/"R6ykx"/gi, '');
    filtered = filtered.replace(/"DcNF7"/gi, '');
    filtered = filtered.replace(/"E1DT0"/gi, '');
    filtered = filtered.replace(/"xbJPp"/gi, '');
    filtered = filtered.replace(/"top"/gi, '');
    filtered = filtered.replace(/"undefined"/gi, '');
    
    // Remove numbered class patterns like "_0", "_1", "_2", etc.
    filtered = filtered.replace(/"_\d+"/gi, '');
    
    // Remove URL patterns with CDN/image paths
    filtered = filtered.replace(/https:\/\/assets\.lightfunnels\.com\/[^\s"]*/gi, '');
    filtered = filtered.replace(/https:\/\/cdn\.youcan\.shop\/[^\s"]*/gi, '');
    filtered = filtered.replace(/https:\/\/static\d+\.youcan\.shop\/[^\s"]*/gi, '');
    
    // Remove forId patterns
    filtered = filtered.replace(/"forId-p-children-\d+[^"]*"/gi, '');
    
    // Remove JSON-like patterns with semicolons (Vue data bindings)
    filtered = filtered.replace(/\{;sub_total;:0,;count;:0,;one_page_checkout;:false,;created_at;:;[\d\-T:\.Z]+;,;items;:\{;data;:\[\]\}\}/gi, '');
    filtered = filtered.replace(/\{;id;:;[^;]+;,;name;:;[^;]+;,;slug;:;[^;]+;/gi, '');
    filtered = filtered.replace(/;key;:;/gi, '');
    filtered = filtered.replace(/;show;:true/gi, '');
    filtered = filtered.replace(/;show;:false/gi, '');
    filtered = filtered.replace(/;color;:;/gi, '');
    filtered = filtered.replace(/;background;:;/gi, '');
    filtered = filtered.replace(/;border;:;/gi, '');
    filtered = filtered.replace(/;text;:;/gi, '');
    filtered = filtered.replace(/;hover;:;/gi, '');
    filtered = filtered.replace(/;padding;:;/gi, '');
    filtered = filtered.replace(/;top;:30/gi, '');
    filtered = filtered.replace(/;bottom;:30/gi, '');
    filtered = filtered.replace(/;max;:10/gi, '');
    filtered = filtered.replace(/;min;:5/gi, '');
    filtered = filtered.replace(/;days;:0/gi, '');
    filtered = filtered.replace(/;hours;:1/gi, '');
    filtered = filtered.replace(/;minutes;:0/gi, '');
    filtered = filtered.replace(/;seconds;:0/gi, '');
    filtered = filtered.replace(/;before;:;/gi, '');
    filtered = filtered.replace(/;after;:;/gi, '');
    filtered = filtered.replace(/;primary;:;/gi, '');
    filtered = filtered.replace(/;secondary;:;/gi, '');
    filtered = filtered.replace(/;enabled;:true/gi, '');
    filtered = filtered.replace(/;enabled;:false/gi, '');
    filtered = filtered.replace(/;one_page_checkout;:false/gi, '');
    filtered = filtered.replace(/;cart_safe_badges;:null/gi, '');
    filtered = filtered.replace(/;customStock;:;/gi, '');
    filtered = filtered.replace(/;data;:\[\]/gi, '');
    filtered = filtered.replace(/;pagination;:;/gi, '');
    filtered = filtered.replace(/;total;:0/gi, '');
    filtered = filtered.replace(/;count;:0/gi, '');
    filtered = filtered.replace(/;per_page;:10/gi, '');
    filtered = filtered.replace(/;current_page;:1/gi, '');
    filtered = filtered.replace(/;total_pages;:1/gi, '');
    filtered = filtered.replace(/;links;:;\{\}/gi, '');
    filtered = filtered.replace(/;fields;:\[/gi, '');
    filtered = filtered.replace(/;name;:;/gi, '');
    filtered = filtered.replace(/;type;:;text/gi, '');
    filtered = filtered.replace(/;custom;:false/gi, '');
    filtered = filtered.replace(/;displayName;:;/gi, '');
    filtered = filtered.replace(/;placeholder;:;/gi, '');
    filtered = filtered.replace(/;hidden;:null/gi, '');
    filtered = filtered.replace(/;extra;:;/gi, '');
    filtered = filtered.replace(/;countries;:\[/gi, '');
    filtered = filtered.replace(/;code;:;/gi, '');
    filtered = filtered.replace(/;currency;:;/gi, '');
    filtered = filtered.replace(/;isoCode;:;/gi, '');
    filtered = filtered.replace(/;languages;:null/gi, '');
    filtered = filtered.replace(/;nameTrans;:;/gi, '');
    filtered = filtered.replace(/;phone;:;/gi, '');
    filtered = filtered.replace(/;continentCode;:;/gi, '');
    filtered = filtered.replace(/;continent;:;/gi, '');
    
    // Remove semicolon-based JSON patterns more aggressively
    filtered = filtered.replace(/\{;[^}]+\}/g, ' '); // Remove any {;...;} patterns
    filtered = filtered.replace(/\[;[^\]]+\]/g, ' '); // Remove any [;...;] patterns
    
    // Remove more semicolon-based patterns
    filtered = filtered.replace(/,;public_url;:;/gi, '');
    filtered = filtered.replace(/,;thumbnail;:;/gi, '');
    filtered = filtered.replace(/,;description;:;/gi, '');
    filtered = filtered.replace(/,;price;:/gi, '');
    filtered = filtered.replace(/,;compare_at_price;:/gi, '');
    filtered = filtered.replace(/,;has_variants;:/gi, '');
    filtered = filtered.replace(/,;variants_count;:/gi, '');
    filtered = filtered.replace(/,;variant_options;:/gi, '');
    filtered = filtered.replace(/,;track_inventory;:/gi, '');
    filtered = filtered.replace(/,;you_save_amount;:/gi, '');
    filtered = filtered.replace(/,;meta;:/gi, '');
    filtered = filtered.replace(/,;created_at;:/gi, '');
    filtered = filtered.replace(/,;has_related_products;:/gi, '');
    filtered = filtered.replace(/,;related_products;:/gi, '');
    filtered = filtered.replace(/,;product_settings;:/gi, '');
    filtered = filtered.replace(/,;images;:/gi, '');
    filtered = filtered.replace(/,;variants;:/gi, '');
    filtered = filtered.replace(/,;categories;:/gi, '');
    filtered = filtered.replace(/,;id;:/gi, '');
    filtered = filtered.replace(/,;product_id;:/gi, '');
    filtered = filtered.replace(/,;variations;:/gi, '');
    filtered = filtered.replace(/,;options;:/gi, '');
    filtered = filtered.replace(/,;values;:/gi, '');
    filtered = filtered.replace(/,;weight;:/gi, '');
    filtered = filtered.replace(/,;sku;:/gi, '');
    filtered = filtered.replace(/,;inventory;:/gi, '');
    filtered = filtered.replace(/,;is_default;:/gi, '');
    filtered = filtered.replace(/,;image;:/gi, '');
    filtered = filtered.replace(/,;name;:/gi, '');
    filtered = filtered.replace(/,;url;:/gi, '');
    filtered = filtered.replace(/,;sections;:/gi, '');
    filtered = filtered.replace(/,;visitors;:/gi, '');
    filtered = filtered.replace(/,;fakeStock;:/gi, '');
    filtered = filtered.replace(/,;time;:/gi, '');
    filtered = filtered.replace(/,;style;:/gi, '');
    filtered = filtered.replace(/,;padding;:/gi, '');
    filtered = filtered.replace(/,;background;:/gi, '');
    filtered = filtered.replace(/,;text;:/gi, '');
    filtered = filtered.replace(/,;link;:/gi, '');
    filtered = filtered.replace(/,;title;:/gi, '');
    filtered = filtered.replace(/,;price;:/gi, '');
    filtered = filtered.replace(/,;before;:/gi, '');
    filtered = filtered.replace(/,;after;:/gi, '');
    filtered = filtered.replace(/,;addToCart;:/gi, '');
    filtered = filtered.replace(/,;border;:/gi, '');
    filtered = filtered.replace(/,;hover;:/gi, '');
    filtered = filtered.replace(/,;quantityButtons;:/gi, '');
    filtered = filtered.replace(/,;primary;:/gi, '');
    filtered = filtered.replace(/,;secondary;:/gi, '');
    filtered = filtered.replace(/,;option;:/gi, '');
    filtered = filtered.replace(/,;cart_safe_badges;:/gi, '');
    filtered = filtered.replace(/,;enabled;:/gi, '');
    filtered = filtered.replace(/,;one_page_checkout;:/gi, '');
    filtered = filtered.replace(/,;customStock;:/gi, '');
    filtered = filtered.replace(/,;data;:/gi, '');
    filtered = filtered.replace(/,;pagination;:/gi, '');
    filtered = filtered.replace(/,;total;:/gi, '');
    filtered = filtered.replace(/,;count;:/gi, '');
    filtered = filtered.replace(/,;per_page;:/gi, '');
    filtered = filtered.replace(/,;current_page;:/gi, '');
    filtered = filtered.replace(/,;total_pages;:/gi, '');
    filtered = filtered.replace(/,;links;:/gi, '');
    filtered = filtered.replace(/,;fields;:/gi, '');
    filtered = filtered.replace(/,;type;:/gi, '');
    filtered = filtered.replace(/,;custom;:/gi, '');
    filtered = filtered.replace(/,;displayName;:/gi, '');
    filtered = filtered.replace(/,;hidden;:/gi, '');
    filtered = filtered.replace(/,;extra;:/gi, '');
    filtered = filtered.replace(/,;countries;:/gi, '');
    filtered = filtered.replace(/,;code;:/gi, '');
    filtered = filtered.replace(/,;currency;:/gi, '');
    filtered = filtered.replace(/,;isoCode;:/gi, '');
    filtered = filtered.replace(/,;languages;:/gi, '');
    filtered = filtered.replace(/,;nameTrans;:/gi, '');
    filtered = filtered.replace(/,;phone;:/gi, '');
    filtered = filtered.replace(/,;continentCode;:/gi, '');
    filtered = filtered.replace(/,;continent;:/gi, '');
    
    // Remove standalone semicolons and commas in patterns
    filtered = filtered.replace(/,;/g, ' ');
    filtered = filtered.replace(/,,/g, ' ');
    filtered = filtered.replace(/{,/g, ' ');
    filtered = filtered.replace(/,}/g, ' ');
    filtered = filtered.replace(/\[,/g, ' ');
    filtered = filtered.replace(/,\]/g, ' ');
    
    // Remove CSRF tokens and tracking IDs (long alphanumeric strings in quotes)
    filtered = filtered.replace(/"[A-Za-z0-9]{20,}"/g, ' '); // Remove quoted strings with 20+ alphanumeric chars (likely tokens/IDs)
    
    // Remove empty quoted strings
    filtered = filtered.replace(/""/g, ' ');
    filtered = filtered.replace(/" "/g, ' ');
    
    // Remove boolean values in quotes
    filtered = filtered.replace(/"false"/gi, '');
    filtered = filtered.replace(/"true"/gi, '');
    
    // Remove tracking/event IDs
    filtered = filtered.replace(/"biodzzEzwk[A-Za-z0-9]+"/gi, '');
    
    // Remove country code patterns when they appear as standalone quoted values (but keep actual country names)
    filtered = filtered.replace(/";[A-Z]{2};"/gi, ''); // ";FR;", ";AD;", etc.
    
    // Remove more specific patterns
    filtered = filtered.replace(/"Full name"/gi, '');
    filtered = filtered.replace(/"Phone"/gi, '');
    filtered = filtered.replace(/\{\{first_name;/gi, '');
    filtered = filtered.replace(/\{\{phone;/gi, '');
    
    // Remove more JSON structure patterns
    filtered = filtered.replace(/\{preview;\}/gi, '');
    filtered = filtered.replace(/\{price;\}/gi, '');
    filtered = filtered.replace(/\{variants;\}/gi, '');
    filtered = filtered.replace(/\{express-checkout;\}/gi, '');
    filtered = filtered.replace(/\{add_to_cart;\}/gi, '');
    filtered = filtered.replace(/\{scarcity;\}/gi, '');
    filtered = filtered.replace(/\{visitors;\}/gi, '');
    filtered = filtered.replace(/\{countdown;\}/gi, '');
    filtered = filtered.replace(/\{description;\}/gi, '');
    filtered = filtered.replace(/\{title;\}/gi, '');
    
    // Remove color code patterns
    filtered = filtered.replace(/\{#ffffff;\}/gi, '');
    filtered = filtered.replace(/\{#000000;\}/gi, '');
    filtered = filtered.replace(/\{#D0021BFF;\}/gi, '');
    filtered = filtered.replace(/\{#747474;\}/gi, '');
    filtered = filtered.replace(/\{#f0f0f0;\}/gi, '');
    filtered = filtered.replace(/\{#333333;\}/gi, '');
    filtered = filtered.replace(/\{transparent;\}/gi, '');
    filtered = filtered.replace(/\{f0f0f0;\}/gi, '');
    
    // Remove more patterns with semicolons and colons
    filtered = filtered.replace(/,{preview;/gi, '');
    filtered = filtered.replace(/,{price;/gi, '');
    filtered = filtered.replace(/,{variants;/gi, '');
    filtered = filtered.replace(/,{express-checkout;/gi, '');
    filtered = filtered.replace(/,{add_to_cart;/gi, '');
    filtered = filtered.replace(/,{scarcity;/gi, '');
    filtered = filtered.replace(/,{visitors;/gi, '');
    filtered = filtered.replace(/,{countdown;/gi, '');
    filtered = filtered.replace(/,{description;/gi, '');
    filtered = filtered.replace(/ ]/gi, ' ');
    filtered = filtered.replace(/ }/gi, ' ');
    filtered = filtered.replace(/ }}/gi, ' ');
    filtered = filtered.replace(/ }}}/gi, ' ');
    filtered = filtered.replace(/ }}}}/gi, ' ');
    filtered = filtered.replace(/{ }}/gi, ' ');
    filtered = filtered.replace(/{ }}}/gi, ' ');
    filtered = filtered.replace(/{ }}}}/gi, ' ');
    
    // Remove URL patterns (escaped and unescaped)
    filtered = filtered.replace(/https:\/\/biodzz\.youcan\.store\/[^\s"]*/gi, '');
    filtered = filtered.replace(/https:\\\/\\\/biodzz\.youcan\.store\\\/[^\s"]*/gi, '');
    filtered = filtered.replace(/\/store-front\/images\/[^\s"]*/gi, '');
    filtered = filtered.replace(/\/products\/[^\s"]*/gi, '');
    filtered = filtered.replace(/\/pages\/[^\s"]*/gi, '');
    filtered = filtered.replace(/\/collections/gi, '');
    filtered = filtered.replace(/\/search/gi, '');
    
    // Remove UUID patterns
    filtered = filtered.replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, ' ');
    
    // Remove date patterns
    filtered = filtered.replace(/;2025-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2};/gi, ' ');
    filtered = filtered.replace(/2025-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}/gi, ' ');
    
    // Remove number patterns with semicolons
    filtered = filtered.replace(/;\d+false\d+\[\]false\d+/gi, ' ');
    filtered = filtered.replace(/\d+false\d+\[\]false\d+/gi, ' ');
    
    // Remove escaped patterns
    filtered = filtered.replace(/\\;/gi, ' ');
    filtered = filtered.replace(/\\\/p;/gi, ' ');
    filtered = filtered.replace(/\\\/stores\\\/[^\s"]*/gi, ' ');
    filtered = filtered.replace(/pimg \\;https:\\\/\\\/cdn\.youcan\.shop\\\/stores\\\/[^\s"]*/gi, ' ');
    filtered = filtered.replace(/\\;width: \d+px;\\;/gi, ' ');
    filtered = filtered.replace(/\\;fr-fic fr-dib;\\;/gi, ' ');
    
    // Remove Unicode escape sequences (but keep actual Arabic text)
    filtered = filtered.replace(/\\u[0-9a-fA-F]{4}/g, ' ');
    filtered = filtered.replace(/\\ud83e\\uddd2/gi, '');
    filtered = filtered.replace(/\\ud83d\\udcde/gi, '');
    
    // Remove country/currency code patterns with semicolons
    filtered = filtered.replace(/\{[A-Z]{2};,[^;]*;[A-Z]{3};,[A-Z]{3};, [^;]*;[A-Z]{3};,[^;]*;\}/gi, ' ');
    filtered = filtered.replace(/\{[A-Z]{2};,[^;]*;[A-Z]{3};,[A-Z]{3};, \d+;[A-Z]{3};,[^;]*;\}/gi, ' ');
    
    // Remove more patterns with colons and semicolons
    filtered = filtered.replace(/:true\}/gi, ' ');
    filtered = filtered.replace(/:false\}/gi, ' ');
    filtered = filtered.replace(/:true\},\{phone;/gi, ' ');
    filtered = filtered.replace(/Full name;,\\u[0-9a-fA-F]{4}[^;]*;,\\ud83e\\uddd2;/gi, ' ');
    filtered = filtered.replace(/Phone;,\\u[0-9a-fA-F]{4}[^;]*;,\\ud83d\\udcde;/gi, ' ');
    
    // Remove more specific patterns
    filtered = filtered.replace(/"header-wrapper header-wrapper"/gi, '');
    filtered = filtered.replace(/"header-brand https:\/\/biodzz\.youcan\.store"/gi, '');
    filtered = filtered.replace(/"navigation-brand https:\/\/biodzz\.youcan\.store"/gi, '');
    filtered = filtered.replace(/"navigation-search https:\/\/biodzz\.youcan\.store\/search"/gi, '');
    filtered = filtered.replace(/"search-form" "https:\/\/biodzz\.youcan\.store\/search"/gi, '');
    filtered = filtered.replace(/"limit 12"/gi, '');
    filtered = filtered.replace(/"search-active':/gi, '');
    filtered = filtered.replace(/"navigation-active':/gi, '');
    filtered = filtered.replace(/:"\{'search-active': , 'navigation-active': \}"/gi, '');
    
    // Remove more text patterns
    filtered = filtered.replace(/"App header"/gi, '');
    filtered = filtered.replace(/"Toast messages"/gi, '');
    filtered = filtered.replace(/"App content"/gi, '');
    filtered = filtered.replace(/"Parfum offre"/gi, '');
    filtered = filtered.replace(/"Batik DZ"/gi, '');
    
    // Remove more path patterns
    filtered = filtered.replace(/"\/"/gi, ' ');
    filtered = filtered.replace(/"\/pages\/contact-us"/gi, '');
    filtered = filtered.replace(/"\/collections"/gi, '');
    
    // Remove more button/search patterns
    filtered = filtered.replace(/"بحث"/gi, '');
    filtered = filtered.replace(/"البحث عن منتج"/gi, '');
    filtered = filtered.replace(/"جميع التشكيلات"/gi, '');
    filtered = filtered.replace(/"الصفحة الرئيسية"/gi, '');
    filtered = filtered.replace(/"اتصل بنا"/gi, '');
    filtered = filtered.replace(/"التصنيفات"/gi, '');
    
    // Remove more escaped URL patterns
    filtered = filtered.replace(/https:\\\/\\\/biodzz\.youcan\.store\\\/products\\\/[^\s"]*/gi, '');
    filtered = filtered.replace(/\\\/store-front\\\/images\\\/[^\s"]*/gi, '');
    
    // Remove more patterns with colons
    filtered = filtered.replace(/:[0-9]+;/gi, ' ');
    filtered = filtered.replace(/:[A-Z]{3};/gi, ' ');
    filtered = filtered.replace(/:[A-Z]{2};/gi, ' ');
    
    // Remove standalone brackets and braces
    filtered = filtered.replace(/\[\]/g, ' ');
    filtered = filtered.replace(/\[ /g, ' ');
    filtered = filtered.replace(/ \]/g, ' ');
    filtered = filtered.replace(/\{\}/g, ' ');
    filtered = filtered.replace(/\{ /g, ' ');
    filtered = filtered.replace(/ \}/g, ' ');
    
    // Remove more patterns with quotes and colons
    filtered = filtered.replace(/":/g, ' ');
    filtered = filtered.replace(/":true/gi, ' ');
    filtered = filtered.replace(/":false/gi, ' ');
    
    // Remove more specific escaped patterns
    filtered = filtered.replace(/\\u[0-9a-fA-F]{4}/g, ' ');
    
    // Clean up multiple spaces
    filtered = filtered.replace(/\s+/g, ' ');
    filtered = filtered.trim();
    
    // Remove common HTML text patterns that are markup, not content
    filtered = filtered.replace(/\b"App header"\b/gi, '');
    filtered = filtered.replace(/\b"Toast messages"\b/gi, '');
    filtered = filtered.replace(/\b"App content"\b/gi, '');
    
    // Clean up multiple spaces that might result from removals
    filtered = filtered.replace(/\s+/g, ' ');
    
    return filtered.trim();
  };

  // Ref to track previous URL for cache flushing
  const previousUrlRef = useRef<string>('');

  const [loading, setLoading] = useState(true);
  const hasGeneratedContentRef = useRef(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Track when content has been generated to prevent loading state from showing again
  useEffect(() => {
    if (parsedAdCopies.length > 0 || webpageParsedAdCopies.length > 0) {
      hasGeneratedContentRef.current = true;
    }
  }, [parsedAdCopies.length, webpageParsedAdCopies.length]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await Promise.all([
        loadPresets(user.id),
        loadHistory({ userId: user.id, initial: true })
      ]);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-flush cache when URL changes or is cleared
  useEffect(() => {
    // Normalize URL for comparison
    const normalizeUrl = (url: string) => {
      if (!url.trim()) return '';
      let normalized = url.trim();
      const questionMarkIndex = normalized.indexOf('?');
      if (questionMarkIndex !== -1) {
        normalized = normalized.substring(0, questionMarkIndex);
      }
      if (normalized.includes('aliexpress.com')) {
        normalized = normalized.replace(/https?:\/\/[a-z]{2}\.aliexpress\.com/i, 'https://www.aliexpress.com');
      }
      return normalized;
    };

    const currentUrl = normalizeUrl(webpageUrl);
    const prevUrl = normalizeUrl(previousUrlRef.current);

    // If URL changed or was cleared, flush cache for the old URL
    if (prevUrl && prevUrl !== currentUrl) {
      console.log('🔄 URL changed or cleared, flushing cache for:', prevUrl);
      setVisionAIOcrCache(prev => {
        const newCache = { ...prev };
        delete newCache[prevUrl];
        return newCache;
      });
      setScrapedContent('');
    }

    // Update previous URL ref
    previousUrlRef.current = webpageUrl;
  }, [webpageUrl]);

  const loadPresets = async (userId?: string) => {
    try {
      const uid = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!uid) return;

      const { data, error } = await supabase
        .from('ad_copy_presets')
        .select('*')
        .eq('user_id', uid)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setSavedPresets(data as any[]);
      }
    } catch (err) {
      console.error('Failed to load presets:', err);
    }
  };

  const handleTextGeneration = async () => {
    if (!canGenerate('adcopy')) {
      setShowCreditModal(true);
      return;
    }

    if (!textInput.trim()) {
      alert('Please provide product information');
      return;
    }

    if (selectedTone === 'Custom' && !customTone.trim()) {
      alert('Please provide a custom tone description');
      return;
    }

    setTextLoading(true);
    setGenerationPhase('generating');
    setParsedAdCopies([]);

    try {
      const tone = selectedTone === 'Custom' ? customTone : selectedTone;
      const quantity = adCopyQuantity;
      const baseInfo = `Product: ${textInput}`;

      // Add explicit Arabic instruction when Arabic is selected
      const languageInstruction = selectedLanguage === 'Arabic' 
        ? `\n\n🚨 CRITICAL LANGUAGE REQUIREMENT: You MUST write ALL content in Arabic (العربية). Every word, sentence, headline, description, and text element MUST be in Arabic. Do NOT use English or any other language. Write naturally in Arabic as if it's your native language.`
        : '';

      let prompt = '';
      const angleRequirement = quantity > 1 ? `\n\n🚨 MANDATORY DIFFERENT ANGLES REQUIREMENT (QUANTITY > 1): When generating ${quantity} ads, EACH ad MUST use a COMPLETELY DIFFERENT angle/approach that matches the product. Examples of different angles:\n- Ad 1: Focus on benefits/features\n- Ad 2: Focus on problem-solving/pain points\n- Ad 3: Focus on social proof/testimonials\n- Ad 4: Focus on urgency/scarcity\n- Ad 5: Focus on lifestyle/aspiration\n- Ad 6: Focus on value/price\n- Ad 7: Focus on quality/durability\n- Ad 8: Focus on convenience/ease\n- Ad 9: Focus on exclusivity/premium\n- Ad 10: Focus on innovation/technology\n\nCRITICAL: Each angle must be UNIQUE and RELEVANT to the product. Analyze the product details and create angles that genuinely match what the product offers. Do NOT repeat the same angle or message. Each ad must feel like a completely different approach to selling the same product.` : '';
      if (selectedAdNetwork === 'Meta') {
        prompt = `Create EXACTLY ${quantity} Meta ad${quantity > 1 ? 's' : ''} in ${selectedLanguage}, ${tone} tone.${languageInstruction}\n${baseInfo}${angleRequirement}\n\nIMPORTANT: Generate EXACTLY ${quantity} complete ad${quantity > 1 ? 's' : ''}. Each ad needs:\n[Primary Text] Main copy\n[Headline] Short headline with emojis\n[Description] Brief closer with emojis\n\n🚨 CRITICAL LENGTH REQUIREMENT: EACH ad must be FULL-LENGTH and DETAILED regardless of quantity. Do NOT shorten ads when quantity increases. Each Primary Text should be 3-5 sentences with compelling details. Each Headline should be complete with emojis. Each Description should be a full closing statement. Maintain the same quality and length for ad 1, ad 2, ad 3, and ALL subsequent ads.\n\n🚨 CRITICAL CTA REQUIREMENT: ${selectedLanguage === 'Arabic' ? 'When Arabic is selected, ALL CTAs MUST be in PURE ARABIC (Modern Standard Arabic - الفصحى), NOT in dialects. Use pure Arabic CTAs like: "اطلب الآن" (Order Now), "اطلب قطعتك" (Order yours), "اشتري الآن" (Buy Now), "احصل عليها الآن" (Get it now), "اضغط واطلب" (Click and order), "اطلب اليوم" (Order today), "أضف للسلة الآن" (Add to cart now), etc. NEVER use dialect-specific CTAs. The CTA must always be in pure Arabic regardless of the dialect used in the rest of the ad copy.' : 'ALWAYS use direct purchase CTAs like "Buy Now", "Order Now", "Shop Now", "Get Yours From Our Website", "Click The Link And Get Yours", "Purchase Today", "Add To Cart Now", etc. NEVER use phrases like "go get yours", "go buy it", "get it from the market" - we are selling directly, not telling them to go elsewhere.'}\n\n🚨 ABSOLUTELY FORBIDDEN - NEVER INCLUDE IN AD COPY: NEVER EVER mention character counts, letter counts, word counts, or any meta information like "(98 حرف)", "(99 chars)", "(78/100)", or any numbers in parentheses that indicate length. The character limits are for YOU to follow internally, NOT to mention in the ad copy. The ad copy must be PURE marketing text ONLY - no counts, no numbers showing length, no meta information whatsoever.\n\nFormat:\n[Meta Ad 1]\n[Primary Text] ...\n[Headline] ... 🎯\n[Description] ... ⭐\n${quantity > 1 ? `\n[Meta Ad 2]\n[Primary Text] ...\n[Headline] ... 🎯\n[Description] ... ⭐\n` : ''}${quantity > 2 ? `\n[Meta Ad 3]\n[Primary Text] ...\n[Headline] ... 🎯\n[Description] ... ⭐\n` : ''}\nGenerate EXACTLY ${quantity} complete ad${quantity > 1 ? 's' : ''} - no more, no less. Include emojis in headlines/descriptions.\n\nFINAL REMINDER: The ad copy must be PURE marketing text. NEVER include character counts, letter counts, or any meta information like "(98 حرف)" or "(99 chars)" in the actual ad copy.\n\nRespond ONLY with ads in this format. NO extra text.`;
      } else if (selectedAdNetwork === 'Google') {
        prompt = `Create EXACTLY ${quantity} Google Ad${quantity > 1 ? 's' : ''} in ${selectedLanguage}, ${tone} tone.${languageInstruction} STRICT LIMITS:\n${baseInfo}${angleRequirement}\n\nIMPORTANT: Generate EXACTLY ${quantity} complete ad${quantity > 1 ? 's' : ''}. Each ad:\n[Headline] Max 40 chars (aim 35-40)\n[Long Headline] Max 90 chars (aim 85-90)\n[Description] Max 90 chars (aim 85-90)\n\n🚨 CRITICAL LENGTH REQUIREMENT: EACH ad must MAXIMIZE character usage regardless of quantity. Do NOT shorten ads when quantity increases. For EVERY ad (1, 2, 3, and ALL subsequent ads): Headline should be 35-40 chars, Long Headline should be 85-90 chars, Description should be 85-90 chars. Fill every character limit completely for each individual ad.\n\n🚨 CRITICAL CTA REQUIREMENT: ${selectedLanguage === 'Arabic' ? 'When Arabic is selected, ALL CTAs MUST be in PURE ARABIC (Modern Standard Arabic - الفصحى), NOT in dialects. Use pure Arabic CTAs like: "اطلب الآن" (Order Now), "اطلب قطعتك" (Order yours), "اشتري الآن" (Buy Now), "احصل عليها الآن" (Get it now), "اضغط واطلب" (Click and order), "اطلب اليوم" (Order today), "أضف للسلة الآن" (Add to cart now), etc. NEVER use dialect-specific CTAs. The CTA must always be in pure Arabic regardless of the dialect used in the rest of the ad copy.' : 'ALWAYS use direct purchase CTAs like "Buy Now", "Order Now", "Shop Now", "Get Yours From Our Website", "Click The Link And Get Yours", "Purchase Today", "Add To Cart Now", etc. NEVER use phrases like "go get yours", "go buy it", "get it from the market" - we are selling directly, not telling them to go elsewhere.'}\n\nMAXIMIZE character usage - use full space! Add details to reach limits.\n\nFormat:\n[Google Ad 1]\n[Headline] ...\n[Long Headline] ...\n[Description] ...\n${quantity > 1 ? `\n[Google Ad 2]\n[Headline] ...\n[Long Headline] ...\n[Description] ...\n` : ''}${quantity > 2 ? `\n[Google Ad 3]\n[Headline] ...\n[Long Headline] ...\n[Description] ...\n` : ''}\nGenerate EXACTLY ${quantity} complete ad${quantity > 1 ? 's' : ''} - no more, no less.\n\nVERIFY before sending:\n✓ Headline ≤40 (aim 35-40)\n✓ Long Headline ≤90 (aim 85-90)\n✓ Description ≤90 (aim 85-90)\n✓ Maximize usage, add content if under limit\n✓ EXACTLY ${quantity} ad${quantity > 1 ? 's' : ''} generated\n\nFINAL REMINDER: The ad copy must be PURE marketing text. NEVER include character counts, letter counts, or any meta information like "(98 حرف)" or "(99 chars)" in the actual ad copy.\n\nRespond ONLY with ads. NO extra text.`;
      } else if (selectedAdNetwork === 'TikTok') {
        prompt = `Create EXACTLY ${quantity} TikTok ad${quantity > 1 ? 's' : ''} in ${selectedLanguage}, ${tone} tone.${languageInstruction} CRITICAL: 100 CHAR MAX PER AD\n${baseInfo}${angleRequirement}\n\nIMPORTANT: Generate EXACTLY ${quantity} ad${quantity > 1 ? 's' : ''} - no more, no less.\n\nRULES:\n- EACH ad ≤100 chars (count spaces, punctuation, everything)\n- NO emojis\n- Short, punchy, direct\n- Action words, urgency\n\n🚨 CRITICAL LENGTH REQUIREMENT: EACH ad must be 90-100 chars regardless of quantity. Do NOT shorten ads when quantity increases. Every single ad (1, 2, 3, and ALL subsequent ads) should use 90-100 characters. Aim for 95-100 chars per ad to maximize impact.\n\n🚨 CRITICAL CTA REQUIREMENT: ${selectedLanguage === 'Arabic' ? 'When Arabic is selected, ALL CTAs MUST be in PURE ARABIC (Modern Standard Arabic - الفصحى), NOT in dialects. Use pure Arabic CTAs like: "اطلب الآن" (Order Now), "اطلب قطعتك" (Order yours), "اشتري الآن" (Buy Now), "احصل عليها الآن" (Get it now), "اضغط واطلب" (Click and order), "اطلب اليوم" (Order today), "أضف للسلة الآن" (Add to cart now), etc. NEVER use dialect-specific CTAs. The CTA must always be in pure Arabic regardless of the dialect used in the rest of the ad copy.' : 'ALWAYS use direct purchase CTAs like "Buy Now", "Order Now", "Shop Now", "Get Yours From Our Website", "Click The Link And Get Yours", "Purchase Today", "Add To Cart Now", etc. NEVER use phrases like "go get yours", "go buy it", "get it from the market" - we are selling directly, not telling them to go elsewhere.'}\n\n🚨 ABSOLUTELY FORBIDDEN - NEVER INCLUDE IN AD COPY: NEVER EVER mention character counts, letter counts, word counts, or any meta information like "(98 حرف)", "(99 chars)", "(78/100)", or any numbers in parentheses that indicate length. The character limits are for YOU to follow internally, NOT to mention in the ad copy. The ad copy must be PURE marketing text ONLY - no counts, no numbers showing length, no meta information whatsoever.\n\nFormat:\n[TikTok Ad 1]\n<ad copy text only, no character counts>\n${quantity > 1 ? `[TikTok Ad 2]\n<ad copy text only, no character counts>\n` : ''}${quantity > 2 ? `[TikTok Ad 3]\n<ad copy text only, no character counts>\n` : ''}\nGenerate EXACTLY ${quantity} ad${quantity > 1 ? 's' : ''}.\n\nVERIFY each ad ≤100 chars internally (but NEVER mention this in the ad copy itself). If over, rewrite shorter.\n\nFINAL REMINDER: The ad copy must be PURE marketing text. NEVER include character counts, letter counts, or any meta information like "(98 حرف)" or "(99 chars)" in the actual ad copy.\n\nRespond ONLY with ads. NO extra text.`;
      } else if (selectedAdNetwork === 'Snapchat') {
        prompt = `Create EXACTLY ${quantity} Snapchat ad${quantity > 1 ? 's' : ''} in ${selectedLanguage}, ${tone} tone.${languageInstruction} CRITICAL: 34 CHAR MAX\n${baseInfo}${angleRequirement}\n\nIMPORTANT: Generate EXACTLY ${quantity} ad${quantity > 1 ? 's' : ''} - no more, no less.\n\nRULES:\n- EACH ad ≤34 chars (count everything including emojis)\n- COMPLETE sentences only - no cuts\n- Natural, grammatical\n- Ultra-short, punchy\n\n🚨 CRITICAL LENGTH REQUIREMENT: EACH ad must be 30-34 chars regardless of quantity. Do NOT shorten ads when quantity increases. Every single ad (1, 2, 3, and ALL subsequent ads) should use 30-34 characters. Maximize character usage for maximum impact.\n\n🚨 CRITICAL CTA REQUIREMENT: ${selectedLanguage === 'Arabic' ? 'When Arabic is selected, ALL CTAs MUST be in PURE ARABIC (Modern Standard Arabic - الفصحى), NOT in dialects. Use pure Arabic CTAs like: "اطلب الآن" (Order Now), "اطلب قطعتك" (Order yours), "اشتري الآن" (Buy Now), "احصل عليها الآن" (Get it now), "اضغط واطلب" (Click and order), "اطلب اليوم" (Order today), "أضف للسلة الآن" (Add to cart now), etc. NEVER use dialect-specific CTAs. The CTA must always be in pure Arabic regardless of the dialect used in the rest of the ad copy.' : 'ALWAYS use direct purchase CTAs like "Buy Now", "Order Now", "Shop Now", "Get Yours From Our Website", "Click The Link And Get Yours", "Purchase Today", "Add To Cart Now", etc. NEVER use phrases like "go get yours", "go buy it", "get it from the market" - we are selling directly, not telling them to go elsewhere.'}\n\n🚨 ABSOLUTELY FORBIDDEN - NEVER INCLUDE IN AD COPY: NEVER EVER mention character counts, letter counts, word counts, or any meta information like "(98 حرف)", "(99 chars)", "(78/100)", or any numbers in parentheses that indicate length. The character limits are for YOU to follow internally, NOT to mention in the ad copy. The ad copy must be PURE marketing text ONLY - no counts, no numbers showing length, no meta information whatsoever.\n\nFormat:\n[Snapchat Ad 1] Complete sentence!\n${quantity > 1 ? `[Snapchat Ad 2] Full thought!\n` : ''}${quantity > 2 ? `[Snapchat Ad 3] Complete thought!\n` : ''}\nGenerate EXACTLY ${quantity} ad${quantity > 1 ? 's' : ''}.\n\nVERIFY each ad ≤34 chars AND complete. If over or incomplete, rewrite.\n\nFINAL REMINDER: The ad copy must be PURE marketing text. NEVER include character counts, letter counts, or any meta information like "(98 حرف)" or "(99 chars)" in the actual ad copy.\n\nRespond ONLY with ads. NO extra text.`;
      } else {
        prompt = `Create EXACTLY ${quantity} ad variation${quantity > 1 ? 's' : ''} in ${selectedLanguage}, ${tone} tone.${languageInstruction}\n${baseInfo}${angleRequirement}\n\nIMPORTANT: Generate EXACTLY ${quantity} ad${quantity > 1 ? 's' : ''} - no more, no less.\n\n🚨 CRITICAL LENGTH REQUIREMENT: EACH ad must be FULL-LENGTH and DETAILED regardless of quantity. Do NOT shorten ads when quantity increases. Each ad should be 4-6 sentences with compelling details, benefits, and persuasive copy. Maintain the same quality and length for ad 1, ad 2, ad 3, and ALL subsequent ads. Every ad should be complete and substantial.\n\n🚨 CRITICAL CTA REQUIREMENT: ${selectedLanguage === 'Arabic' ? 'When Arabic is selected, ALL CTAs MUST be in PURE ARABIC (Modern Standard Arabic - الفصحى), NOT in dialects. Use pure Arabic CTAs like: "اطلب الآن" (Order Now), "اطلب قطعتك" (Order yours), "اشتري الآن" (Buy Now), "احصل عليها الآن" (Get it now), "اضغط واطلب" (Click and order), "اطلب اليوم" (Order today), "أضف للسلة الآن" (Add to cart now), etc. NEVER use dialect-specific CTAs. The CTA must always be in pure Arabic regardless of the dialect used in the rest of the ad copy.' : 'ALWAYS use direct purchase CTAs like "Buy Now", "Order Now", "Shop Now", "Get Yours From Our Website", "Click The Link And Get Yours", "Purchase Today", "Add To Cart Now", etc. NEVER use phrases like "go get yours", "go buy it", "get it from the market" - we are selling directly, not telling them to go elsewhere.'}\n\n🚨 ABSOLUTELY FORBIDDEN - NEVER INCLUDE IN AD COPY: NEVER EVER mention character counts, letter counts, word counts, or any meta information like "(98 حرف)", "(99 chars)", "(78/100)", or any numbers in parentheses that indicate length. The character limits are for YOU to follow internally, NOT to mention in the ad copy. The ad copy must be PURE marketing text ONLY - no counts, no numbers showing length, no meta information whatsoever.\n\nFormat:\n[Ad Copy 1]\n<copy>\n${quantity > 1 ? `\n[Ad Copy 2]\n<copy>\n` : ''}${quantity > 2 ? `\n[Ad Copy 3]\n<copy>\n` : ''}\nGenerate EXACTLY ${quantity} ad${quantity > 1 ? 's' : ''}. FINAL REMINDER: The ad copy must be PURE marketing text. NEVER include character counts, letter counts, or any meta information like "(98 حرف)" or "(99 chars)" in the actual ad copy.\n\nRespond ONLY with ads. NO extra text.`;
      }

      let response: string;
      if (aiProvider === 'gemini') {
        const result = await GeminiService.generateText({
          prompt,
          tone: tone,
          language: selectedLanguage,
          customTone: selectedTone === 'Custom' ? customTone : undefined,
          quantity,
        });
        if (!result.success || !result.content) {
          throw new Error(result.error || 'Failed to generate text');
        }
        response = result.content;
      } else {
        const result = await DeepSeekService.generateText({
          prompt,
          tone: tone,
          language: selectedLanguage,
          customTone: selectedTone === 'Custom' ? customTone : undefined,
          quantity,
        });
        if (!result.success || !result.content) {
          throw new Error(result.error || 'Failed to generate text');
        }
        response = result.content;
      }

      console.log('🔵 [Ad Copy Generation] Raw AI Response (first 500 chars):', response.substring(0, 500));
      console.log('🔵 [Ad Copy Generation] Selected Network:', selectedAdNetwork);
      console.log('🔵 [Ad Copy Generation] AI Provider:', aiProvider);

      const copies = parseAdCopies(response);
      setParsedAdCopies(copies);
      setGeneratedWithNetwork(selectedAdNetwork);

      await incrementUsage('adcopy', quantity);
      await saveToHistory(copies);
    } catch (err: any) {
      console.error('Generation error:', err);
      alert(err.message || 'Failed to generate ad copies');
    } finally {
      setTextLoading(false);
      setGenerationPhase(null);
    }
  };

  const parseAdCopies = (text: string): string[] => {
    console.log('🔍 Parsing ad copies from text:', text.substring(0, 200));
    const copies: string[] = [];
    const requestedQuantity = adCopyQuantity;

    if (selectedAdNetwork === 'Meta') {
      const versionRegex = /\[(?:Meta Ad|Ad Copy Version) (\d+)[^\]]*\]([\s\S]*?)(?=\[(?:Meta Ad|Ad Copy Version)|$)/g;
      let match;
      let adCount = 0;

      while ((match = versionRegex.exec(text)) !== null && adCount < requestedQuantity) {
        const versionContent = match[2];

        const primaryMatch = versionContent.match(/^([\s\S]*?)(?=\[Headline\]|$)/);
        const headlineMatch = versionContent.match(/\[Headline\]([\s\S]*?)(?=\[Description\]|$)/);
        const descriptionMatch = versionContent.match(/\[Description\]([\s\S]*?)(?=\[|$)/);

        let primaryText = primaryMatch && primaryMatch[1] ? primaryMatch[1].trim() : '';
        primaryText = primaryText.replace(/^\[Primary\s+Text\]\s*/, '');
        let headline = headlineMatch && headlineMatch[1] ? headlineMatch[1].trim() : '';
        let description = descriptionMatch && descriptionMatch[1] ? descriptionMatch[1].trim() : '';

        // Group all three fields as ONE complete Meta ad copy
        if (primaryText || headline || description) {
          copies.push(primaryText || '');
          copies.push(headline || '');
          copies.push(description || '');
          adCount++;
        }
      }
    } else if (selectedAdNetwork === 'Google') {
      console.log('🔍 Parsing Google ads');

      // Pattern 1: [Google Ad 1] format
      const versionRegex = /\[(?:Google Ad) (\d+)[^\]]*\]([\s\S]*?)(?=\[(?:Google Ad)|\[Ad Copy|$)/g;
      let match;
      let foundMatches = false;
      let adCount = 0;

      while ((match = versionRegex.exec(text)) !== null && adCount < requestedQuantity) {
        foundMatches = true;
        const versionContent = match[2];

        const headlineMatch = versionContent.match(/\[Headline\]([^\[]*?)(?=\[|$)/);
        const longHeadlineMatch = versionContent.match(/\[Long Headline\]([^\[]*?)(?=\[|$)/);
        const descriptionMatch = versionContent.match(/\[Description\]([^\[]*?)(?=\[|$)/);

        const headline = headlineMatch && headlineMatch[1] ? headlineMatch[1].trim() : '';
        const longHeadline = longHeadlineMatch && longHeadlineMatch[1] ? longHeadlineMatch[1].trim() : '';
        const description = descriptionMatch && descriptionMatch[1] ? descriptionMatch[1].trim() : '';

        // Group all three fields as ONE complete Google ad copy
        if (headline || longHeadline || description) {
          copies.push(headline || '');
          copies.push(longHeadline || '');
          copies.push(description || '');
          adCount++;
        }
      }

      console.log('🔍 Google Pattern 1 found:', foundMatches);

      // Pattern 2: Fallback to generic [Ad Copy Version X] format that Gemini might use
      if (!foundMatches && adCount < requestedQuantity) {
        console.log('🔍 Trying fallback pattern for generic Ad Copy format');
        const fallbackRegex = /\[Ad Copy(?:\s+Version)?\s+\d+[^\]]*\]([\s\S]*?)(?=\[Ad Copy(?:\s+Version)?\s+\d+|$)/g;
        const fallbackMatches = Array.from(text.matchAll(fallbackRegex));
        console.log('🔍 Google Pattern 2 matches:', fallbackMatches.length);

        for (const fmatch of fallbackMatches) {
          if (adCount >= requestedQuantity) break;

          const versionContent = fmatch[1];

          // Try to extract headline, long headline, description if structured
          const headlineMatch = versionContent.match(/\[Headline\]([^\[]*?)(?=\[|$)/);
          const longHeadlineMatch = versionContent.match(/\[Long Headline\]([^\[]*?)(?=\[|$)/);
          const descriptionMatch = versionContent.match(/\[Description\]([^\[]*?)(?=\[|$)/);

          if (headlineMatch || longHeadlineMatch || descriptionMatch) {
            // Structured format found
            const headline = headlineMatch && headlineMatch[1] ? headlineMatch[1].trim() : '';
            const longHeadline = longHeadlineMatch && longHeadlineMatch[1] ? longHeadlineMatch[1].trim() : '';
            const description = descriptionMatch && descriptionMatch[1] ? descriptionMatch[1].trim() : '';

            // Group all three fields as ONE complete Google ad copy
            if (headline || longHeadline || description) {
              copies.push(headline || '');
              copies.push(longHeadline || '');
              copies.push(description || '');
              adCount++;
            }
          } else {
            // No structure, treat whole content as single ad copy
            let copy = versionContent.trim();
            copy = copy.replace(/^[🛒📦🌟✨💎🎯⭐]+\s*.*$/gm, '').trim();
            if (copy) {
              copies.push(copy);
              adCount++;
            }
          }
        }
      }
    } else if (selectedAdNetwork === 'TikTok' || selectedAdNetwork === 'Snapchat') {
      console.log('🔍 Parsing TikTok/Snapchat ads');

      // Try multiple patterns to catch different AI response formats
      // Pattern 1: [TikTok Ad 1], [TikTok Ad 1 - Short], etc.
      const pattern1 = /\[(?:TikTok|Snapchat) Ad \d+[^\]]*\]\s*([\s\S]*?)(?=\[(?:TikTok|Snapchat) Ad \d+|\[Ad Copy|$)/g;
      let matches1 = Array.from(text.matchAll(pattern1));
      console.log('🔍 Pattern 1 matches:', matches1.length);

      if (matches1.length > 0) {
        for (let i = 0; i < Math.min(matches1.length, requestedQuantity); i++) {
          const match = matches1[i];
          if (match[1]) {
            let copy = match[1].trim();
            copy = copy.replace(/^[-:]+\s*/, '').trim();
            if (copy) {
              copies.push(copy);
            }
          }
        }
      } else {
        // Pattern 2: Fallback to generic [Ad Copy Version X] format that Gemini might use
        console.log('🔍 Trying fallback pattern for generic Ad Copy format');
        const pattern2 = /\[Ad Copy(?:\s+Version)?\s+\d+[^\]]*\]\s*([\s\S]*?)(?=\[Ad Copy(?:\s+Version)?\s+\d+|$)/g;
        const matches2 = Array.from(text.matchAll(pattern2));
        console.log('🔍 Pattern 2 matches:', matches2.length);

        for (let i = 0; i < Math.min(matches2.length, requestedQuantity); i++) {
          const match = matches2[i];
          if (match[1]) {
            let copy = match[1].trim();
            copy = copy.replace(/^[🛒📦🌟✨💎🎯⭐]+\s*.*$/gm, '').trim();
            copy = copy.replace(/^[-:]+\s*/, '').trim();
            if (copy) {
              copies.push(copy);
            }
          }
        }
      }
    } else {
      // Match various formats: [Ad Copy 1], [Ad Copy Version 1], etc.
      const adMatches = Array.from(text.matchAll(/\[Ad Copy(?:\s+Version)?\s+\d+[^\]]*\]\s*([\s\S]*?)(?=\[Ad Copy(?:\s+Version)?\s+\d+|$)/g));
      for (let i = 0; i < Math.min(adMatches.length, requestedQuantity); i++) {
        const match = adMatches[i];
        if (match[1]) {
          // Clean up the copy: remove emoji-only lines and extra whitespace
          let copy = match[1].trim();
          // Remove lines that are just emojis or shop now buttons
          copy = copy.replace(/^[🛒📦🌟✨💎🎯⭐]+\s*.*$/gm, '').trim();
          if (copy) {
            copies.push(copy);
          }
        }
      }
    }

    console.log('✅ Parsed', copies.length, 'ad copies:', copies);
    return copies;
  };

  const saveToHistory = async (copies: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const title = textInput.slice(0, 100) || webpageUrl.slice(0, 100) || 'Ad Copy Generation';

      await supabase.from('ad_copy_history').insert({
        user_id: user.id,
        title,
        outputs: copies,
      });
    } catch (err) {
      console.error('Failed to save history:', err);
    }
  };

  // Test scrape function - only scrapes without generating ad copies
  const handleTestScrape = async () => {
    if (!webpageUrl.trim()) {
      alert('Please enter a URL');
      return;
    }

    setScrapingLoading(true);

    try {
      // Clean URL by removing query parameters
      let trimmedUrl = webpageUrl.trim();
      const questionMarkIndex = trimmedUrl.indexOf('?');
      if (questionMarkIndex !== -1) {
        trimmedUrl = trimmedUrl.substring(0, questionMarkIndex);
      }

      // Normalize AliExpress URLs
      if (trimmedUrl.includes('aliexpress.com')) {
        trimmedUrl = trimmedUrl.replace(/https?:\/\/[a-z]{2}\.aliexpress\.com/i, 'https://www.aliexpress.com');
      }

      // Call BOTH edge functions and combine results (don't override, join them)
      console.log(`🔍 [TEST] Calling BOTH scrape-webpage AND image-ocr-v2 for URL: ${trimmedUrl}`);

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const textParts: string[] = [];

      // Call scrape-webpage first
      try {
        console.log('🔍 [TEST] Calling scrape-webpage...');
        const scrapeResponse = await fetch('https://auth.symplysis.com/functions/v1/scrape-webpage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ url: trimmedUrl })
        });

        if (scrapeResponse.ok) {
          const scrapeData = await scrapeResponse.json();
          if (scrapeData.success && scrapeData.content) {
            textParts.push(`=== WEBPAGE CONTENT ===\n\n${scrapeData.content}`);
            console.log(`✅ [TEST] scrape-webpage returned ${scrapeData.content.length} chars`);
          }
        } else {
          const errorText = await scrapeResponse.text();
          console.warn('⚠️ [TEST] scrape-webpage failed:', errorText);
        }
      } catch (err) {
        console.warn('⚠️ [TEST] scrape-webpage error:', err);
      }

      // Call image-ocr-v2 second
      try {
        console.log('🔍 [TEST] Calling image-ocr-v2...');
        const ocrResponse = await fetch('https://auth.symplysis.com/functions/v1/image-ocr-v2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ url: trimmedUrl, language: selectedLanguage })
        });

        if (ocrResponse.ok) {
          const ocrData = await ocrResponse.json();
          if (ocrData.success) {
            if (ocrData.results && Array.isArray(ocrData.results)) {
              const ocrTextParts: string[] = [];
              ocrData.results.forEach((result: any) => {
                if (result.text && result.text.trim() && !result.error && result.confidence > 0) {
                  ocrTextParts.push(result.text.trim());
                }
              });
              if (ocrTextParts.length > 0) {
                textParts.push(`=== IMAGE OCR TEXT ===\n\n${ocrTextParts.join('\n\n')}`);
                console.log(`✅ [TEST] image-ocr-v2 returned ${ocrTextParts.join('\n\n').length} chars`);
              }
            } else if (ocrData.text || ocrData.ocrText || ocrData.content) {
              const ocrText = ocrData.text || ocrData.ocrText || ocrData.content;
              textParts.push(`=== IMAGE OCR TEXT ===\n\n${ocrText}`);
              console.log(`✅ [TEST] image-ocr-v2 returned ${ocrText.length} chars`);
            }
          }
        } else {
          const errorText = await ocrResponse.text();
          console.warn('⚠️ [TEST] image-ocr-v2 failed:', errorText);
        }
      } catch (err) {
        console.warn('⚠️ [TEST] image-ocr-v2 error:', err);
      }

      // Combine all text parts (join, don't override)
      let combinedText = textParts.join('\n\n\n');

      if (!combinedText || !combinedText.trim()) {
        throw new Error('No content extracted from either edge function. Both scrape-webpage and image-ocr-v2 returned no results.');
      }

      // Filter out HTML tags/patterns before caching and displaying
      combinedText = filterScrapedContent(combinedText);
      console.log(`🔍 [TEST] Filtered content length: ${combinedText.length} chars (after removing HTML patterns)`);

      setScrapedContent(combinedText);

      // Cache the filtered results
      setVisionAIOcrCache(prev => ({
        ...prev,
        [trimmedUrl]: {
          text: combinedText,
          timestamp: Date.now()
        }
      }));

      // Show the filtered scraped content in modal
      setCachedContentToDisplay(combinedText);
      setShowCachedContentModal(true);

      alert(`✅ Scraped successfully! Content length: ${combinedText.length} chars`);
    } catch (err: any) {
      console.error('[TEST] Scraping error:', err);
      alert(`Scraping error: ${err.message || 'Failed to scrape webpage'}`);
    } finally {
      setScrapingLoading(false);
    }
  };

  const handleWebpageScraping = async (forceRegenerate: boolean = false) => {
    if (!canGenerate('adcopy')) {
      setShowCreditModal(true);
      return;
    }

    if (!webpageUrl.trim()) {
      alert('Please enter a URL');
      return;
    }

    setScrapingLoading(true);
    setGenerationPhase('scraping');
    setWebpageParsedAdCopies([]);

    try {
      // Clean URL by removing query parameters
      let trimmedUrl = webpageUrl.trim();
      const questionMarkIndex = trimmedUrl.indexOf('?');
      if (questionMarkIndex !== -1) {
        trimmedUrl = trimmedUrl.substring(0, questionMarkIndex);
      }

      // Normalize AliExpress URLs
      if (trimmedUrl.includes('aliexpress.com')) {
        trimmedUrl = trimmedUrl.replace(/https?:\/\/[a-z]{2}\.aliexpress\.com/i, 'https://www.aliexpress.com');
      }

      let currentScrapedContent = scrapedContent;

      // Check cache - if cache exists and not forcing regenerate, use it and skip scraping
      const cached = visionAIOcrCache[trimmedUrl];
      const shouldUseCache = !forceRegenerate && cached && cached.text && cached.text.trim();

      console.log('🔍 Cache check:', {
        trimmedUrl,
        hasCache: !!cached,
        cacheText: cached?.text?.substring(0, 50) || 'none',
        forceRegenerate,
        shouldUseCache
      });

      if (shouldUseCache) {
        // Use cached content - don't scrape again
        console.log('✅ Using cached content for URL:', trimmedUrl, '- skipping edge function calls');
        // Filter cached content in case it's old unfiltered cache
        currentScrapedContent = filterScrapedContent(cached.text);
        setScrapedContent(currentScrapedContent);
        setGenerationPhase('generating'); // Skip scraping phase
      } else {
        // Call BOTH edge functions and combine results (don't override, join them)
        console.log(`🔍 Calling BOTH scrape-webpage AND image-ocr-v2 for URL: ${trimmedUrl}`);

        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Authentication required');
        }

        const textParts: string[] = [];

        // Call scrape-webpage first
        try {
          console.log('🔍 Calling scrape-webpage...');
          const scrapeResponse = await fetch('https://auth.symplysis.com/functions/v1/scrape-webpage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ url: trimmedUrl })
          });

          if (scrapeResponse.ok) {
            const scrapeData = await scrapeResponse.json();
            if (scrapeData.success && scrapeData.content) {
              textParts.push(`=== WEBPAGE CONTENT ===\n\n${scrapeData.content}`);
              console.log(`✅ scrape-webpage returned ${scrapeData.content.length} chars`);
            }
          } else {
            const errorText = await scrapeResponse.text();
            console.warn('⚠️ scrape-webpage failed:', errorText);
          }
        } catch (err) {
          console.warn('⚠️ scrape-webpage error:', err);
        }

        // Call image-ocr-v2 second
        try {
          console.log('🔍 Calling image-ocr-v2...');
          const ocrResponse = await fetch('https://auth.symplysis.com/functions/v1/image-ocr-v2', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ url: trimmedUrl, language: selectedLanguage })
          });

          if (ocrResponse.ok) {
            const ocrData = await ocrResponse.json();
            if (ocrData.success) {
              if (ocrData.results && Array.isArray(ocrData.results)) {
                const ocrTextParts: string[] = [];
                ocrData.results.forEach((result: any, index: number) => {
                  if (result.text && result.text.trim() && !result.error && result.confidence > 0) {
                    ocrTextParts.push(result.text.trim());
                    console.log(`✅ Extracted text from OCR result ${index + 1} (confidence: ${result.confidence}%)`);
                  }
                });
                if (ocrTextParts.length > 0) {
                  textParts.push(`=== IMAGE OCR TEXT ===\n\n${ocrTextParts.join('\n\n')}`);
                  console.log(`✅ image-ocr-v2 returned ${ocrTextParts.join('\n\n').length} chars from ${ocrTextParts.length} results`);
                }
              } else if (ocrData.text || ocrData.ocrText || ocrData.content) {
                const ocrText = ocrData.text || ocrData.ocrText || ocrData.content;
                textParts.push(`=== IMAGE OCR TEXT ===\n\n${ocrText}`);
                console.log(`✅ image-ocr-v2 returned ${ocrText.length} chars`);
              }
            }
          } else {
            const errorText = await ocrResponse.text();
            console.warn('⚠️ image-ocr-v2 failed:', errorText);
          }
        } catch (err) {
          console.warn('⚠️ image-ocr-v2 error:', err);
        }

        // Combine all text parts (join, don't override)
        let combinedText = textParts.join('\n\n\n');

        if (!combinedText || !combinedText.trim()) {
          throw new Error('No content extracted from either edge function. Both scrape-webpage and image-ocr-v2 returned no results.');
        }

        // Filter out HTML tags/patterns before caching and using
        combinedText = filterScrapedContent(combinedText);
        console.log(`🔍 Filtered content length: ${combinedText.length} chars (after removing HTML patterns)`);

        currentScrapedContent = combinedText;
        setScrapedContent(currentScrapedContent);

        console.log('✅ Scraped content length:', currentScrapedContent.length, 'chars');

        // Cache the filtered results
        setVisionAIOcrCache(prev => ({
          ...prev,
          [trimmedUrl]: {
            text: currentScrapedContent,
            timestamp: Date.now()
          }
        }));
      }

      if (!currentScrapedContent.trim()) {
        throw new Error('No content extracted from webpage');
      }

      // Now generate ad copies from the scraped content
      setGenerationPhase('generating');

      const tone = selectedTone === 'Custom' ? customTone : selectedTone;
      const quantity = adCopyQuantity;
      const baseInfo = `Product: ${currentScrapedContent}`;

      // Add explicit Arabic instruction when Arabic is selected
      const languageInstruction = selectedLanguage === 'Arabic' 
        ? `\n\n🚨 CRITICAL LANGUAGE REQUIREMENT: You MUST write ALL content in Arabic (العربية). Every word, sentence, headline, description, and text element MUST be in Arabic. Do NOT use English or any other language. Write naturally in Arabic as if it's your native language.`
        : '';

      let prompt = '';
      const angleRequirement = quantity > 1 ? `\n\n🚨 MANDATORY DIFFERENT ANGLES REQUIREMENT (QUANTITY > 1): When generating ${quantity} ads, EACH ad MUST use a COMPLETELY DIFFERENT angle/approach that matches the product. Examples of different angles:\n- Ad 1: Focus on benefits/features\n- Ad 2: Focus on problem-solving/pain points\n- Ad 3: Focus on social proof/testimonials\n- Ad 4: Focus on urgency/scarcity\n- Ad 5: Focus on lifestyle/aspiration\n- Ad 6: Focus on value/price\n- Ad 7: Focus on quality/durability\n- Ad 8: Focus on convenience/ease\n- Ad 9: Focus on exclusivity/premium\n- Ad 10: Focus on innovation/technology\n\nCRITICAL: Each angle must be UNIQUE and RELEVANT to the product. Analyze the product details and create angles that genuinely match what the product offers. Do NOT repeat the same angle or message. Each ad must feel like a completely different approach to selling the same product.` : '';
      if (selectedAdNetwork === 'Meta') {
        prompt = `Create EXACTLY ${quantity} Meta ad${quantity > 1 ? 's' : ''} in ${selectedLanguage}, ${tone} tone.${languageInstruction}\n${baseInfo}${angleRequirement}\n\nIMPORTANT: Generate EXACTLY ${quantity} complete ad${quantity > 1 ? 's' : ''}. Each ad needs:\n[Primary Text] Main copy\n[Headline] Short headline with emojis\n[Description] Brief closer with emojis\n\n🚨 CRITICAL LENGTH REQUIREMENT: EACH ad must be FULL-LENGTH and DETAILED regardless of quantity. Do NOT shorten ads when quantity increases. Each Primary Text should be 3-5 sentences with compelling details. Each Headline should be complete with emojis. Each Description should be a full closing statement. Maintain the same quality and length for ad 1, ad 2, ad 3, and ALL subsequent ads.\n\n🚨 CRITICAL CTA REQUIREMENT: ${selectedLanguage === 'Arabic' ? 'When Arabic is selected, ALL CTAs MUST be in PURE ARABIC (Modern Standard Arabic - الفصحى), NOT in dialects. Use pure Arabic CTAs like: "اطلب الآن" (Order Now), "اطلب قطعتك" (Order yours), "اشتري الآن" (Buy Now), "احصل عليها الآن" (Get it now), "اضغط واطلب" (Click and order), "اطلب اليوم" (Order today), "أضف للسلة الآن" (Add to cart now), etc. NEVER use dialect-specific CTAs. The CTA must always be in pure Arabic regardless of the dialect used in the rest of the ad copy.' : 'ALWAYS use direct purchase CTAs like "Buy Now", "Order Now", "Shop Now", "Get Yours From Our Website", "Click The Link And Get Yours", "Purchase Today", "Add To Cart Now", etc. NEVER use phrases like "go get yours", "go buy it", "get it from the market" - we are selling directly, not telling them to go elsewhere.'}\n\n🚨 ABSOLUTELY FORBIDDEN - NEVER INCLUDE IN AD COPY: NEVER EVER mention character counts, letter counts, word counts, or any meta information like "(98 حرف)", "(99 chars)", "(78/100)", or any numbers in parentheses that indicate length. The character limits are for YOU to follow internally, NOT to mention in the ad copy. The ad copy must be PURE marketing text ONLY - no counts, no numbers showing length, no meta information whatsoever.\n\nFormat:\n[Meta Ad 1]\n[Primary Text] ...\n[Headline] ... 🎯\n[Description] ... ⭐\n${quantity > 1 ? `\n[Meta Ad 2]\n[Primary Text] ...\n[Headline] ... 🎯\n[Description] ... ⭐\n` : ''}${quantity > 2 ? `\n[Meta Ad 3]\n[Primary Text] ...\n[Headline] ... 🎯\n[Description] ... ⭐\n` : ''}\nGenerate EXACTLY ${quantity} complete ad${quantity > 1 ? 's' : ''} - no more, no less. Include emojis in headlines/descriptions.\n\nFINAL REMINDER: The ad copy must be PURE marketing text. NEVER include character counts, letter counts, or any meta information like "(98 حرف)" or "(99 chars)" in the actual ad copy.\n\nRespond ONLY with ads in this format. NO extra text.`;
      } else if (selectedAdNetwork === 'Google') {
        prompt = `Create EXACTLY ${quantity} Google Ad${quantity > 1 ? 's' : ''} in ${selectedLanguage}, ${tone} tone.${languageInstruction} STRICT LIMITS:\n${baseInfo}${angleRequirement}\n\nIMPORTANT: Generate EXACTLY ${quantity} complete ad${quantity > 1 ? 's' : ''}. Each ad:\n[Headline] Max 40 chars (aim 35-40)\n[Long Headline] Max 90 chars (aim 85-90)\n[Description] Max 90 chars (aim 85-90)\n\n🚨 CRITICAL LENGTH REQUIREMENT: EACH ad must MAXIMIZE character usage regardless of quantity. Do NOT shorten ads when quantity increases. For EVERY ad (1, 2, 3, and ALL subsequent ads): Headline should be 35-40 chars, Long Headline should be 85-90 chars, Description should be 85-90 chars. Fill every character limit completely for each individual ad.\n\n🚨 CRITICAL CTA REQUIREMENT: ${selectedLanguage === 'Arabic' ? 'When Arabic is selected, ALL CTAs MUST be in PURE ARABIC (Modern Standard Arabic - الفصحى), NOT in dialects. Use pure Arabic CTAs like: "اطلب الآن" (Order Now), "اطلب قطعتك" (Order yours), "اشتري الآن" (Buy Now), "احصل عليها الآن" (Get it now), "اضغط واطلب" (Click and order), "اطلب اليوم" (Order today), "أضف للسلة الآن" (Add to cart now), etc. NEVER use dialect-specific CTAs. The CTA must always be in pure Arabic regardless of the dialect used in the rest of the ad copy.' : 'ALWAYS use direct purchase CTAs like "Buy Now", "Order Now", "Shop Now", "Get Yours From Our Website", "Click The Link And Get Yours", "Purchase Today", "Add To Cart Now", etc. NEVER use phrases like "go get yours", "go buy it", "get it from the market" - we are selling directly, not telling them to go elsewhere.'}\n\nMAXIMIZE character usage - use full space! Add details to reach limits.\n\nFormat:\n[Google Ad 1]\n[Headline] ...\n[Long Headline] ...\n[Description] ...\n${quantity > 1 ? `\n[Google Ad 2]\n[Headline] ...\n[Long Headline] ...\n[Description] ...\n` : ''}${quantity > 2 ? `\n[Google Ad 3]\n[Headline] ...\n[Long Headline] ...\n[Description] ...\n` : ''}\nGenerate EXACTLY ${quantity} complete ad${quantity > 1 ? 's' : ''} - no more, no less.\n\nVERIFY before sending:\n✓ Headline ≤40 (aim 35-40)\n✓ Long Headline ≤90 (aim 85-90)\n✓ Description ≤90 (aim 85-90)\n✓ Maximize usage, add content if under limit\n✓ EXACTLY ${quantity} ad${quantity > 1 ? 's' : ''} generated\n\nFINAL REMINDER: The ad copy must be PURE marketing text. NEVER include character counts, letter counts, or any meta information like "(98 حرف)" or "(99 chars)" in the actual ad copy.\n\nRespond ONLY with ads. NO extra text.`;
      } else if (selectedAdNetwork === 'TikTok') {
        prompt = `Create EXACTLY ${quantity} TikTok ad${quantity > 1 ? 's' : ''} in ${selectedLanguage}, ${tone} tone.${languageInstruction} CRITICAL: 100 CHAR MAX PER AD\n${baseInfo}${angleRequirement}\n\nIMPORTANT: Generate EXACTLY ${quantity} ad${quantity > 1 ? 's' : ''} - no more, no less.\n\nRULES:\n- EACH ad ≤100 chars (count spaces, punctuation, everything)\n- NO emojis\n- Short, punchy, direct\n- Action words, urgency\n\n🚨 CRITICAL LENGTH REQUIREMENT: EACH ad must be 90-100 chars regardless of quantity. Do NOT shorten ads when quantity increases. Every single ad (1, 2, 3, and ALL subsequent ads) should use 90-100 characters. Aim for 95-100 chars per ad to maximize impact.\n\n🚨 CRITICAL CTA REQUIREMENT: ${selectedLanguage === 'Arabic' ? 'When Arabic is selected, ALL CTAs MUST be in PURE ARABIC (Modern Standard Arabic - الفصحى), NOT in dialects. Use pure Arabic CTAs like: "اطلب الآن" (Order Now), "اطلب قطعتك" (Order yours), "اشتري الآن" (Buy Now), "احصل عليها الآن" (Get it now), "اضغط واطلب" (Click and order), "اطلب اليوم" (Order today), "أضف للسلة الآن" (Add to cart now), etc. NEVER use dialect-specific CTAs. The CTA must always be in pure Arabic regardless of the dialect used in the rest of the ad copy.' : 'ALWAYS use direct purchase CTAs like "Buy Now", "Order Now", "Shop Now", "Get Yours From Our Website", "Click The Link And Get Yours", "Purchase Today", "Add To Cart Now", etc. NEVER use phrases like "go get yours", "go buy it", "get it from the market" - we are selling directly, not telling them to go elsewhere.'}\n\n🚨 ABSOLUTELY FORBIDDEN - NEVER INCLUDE IN AD COPY: NEVER EVER mention character counts, letter counts, word counts, or any meta information like "(98 حرف)", "(99 chars)", "(78/100)", or any numbers in parentheses that indicate length. The character limits are for YOU to follow internally, NOT to mention in the ad copy. The ad copy must be PURE marketing text ONLY - no counts, no numbers showing length, no meta information whatsoever.\n\nFormat:\n[TikTok Ad 1]\n<ad copy text only, no character counts>\n${quantity > 1 ? `[TikTok Ad 2]\n<ad copy text only, no character counts>\n` : ''}${quantity > 2 ? `[TikTok Ad 3]\n<ad copy text only, no character counts>\n` : ''}\nGenerate EXACTLY ${quantity} ad${quantity > 1 ? 's' : ''}.\n\nVERIFY each ad ≤100 chars internally (but NEVER mention this in the ad copy itself). If over, rewrite shorter.\n\nFINAL REMINDER: The ad copy must be PURE marketing text. NEVER include character counts, letter counts, or any meta information like "(98 حرف)" or "(99 chars)" in the actual ad copy.\n\nRespond ONLY with ads. NO extra text.`;
      } else if (selectedAdNetwork === 'Snapchat') {
        prompt = `Create EXACTLY ${quantity} Snapchat ad${quantity > 1 ? 's' : ''} in ${selectedLanguage}, ${tone} tone.${languageInstruction} CRITICAL: 34 CHAR MAX\n${baseInfo}${angleRequirement}\n\nIMPORTANT: Generate EXACTLY ${quantity} ad${quantity > 1 ? 's' : ''} - no more, no less.\n\nRULES:\n- EACH ad ≤34 chars (count everything including emojis)\n- COMPLETE sentences only - no cuts\n- Natural, grammatical\n- Ultra-short, punchy\n\n🚨 CRITICAL LENGTH REQUIREMENT: EACH ad must be 30-34 chars regardless of quantity. Do NOT shorten ads when quantity increases. Every single ad (1, 2, 3, and ALL subsequent ads) should use 30-34 characters. Maximize character usage for maximum impact.\n\n🚨 CRITICAL CTA REQUIREMENT: ${selectedLanguage === 'Arabic' ? 'When Arabic is selected, ALL CTAs MUST be in PURE ARABIC (Modern Standard Arabic - الفصحى), NOT in dialects. Use pure Arabic CTAs like: "اطلب الآن" (Order Now), "اطلب قطعتك" (Order yours), "اشتري الآن" (Buy Now), "احصل عليها الآن" (Get it now), "اضغط واطلب" (Click and order), "اطلب اليوم" (Order today), "أضف للسلة الآن" (Add to cart now), etc. NEVER use dialect-specific CTAs. The CTA must always be in pure Arabic regardless of the dialect used in the rest of the ad copy.' : 'ALWAYS use direct purchase CTAs like "Buy Now", "Order Now", "Shop Now", "Get Yours From Our Website", "Click The Link And Get Yours", "Purchase Today", "Add To Cart Now", etc. NEVER use phrases like "go get yours", "go buy it", "get it from the market" - we are selling directly, not telling them to go elsewhere.'}\n\n🚨 ABSOLUTELY FORBIDDEN - NEVER INCLUDE IN AD COPY: NEVER EVER mention character counts, letter counts, word counts, or any meta information like "(98 حرف)", "(99 chars)", "(78/100)", or any numbers in parentheses that indicate length. The character limits are for YOU to follow internally, NOT to mention in the ad copy. The ad copy must be PURE marketing text ONLY - no counts, no numbers showing length, no meta information whatsoever.\n\nFormat:\n[Snapchat Ad 1] Complete sentence!\n${quantity > 1 ? `[Snapchat Ad 2] Full thought!\n` : ''}${quantity > 2 ? `[Snapchat Ad 3] Complete thought!\n` : ''}\nGenerate EXACTLY ${quantity} ad${quantity > 1 ? 's' : ''}.\n\nVERIFY each ad ≤34 chars AND complete. If over or incomplete, rewrite.\n\nFINAL REMINDER: The ad copy must be PURE marketing text. NEVER include character counts, letter counts, or any meta information like "(98 حرف)" or "(99 chars)" in the actual ad copy.\n\nRespond ONLY with ads. NO extra text.`;
      } else {
        prompt = `Create EXACTLY ${quantity} ad variation${quantity > 1 ? 's' : ''} in ${selectedLanguage}, ${tone} tone.${languageInstruction}\n${baseInfo}${angleRequirement}\n\nIMPORTANT: Generate EXACTLY ${quantity} ad${quantity > 1 ? 's' : ''} - no more, no less.\n\n🚨 CRITICAL LENGTH REQUIREMENT: EACH ad must be FULL-LENGTH and DETAILED regardless of quantity. Do NOT shorten ads when quantity increases. Each ad should be 4-6 sentences with compelling details, benefits, and persuasive copy. Maintain the same quality and length for ad 1, ad 2, ad 3, and ALL subsequent ads. Every ad should be complete and substantial.\n\n🚨 CRITICAL CTA REQUIREMENT: ${selectedLanguage === 'Arabic' ? 'When Arabic is selected, ALL CTAs MUST be in PURE ARABIC (Modern Standard Arabic - الفصحى), NOT in dialects. Use pure Arabic CTAs like: "اطلب الآن" (Order Now), "اطلب قطعتك" (Order yours), "اشتري الآن" (Buy Now), "احصل عليها الآن" (Get it now), "اضغط واطلب" (Click and order), "اطلب اليوم" (Order today), "أضف للسلة الآن" (Add to cart now), etc. NEVER use dialect-specific CTAs. The CTA must always be in pure Arabic regardless of the dialect used in the rest of the ad copy.' : 'ALWAYS use direct purchase CTAs like "Buy Now", "Order Now", "Shop Now", "Get Yours From Our Website", "Click The Link And Get Yours", "Purchase Today", "Add To Cart Now", etc. NEVER use phrases like "go get yours", "go buy it", "get it from the market" - we are selling directly, not telling them to go elsewhere.'}\n\n🚨 ABSOLUTELY FORBIDDEN - NEVER INCLUDE IN AD COPY: NEVER EVER mention character counts, letter counts, word counts, or any meta information like "(98 حرف)", "(99 chars)", "(78/100)", or any numbers in parentheses that indicate length. The character limits are for YOU to follow internally, NOT to mention in the ad copy. The ad copy must be PURE marketing text ONLY - no counts, no numbers showing length, no meta information whatsoever.\n\nFormat:\n[Ad Copy 1]\n<copy>\n${quantity > 1 ? `\n[Ad Copy 2]\n<copy>\n` : ''}${quantity > 2 ? `\n[Ad Copy 3]\n<copy>\n` : ''}\nGenerate EXACTLY ${quantity} ad${quantity > 1 ? 's' : ''}. FINAL REMINDER: The ad copy must be PURE marketing text. NEVER include character counts, letter counts, or any meta information like "(98 حرف)" or "(99 chars)" in the actual ad copy.\n\nRespond ONLY with ads. NO extra text.`;
      }

      let response: string;
      if (aiProvider === 'gemini') {
        const result = await GeminiService.generateText({
          prompt,
          tone: tone,
          language: selectedLanguage,
          customTone: selectedTone === 'Custom' ? customTone : undefined,
          quantity,
        });
        if (!result.success || !result.content) {
          throw new Error(result.error || 'Failed to generate text');
        }
        response = result.content;
      } else {
        const result = await DeepSeekService.generateText({
          prompt,
          tone: tone,
          language: selectedLanguage,
          customTone: selectedTone === 'Custom' ? customTone : undefined,
          quantity,
        });
        if (!result.success || !result.content) {
          throw new Error(result.error || 'Failed to generate text');
        }
        response = result.content;
      }

      const copies = parseAdCopies(response);
      setWebpageParsedAdCopies(copies);
      setGeneratedWithNetwork(selectedAdNetwork);

      await incrementUsage('adcopy', quantity);
      await saveToHistory(copies);
    } catch (err: any) {
      console.error('Scraping error:', err);
      alert(err.message || 'Failed to scrape webpage and generate ad copies');
    } finally {
      setScrapingLoading(false);
      setGenerationPhase(null);
    }
  };

  const regenerateAdCopy = (index: number, copies: string[]) => {
    console.log('Regenerate ad copy at index:', index);
    // TODO: Add regeneration logic here
  };

  const loadHistory = async (opts?: { refresh?: boolean; userId?: string; initial?: boolean }) => {
    try {
      const uid = opts?.userId || (await supabase.auth.getUser()).data.user?.id;
      if (!uid) return;

      // Reset page if refreshing
      if (opts?.refresh) {
        setHistoryPage(0);
      }

      // Calculate pagination
      const currentPage = opts?.refresh ? 0 : historyPage;
      const itemsPerPage = 3;
      const from = currentPage * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error } = await supabase
        .from('ad_copy_history')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (!error && data) {
        if (opts?.refresh || opts?.initial) {
          // Replace items on refresh or initial load
          setHistoryItems(data as any[]);
        } else {
          // Append items on "load more"
          setHistoryItems((prev) => {
            // Avoid duplicates by checking IDs
            const existingIds = new Set(prev.map((item: any) => item.id));
            const newItems = data.filter((item: any) => !existingIds.has(item.id));
            return [...prev, ...newItems];
          });
        }
        
        // Set page correctly after load
        if (opts?.refresh || opts?.initial) {
          setHistoryPage(1); // Set to 1 after refresh/initial since we loaded page 0
        } else {
          setHistoryPage((prev) => prev + 1); // Increment page for "load more"
        }
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  // Show loading spinner while checking subscription status
  if (subscriptionLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <LoadingSpinner size="md" className="mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check subscription access - only show premium gate after loading is complete
  if (!hasAccess) {
    return <AdCopyPremiumGate />
  }

  // Skeleton Loading State - only show on initial load, not when refreshing usage after generation
  // Use ref to track if content has been generated to prevent showing skeleton again
  if (loading || (usageLoading && !hasGeneratedContentRef.current)) {
    return (
      <div className="w-full h-screen overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Header Skeleton */}
        <div className="px-4 md:px-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex-shrink-0 flex items-center justify-between h-[60px]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Panel Skeleton (Input & Results) */}
          <div className="flex-1 min-w-0 border-r border-slate-200 flex flex-col bg-white overflow-hidden">
            <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
              <div className="px-4 md:px-8 pt-6 md:pt-8 pb-6 space-y-6 flex-shrink-0">
                {/* Large Text Area Skeleton */}
                <div className="w-full h-40 bg-slate-50 rounded-xl animate-pulse border border-slate-200" />
              </div>

              {/* Bottom Section (Get started with) */}
              <div className="mt-auto p-4 md:p-6 border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                <div className="h-4 w-32 bg-slate-200 rounded mb-4 animate-pulse" />
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-10 w-32 bg-slate-100 rounded-xl animate-pulse border border-slate-200" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel Skeleton (Settings Sidebar) */}
          <div className="hidden md:flex flex-shrink-0 flex-col bg-white border-l border-slate-200 w-[500px]">
            {/* Tabs Skeleton */}
            <div className="flex border-b border-slate-200 px-6">
              <div className="flex gap-6">
                <div className="h-12 w-16 border-b-2 border-slate-300 mt-auto animate-pulse" />
                <div className="h-12 w-16 mt-auto" />
              </div>
            </div>

            {/* Settings Form Skeleton */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Language */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-200 rounded-full animate-pulse" />
                  <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="h-12 w-full bg-white rounded-xl border border-slate-200 animate-pulse shadow-sm" />
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-200 rounded-full animate-pulse" />
                  <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="h-12 w-full bg-white rounded-xl border border-slate-200 animate-pulse shadow-sm" />
              </div>

              {/* AI Provider */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-200 rounded-full animate-pulse" />
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="h-12 w-full bg-white rounded-xl border border-slate-200 animate-pulse shadow-sm" />
              </div>

              {/* Copies */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-200 rounded-full animate-pulse" />
                  <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="flex justify-center py-2">
                  <div className="h-10 w-32 bg-white rounded-full border border-slate-200 animate-pulse shadow-sm" />
                </div>
              </div>

              {/* Network */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-200 rounded-full animate-pulse" />
                  <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="h-12 w-full bg-white rounded-xl border border-slate-200 animate-pulse shadow-sm" />
              </div>

              {/* Preset Buttons */}
              <div className="flex gap-2 pt-2">
                <div className="flex-1 h-10 bg-white border border-slate-200 rounded-xl animate-pulse shadow-sm" />
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl animate-pulse shadow-sm" />
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex gap-2">
                <div className="flex-1 h-12 bg-slate-200 rounded-xl animate-pulse" />
                <div className="w-12 h-12 bg-slate-100 rounded-xl animate-pulse border border-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="w-full overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100"
        style={{
          height: isMobile ? 'calc(100vh - 64px)' : '100vh',
          maxHeight: isMobile ? 'calc(100vh - 64px)' : '100vh',
          position: isMobile ? 'fixed' : 'relative',
          top: isMobile ? '64px' : 'auto',
          left: isMobile ? 0 : 'auto',
          right: isMobile ? 0 : 'auto',
          bottom: isMobile ? 0 : 'auto',
          display: 'flex'
        }}
      >
        {/* Header spanning full width */}
        <div className="px-4 md:px-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex-shrink-0 flex items-center justify-between" style={{ height: '60px', minHeight: '60px', maxHeight: '60px', flexShrink: 0 }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold tracking-tight text-slate-900">Ad Copy Generator</h1>
            </div>
          </div>
          {/* Mobile Settings Button */}
          <button
            onClick={() => setShowMobileSettings(true)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open settings"
          >
            <Settings size={20} className="text-slate-700" />
          </button>
        </div>

        {/* Content area with left panel and sidebar */}
        <div
          className="flex flex-1 overflow-hidden relative"
          style={{
            height: isMobile ? 'calc(100vh - 64px - 60px)' : 'calc(100vh - 60px)',
            maxHeight: isMobile ? 'calc(100vh - 64px - 60px)' : 'calc(100vh - 60px)',
            minHeight: 0
          }}
        >
          {/* Mobile Settings Overlay */}
          {showMobileSettings && (
            <div
              className="fixed inset-0 bg-black/50 z-[90] md:hidden transition-opacity duration-300"
              onClick={() => setShowMobileSettings(false)}
            />
          )}

          {/* Left Panel - Input & Results */}
          <div className="flex-1 min-w-0 border-r-0 md:border-r border-slate-200 flex flex-col bg-white overflow-hidden" style={{ height: '100%', maxHeight: '100%' }}>
            {/* Scrollable Content Area - Parent container with flex-1 */}
            <div className="flex flex-col flex-1 min-h-0 overflow-y-auto" style={{ height: '100%', maxHeight: '100%' }}>
              {/* Input Section - Modern Style */}
              <div className="px-4 md:px-8 pt-6 md:pt-8 pb-6 space-y-6 flex-shrink-0">
                {(() => {
                  // URL detection - supports all subdomains
                  const isUrl = (() => {
                    const input = smartInput.trim()
                    if (!input) {
                      return false
                    }
                    try {
                      // Add protocol if missing
                      const testUrl = input.startsWith('http') ? input : `https://${input}`
                      new URL(testUrl)
                      // Basic check that it looks like a URL (has at least one dot)
                      const hasDot = input.includes('.')
                      return hasDot
                    } catch (err) {
                      return false
                    }
                  })()

                  const detectedDomain = isUrl ? (() => {
                    try {
                      let input = smartInput.trim()

                      // ALWAYS normalize AliExpress URLs to www for display
                      if (input.includes('aliexpress.com')) {
                        input = input.replace(/https?:\/\/([a-z]{2}\.)?aliexpress\.com/i, 'https://www.aliexpress.com')
                      }

                      const urlWithProtocol = input.startsWith('http') ? input : `https://${input}`
                      const url = new URL(urlWithProtocol)
                      return url.hostname
                    } catch (err) {
                      return null
                    }
                  })() : null

                  return (
                    <div className="relative">
                      {isUrl && (
                        <div className="absolute inset-0 px-4 py-3">
                          <span className="relative inline-block">
                            <button
                              type="button"
                              onMouseEnter={() => setUrlHover(true)}
                              onMouseLeave={() => setUrlHover(false)}
                              className="inline-flex items-center max-w-full truncate px-3 py-1 text-sm border border-gray-300 bg-white/90 hover:bg-white text-gray-900 shadow-sm rounded-full"
                            >
                              {detectedDomain || smartInput.trim()}
                            </button>
                            {urlHover && (
                              <div className="absolute top-full left-0 mt-2 z-50 max-w-[32rem] break-all rounded-lg bg-gray-900 text-white text-xs px-3 py-2 shadow-lg">
                                {smartInput.trim()}
                              </div>
                            )}
                          </span>
                        </div>
                      )}
                      <textarea
                        value={displayValue}
                        onChange={(e) => {
                          const newValue = e.target.value
                          if (isUrl) {
                            return
                          }
                          setDisplayValue(newValue)
                          setSmartInput(newValue)

                          // Check if it's a URL using the same logic
                          const isUrlInput = (() => {
                            const input = newValue.trim()
                            if (!input || !input.includes('.')) {
                              return false
                            }
                            try {
                              const testUrl = input.startsWith('http') ? input : `https://${input}`
                              new URL(testUrl)
                              return true
                            } catch (err) {
                              return false
                            }
                          })()

                          if (isUrlInput) {
                            // Clean URL by removing query parameters
                            let cleanedUrl = newValue.trim()

                            // ALWAYS normalize AliExpress URLs to www
                            if (cleanedUrl.includes('aliexpress.com')) {
                              cleanedUrl = cleanedUrl.replace(/https?:\/\/([a-z]{2}\.)?aliexpress\.com/i, 'https://www.aliexpress.com')
                            }

                            const questionMarkIndex = cleanedUrl.indexOf('?')
                            if (questionMarkIndex !== -1) {
                              cleanedUrl = cleanedUrl.substring(0, questionMarkIndex)
                            }

                            // Get hostname for display
                            let hostname = cleanedUrl
                            try {
                              const urlWithProtocol = cleanedUrl.startsWith('http') ? cleanedUrl : `https://${cleanedUrl}`
                              hostname = new URL(urlWithProtocol).hostname
                            } catch (err) {
                              // Silent fail
                            }

                            // Check if URL changed - cache flush will happen in useEffect
                            setDisplayValue(hostname)
                            setWebpageUrl(cleanedUrl)
                            setSmartInput(cleanedUrl)
                            setTextInput('')
                          } else {
                            // Clearing URL - cache flush will happen in useEffect
                            setTextInput(newValue)
                            setWebpageUrl('')
                          }
                        }}
                        onKeyDown={(e) => {
                          if (isUrl) {
                            if (e.key === ' ') {
                              e.preventDefault()
                              return
                            }
                            if (e.key === 'Backspace' || e.key === 'Delete') {
                              e.preventDefault()
                              // Clearing URL - cache flush will happen in useEffect
                              setSmartInput('')
                              setDisplayValue('')
                              setWebpageUrl('')
                              setTextInput('')
                              return
                            }
                            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                              e.preventDefault()
                            }
                          }
                        }}
                        placeholder="Enter product description or paste a URL..."
                        rows={5}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none font-normal bg-white shadow-sm hover:border-slate-400 transition-all"
                        style={isUrl ? {
                          color: 'transparent',
                          caretColor: '#1e293b'
                        } : {}}
                      />
                      {(displayValue.trim() || smartInput.trim()) && (
                        <button
                          onClick={() => {
                            // Clearing URL - cache flush will happen in useEffect
                            setSmartInput('')
                            setDisplayValue('')
                            setWebpageUrl('')
                            setTextInput('')
                          }}
                          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Clear input"
                        >
                          <Trash2 size={16} className="text-gray-500 hover:text-gray-700" />
                        </button>
                      )}
                    </div>
                  )
                })()}
              </div>

              {/* Mobile Generate Button - Below Input, Full Width */}
              <div className="md:hidden px-4 pb-4 space-y-3 bg-white">
                {/* Test Scrape Button - Small button above generate */}
                {webpageUrl.trim() && (
                  <div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleTestScrape();
                      }}
                      disabled={scrapingLoading || !webpageUrl.trim()}
                      className="w-full px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Test edge function scraping (without generating ad copies)"
                    >
                      <RefreshCcw size={14} className={scrapingLoading ? 'animate-spin' : ''} />
                      {scrapingLoading ? 'Scraping...' : 'Test Scrape'}
                    </button>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (webpageUrl.trim()) {
                        handleWebpageScraping(false)
                      } else {
                        handleTextGeneration()
                      }
                    }}
                    disabled={!smartInput.trim() || textLoading || scrapingLoading || (selectedTone === 'Custom' && !customTone.trim())}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                  >
                    <Blocks size={18} />
                    {(textLoading || scrapingLoading) ? 'Generating...' : 'Generate Ad Copies'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const trimmedUrl = webpageUrl.trim()
                      const visionOcrData = visionAIOcrCache[trimmedUrl]
                      let contentToShow = '';
                      if (visionOcrData) {
                        contentToShow = filterScrapedContent(visionOcrData.text)
                      } else if (scrapedContent) {
                        contentToShow = filterScrapedContent(scrapedContent)
                      }
                      setCachedContentToDisplay(contentToShow)
                      setShowCachedContentModal(true)
                    }}
                    disabled={!scrapedContent && !visionAIOcrCache[webpageUrl.trim()]}
                    className="px-5 py-3 font-medium rounded-xl transition-all bg-slate-100 hover:bg-slate-200 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow-md"
                    title={visionAIOcrCache[webpageUrl.trim()] ? 'View cached Vision AI OCR results' : 'View cached scraped content'}
                  >
                    <ClipboardList size={18} />
                  </button>
                </div>
              </div>

              {/* Results Section */}
              {textLoading || scrapingLoading ? (
                <div className="flex items-start justify-start pl-4 md:pl-8">
                  <TextShimmer className="text-base font-medium text-slate-700" duration={1.5}>
                    {generationPhase === 'generating' ? 'Generating ad copies...' : 'Analyzing webpage...'}
                  </TextShimmer>
                </div>
              ) : (parsedAdCopies.length > 0 || webpageParsedAdCopies.length > 0) ? (
                <div className="space-y-4 p-4 md:p-8 overflow-x-hidden">
                  {/* History Banner inside Generated Content */}
                  {historyBanner && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between rounded-md px-2.5 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold">Previewing history</span>
                        <button onClick={() => { setHistoryBanner(null); setHistoryActive(false); setParsedAdCopies([]); setWebpageParsedAdCopies([]); }} className="p-1 rounded hover:bg-yellow-200">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Ad Copy Cards with yellow background when history active */}
                  <div className={`space-y-3 ${historyActive ? 'bg-yellow-50 p-4 rounded-lg' : ''}`}>
                    {(() => {
                      const adCopies = webpageUrl.trim() ? webpageParsedAdCopies : parsedAdCopies
                      const networkForLimits = generatedWithNetwork

                      // Group ads for Google and Meta (every 3 items = 1 ad)
                      if (networkForLimits === 'Google' || networkForLimits === 'Meta') {
                        const groupedAds: string[][] = []
                        for (let i = 0; i < adCopies.length; i += 3) {
                          groupedAds.push(adCopies.slice(i, i + 3))
                        }

                        return groupedAds.map((adGroup, groupIndex) => (
                          <div key={groupIndex} className="p-5 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="text-xs font-semibold text-blue-700 bg-blue-200 px-2.5 py-1 rounded-full">
                                {networkForLimits === 'Google' ? `Google Ad ${groupIndex + 1}` : `Meta Ad ${groupIndex + 1}`}
                              </div>
                            </div>
                            {adGroup.map((adCopy, fieldIndex) => {
                              const actualIndex = groupIndex * 3 + fieldIndex
                              const charCount = adCopy.length

                              let fieldType = ''
                              let charLimit = 0

                              if (networkForLimits === 'Google') {
                                if (fieldIndex === 0) {
                                  fieldType = 'Headline'
                                  charLimit = 40
                                } else if (fieldIndex === 1) {
                                  fieldType = 'Long Headline'
                                  charLimit = 90
                                } else {
                                  fieldType = 'Description'
                                  charLimit = 90
                                }
                              } else if (networkForLimits === 'Meta') {
                                if (fieldIndex === 0) {
                                  fieldType = 'Primary Text'
                                } else if (fieldIndex === 1) {
                                  fieldType = 'Headline'
                                } else {
                                  fieldType = 'Description'
                                }
                              }

                              const isOverLimit = networkForLimits === 'Google' && charCount > charLimit

                              return (
                                <div key={actualIndex} className="relative group bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                                  {/* Field label */}
                                  <div className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">{fieldType}</div>

                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex-1 text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">{adCopy}</div>

                                    {/* Right side: character count (Google only), regenerate, and copy button */}
                                    <div className="flex items-center gap-2 flex-shrink-0 sm:self-start">
                                      {/* Character counter only for Google ads */}
                                      {networkForLimits === 'Google' && (
                                        <>
                                          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${isOverLimit ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {charCount}/{charLimit}
                                          </span>

                                          {isOverLimit && (
                                            <button
                                              onClick={() => {
                                                const currentAdCopies = webpageUrl.trim() ? webpageParsedAdCopies : parsedAdCopies
                                                regenerateAdCopy(actualIndex, currentAdCopies)
                                              }}
                                              disabled={regeneratingIndex === actualIndex}
                                              className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                              title="Regenerate this ad copy"
                                            >
                                              <svg className={`w-4 h-4 text-gray-600 hover:text-gray-800 ${regeneratingIndex === actualIndex ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                              </svg>
                                            </button>
                                          )}
                                        </>
                                      )}

                                      {copiedIndex === actualIndex && (
                                        <span className="text-xs text-green-600 font-medium">Copied</span>
                                      )}
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(adCopy)
                                          setCopiedIndex(actualIndex)
                                          setTimeout(() => setCopiedIndex(null), 2000)
                                        }}
                                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                                        title="Copy"
                                      >
                                        <svg className="w-3 h-3 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ))
                      }

                      // For other networks (TikTok, Snapchat, General), render individually
                      return adCopies.map((adCopy, index) => {
                        const charCount = adCopy.length

                        let charLimit = 0
                        if (networkForLimits === 'TikTok') {
                          charLimit = 100
                        } else if (networkForLimits === 'Snapchat') {
                          charLimit = 34
                        }

                        const isOverLimit =
                          (networkForLimits === 'TikTok' && charCount > 100) ||
                          (networkForLimits === 'Snapchat' && charCount > 34)

                        return (
                          <div key={index} className="relative group bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="flex-1 text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">{adCopy}</div>

                              {/* Right side: character count, regenerate (if over limit), and copy button */}
                              <div className="flex items-center gap-2 flex-shrink-0 sm:self-start">
                                {/* Character count for TikTok and Snapchat */}
                                {(networkForLimits === 'TikTok' || networkForLimits === 'Snapchat') && (
                                  <>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${isOverLimit ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                      }`}>
                                      {charCount}/{charLimit}
                                    </span>
                                    {isOverLimit && (
                                      <button
                                        onClick={() => {
                                          const currentAdCopies = webpageUrl.trim() ? webpageParsedAdCopies : parsedAdCopies
                                          regenerateAdCopy(index, currentAdCopies)
                                        }}
                                        disabled={regeneratingIndex === index}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Regenerate this ad copy"
                                      >
                                        <svg className={`w-4 h-4 text-gray-600 hover:text-gray-800 ${regeneratingIndex === index ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                      </button>
                                    )}
                                  </>
                                )}

                                {/* Copied feedback and copy button */}
                                {copiedIndex === index && (
                                  <span className="text-xs text-green-600 font-medium">Copied to clipboard</span>
                                )}
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(adCopy)
                                    setCopiedIndex(index)
                                    setTimeout(() => setCopiedIndex(null), 2000)
                                  }}
                                  className="p-1 hover:bg-white rounded transition-colors"
                                  title="Copy"
                                >
                                  <svg className="w-3 h-3 text-gray-500 hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Preset Tones Section - Fixed at Bottom */}
            <div className="p-4 md:p-6 border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white flex-shrink-0">
              <p className="text-sm font-semibold text-slate-900 mb-4">Get started with</p>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {[
                  { label: 'Algerian dialect', toneText: 'write in a fully algerian dialect', code: 'DZ' },
                  { label: 'Libyan dialect', toneText: 'write in a fully libyan dialect', code: 'LY' },
                  { label: 'Moroccan dialect', toneText: 'write in a fully moroccan dialect', code: 'MA' },
                  { label: 'Iraqi dialect', toneText: 'write in a fully iraqi dialect', code: 'IQ' },
                  { label: 'Saudi dialect', toneText: 'write in a fully saudi dialect', code: 'SA' },
                  { label: 'Egyptian dialect', toneText: 'write in a fully egyptian dialect', code: 'EG' },
                ].map((preset) => {
                  const isSelected = selectedTone === 'Custom' && customTone === preset.toneText
                  return (
                    <button
                      key={preset.label}
                      onClick={() => {
                        if (selectedTone === 'Custom' && customTone === preset.toneText) {
                          setSelectedTone('Expert')
                          setCustomTone('')
                        } else {
                          setSelectedTone('Custom')
                          setCustomTone(preset.toneText)
                          setSelectedLanguage('Arabic')
                          setAiProvider('gemini')
                        }
                      }}
                      className={`inline-flex items-center justify-center whitespace-nowrap text-xs md:text-sm font-medium transition-all h-9 md:h-10 rounded-xl px-3 md:px-4 gap-2 ${isSelected
                        ? 'text-white shadow-lg'
                        : 'border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                        }`}
                      style={isSelected ? {
                        backgroundImage: 'linear-gradient(104deg, #3b82f6 0%, #6366f1 100%)',
                        border: 'none'
                      } : {}}
                    >
                      <Flag code={preset.code} style={{ width: '16px', height: '12px' }} />
                      {preset.label}
                    </button>
                  )
                })}
                {savedPresets.length > 0 && (
                  <div className="w-full mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm font-semibold text-slate-900 mb-3">Saved presets</p>
                    <div className="flex flex-wrap gap-3">
                      {savedPresets.map((p) => {
                        const isSelected = (
                          selectedLanguage === p.language &&
                          ((selectedTone === 'Custom' && p.is_custom_tone && customTone === p.tone) || (selectedTone === p.tone && !p.is_custom_tone)) &&
                          aiProvider === p.ai_provider &&
                          adCopyQuantity === Math.min(10, Math.max(1, p.copies)) &&
                          selectedAdNetwork === p.network &&
                          !!noEmojis === !!p.no_emojis
                        )
                        return (
                          <button
                            key={p.id}
                            onClick={async () => {
                              if (isEditingPresets) {
                                // Delete preset when in edit mode
                                try {
                                  const { supabase } = await import('../lib/supabase')
                                  const { error } = await supabase.from('ad_copy_presets').delete().eq('id', p.id)
                                  if (!error) {
                                    setSavedPresets((prev) => prev.filter((preset) => preset.id !== p.id))
                                  }
                                } catch { }
                                return;
                              }
                              if (isSelected) {
                                // Deselect preset: revert tone to default Expert
                                setSelectedTone('Expert');
                                setCustomTone('');
                                return;
                              }
                              setSelectedLanguage(p.language)
                              if (p.is_custom_tone) { setSelectedTone('Custom'); setCustomTone(p.tone) } else { setSelectedTone(p.tone); setCustomTone('') }
                              setAiProvider(p.ai_provider as any)
                              setAdCopyQuantity(Math.min(10, Math.max(1, p.copies)))
                              setSelectedAdNetwork(p.network as any)
                              setNoEmojis(!!p.no_emojis)
                            }}
                            className={`group inline-flex items-center justify-center whitespace-nowrap text-sm font-medium h-10 rounded-xl px-4 gap-2 transition-all ${isSelected && !isEditingPresets
                              ? 'text-white shadow-lg'
                              : isEditingPresets
                                ? 'border border-red-200 bg-white text-slate-900 hover:bg-red-50'
                                : 'border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                              }`}
                            style={isSelected && !isEditingPresets ? {
                              backgroundImage: 'linear-gradient(104deg, #3b82f6 0%, #6366f1 100%)',
                              border: 'none'
                            } : {}}
                            onMouseEnter={(e) => {
                              if (isEditingPresets) {
                                e.currentTarget.style.backgroundColor = '#ff0000'
                                e.currentTarget.style.color = 'rgb(255, 255, 255)'
                                e.currentTarget.style.borderColor = 'rgb(254, 202, 202)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (isEditingPresets) {
                                e.currentTarget.style.backgroundColor = 'white'
                                e.currentTarget.style.color = '#1d1d1f'
                                e.currentTarget.style.borderColor = '#fecaca'
                              }
                            }}
                          >
                            {isEditingPresets ? (
                              <Trash2 size={16} className="group-hover:text-white" />
                            ) : (
                              <Settings2 size={16} />
                            )}
                            {p.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <style>{`
        /* Use Inter font like the reference page */
        body {
          font-family: 'Inter', sans-serif;
        }
        /* Define NEW custom properties for colors (Green/Blue/Violet Theme) */
        :root {
          --holo-bg: #fbfbfb;
          --holo-text-primary: #1d1d1f;
          --holo-text-muted: #6e6e73;
          --holo-border: #e6e6e7;
          --app-g1: #10b981;
          --app-g2: #06b6d4;
          --app-g3: #3b82f6;
          --app-g4: #8b5cf6;
          --app-g5: #d946ef;
          --app-selected-bg: #ecfdf5;
          --app-selected-border: #059669;
        }
        /* Apply colors to sidebar */
        [role="tablist"] button[aria-selected="true"]::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background-image: linear-gradient(104deg, var(--app-g1) 0%, var(--app-g2) 22.12%, var(--app-g3) 50.53%, var(--app-g4) 76.15%, var(--app-g5) 100%);
        }
        .btn-gradient {
          background-image: linear-gradient(104deg, var(--app-g1) 0%, var(--app-g2) 22.12%, var(--app-g3) 50.53%, var(--app-g4) 76.15%, var(--app-g5) 100%);
          box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.3);
          color: white;
        }
        .language-option.selected {
          background-image: linear-gradient(to right, var(--app-g1), var(--app-g2), var(--app-g3), var(--app-g4), var(--app-g5));
          color: white;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          transform: scale(1.05);
        }
        .selection-option.selected {
          border-color: var(--app-selected-border);
          background-color: var(--app-selected-bg);
          box-shadow: 0 0 0 2px var(--app-selected-border);
        }
      `}</style>

          {/* Right Panel - Settings Sidebar */}
          <div
            className={`flex-shrink-0 flex flex-col bg-white border-l border-slate-200 relative overflow-hidden shadow-lg transition-transform duration-300 ease-in-out ${showMobileSettings
              ? 'fixed right-0 top-0 h-full w-full z-[100] md:relative md:z-auto md:w-auto'
              : 'hidden md:flex'
              }`}
            style={isMobile ? {} : { minWidth: '500px' }}
          >
            {/* Mobile Close Button */}
            {showMobileSettings && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 md:hidden">
                <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
                <button
                  onClick={() => setShowMobileSettings(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="Close settings"
                >
                  <X size={20} className="text-slate-600" />
                </button>
              </div>
            )}
            <style>{`
          :root {
            --holo-bg: #fbfbfb;
            --holo-text-primary: #1d1d1f;
            --holo-text-muted: #6e6e73;
            --holo-border: #e6e6e7;
            --app-g1: #10b981;
            --app-g2: #06b6d4;
            --app-g3: #3b82f6;
            --app-g4: #8b5cf6;
            --app-g5: #d946ef;
            --app-selected-bg: #ecfdf5;
            --app-selected-border: #059669;
          }
          .language-option.selected {
            background-image: linear-gradient(to right, var(--app-g1), var(--app-g2), var(--app-g3), var(--app-g4), var(--app-g5));
            color: white;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            transform: scale(1.05);
          }
          .language-option:not(.selected) {
            background-color: #f3f4f6;
            color: #374151;
          }
          .language-option:not(.selected):hover {
            background-color: #e5e7eb;
            transform: scale(1.05);
          }
          .selection-option.selected {
            border-color: var(--app-selected-border);
            background-color: var(--app-selected-bg);
            box-shadow: 0 0 0 2px var(--app-selected-border);
          }
          .selection-option:not(.selected) {
            border-color: #e5e7eb;
            background-color: white;
          }
          .selection-option:not(.selected):hover {
            border-color: #d1d5db;
          }
          .btn-gradient {
            background-image: linear-gradient(104deg, var(--app-g1) 0%, var(--app-g2) 22.12%, var(--app-g3) 50.53%, var(--app-g4) 76.15%, var(--app-g5) 100%);
            box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.3);
            color: white;
          }
          .btn-gradient:hover {
            opacity: 0.9;
          }
          [role="tablist"] button {
            position: relative;
            border-bottom: 2px solid transparent;
          }
          [role="tablist"] button[aria-selected="true"]::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background-image: linear-gradient(104deg, var(--app-g1) 0%, var(--app-g2) 22.12%, var(--app-g3) 50.53%, var(--app-g4) 76.15%, var(--app-g5) 100%);
          }
          [role="tablist"] button[aria-selected="true"] {
            border-color: transparent;
            color: var(--holo-text-primary);
          }
          .copies-control button {
            color: var(--holo-text-muted);
            transition: color 0.2s;
          }
          .copies-control button:hover {
            color: var(--holo-text-primary);
          }
          .copies-control span {
            min-width: 20px;
            text-align: center;
            font-weight: 500;
          }
        `}</style>

            {/* Main Settings Panel */}
            <div
              className="absolute inset-0 flex flex-col bg-white transition-all duration-300 ease-in-out"
              style={{
                transform: showLanguageSlideout || showToneSlideout || showNetworkSlideout || showAiProviderSlideout ? 'translateX(-50%)' : 'translateX(0)',
                opacity: showLanguageSlideout || showToneSlideout || showNetworkSlideout || showAiProviderSlideout ? 0.5 : 1,
                filter: showLanguageSlideout || showToneSlideout || showNetworkSlideout || showAiProviderSlideout ? 'blur(1px)' : 'blur(0px)',
                pointerEvents: showLanguageSlideout || showToneSlideout || showNetworkSlideout || showAiProviderSlideout ? 'none' : 'auto',
                display: 'flex',
                zIndex: 10
              }}
            >
              {/* Tabs */}
              <div className="px-6 bg-white flex-shrink-0 border-b border-slate-200">
                <div className="inline-flex gap-6 w-full h-14" role="tablist">
                  <button
                    role="tab"
                    onClick={() => setSidebarTab('settings')}
                    className={`whitespace-nowrap transition-all inline-flex items-center justify-center px-2 py-4 text-sm font-semibold relative ${sidebarTab === 'settings'
                      ? 'text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                      }`}
                    aria-selected={sidebarTab === 'settings'}
                  >
                    Settings
                    {sidebarTab === 'settings' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></span>
                    )}
                  </button>
                  <button
                    role="tab"
                    onClick={() => setSidebarTab('history')}
                    className={`whitespace-nowrap transition-all inline-flex items-center justify-center px-2 py-4 text-sm font-semibold relative ${sidebarTab === 'history'
                      ? 'text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                      }`}
                    aria-selected={sidebarTab === 'history'}
                  >
                    History
                    {sidebarTab === 'history' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></span>
                    )}
                  </button>
                </div>
              </div>

              {/* Settings/History Content */}
              {sidebarTab === 'settings' ? (
                <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
                  {/* Language Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                      Language
                    </label>
                    <div className="w-full">
                      <button
                        onClick={() => setShowLanguageSlideout(true)}
                        className="relative inline-flex items-center whitespace-nowrap text-sm font-medium transition-all bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-900 h-11 justify-between rounded-xl px-4 w-full shadow-sm"
                      >
                        <span className="flex items-center gap-2 max-w-full">
                          <span id="selectedLanguage" className="font-medium truncate">{selectedLanguage}</span>
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <path d="m9 18 6-6-6-6"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Tone Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                      <Music2 size={16} />
                      Tone
                    </label>
                    <div className="w-full">
                      <button
                        onClick={() => setShowToneSlideout(true)}
                        className="relative inline-flex items-center whitespace-nowrap text-sm font-medium transition-all bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-900 h-11 justify-between rounded-xl px-4 w-full shadow-sm"
                      >
                        <span className="flex items-center gap-2 max-w-full">
                          <span id="selectedTone" className="font-medium truncate">{selectedTone}</span>
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <path d="m9 18 6-6-6-6"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* AI Provider Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                      <Brain size={16} />
                      AI Provider
                    </label>
                    <div className="w-full">
                      <button
                        onClick={() => setShowAiProviderSlideout(true)}
                        className="relative inline-flex items-center whitespace-nowrap text-sm font-medium transition-all bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-900 h-11 justify-between rounded-xl px-4 w-full shadow-sm"
                      >
                        <span className="flex items-center gap-2 max-w-full">
                          <span id="selectedAiProvider" className="font-medium truncate">{aiProvider === 'deepseek' ? 'DeepSeek' : 'Gemini'}</span>
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <path d="m9 18 6-6-6-6"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Number of Copies */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                      Copies
                    </label>
                    <div className="flex items-center justify-center">
                      <div className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-full px-4 h-12 shadow-sm copies-control">
                        <button onClick={decrementCopies} className="text-lg leading-none pb-1 hover:text-gray-900">−</button>
                        <span className="font-medium px-2 text-sm select-none">{adCopyQuantity}</span>
                        <button onClick={incrementCopies} className="text-lg leading-none pb-1 hover:text-gray-900">+</button>
                      </div>
                    </div>
                  </div>

                  {/* Ad Network Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                      <Waypoints size={16} />
                      Network
                    </label>
                    <div className="w-full">
                      <button
                        onClick={() => setShowNetworkSlideout(true)}
                        className="relative inline-flex items-center whitespace-nowrap text-sm font-medium transition-all bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-900 h-11 justify-between rounded-xl px-4 w-full shadow-sm"
                      >
                        <span className="flex items-center gap-2 max-w-full">
                          {selectedAdNetwork === 'General' && (
                            <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-blue-600 rounded flex items-center justify-center text-white flex-shrink-0">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                              </svg>
                            </div>
                          )}
                          {selectedAdNetwork === 'Meta' && (
                            <img
                              src="https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/Logos/Meta_Platforms_Inc._logo_(cropped).svg"
                              alt="Meta"
                              className="w-5 h-5 object-contain flex-shrink-0"
                            />
                          )}
                          {selectedAdNetwork === 'TikTok' && (
                            <img
                              src="https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/Logos/BrandLogo.org%20-%20TikTok%20Logo%20Icon.svg"
                              alt="TikTok"
                              className="w-5 h-5 object-contain flex-shrink-0"
                            />
                          )}
                          {selectedAdNetwork === 'Snapchat' && (
                            <img
                              src="https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/Logos/BrandLogo.org%20-%20Snapchat%20Logo.svg"
                              alt="Snapchat"
                              className="w-5 h-5 object-contain flex-shrink-0"
                            />
                          )}
                          {selectedAdNetwork === 'Google' && (
                            <img
                              src="https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/Logos/BrandLogo.org-Google-G-Icon-2025.svg"
                              alt="Google Ads"
                              className="w-5 h-5 object-contain flex-shrink-0"
                            />
                          )}
                          <span id="selectedNetwork" className="font-medium truncate">{selectedAdNetwork}</span>
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <path d="m9 18 6-6-6-6"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Save Preset and Edit Buttons */}
                  <div className="flex gap-2 px-4 md:px-6 pb-4 md:pb-6 flex-shrink-0">
                    <div className="flex-1 relative group">
                      {(() => {
                        // Check if current settings match any existing preset
                        const currentSettingsMatchPreset = savedPresets.some((p) =>
                          p.language === selectedLanguage &&
                          ((selectedTone === 'Custom' && p.is_custom_tone && customTone === p.tone) || (selectedTone === p.tone && !p.is_custom_tone)) &&
                          p.ai_provider === aiProvider &&
                          p.copies === adCopyQuantity &&
                          p.network === selectedAdNetwork &&
                          !!p.no_emojis === !!noEmojis
                        )

                        return (
                          <button
                            onClick={async () => {
                              // Prevent concurrent saves, check limit, and check if already exists
                              if (isSavingPreset || savedPresets.length >= 6 || currentSettingsMatchPreset) return

                              setIsSavingPreset(true)
                              try {
                                // Double-check limit right before DB operation
                                if (savedPresets.length >= 6) return

                                const labelSource = selectedTone === 'Custom' ? customTone : `${selectedLanguage} ${selectedTone}`
                                const words = labelSource.trim().split(/\s+/)
                                const label = words.slice(0, 3).join(' ')

                                const { supabase } = await import('../lib/supabase')
                                const { data: { user } } = await supabase.auth.getUser()
                                if (!user) return

                                // Final check: count existing presets in DB
                                const { count } = await supabase
                                  .from('ad_copy_presets')
                                  .select('*', { count: 'exact', head: true })
                                  .eq('user_id', user.id)

                                if (count !== null && count >= 6) {
                                  // Refresh local state to match DB
                                  const { data: presets } = await supabase
                                    .from('ad_copy_presets')
                                    .select('*')
                                    .eq('user_id', user.id)
                                    .order('updated_at', { ascending: false })
                                  if (presets) setSavedPresets(presets as any)
                                  return
                                }

                                const { data, error } = await supabase.from('ad_copy_presets').insert({
                                  user_id: user.id,
                                  label,
                                  language: selectedLanguage,
                                  tone: selectedTone === 'Custom' ? customTone : selectedTone,
                                  is_custom_tone: selectedTone === 'Custom',
                                  ai_provider: aiProvider,
                                  copies: adCopyQuantity,
                                  network: selectedAdNetwork,
                                  no_emojis: noEmojis
                                }).select('*').single()
                                if (!error && data) setSavedPresets((prev) => [data as any, ...prev])
                              } catch { }
                              finally {
                                setIsSavingPreset(false)
                              }
                            }}
                            disabled={savedPresets.length >= 6 || isSavingPreset || currentSettingsMatchPreset}
                            className="relative inline-flex items-center whitespace-nowrap text-sm font-medium transition-all bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-900 h-11 justify-center rounded-xl px-4 w-full gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            title={currentSettingsMatchPreset ? '' : savedPresets.length >= 6 ? '' : 'Save current settings as preset'}
                          >
                            <Save size={16} />
                            Save preset
                          </button>
                        )
                      })()}
                      {(() => {
                        const currentSettingsMatchPreset = savedPresets.some((p) =>
                          p.language === selectedLanguage &&
                          ((selectedTone === 'Custom' && p.is_custom_tone && customTone === p.tone) || (selectedTone === p.tone && !p.is_custom_tone)) &&
                          p.ai_provider === aiProvider &&
                          p.copies === adCopyQuantity &&
                          p.network === selectedAdNetwork &&
                          !!p.no_emojis === !!noEmojis
                        )

                        if (currentSettingsMatchPreset) {
                          return (
                            <div className="absolute bottom-full left-0 right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                              Preset already exists :)
                            </div>
                          )
                        }

                        if (savedPresets.length >= 6) {
                          return (
                            <div className="absolute bottom-full left-0 right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                              Maximum presets is 6, delete to add
                            </div>
                          )
                        }

                        return null
                      })()}
                    </div>
                    <button
                      onClick={() => setIsEditingPresets(!isEditingPresets)}
                      className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all h-11 rounded-xl px-4 shadow-sm flex-shrink-0 ${isEditingPresets
                        ? 'bg-red-100 border border-red-300 text-red-700 hover:bg-red-200 hover:shadow-md'
                        : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-900'
                        }`}
                      title={isEditingPresets ? 'Done editing' : 'Edit presets'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 0, marginBottom: 0 }}>
                        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
                      </svg>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">History</h3>
                    <button onClick={() => { setHistoryItems([]); setHistoryPage(0); loadHistory({ refresh: true }) }} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md transition-all">
                      <RefreshCcw size={16} /> Refresh
                    </button>
                  </div>
                  {historyItems.map((h, i) => (
                    <div key={h.id} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-2">{h.title && h.title.length > 25 ? `${h.title.substring(0, 25)}...` : h.title}</p>
                          <p className="text-xs text-gray-500">{new Date(h.created_at).toLocaleString()}</p>
                        </div>
                        <button onClick={() => { setParsedAdCopies(h.outputs); setWebpageParsedAdCopies([]); setSidebarTab('settings'); setHistoryBanner('history'); setHistoryActive(true); setShowMobileSettings(false); }} className="text-sm border border-slate-200 rounded-xl px-4 py-2 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md transition-all shrink-0 font-medium">Load</button>
                      </div>
                      <div className="space-y-3">
                        {h.outputs.slice(0, 3).map((o: string, idx: number) => (
                          <div key={idx} className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md">
                            <div className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700 mt-1 shrink-0">#{idx + 1}</div>
                            <div className="flex-1 space-y-2">
                              <p className="text-sm leading-relaxed text-slate-900 whitespace-pre-wrap">{o.length > 100 ? `${o.slice(0, 100)}…` : o}</p>
                            </div>
                            <button onClick={() => navigator.clipboard.writeText(o)} className="h-9 rounded-xl px-4 text-xs opacity-0 transition-opacity group-hover:opacity-100 border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md shrink-0 font-medium">Copy</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div>
                    <button onClick={() => loadHistory()} className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md transition-all font-medium">Load more</button>
                  </div>
                </div>
              )}

              {/* Generate Button - Fixed at bottom (Desktop only) */}
              <div className="hidden md:block p-4 md:p-6 border-slate-200 bg-white">
                {/* Test Scrape Button - Small button above generate */}
                {webpageUrl.trim() && (
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleTestScrape();
                      }}
                      disabled={scrapingLoading || !webpageUrl.trim()}
                      className="w-full px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Test edge function scraping (without generating ad copies)"
                    >
                      <RefreshCcw size={14} className={scrapingLoading ? 'animate-spin' : ''} />
                      {scrapingLoading ? 'Scraping...' : 'Test Scrape'}
                    </button>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (webpageUrl.trim()) {
                        handleWebpageScraping(false) // Use cache if available, don't force regenerate
                      } else {
                        handleTextGeneration()
                      }
                    }}
                    disabled={!smartInput.trim() || textLoading || scrapingLoading || (selectedTone === 'Custom' && !customTone.trim())}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                  >
                    <Blocks size={18} />
                    {(textLoading || scrapingLoading) ? 'Generating...' : 'Generate Ad Copies'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const trimmedUrl = webpageUrl.trim()
                      const visionOcrData = visionAIOcrCache[trimmedUrl]
                      let contentToShow = '';
                      if (visionOcrData) {
                        contentToShow = filterScrapedContent(visionOcrData.text)
                      } else if (scrapedContent) {
                        contentToShow = filterScrapedContent(scrapedContent)
                      }
                      setCachedContentToDisplay(contentToShow)
                      setShowCachedContentModal(true)
                    }}
                    disabled={!scrapedContent && !visionAIOcrCache[webpageUrl.trim()]}
                    className="px-5 py-3 font-medium rounded-xl transition-all bg-slate-100 hover:bg-slate-200 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow-md"
                    title={visionAIOcrCache[webpageUrl.trim()] ? 'View cached Vision AI OCR results' : 'View cached scraped content'}
                  >
                    <ClipboardList size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Language Selection Panel */}
            <div
              className="absolute inset-0 flex flex-col bg-white transition-all duration-350 ease-in-out"
              style={{
                transform: showLanguageSlideout ? 'translateX(0)' : 'translateX(50%)',
                opacity: showLanguageSlideout ? 1 : 0,
                filter: showLanguageSlideout ? 'blur(0px)' : 'blur(2px)',
                pointerEvents: showLanguageSlideout ? 'auto' : 'none',
                visibility: showLanguageSlideout ? 'visible' : 'hidden',
                zIndex: showLanguageSlideout ? 20 : 0
              }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0 flex items-center gap-3">
                <button
                  onClick={() => setShowLanguageSlideout(false)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-sm font-semibold text-gray-900">Select Language</h2>
              </div>

              {/* Languages Grid */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  {languageOptions.map((language) => (
                    <button
                      key={language}
                      onClick={() => {
                        setSelectedLanguage(language)
                        setShowLanguageSlideout(false)
                      }}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${selectedLanguage === language
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transform scale-[1.02]'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md'
                        }`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tone Selection Panel */}
            <div
              className="absolute inset-0 flex flex-col bg-white transition-all duration-350 ease-in-out"
              style={{
                transform: showToneSlideout ? 'translateX(0)' : 'translateX(50%)',
                opacity: showToneSlideout ? 1 : 0,
                filter: showToneSlideout ? 'blur(0px)' : 'blur(2px)',
                pointerEvents: showToneSlideout ? 'auto' : 'none',
                visibility: showToneSlideout ? 'visible' : 'hidden',
                zIndex: showToneSlideout ? 20 : 0
              }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0 flex items-center gap-3">
                <button
                  onClick={() => setShowToneSlideout(false)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-sm font-semibold text-gray-900">Select Tone</h2>
              </div>

              {/* Tones Cards */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-2">
                  {/* Expert Tone */}
                  <button
                    onClick={() => {
                      setSelectedTone('Expert')
                      setShowToneSlideout(false)
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${selectedTone === 'Expert'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-sm mb-1">Expert</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">Build trust & authority. Confident, factual, structured.</p>
                      </div>
                    </div>
                  </button>

                  {/* Daring Tone */}
                  <button
                    onClick={() => {
                      setSelectedTone('Daring')
                      setShowToneSlideout(false)
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${selectedTone === 'Daring'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-sm mb-1">Daring</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">Stand out & disrupt. Provocative, fearless, punchy.</p>
                      </div>
                    </div>
                  </button>

                  {/* Playful Tone */}
                  <button
                    onClick={() => {
                      setSelectedTone('Playful')
                      setShowToneSlideout(false)
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${selectedTone === 'Playful'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-sm mb-1">Playful</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">Feel fun & human. Lighthearted, witty, conversational.</p>
                      </div>
                    </div>
                  </button>

                  {/* Sophisticated Tone */}
                  <button
                    onClick={() => {
                      setSelectedTone('Sophisticated')
                      setShowToneSlideout(false)
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${selectedTone === 'Sophisticated'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-sm mb-1">Sophisticated</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">Appeal to premium audiences. Refined, minimalistic, elegant.</p>
                      </div>
                    </div>
                  </button>

                  {/* Persuasive Tone */}
                  <button
                    onClick={() => {
                      setSelectedTone('Persuasive')
                      setShowToneSlideout(false)
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${selectedTone === 'Persuasive'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-sm mb-1">Persuasive</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">Drive conversions. Urgent, emotional, result-oriented.</p>
                      </div>
                    </div>
                  </button>

                  {/* Supportive Tone */}
                  <button
                    onClick={() => {
                      setSelectedTone('Supportive')
                      setShowToneSlideout(false)
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${selectedTone === 'Supportive'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-sm mb-1">Supportive</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">Encourage & empathize. Warm, understanding, positive.</p>
                      </div>
                    </div>
                  </button>

                  {/* Custom Tone */}
                  <button
                    onClick={() => setSelectedTone('Custom')}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${selectedTone === 'Custom'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-gray-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-sm mb-1">Custom</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">Define your own tone. Flexible & fully adaptable.</p>
                      </div>
                    </div>
                  </button>
                </div>

                {selectedTone === 'Custom' && (
                  <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
                    <label className="block text-xs font-semibold text-slate-700">Custom Tone Description</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customTone}
                        onChange={(e) => setCustomTone(e.target.value.slice(0, 100))}
                        placeholder="e.g., optimistic, professional with humor..."
                        maxLength={100}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400">{customTone.length}/100</span>
                    </div>
                    <button
                      onClick={() => setShowToneSlideout(false)}
                      disabled={!customTone.trim()}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirm Tone
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Network Selection Panel */}
            <div
              className="absolute inset-0 flex flex-col bg-white transition-all duration-350 ease-in-out"
              style={{
                transform: showNetworkSlideout ? 'translateX(0)' : 'translateX(50%)',
                opacity: showNetworkSlideout ? 1 : 0,
                filter: showNetworkSlideout ? 'blur(0px)' : 'blur(2px)',
                pointerEvents: showNetworkSlideout ? 'auto' : 'none',
                visibility: showNetworkSlideout ? 'visible' : 'hidden',
                zIndex: showNetworkSlideout ? 20 : 0
              }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0 flex items-center gap-3">
                <button
                  onClick={() => setShowNetworkSlideout(false)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-sm font-semibold text-gray-900">Select Network</h2>
              </div>

              {/* Networks Cards */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-3">
                  {/* General Network */}
                  <button
                    onClick={() => {
                      setSelectedAdNetwork('General')
                      setShowNetworkSlideout(false)
                    }}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${selectedAdNetwork === 'General'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-600 rounded-lg flex items-center justify-center text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">General</h3>
                        <p className="text-xs text-gray-500">Standard ad copy format</p>
                      </div>
                    </div>
                    <div className="space-y-1 mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                      <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </button>

                  {/* Meta Network */}
                  <button
                    onClick={() => {
                      setSelectedAdNetwork('Meta')
                      setShowNetworkSlideout(false)
                    }}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${selectedAdNetwork === 'Meta'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <img
                        src="https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/Logos/Meta_Platforms_Inc._logo_(cropped).svg"
                        alt="Meta"
                        className="w-10 h-10 object-contain"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Meta</h3>
                        <p className="text-xs text-gray-500">Facebook & Instagram format</p>
                      </div>
                    </div>
                    <div className="space-y-2 mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-gray-600">Primary Text</div>
                        <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                        <div className="h-1.5 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div className="space-y-1 pt-1 border-t border-gray-200">
                        <div className="text-xs font-semibold text-gray-600">Headline</div>
                        <div className="h-1.5 bg-gray-200 rounded w-5/6"></div>
                      </div>
                      <div className="space-y-1 pt-1 border-t border-gray-200">
                        <div className="text-xs font-semibold text-gray-600">Description</div>
                        <div className="h-1.5 bg-gray-200 rounded w-4/5"></div>
                      </div>
                    </div>
                  </button>

                  {/* TikTok Network */}
                  <button
                    onClick={() => {
                      setSelectedAdNetwork('TikTok')
                      setShowNetworkSlideout(false)
                    }}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${selectedAdNetwork === 'TikTok'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <img
                        src="https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/Logos/BrandLogo.org%20-%20TikTok%20Logo%20Icon.svg"
                        alt="TikTok"
                        className="w-10 h-10 object-contain"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">TikTok</h3>
                        <p className="text-xs text-gray-500">Max 100 chars, no emojis</p>
                      </div>
                    </div>
                    <div className="space-y-1 mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                      <div className="text-xs text-gray-400 mt-1">Short, punchy copy</div>
                    </div>
                  </button>

                  {/* Snapchat Network */}
                  <button
                    onClick={() => {
                      setSelectedAdNetwork('Snapchat')
                      setShowNetworkSlideout(false)
                    }}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${selectedAdNetwork === 'Snapchat'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <img
                        src="https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/Logos/BrandLogo.org%20-%20Snapchat%20Logo.svg"
                        alt="Snapchat"
                        className="w-10 h-10 object-contain"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Snapchat</h3>
                        <p className="text-xs text-gray-500">Max 34 chars, emojis optional</p>
                      </div>
                    </div>
                    <div className="space-y-1 mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                      <div className="text-xs text-gray-400 mt-1">Ultra-short & punchy</div>
                    </div>
                  </button>

                  {/* Google Ads Network */}
                  <button
                    onClick={() => {
                      setSelectedAdNetwork('Google')
                      setShowNetworkSlideout(false)
                    }}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${selectedAdNetwork === 'Google'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <img
                        src="https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/Logos/BrandLogo.org-Google-G-Icon-2025.svg"
                        alt="Google Ads"
                        className="w-10 h-10 object-contain"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Google Ads</h3>
                        <p className="text-xs text-gray-500">Headline, Long Headline, Description</p>
                      </div>
                    </div>
                    <div className="space-y-2 mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-gray-600">Headline</div>
                        <div className="h-1.5 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="space-y-1 pt-1 border-t border-gray-200">
                        <div className="text-xs font-semibold text-gray-600">Long Headline</div>
                        <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                      </div>
                      <div className="space-y-1 pt-1 border-t border-gray-200">
                        <div className="text-xs font-semibold text-gray-600">Description</div>
                        <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* AI Provider Selection Panel */}
            <div
              className="absolute inset-0 flex flex-col bg-white transition-all duration-350 ease-in-out"
              style={{
                transform: showAiProviderSlideout ? 'translateX(0)' : 'translateX(50%)',
                opacity: showAiProviderSlideout ? 1 : 0,
                filter: showAiProviderSlideout ? 'blur(0px)' : 'blur(2px)',
                pointerEvents: showAiProviderSlideout ? 'auto' : 'none',
                visibility: showAiProviderSlideout ? 'visible' : 'hidden',
                zIndex: showAiProviderSlideout ? 20 : 0
              }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0 flex items-center gap-3">
                <button
                  onClick={() => setShowAiProviderSlideout(false)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-sm font-semibold text-gray-900">Select AI Provider</h2>
              </div>

              {/* AI Provider Cards */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-4">
                  {/* DeepSeek */}
                  <button
                    onClick={() => {
                      setAiProvider('deepseek')
                      setShowAiProviderSlideout(false)
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${aiProvider === 'deepseek'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-base mb-1.5">DeepSeek</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">Lightning-fast responses. Handles long, complex requests with ease.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-0 py-2 border-t border-slate-200 text-sm mt-3">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-700 flex-shrink-0">
                        <path d="M4.66667 7.33333H2.66667C2.29848 7.33333 2 7.63181 2 8V12.6667C2 13.0349 2.29848 13.3333 2.66667 13.3333H4.66667M4.66667 7.33333V13.3333M4.66667 7.33333L7.33333 2H7.74375C8.56202 2 9.18722 2.73024 9.06117 3.53874L8.67742 6H12.0421C13.2541 6 14.1875 7.06937 14.0238 8.27023L13.5692 11.6036C13.4341 12.5945 12.5877 13.3333 11.5876 13.3333H4.66667" stroke="currentColor" strokeWidth="1.33333" strokeLinejoin="round"></path>
                      </svg>
                      <span className="text-slate-700 font-medium">Recommended for</span>
                      <span className="text-slate-900 font-semibold">English</span>
                    </div>
                  </button>

                  {/* Gemini */}
                  <button
                    onClick={() => {
                      setAiProvider('gemini')
                      setShowAiProviderSlideout(false)
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${aiProvider === 'gemini'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-base mb-1.5">Gemini</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">Nuanced language understanding. More natural & context-aware responses.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-0 py-2 border-t border-slate-200 text-sm mt-3">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-700 flex-shrink-0">
                        <path d="M4.66667 7.33333H2.66667C2.29848 7.33333 2 7.63181 2 8V12.6667C2 13.0349 2.29848 13.3333 2.66667 13.3333H4.66667M4.66667 7.33333V13.3333M4.66667 7.33333L7.33333 2H7.74375C8.56202 2 9.18722 2.73024 9.06117 3.53874L8.67742 6H12.0421C13.2541 6 14.1875 7.06937 14.0238 8.27023L13.5692 11.6036C13.4341 12.5945 12.5877 13.3333 11.5876 13.3333H4.66667" stroke="currentColor" strokeWidth="1.33333" strokeLinejoin="round"></path>
                      </svg>
                      <span className="text-slate-700 font-medium">Recommended for</span>
                      <span className="text-slate-900 font-semibold">Arabic</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cached Content Modal */}
        {showCachedContentModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-slate-200">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">📋 Cached Content</h3>
                <button
                  onClick={() => setShowCachedContentModal(false)}
                  className="text-slate-500 hover:text-slate-700 text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-slate-50 rounded-xl p-4 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-700 max-h-96 border border-slate-200">
                  {cachedContentToDisplay}
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(cachedContentToDisplay)
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                >
                  📋 Copy Content
                </button>
                <button
                  onClick={() => {
                    const trimmedUrl = webpageUrl.trim()
                    // Remove from cache
                    setVisionAIOcrCache(prev => {
                      const newCache = { ...prev }
                      delete newCache[trimmedUrl]
                      return newCache
                    })
                    // Clear scraped content
                    setScrapedContent('')
                    setShowCachedContentModal(false)
                    alert('✅ Cache flushed! You can now get fresh content.')
                  }}
                  className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                  title="Flush content from cache to get fresh content"
                >
                  <Trash2 size={18} />
                  Flush Cache
                </button>
                <button
                  onClick={() => setShowCachedContentModal(false)}
                  className="px-6 py-3 bg-slate-200 text-slate-800 font-semibold rounded-xl hover:bg-slate-300 shadow-sm hover:shadow-md transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Credit Purchase Modal */}
        <CreditPurchaseModal
          isOpen={showCreditModal}
          onClose={() => {
            setShowCreditModal(false);
            // Navigate back to base route when modal closes
            if (location.pathname === '/ad-copy-generator/credits') {
              navigate('/ad-copy-generator', { replace: true });
            }
          }}
          featureType="adcopy"
          onPurchaseComplete={async () => {
            // Refresh usage data after purchase
            await refreshUsage();
            setShowCreditModal(false);
            // Navigate back to base route after purchase
            if (location.pathname === '/ad-copy-generator/credits') {
              navigate('/ad-copy-generator', { replace: true });
            }
          }}
        />
      </div>
    </>

  );
};

export default AdcopyGen;