'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
// import { createClient } from '@/lib/supabase/client'; // This is already imported
// import { createClient } from '@/lib/supabase/client';


interface ProductWithRelations {
    id: string;
    store_id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compare_price: number | null;
    currency: string;
    status: 'draft' | 'published' | 'archived';
    highlights: string[] | null;
    layout_config: any;
    theme: any;
    images: any[];
    lead_form_config: any;
}
import { formatPrice } from '@/lib/currencies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Check,
    Shield,
    Truck,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Phone,
    MapPin,
    User,
    Globe,
    CreditCard,
    ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

declare global {
    interface Window {
        ttq: any;
        TiktokAnalyticsObject: any;
    }
}

interface LayoutSection {
    id: string;
    enabled: boolean;
    order: number;
}

interface LayoutConfig {
    sections: LayoutSection[];
    show_store_name?: boolean;
}

interface StoreData {
    id: string;
    name: string;
    currency_symbol: string;
    currency_code?: string;
    currency_position: 'before' | 'after';
    custom_domain?: string;
    tiktok_pixels?: Array<{
        id: string;
        name: string;
        pixelId: string;
        accessToken: string;
        enabled: boolean;
    }>;
}

// Updated Interfaces to match Designer
interface FormBlock {
    id: string;
    type: 'field' | 'summary' | 'discount' | 'shipping' | 'button' | 'html' | 'order_summary';
    label: string;
    enabled: boolean;
    required?: boolean;
    fieldName?: string;
    placeholder?: string;
    content?: string;
    showIcon?: boolean;
    minLength?: number;
    maxLength?: number;
    invalidErrorText?: string;
    alignment?: 'left' | 'center' | 'right';
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    textColor?: string;
    backgroundColor?: string;
    borderRadius?: number;
}

interface FormSettings {
    mode: 'popup' | 'embedded';
    fields: FormBlock[];
    styles: {
        backgroundColor: string;
        textColor: string;
        fontSize: number;
        borderRadius: number;
        borderWidth: number;
        borderColor: string;
        shadow: boolean;
        hideLabels: boolean;
        rtl: boolean;
        language: 'en' | 'ar' | 'fr';
    };
    texts: {
        requiredError: string;
        invalidError: string;
    };
}

const TRANSLATIONS = {
    en: {
        shippingOptions: 'Shipping Options',
        standardDelivery: 'Standard Delivery',
        orderSummary: 'Order Summary',
        subtotal: 'Subtotal',
        shipping: 'Shipping',
        total: 'Total',
        orderNow: 'Order Now',
    },
    ar: {
        shippingOptions: 'خيارات الشحن',
        standardDelivery: 'التوصيل العادي',
        orderSummary: 'ملخص الطلب',
        subtotal: 'المجموع الفرعي',
        shipping: 'الشحن',
        total: 'الإجمالي',
        orderNow: 'اطلب الآن',
    },
    fr: {
        shippingOptions: 'Options de livraison',
        standardDelivery: 'Livraison standard',
        orderSummary: 'Résumé de commande',
        subtotal: 'Sous-total',
        shipping: 'Livraison',
        total: 'Total',
        orderNow: 'Commander',
    },
};

// Helper for dynamic content
const replaceVariables = (text: string, product: ProductWithRelations, store: StoreData) => {
    if (!text) return '';
    let result = text;
    const price = formatPrice(product.price, store.currency_symbol, store.currency_position);
    result = result.replace(/{total}/g, price);
    result = result.replace(/{product_name}/g, product.name);
    return result;
};

