'use client';

import { CustomElement, CustomElementStyles } from './custom-elements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    MessageCircle,
    ShoppingCart,
    Plus,
    Minus,
    Upload,
    Calendar,
    Star,
    ExternalLink,
    ChevronDown
} from 'lucide-react';

// ============================================================================
// STYLE HELPERS
// ============================================================================

const getShadowClass = (shadow?: string) => {
    switch (shadow) {
        case 'sm': return 'shadow-sm';
        case 'md': return 'shadow-md';
        case 'lg': return 'shadow-lg';
        case 'xl': return 'shadow-xl';
        default: return '';
    }
};

const getHoverClass = (hover?: string) => {
    switch (hover) {
        case 'lift': return 'hover:-translate-y-1 hover:shadow-lg';
        case 'glow': return 'hover:ring-4 hover:ring-orange-200';
        case 'scale': return 'hover:scale-105';
        case 'darken': return 'hover:brightness-90';
        default: return '';
    }
};

const getWidthClass = (width?: string) => {
    switch (width) {
        case 'auto': return 'w-auto';
        case 'half': return 'w-1/2';
        case 'third': return 'w-1/3';
        case 'quarter': return 'w-1/4';
        default: return 'w-full';
    }
};

const getButtonSizeClass = (size?: string) => {
    switch (size) {
        case 'sm': return 'h-9 text-sm px-4';
        case 'lg': return 'h-12 text-lg px-6';
        case 'xl': return 'h-14 text-xl px-8';
        default: return 'h-10 px-5';
    }
};

const buildStyles = (styles?: CustomElementStyles): React.CSSProperties => {
    if (!styles) return {};

    return {
        fontSize: styles.fontSize ? `${styles.fontSize}px` : undefined,
        fontWeight: styles.fontWeight,
        color: styles.textColor,
        textAlign: styles.textAlign,
        lineHeight: styles.lineHeight,
        letterSpacing: styles.letterSpacing ? `${styles.letterSpacing}px` : undefined,
        textTransform: styles.textTransform,
        textDecoration: styles.textDecoration,
        backgroundColor: styles.backgroundColor || 'transparent',
        borderRadius: styles.borderRadius ? `${styles.borderRadius}px` : undefined,
        borderWidth: styles.borderWidth ? `${styles.borderWidth}px` : undefined,
        borderColor: styles.borderColor,
        borderStyle: styles.borderStyle,
        padding: styles.padding ? `${styles.padding}px` : undefined,
        paddingTop: styles.paddingTop ? `${styles.paddingTop}px` : undefined,
        paddingRight: styles.paddingRight ? `${styles.paddingRight}px` : undefined,
        paddingBottom: styles.paddingBottom ? `${styles.paddingBottom}px` : undefined,
        paddingLeft: styles.paddingLeft ? `${styles.paddingLeft}px` : undefined,
        marginTop: styles.marginTop ? `${styles.marginTop}px` : undefined,
        marginBottom: styles.marginBottom ? `${styles.marginBottom}px` : undefined,
        height: styles.height ? `${styles.height}px` : undefined,
        opacity: styles.opacity,
    };
};

// ============================================================================
// ELEMENT PREVIEW COMPONENT
// ============================================================================

interface ElementPreviewProps {
    element: CustomElement;
    isEditing?: boolean;
    onClick?: () => void;
}

