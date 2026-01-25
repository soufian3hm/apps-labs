'use client';

import { use, useState, useEffect, useMemo } from 'react';
// import { createClient } from '@/lib/supabase/client'; // This is already imported
import { createClient } from '@/lib/supabase/client';
import type { ProductWithRelations } from '@/types/supabase';

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
    ChevronDown,
    Loader2,
    Phone,
    MapPin,
    User,
    Globe,
    CreditCard,
    ShoppingCart,
    MessageCircle,
    Star,
    Upload,
    Calendar,
    ExternalLink
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { CustomElement, CustomElementStyles } from '@/components/form-builder/custom-elements';

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
    custom_elements?: CustomElement[];
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
        chooseVariant: 'Choose the Variant',
    },
    ar: {
        shippingOptions: 'خيارات الشحن',
        standardDelivery: 'التوصيل العادي',
        orderSummary: 'ملخص الطلب',
        subtotal: 'المجموع الفرعي',
        shipping: 'الشحن',
        total: 'الإجمالي',
        orderNow: 'اطلب الآن',
        chooseVariant: 'اختر الخيار',
    },
    fr: {
        shippingOptions: 'Options de livraison',
        standardDelivery: 'Livraison standard',
        orderSummary: 'Résumé de commande',
        subtotal: 'Sous-total',
        shipping: 'Livraison',
        total: 'Total',
        orderNow: 'Commander',
        chooseVariant: 'Choisir la variante',
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

// Custom Element Renderer for Storefront - ALL ELEMENT TYPES
function CustomElementRenderer({ element, formData, setFormData }: {
    element: CustomElement;
    formData: Record<string, string>;
    setFormData: (data: Record<string, string>) => void;
}) {
    const [countdownTime, setCountdownTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    // Countdown timer effect
    useEffect(() => {
        if (element.type !== 'countdown' || !element.countdownDate) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(element.countdownDate!).getTime();
            const diff = target - now;

            if (diff > 0) {
                setCountdownTime({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((diff % (1000 * 60)) / 1000),
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [element.type, element.countdownDate]);

    if (!element.enabled) return null;

    const styles = element.styles || {};
    const inlineStyles: React.CSSProperties = {
        fontSize: styles.fontSize ? `${styles.fontSize}px` : undefined,
        fontWeight: styles.fontWeight,
        color: styles.textColor,
        textAlign: styles.textAlign,
        backgroundColor: styles.backgroundColor || 'transparent',
        borderRadius: styles.borderRadius ? `${styles.borderRadius}px` : undefined,
        borderWidth: styles.borderWidth ? `${styles.borderWidth}px` : undefined,
        borderColor: styles.borderColor,
        borderStyle: styles.borderStyle,
        padding: styles.padding ? `${styles.padding}px` : undefined,
    };

    switch (element.type) {
        case 'title_text':
            return (
                <div style={inlineStyles} className="py-2">
                    {element.content || element.label}
                </div>
            );

        case 'image':
            return element.imageUrl ? (
                <img
                    src={element.imageUrl}
                    alt={element.imageAlt || 'Image'}
                    className="w-full rounded-lg"
                    style={{ objectFit: element.imageFit || 'cover', ...inlineStyles }}
                />
            ) : null;

        case 'shopify_checkout':
            return (
                <Button
                    type="button"
                    onClick={() => element.linkUrl && window.open(element.linkUrl, '_blank')}
                    className={`h-12 font-semibold gap-2 ${element.fullWidth ? 'w-full' : 'w-auto'}`}
                    style={{
                        backgroundColor: styles.backgroundColor || '#5c6ac4',
                        color: styles.textColor || '#ffffff',
                        borderRadius: `${styles.borderRadius || 8}px`,
                    }}
                >
                    <ShoppingCart className="w-5 h-5" />
                    {element.content || 'Buy Now'}
                </Button>
            );

        case 'whatsapp_button':
            const whatsappUrl = `https://wa.me/${element.phoneNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(element.whatsappMessage || '')}`;
            return (
                <Button
                    type="button"
                    onClick={() => window.open(whatsappUrl, '_blank')}
                    className={`h-12 font-semibold gap-2 ${element.fullWidth ? 'w-full' : 'w-auto'}`}
                    style={{
                        backgroundColor: styles.backgroundColor || '#25D366',
                        color: styles.textColor || '#ffffff',
                        borderRadius: `${styles.borderRadius || 8}px`,
                    }}
                >
                    <MessageCircle className="w-5 h-5" />
                    {element.content || 'Chat on WhatsApp'}
                </Button>
            );

        case 'quantity_selector':
            const qty = parseInt(formData[element.id] || '1') || 1;
            return (
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium">{element.label}</Label>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => setFormData({ ...formData, [element.id]: String(Math.max(1, qty - 1)) })}
                        >
                            -
                        </Button>
                        <Input
                            type="number"
                            min="1"
                            value={qty}
                            onChange={(e) => setFormData({ ...formData, [element.id]: e.target.value })}
                            className="w-20 h-10 text-center"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => setFormData({ ...formData, [element.id]: String(qty + 1) })}
                        >
                            +
                        </Button>
                    </div>
                </div>
            );

        case 'text_input':
        case 'email_input':
        case 'phone_input':
            return (
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                        {element.label}
                        {element.validation?.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                        type={element.type === 'email_input' ? 'email' : element.type === 'phone_input' ? 'tel' : 'text'}
                        placeholder={element.placeholder}
                        required={element.validation?.required}
                        minLength={element.validation?.minLength}
                        maxLength={element.validation?.maxLength}
                        value={formData[element.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [element.id]: e.target.value })}
                        className="h-11 bg-white"
                        style={inlineStyles}
                    />
                    {element.helpText && <p className="text-xs text-gray-500">{element.helpText}</p>}
                </div>
            );

        case 'number_input':
            return (
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                        {element.label}
                        {element.validation?.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                        type="number"
                        placeholder={element.placeholder}
                        required={element.validation?.required}
                        min={element.minValue}
                        max={element.maxValue}
                        step={element.step || 1}
                        value={formData[element.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [element.id]: e.target.value })}
                        className="h-11 bg-white"
                        style={inlineStyles}
                    />
                </div>
            );

        case 'textarea':
            return (
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                        {element.label}
                        {element.validation?.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Textarea
                        placeholder={element.placeholder}
                        required={element.validation?.required}
                        value={formData[element.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [element.id]: e.target.value })}
                        className="bg-white min-h-[100px]"
                        style={inlineStyles}
                    />
                </div>
            );

        case 'dropdown':
            return (
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                        {element.label}
                        {element.validation?.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Select
                        value={formData[element.id] || ''}
                        onValueChange={(v) => setFormData({ ...formData, [element.id]: v })}
                    >
                        <SelectTrigger className="h-11 bg-white" style={inlineStyles}>
                            <SelectValue placeholder={element.placeholder || 'Select...'} />
                        </SelectTrigger>
                        <SelectContent>
                            {element.options?.map(opt => (
                                <SelectItem key={opt.id} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            );

        case 'single_choice':
            return (
                <div className="space-y-2">
                    <Label className="text-sm font-medium">{element.label}</Label>
                    <div className="space-y-2">
                        {element.options?.map(opt => (
                            <label
                                key={opt.id}
                                className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${formData[element.id] === opt.value
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 hover:border-orange-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={element.id}
                                    value={opt.value}
                                    checked={formData[element.id] === opt.value}
                                    onChange={(e) => setFormData({ ...formData, [element.id]: e.target.value })}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData[element.id] === opt.value ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                                    }`}>
                                    {formData[element.id] === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <span className="font-medium">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            );

        case 'checkbox':
            return (
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData[element.id] === 'true'}
                        onChange={(e) => setFormData({ ...formData, [element.id]: e.target.checked ? 'true' : 'false' })}
                        className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span>{element.label}</span>
                </label>
            );

        case 'date_selector':
            return (
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                        {element.label}
                        {element.validation?.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                        type="date"
                        required={element.validation?.required}
                        value={formData[element.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [element.id]: e.target.value })}
                        className="h-11 bg-white"
                        style={inlineStyles}
                    />
                </div>
            );

        case 'link_button':
            return (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => element.linkUrl && window.open(element.linkUrl, element.linkTarget || '_blank')}
                    className={`h-11 gap-2 ${element.fullWidth ? 'w-full' : 'w-auto'}`}
                    style={inlineStyles}
                >
                    {element.content || element.label}
                    {element.linkTarget === '_blank' && <ExternalLink className="w-4 h-4" />}
                </Button>
            );

        case 'divider':
            return (
                <div
                    className="border-t my-4"
                    style={{
                        borderColor: styles.borderColor || '#e5e7eb',
                        borderWidth: styles.borderWidth || 1,
                    }}
                />
            );

        case 'spacer':
            return <div style={{ height: styles.height || 24 }} />;

        case 'rating':
            const rating = parseInt(formData[element.id] || '0') || 0;
            const maxStars = element.maxValue || 5;
            return (
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium">{element.label}</Label>
                    <div className="flex gap-1">
                        {Array.from({ length: maxStars }, (_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setFormData({ ...formData, [element.id]: String(i + 1) })}
                                className="p-1 transition-colors"
                            >
                                <Star
                                    className={`w-6 h-6 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            );

        case 'file_upload':
            return (
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                        {element.label}
                        {element.validation?.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-400 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">{element.acceptedFileTypes || 'All files accepted'}</p>
                        <input
                            type="file"
                            accept={element.acceptedFileTypes}
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setFormData({ ...formData, [element.id]: file.name });
                            }}
                        />
                    </div>
                </div>
            );

        case 'color_picker':
            return (
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium">{element.label}</Label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={formData[element.id] || '#000000'}
                            onChange={(e) => setFormData({ ...formData, [element.id]: e.target.value })}
                            className="w-12 h-10 rounded border cursor-pointer"
                        />
                        <Input
                            type="text"
                            value={formData[element.id] || '#000000'}
                            onChange={(e) => setFormData({ ...formData, [element.id]: e.target.value })}
                            className="flex-1 h-10"
                        />
                    </div>
                </div>
            );

        case 'slider':
            const sliderVal = parseInt(formData[element.id] || String(element.minValue || 0)) || 0;
            return (
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                        {element.label}: <span className="font-bold">{sliderVal}</span>
                    </Label>
                    <input
                        type="range"
                        min={element.minValue || 0}
                        max={element.maxValue || 100}
                        step={element.step || 1}
                        value={sliderVal}
                        onChange={(e) => setFormData({ ...formData, [element.id]: e.target.value })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>{element.minValue || 0}</span>
                        <span>{element.maxValue || 100}</span>
                    </div>
                </div>
            );

        case 'toggle':
            return (
                <div className="flex items-center justify-between p-3 border rounded-xl">
                    <Label className="text-sm font-medium">{element.label}</Label>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, [element.id]: formData[element.id] === 'true' ? 'false' : 'true' })}
                        className={`w-12 h-6 rounded-full transition-colors ${formData[element.id] === 'true' ? 'bg-orange-500' : 'bg-gray-300'
                            }`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${formData[element.id] === 'true' ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                    </button>
                </div>
            );

        case 'countdown':
            return (
                <div className="p-4 rounded-xl text-center" style={inlineStyles}>
                    {element.label && <p className="text-sm mb-2 opacity-70">{element.label}</p>}
                    <div className="flex justify-center gap-4">
                        {[
                            { value: countdownTime.days, label: 'Days' },
                            { value: countdownTime.hours, label: 'Hours' },
                            { value: countdownTime.minutes, label: 'Mins' },
                            { value: countdownTime.seconds, label: 'Secs' },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <span className="text-2xl font-bold">{String(item.value).padStart(2, '0')}</span>
                                <span className="text-xs opacity-60">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'social_links':
            return (
                <div className="flex justify-center gap-3 py-2">
                    {element.socialLinks?.map((link, i) => (
                        <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                            <Globe className="w-5 h-5" />
                        </a>
                    ))}
                </div>
            );

        case 'video_embed':
            if (!element.videoUrl) return null;
            // Extract YouTube video ID
            const youtubeMatch = element.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
            const vimeoMatch = element.videoUrl.match(/vimeo\.com\/(\d+)/);

            if (youtubeMatch) {
                return (
                    <div className="aspect-video rounded-xl overflow-hidden">
                        <iframe
                            src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
                            className="w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                    </div>
                );
            }
            if (vimeoMatch) {
                return (
                    <div className="aspect-video rounded-xl overflow-hidden">
                        <iframe
                            src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
                            className="w-full h-full"
                            allowFullScreen
                        />
                    </div>
                );
            }
            return null;

        case 'accordion':
            return (
                <div className="space-y-2">
                    {element.accordionItems?.map((item, i) => (
                        <div key={i} className="border rounded-xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setActiveAccordion(activeAccordion === item.id ? null : item.id)}
                                className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-medium">{item.title}</span>
                                <ChevronDown className={`w-5 h-5 transition-transform ${activeAccordion === item.id ? 'rotate-180' : ''}`} />
                            </button>
                            {activeAccordion === item.id && (
                                <div className="p-4 pt-0 border-t">
                                    {item.content}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );

        case 'tabs_element':
            return (
                <div className="space-y-4">
                    <div className="flex gap-2 border-b">
                        {element.tabItems?.map((tab, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setActiveTab(i)}
                                className={`px-4 py-2 font-medium transition-colors ${activeTab === i
                                    ? 'border-b-2 border-orange-500 text-orange-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.title}
                            </button>
                        ))}
                    </div>
                    <div className="p-2">
                        {element.tabItems?.[activeTab]?.content}
                    </div>
                </div>
            );

        default:
            // Log unknown element types for debugging
            console.warn('Unknown element type:', element.type);
            return null;
    }
}


function VariantSelector({
    variants,
    title,
    selectedOptions,
    onSelect,
    styles
}: {
    variants: { name: string; type?: string; values: string[] }[];
    title?: string;
    selectedOptions: Record<string, string>;
    onSelect: (name: string, value: string) => void;
    styles: any;
}) {
    if (!variants || variants.length === 0) return null;

    const renderVariantOptions = (variant: { name: string; type?: string; values: string[] }) => {
        const type = variant.type || 'textual_buttons';

        switch (type) {
            case 'dropdown':
                return (
                    <select
                        value={selectedOptions[variant.name] || ''}
                        onChange={(e) => onSelect(variant.name, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        style={{
                            borderColor: '#e5e7eb',
                            backgroundColor: '#ffffff',
                            color: styles.textColor,
                        }}
                    >
                        <option value="">Select {variant.name}</option>
                        {variant.values.map((val) => (
                            <option key={val} value={val}>{val}</option>
                        ))}
                    </select>
                );

            case 'radio_buttons':
                return (
                    <div className="flex flex-col gap-2">
                        {variant.values.map((val) => {
                            const isSelected = selectedOptions[variant.name] === val;
                            return (
                                <label
                                    key={val}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <input
                                        type="radio"
                                        name={variant.name}
                                        value={val}
                                        checked={isSelected}
                                        onChange={() => onSelect(variant.name, val)}
                                        className="w-4 h-4"
                                        style={{ accentColor: styles.textColor }}
                                    />
                                    <span className="text-sm" style={{ color: styles.textColor }}>{val}</span>
                                </label>
                            );
                        })}
                    </div>
                );

            case 'textual_buttons':
            default:
                return (
                    <div className="flex flex-wrap gap-2">
                        {variant.values.map((val) => {
                            const isSelected = selectedOptions[variant.name] === val;
                            return (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => onSelect(variant.name, val)}
                                    className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${isSelected
                                        ? 'ring-2 ring-offset-1 font-medium'
                                        : 'hover:bg-gray-50'
                                        }`}
                                    style={{
                                        borderColor: isSelected ? styles.textColor : '#e5e7eb',
                                        backgroundColor: isSelected ? styles.textColor : '#ffffff',
                                        color: isSelected ? styles.backgroundColor : styles.textColor,
                                        opacity: isSelected ? 1 : 0.8,
                                    }}
                                >
                                    {val}
                                </button>
                            );
                        })}
                    </div>
                );
        }
    };

    return (
        <div className="py-2 space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
            {title && (
                <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: styles.textColor }}>
                    {title}
                </h3>
            )}
            <div className="space-y-4">
                {variants.map((variant, i) => (
                    <div key={i} className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider opacity-70" style={{ color: styles.textColor }}>
                            {variant.name}
                        </label>
                        {renderVariantOptions(variant)}
                    </div>
                ))}
            </div>
        </div>
    );
}


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

    // Variants State
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        if ((product as any).variants) {
            (product as any).variants.forEach((v: any) => {
                if (v.values && v.values.length > 0) initial[v.name] = v.values[0];
            });
        }
        return initial;
    });

    const handleVariantSelect = (name: string, value: string) => {
        setSelectedVariants(prev => ({ ...prev, [name]: value }));
    };

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
                        currency: store.currency_symbol,
                        variants: selectedVariants
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

    const renderFormContent = () => {
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

                {formFields.map((block, index) => {
                    // Get translations based on settings or default to en
                    const lang = styles.language || 'en';
                    const t = TRANSLATIONS[lang];

                    return (
                        <div key={block.id}>
                            {/* HTML / Title Block */}
                            {/* HTML / Title Block */}
                            {block.type === 'html' && (
                                <>
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
                                    {index === 0 && (product as any).variants && (
                                        <VariantSelector
                                            variants={(product as any).variants}
                                            title={(product as any).variant_selection_title === 'Choose the Variant' ? t.chooseVariant : (product as any).variant_selection_title}
                                            selectedOptions={selectedVariants}
                                            onSelect={handleVariantSelect}
                                            styles={styles}
                                        />
                                    )}
                                </>
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
                                        <div className="flex justify-between font-bold border-t pt-2">
                                            <span>{t.total}</span>
                                            <span>{formatPrice(product.price, store.currency_symbol, store.currency_position)}</span>
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

                {/* Custom Elements */}
                {settings?.custom_elements?.filter(el => el.enabled).map(element => (
                    <CustomElementRenderer
                        key={element.id}
                        element={element}
                        formData={formData}
                        setFormData={setFormData}
                    />
                ))}
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
                    {renderFormContent()}
                </DialogContent>
            </Dialog>
        );
    }

    // Embedded Mode
    return renderFormContent();
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
                .maybeSingle();

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
                .maybeSingle();

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
                .maybeSingle();

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