function EnhancedLeadForm({
    product,
    store,
    settings,
    onlyButton = false
}: {
    product: ProductWithRelations;
    store: StoreData;
    settings?: FormSettings;
    onlyButton?: boolean;
}) {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [discountCode, setDiscountCode] = useState('');

    const theme = product.theme;
    if (!theme) return null;

    const formFields = settings?.fields?.filter(f => f.enabled) || [];

    // Styles from settings or defaults
    const styles = settings?.styles || {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        fontSize: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadow: true,
        hideLabels: false,
        rtl: false,
        language: 'en'
    };

    const isPopup = settings?.mode === 'popup';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('lead_submissions')
                .insert({
                    product_id: product.id,
                    form_data: {
                        ...formData,
                        language: settings?.styles?.language || 'en',
                        discount_code: discountCode,
                        currency: store.currency_symbol
                    },
                });

            if (error) throw error;

            setSubmitted(true);

            // TikTok PlaceAnOrder Event
            if (store.tiktok_pixels && (window as any).ttq) {
                store.tiktok_pixels.forEach(pixel => {
                    if (pixel.enabled && pixel.pixelId) {
                        try {
                            (window as any).ttq.track('PlaceAnOrder', {
                                contents: [
                                    {
                                        content_id: product.id,
                                        content_name: product.name,
                                        quantity: 1,
                                        price: product.price
                                    }
                                ],
                                value: product.price,
                                currency: store.currency_code || 'USD'
                            });
                        } catch (e) {
                            console.error('TikTok tracking error:', e);
                        }
                    }
                });
            }

            toast.success('Order submitted successfully!');
            setTimeout(() => setIsOpen(false), 2500);
        } catch (error) {
            console.error('Error submitting lead:', error);
            toast.error('Failed to submit. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const FormContent = () => {
        if (submitted) {
            return (
                <div className="p-8 rounded-2xl text-center bg-green-50 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">Thank You!</h3>
                    <p className="text-gray-600">Your order has been received.</p>
                </div>
            );
        }

        // Legacy fallback if no settings
        if (!settings || formFields.length === 0) {
            const config = product.lead_form_config;
            if (!config) return null;
            return (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-center mb-4">
                        <h3 className="text-xl font-bold" style={{ color: theme.text_color }}>{config.title}</h3>
                    </div>
                    {config.fields?.map((field: any) => (
                        <Input
                            key={field.id}
                            required={field.required}
                            placeholder={field.placeholder || field.label}
                            value={formData[field.name] || ''}
                            onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                            className="h-12 bg-white"
                        />
                    ))}
                    <Button type="submit" className="w-full h-12" style={{ backgroundColor: theme.primary_color }}>
                        {config.submit_button_text}
                    </Button>
                </form>
            );
        }

        // EXACT MATCH TO ADMIN DESIGNER PREVIEW
        return (
            <form
                onSubmit={handleSubmit}
                className="space-y-4 transition-all duration-300"
                style={{
                    backgroundColor: styles.backgroundColor,
                    color: styles.textColor,
                    borderRadius: `${styles.borderRadius}px`,
                    borderWidth: `${styles.borderWidth}px`,
                    borderStyle: 'solid',
                    borderColor: styles.borderColor,
                    padding: '24px',
                    boxShadow: styles.shadow ? '0 20px 50px -10px rgba(0, 0, 0, 0.15)' : 'none',
                    direction: styles.rtl ? 'rtl' : 'ltr',
                }}
            >

                {formFields.map(block => {
                    // Get translations based on settings or default to en
                    const lang = styles.language || 'en';
                    const t = TRANSLATIONS[lang];

                    return (
                        <div key={block.id}>
                            {/* HTML / Title Block */}
                            {block.type === 'html' && (
                                <div
                                    className="py-2"
                                    style={{
                                        textAlign: block.alignment || 'center',
                                        fontSize: `${block.fontSize || 16}px`,
                                        fontWeight: block.fontWeight || 'normal',
                                        color: block.textColor || styles.textColor,
                                    }}
                                >
                                    {block.content || block.label}
                                </div>
                            )}

                            {/* Summary Block */}
                            {block.type === 'summary' && (
                                <div
                                    className="p-4 rounded-lg flex justify-between items-center"
                                    style={{
                                        backgroundColor: block.backgroundColor || '#f3f4f6',
                                        color: block.textColor || '#1f2937',
                                    }}
                                >
                                    <span className="font-medium">{t.subtotal}</span>
                                    <span className="font-bold">
                                        {formatPrice(product.price, store.currency_symbol, store.currency_position)}
                                    </span>
                                </div>
                            )}

                            {/* Discount Block */}
                            {block.type === 'discount' && (
                                <div
                                    className="p-3 rounded-lg"
                                    style={{
                                        backgroundColor: block.backgroundColor || '#f0fdf4',
                                        color: block.textColor || '#166534',
                                    }}
                                >
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder={block.placeholder || 'Enter coupon code'}
                                            value={discountCode}
                                            onChange={(e) => setDiscountCode(e.target.value)}
                                            className="flex-1 bg-white border-gray-300 rounded-lg h-10"
                                        />
                                        <Button type="button" size="sm" variant="outline" className="h-10">
                                            Apply
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Field Block */}
                            {block.type === 'field' && block.fieldName && (
                                <div className="space-y-1.5">
                                    {!styles.hideLabels && (
                                        <Label className="text-sm font-medium flex items-center gap-1" style={{ color: styles.textColor }}>
                                            {block.label}
                                            {block.required && <span className="text-red-500">*</span>}
                                        </Label>
                                    )}
                                    <div className="relative">
                                        <Input
                                            required={block.required}
                                            placeholder={block.placeholder || block.label}
                                            value={formData[block.fieldName] || ''}
                                            onChange={e => setFormData({ ...formData, [block.fieldName!]: e.target.value })}
                                            minLength={block.minLength}
                                            maxLength={block.maxLength}
                                            className="bg-white h-11 transition-all border-gray-300 rounded-lg"
                                            style={{
                                                paddingLeft: block.showIcon ? '2.5rem' : '0.75rem',
                                            }}
                                        />
                                        {block.showIcon && (
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                {block.id.includes('name') && <User className="w-4 h-4" />}
                                                {block.id.includes('phone') && <Phone className="w-4 h-4" />}
                                                {block.id.includes('address') && <MapPin className="w-4 h-4" />}
                                                {(block.id.includes('province') || block.id.includes('wilaya')) && <MapPin className="w-4 h-4" />}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Shipping Block */}
                            {block.type === 'shipping' && (
                                <div
                                    className="p-4 rounded-lg space-y-2"
                                    style={{
                                        backgroundColor: block.backgroundColor || '#eff6ff',
                                        color: block.textColor || '#1e40af',
                                    }}
                                >
                                    <div className="flex items-center gap-2 font-medium">
                                        <Truck className="w-4 h-4" />
                                        {t.shippingOptions}
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>{t.standardDelivery}</span>
                                        <span className="font-semibold">500 DA</span>
                                    </div>
                                </div>
                            )}

                            {/* Order Summary Block */}
                            {block.type === 'order_summary' && (
                                <div
                                    className="p-4 rounded-lg space-y-3"
                                    style={{
                                        backgroundColor: block.backgroundColor || '#f9fafb',
                                        color: block.textColor || '#374151',
                                    }}
                                >
                                    <div className="font-semibold flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4" />
                                        {t.orderSummary}
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>{t.subtotal}</span>
                                            <span>{formatPrice(product.price, store.currency_symbol, store.currency_position)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t.shipping}</span>
                                            <span>500 DA</span>
                                        </div>
                                        <div className="flex justify-between font-bold border-t pt-2">
                                            <span>{t.total}</span>
                                            <span>{formatPrice(product.price + 500, store.currency_symbol, store.currency_position)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            {block.type === 'button' && (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 text-base shadow-lg transition-transform hover:scale-[1.02]"
                                    style={{
                                        backgroundColor: block.backgroundColor || '#4f46e5',
                                        color: block.textColor || '#ffffff',
                                        fontWeight: block.fontWeight || 'bold',
                                        fontSize: `${block.fontSize || 16}px`,
                                        borderRadius: `${block.borderRadius || 8}px`,
                                    }}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        replaceVariables(block.content || 'Order Now', product, store)
                                    )}
                                </Button>
                            )}
                        </div>
                    );
                })}
            </form>
        );
    };

    if (isPopup) {
        const lang = styles.language || 'en';
        const t = TRANSLATIONS[lang];

        const buttonBlock = formFields.find(f => f.type === 'button');
        const buttonText = buttonBlock
            ? replaceVariables(buttonBlock.content || t.orderNow, product, store)
            : t.orderNow;

        const btnBg = buttonBlock?.backgroundColor || theme.primary_color;
        const btnTextColor = buttonBlock?.textColor || '#ffffff';
        const btnRadius = buttonBlock?.borderRadius || 8;

        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button
                        className="w-full h-14 text-lg font-bold shadow-xl hover:scale-[1.02] transition-all"
                        style={{
                            backgroundColor: btnBg,
                            color: btnTextColor,
                            borderRadius: `${btnRadius}px`,
                        }}
                    >
                        {buttonText}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 border-0">
                    <VisuallyHidden>
                        <DialogTitle>Order Form</DialogTitle>
                        <DialogDescription>Fill in your details to complete the order</DialogDescription>
                    </VisuallyHidden>
                    <FormContent />
                </DialogContent>
            </Dialog>
        );
    }

    // Embedded Mode
    return <FormContent />;
}

// Image Gallery Component
function ImageGallery({ images, theme }: { images: ProductWithRelations['images']; theme: any }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div
                className="aspect-square rounded-2xl flex items-center justify-center bg-gray-100"
            >
                <span className="text-gray-400">No image</span>
            </div>
        );
    }

    return (
        <div className="space-y-3 sticky top-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm bg-white">
                <img
                    src={images[currentIndex].url}
                    alt={images[currentIndex].alt_text || ''}
                    className="w-full h-full object-contain"
                />

                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => setCurrentIndex(i => (i === 0 ? images.length - 1 : i - 1))}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-800" />
                        </button>
                        <button
                            onClick={() => setCurrentIndex(i => (i === images.length - 1 ? 0 : i + 1))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-800" />
                        </button>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img: any, i: any) => (
                        <button
                            key={img.id}
                            onClick={() => setCurrentIndex(i)}
                            className={cn(
                                "flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all bg-white",
                                i === currentIndex ? "border-indigo-600 opacity-100 ring-2 ring-indigo-600 ring-offset-1" : "border-gray-200 opacity-60 hover:opacity-100"
                            )}
                            style={{ borderColor: i === currentIndex ? theme.primary_color : undefined }}
                        >
                            <img src={img.url} alt={img.alt_text || ''} className="w-full h-full object-contain" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function StoreProductPage({ params }: { params: Promise<{ store: string; slug: string }> }) {
    const resolvedParams = use(params);
    const { store: storeDomain, slug: productSlug } = resolvedParams;

    const [product, setProduct] = useState<ProductWithRelations | null>(null);
    const [store, setStore] = useState<StoreData | null>(null);
    const [formSettings, setFormSettings] = useState<FormSettings | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const supabase = createClient();

            // 1. Find store - try custom_domain first, then match by slugified name
            let storeData = null;

            // Try custom_domain match first
            const { data: domainMatch } = await supabase
                .from('stores')
                .select('id, name, currency_symbol, currency_code, currency_position, custom_domain, tiktok_pixels')
                .eq('custom_domain', storeDomain)
                .single();

            if (domainMatch) {
                storeData = domainMatch;
            } else {
                // Try matching by slugified store name
                const { data: allStores } = await supabase
                    .from('stores')
                    .select('id, name, currency_symbol, currency_code, currency_position, custom_domain, tiktok_pixels');

                if (allStores) {
                    storeData = allStores.find(s =>
                        s.name.toLowerCase().replace(/\s+/g, '-') === storeDomain.toLowerCase()
                    );
                }
            }

            if (!storeData) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            setStore(storeData as StoreData);

            // 2. Find product
            const { data: productData, error: productError } = await supabase
                .from('products')
                .select(`
                    *,
                    theme:product_themes(*),
                    images:product_images(*),
                    lead_form_config:lead_form_configs(
                        *,
                        fields:lead_form_fields(*)
                    )
                `)
                .eq('store_id', storeData.id)
                .eq('slug', productSlug)
                .eq('status', 'published')
                .single();

            if (productError || !productData) {
                setNotFound(true);
            } else {
                setProduct(productData as unknown as ProductWithRelations);
            }

            // 3. Fetch Form Settings
            const { data: formData } = await supabase
                .from('store_lead_form_settings')
                .select('*')
                .eq('store_id', storeData.id)
                .single();

            if (formData) {
                setFormSettings(formData as unknown as FormSettings);
            }

            setLoading(false);
        }

        fetchData();
    }, [storeDomain, productSlug]);

    // TikTok Pixel Injection
    useEffect(() => {
        if (!store?.tiktok_pixels) return;

        const enabledPixels = store.tiktok_pixels.filter(p => p.enabled && p.pixelId);
        if (enabledPixels.length === 0) return;

        // Prevent duplicate injection
        if ((window as any).ttq) return;

        (function (w: any, d, t) {
            w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
            ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"],
                ttq.setAndDefer = function (t: any, e: any) { t.align = 2, ttq.chars = 1, ttq.methods.forEach(function (t: any) { ttq[t] = function () { var r = Array.prototype.slice.call(arguments); ttq.push([t, e, r]) } }) };
            for (var i = 0; i < ttq.methods.length; i++)ttq.setAndDefer(ttq, ttq.methods[i]);
            ttq.instance = function (t: any) { var e = ttq._i[t] || []; return Object.assign(e, { setAndDefer: ttq.setAndDefer }), e }, ttq.load = function (e: any, n: any) { var i = "https://analytics.tiktok.com/i18n/pixel/events.js"; ttq._i = ttq._i || {}, ttq._i[e] = [], ttq._i[e]._u = i, ttq._t = ttq._t || {}, ttq._t[e] = +new Date, ttq._o = ttq._o || {}, ttq._o[e] = n || {}; var o = document.createElement("script"); o.type = "text/javascript", o.async = !0, o.src = i + "?sdkid=" + e + "&lib=" + t; var a = document.getElementsByTagName("script")[0]; a.parentNode?.insertBefore(o, a) };

            enabledPixels.forEach(p => ttq.load(p.pixelId));
            ttq.page();
        })(window, document, 'ttq');

    }, [store]);

    const layoutConfig = useMemo<LayoutConfig>(() => {
        if (!product?.layout_config) {
            return {
                sections: [
                    { id: 'highlights', enabled: true, order: 0 },
                    { id: 'store_name', enabled: true, order: 1 },
                    { id: 'product_name', enabled: true, order: 2 },
                    { id: 'price', enabled: true, order: 3 },
                    { id: 'gallery', enabled: true, order: 4 },
                    { id: 'lead_form', enabled: true, order: 5 },
                    { id: 'description', enabled: true, order: 6 },
                    { id: 'footer', enabled: true, order: 7 },
                ],
                show_store_name: true,
            };
        }
        return product.layout_config as LayoutConfig;
    }, [product]);

    const sortedSections = useMemo(() => {
        return [...layoutConfig.sections].sort((a, b) => a.order - b.order);
    }, [layoutConfig]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
    if (notFound || !product || !store) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

    const theme = product.theme!;
    const currencySymbol = store.currency_symbol || '$';
    const currencyPosition = store.currency_position || 'before';

    const renderSection = (sectionId: string, isDesktopRightColumn = false) => {
        const section = layoutConfig.sections.find(s => s.id === sectionId);
        if (!section?.enabled) return null;

        // On desktop right column, skip gallery (it's on the left)
        if (isDesktopRightColumn && sectionId === 'gallery') return null;

        switch (sectionId) {
            case 'highlights':
                return (

                    <div key="highlights" className={`py-3 mb-4 ${isDesktopRightColumn ? 'rounded-xl mb-6' : ''}`} style={{ backgroundColor: theme.primary_color }}>
                        <div className="flex items-center gap-4 justify-center text-white text-sm font-medium">
                            {product.highlights?.map((h: any, i: any) => (
                                <span key={i} className="flex items-center gap-2"><Check className="w-4 h-4" />{h}</span>
                            ))}
                        </div>
                    </div>
                );
            case 'store_name':
                if (!layoutConfig.show_store_name) return null;
                return <p key="store_name" className="text-center text-sm opacity-70 mb-2">{store.name}</p>;
            case 'product_name':
                return <h1 key="product_name" className="text-2xl md:text-4xl font-bold text-center mb-2" style={{ color: theme.text_color }}>{product.name}</h1>;
            case 'price':
                return (
                    <div key="price" className="flex items-center justify-center gap-3 mb-6">
                        <span className="text-3xl font-bold" style={{ color: theme.primary_color }}>
                            {formatPrice(product.price, currencySymbol, currencyPosition)}
                        </span>
                        {product.compare_price && (
                            <span className="text-xl line-through opacity-50" style={{ color: theme.text_color }}>
                                {formatPrice(product.compare_price, currencySymbol, currencyPosition)}
                            </span>
                        )}
                    </div>
                );
            case 'gallery':
                return <div key="gallery" className="mb-6"><ImageGallery images={product.images} theme={theme} /></div>;
            case 'lead_form':
                return (
                    <div key="lead_form" className="mb-8">
                        <EnhancedLeadForm
                            product={product}
                            store={store}
                            settings={formSettings}
                            onlyButton={formSettings?.mode === 'popup'}
                        />
                    </div>
                );
            case 'description':
                return (
                    <div key="description" className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: product.description || '' }} />
                );
            case 'footer':
                return (
                    <footer key="footer" className="py-8 text-center border-t opacity-60 text-sm mt-auto">
                        <p>© {new Date().getFullYear()} {store.name}</p>
                    </footer>
                );
            default: return null;
        }
    };

    return (
        <div
            className="min-h-screen transition-colors duration-300"
            style={{ backgroundColor: theme.background_color, color: theme.text_color, fontFamily: theme.font_family }}
        >
            <div className="max-w-7xl mx-auto md:p-6 lg:p-8">
                {/* Desktop Grid Layout */}
                <div className="hidden lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">

                    {/* Left Column - Gallery */}
                    <div className="hidden lg:block lg:col-span-7 lg:sticky lg:top-8">
                        <ImageGallery images={product.images} theme={theme} />
                    </div>

                    {/* Right Column - Details & Form */}
                    <div className="lg:col-span-5 space-y-2">
                        {sortedSections.map(section => {
                            // On Desktop right column, we render everything in order (except Gallery which is on left)
                            return renderSection(section.id, true);
                        })}
                    </div>
                </div>

                {/* Mobile Layout (Default) - Hidden on LG */}
                <div className="lg:hidden block pb-20" style={{ padding: '20px' }}>
                    {sortedSections.map(section => renderSection(section.id, false))}
                </div>
            </div>
        </div>
    );
}