export function ElementPreview({ element, isEditing, onClick }: ElementPreviewProps) {
    if (!element.enabled) return null;

    const baseClasses = `transition-all duration-200 ${getShadowClass(element.styles?.shadow)} ${getHoverClass(element.styles?.hoverEffect)} ${getWidthClass(element.styles?.width)} ${element.cssClass || ''}`;
    const inlineStyles = buildStyles(element.styles);

    const renderContent = () => {
        switch (element.type) {
            // ============================================================
            // TITLE / TEXT
            // ============================================================
            case 'title_text':
                return (
                    <div
                        className={baseClasses}
                        style={inlineStyles}
                    >
                        {element.content || element.label}
                    </div>
                );

            // ============================================================
            // IMAGE
            // ============================================================
            case 'image':
                return (
                    <div className={`${baseClasses} overflow-hidden`} style={inlineStyles}>
                        {element.imageUrl ? (
                            <img
                                src={element.imageUrl}
                                alt={element.imageAlt || 'Image'}
                                className="w-full h-auto"
                                style={{ objectFit: element.imageFit || 'cover' }}
                            />
                        ) : (
                            <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                                <Upload className="w-8 h-8" />
                            </div>
                        )}
                    </div>
                );

            // ============================================================
            // SHOPIFY CHECKOUT BUTTON
            // ============================================================
            case 'shopify_checkout':
                return (
                    <Button
                        className={`${baseClasses} ${getButtonSizeClass(element.buttonSize)} ${element.fullWidth ? 'w-full' : 'w-auto'} gap-2`}
                        style={{
                            ...inlineStyles,
                            backgroundColor: element.styles?.backgroundColor || '#5c6ac4',
                            color: element.styles?.textColor || '#ffffff',
                        }}
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {element.content || 'Buy Now'}
                    </Button>
                );

            // ============================================================
            // WHATSAPP BUTTON
            // ============================================================
            case 'whatsapp_button':
                return (
                    <Button
                        className={`${baseClasses} ${getButtonSizeClass(element.buttonSize)} ${element.fullWidth ? 'w-full' : 'w-auto'} gap-2`}
                        style={{
                            ...inlineStyles,
                            backgroundColor: element.styles?.backgroundColor || '#25D366',
                            color: element.styles?.textColor || '#ffffff',
                        }}
                    >
                        <MessageCircle className="w-5 h-5" />
                        {element.content || 'Chat on WhatsApp'}
                    </Button>
                );

            // ============================================================
            // QUANTITY SELECTOR
            // ============================================================
            case 'quantity_selector':
                return (
                    <div className={`space-y-2 ${baseClasses}`}>
                        <Label className="text-sm font-medium">{element.label}</Label>
                        <div className="inline-flex items-center border rounded-lg overflow-hidden" style={inlineStyles}>
                            <button className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-r">
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-14 text-center font-medium">
                                {typeof element.defaultValue === 'number' ? element.defaultValue : 1}
                            </span>
                            <button className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-l">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        {element.helpText && <p className="text-xs text-gray-500">{element.helpText}</p>}
                    </div>
                );

            // ============================================================
            // TEXT INPUT
            // ============================================================
            case 'text_input':
            case 'email_input':
            case 'phone_input':
                return (
                    <div className={`space-y-2 ${baseClasses}`}>
                        <Label className="text-sm font-medium">
                            {element.label}
                            {element.validation?.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                            type={element.type === 'email_input' ? 'email' : element.type === 'phone_input' ? 'tel' : 'text'}
                            placeholder={element.placeholder}
                            style={inlineStyles}
                            className="h-11"
                            readOnly
                        />
                        {element.helpText && <p className="text-xs text-gray-500">{element.helpText}</p>}
                    </div>
                );

            // ============================================================
            // NUMBER INPUT
            // ============================================================
            case 'number_input':
                return (
                    <div className={`space-y-2 ${baseClasses}`}>
                        <Label className="text-sm font-medium">
                            {element.label}
                            {element.validation?.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                            type="number"
                            placeholder={element.placeholder}
                            min={element.minValue}
                            max={element.maxValue}
                            step={element.step}
                            style={inlineStyles}
                            className="h-11 w-32"
                            readOnly
                        />
                        {element.helpText && <p className="text-xs text-gray-500">{element.helpText}</p>}
                    </div>
                );

            // ============================================================
            // TEXTAREA
            // ============================================================
            case 'textarea':
                return (
                    <div className={`space-y-2 ${baseClasses}`}>
                        <Label className="text-sm font-medium">
                            {element.label}
                            {element.validation?.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Textarea
                            placeholder={element.placeholder}
                            style={{
                                ...inlineStyles,
                                minHeight: element.styles?.height || 100
                            }}
                            readOnly
                        />
                        {element.helpText && <p className="text-xs text-gray-500">{element.helpText}</p>}
                    </div>
                );

            // ============================================================
            // DROPDOWN
            // ============================================================
            case 'dropdown':
                return (
                    <div className={`space-y-2 ${baseClasses}`}>
                        <Label className="text-sm font-medium">
                            {element.label}
                            {element.validation?.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Select>
                            <SelectTrigger style={inlineStyles} className="h-11">
                                <SelectValue placeholder={element.placeholder || 'Select an option...'} />
                            </SelectTrigger>
                            <SelectContent>
                                {element.options?.map(opt => (
                                    <SelectItem key={opt.id} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {element.helpText && <p className="text-xs text-gray-500">{element.helpText}</p>}
                    </div>
                );

            // ============================================================
            // SINGLE CHOICE (Radio)
            // ============================================================
            case 'single_choice':
                return (
                    <div className={`space-y-3 ${baseClasses}`}>
                        <Label className="text-sm font-medium">
                            {element.label}
                            {element.validation?.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="space-y-2">
                            {element.options?.map((opt, idx) => (
                                <label
                                    key={opt.id}
                                    className="flex items-center gap-3 p-3 border rounded-xl hover:border-orange-300 hover:bg-orange-50/50 cursor-pointer transition-all"
                                    style={inlineStyles}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 ${idx === 0 ? 'border-orange-500 bg-orange-500' : 'border-gray-300'} flex items-center justify-center`}>
                                        {idx === 0 && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <span className="font-medium">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                        {element.helpText && <p className="text-xs text-gray-500">{element.helpText}</p>}
                    </div>
                );

            // ============================================================
            // CHECKBOX
            // ============================================================
            case 'checkbox':
                if (element.options && element.options.length > 0) {
                    return (
                        <div className={`space-y-3 ${baseClasses}`}>
                            <Label className="text-sm font-medium">{element.label}</Label>
                            <div className="space-y-2">
                                {element.options.map((opt, idx) => (
                                    <label key={opt.id} className="flex items-center gap-3 cursor-pointer">
                                        <div className={`w-5 h-5 rounded border-2 ${idx === 0 ? 'bg-orange-500 border-orange-500' : 'border-gray-300'} flex items-center justify-center`}>
                                            {idx === 0 && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                }
                // Single checkbox
                return (
                    <label className={`flex items-center gap-3 cursor-pointer ${baseClasses}`} style={inlineStyles}>
                        <div className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center" />
                        <span>{element.label}</span>
                    </label>
                );

            // ============================================================
            // DATE SELECTOR
            // ============================================================
            case 'date_selector':
                return (
                    <div className={`space-y-2 ${baseClasses}`}>
                        <Label className="text-sm font-medium">
                            {element.label}
                            {element.validation?.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="relative">
                            <Input
                                type="date"
                                style={inlineStyles}
                                className="h-11"
                                readOnly
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        {element.helpText && <p className="text-xs text-gray-500">{element.helpText}</p>}
                    </div>
                );

            // ============================================================
            // LINK BUTTON
            // ============================================================
            case 'link_button':
                return (
                    <Button
                        variant="outline"
                        className={`${baseClasses} ${getButtonSizeClass(element.buttonSize)} ${element.fullWidth ? 'w-full' : 'w-auto'} gap-2`}
                        style={inlineStyles}
                    >
                        {element.content || element.label}
                        {element.linkTarget === '_blank' && <ExternalLink className="w-4 h-4" />}
                    </Button>
                );

            // ============================================================
            // DIVIDER
            // ============================================================
            case 'divider':
                return (
                    <div
                        className={baseClasses}
                        style={{
                            marginTop: element.styles?.marginTop || 16,
                            marginBottom: element.styles?.marginBottom || 16,
                        }}
                    >
                        <div
                            className="border-t"
                            style={{
                                borderColor: element.styles?.borderColor || '#e5e7eb',
                                borderWidth: element.styles?.borderWidth || 1,
                            }}
                        />
                    </div>
                );

            // ============================================================
            // SPACER
            // ============================================================
            case 'spacer':
                return (
                    <div
                        className={baseClasses}
                        style={{ height: element.styles?.height || 24 }}
                    />
                );

            // ============================================================
            // FILE UPLOAD
            // ============================================================
            case 'file_upload':
                return (
                    <div className={`space-y-2 ${baseClasses}`}>
                        <Label className="text-sm font-medium">{element.label}</Label>
                        <div
                            className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-all"
                            style={inlineStyles}
                        >
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                            {element.helpText && <p className="text-xs text-gray-400 mt-1">{element.helpText}</p>}
                        </div>
                    </div>
                );

            // ============================================================
            // RATING
            // ============================================================
            case 'rating':
                return (
                    <div className={`space-y-2 ${baseClasses}`}>
                        <Label className="text-sm font-medium">{element.label}</Label>
                        <div className="flex gap-1">
                            {Array.from({ length: element.maxValue || 5 }).map((_, idx) => (
                                <Star
                                    key={idx}
                                    className={`w-8 h-8 cursor-pointer transition-colors ${idx < (element.defaultValue as number || 0)
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                );

            // ============================================================
            // SLIDER
            // ============================================================
            case 'slider':
                return (
                    <div className={`space-y-3 ${baseClasses}`}>
                        <div className="flex justify-between">
                            <Label className="text-sm font-medium">{element.label}</Label>
                            <span className="text-sm text-gray-500">
                                {typeof element.defaultValue === 'number' ? element.defaultValue : element.minValue || 0}
                            </span>
                        </div>
                        <input
                            type="range"
                            min={element.minValue || 0}
                            max={element.maxValue || 100}
                            step={element.step || 1}
                            defaultValue={typeof element.defaultValue === 'number' ? element.defaultValue : element.minValue || 0}
                            className="w-full accent-orange-500"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>{element.minValue || 0}</span>
                            <span>{element.maxValue || 100}</span>
                        </div>
                    </div>
                );

            // ============================================================
            // TOGGLE
            // ============================================================
            case 'toggle':
                return (
                    <div className={`flex items-center justify-between ${baseClasses}`} style={inlineStyles}>
                        <Label className="text-sm font-medium">{element.label}</Label>
                        <Switch checked={element.defaultValue as boolean || false} />
                    </div>
                );

            // ============================================================
            // VIDEO EMBED
            // ============================================================
            case 'video_embed':
                return (
                    <div className={`${baseClasses} overflow-hidden`} style={inlineStyles}>
                        {element.linkUrl ? (
                            <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
                                <iframe
                                    src={element.linkUrl.replace('watch?v=', 'embed/')}
                                    className="w-full h-full rounded-xl"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        ) : (
                            <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                <span>Enter video URL</span>
                            </div>
                        )}
                    </div>
                );

            // ============================================================
            // DEFAULT FALLBACK
            // ============================================================
            default:
                return (
                    <div className="p-4 border border-dashed border-gray-300 rounded-xl text-center text-gray-500">
                        <p className="text-sm">{element.type} (preview not available)</p>
                    </div>
                );
        }
    };

    return (
        <div
            onClick={onClick}
            className={`${isEditing ? 'ring-2 ring-orange-500 ring-offset-2 rounded-xl' : ''} ${onClick ? 'cursor-pointer' : ''}`}
        >
            {renderContent()}
        </div>
    );
}

export default ElementPreview;
