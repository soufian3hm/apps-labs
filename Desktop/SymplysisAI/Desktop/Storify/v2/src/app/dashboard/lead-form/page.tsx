'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    GripVertical,
    Eye,
    EyeOff,
    Pencil,
    Save,
    MapPin,
    Smartphone,
    User,
    Loader2,
    X,
    Type,
    Tag,
    Truck,
    FileText,
    CreditCard,
    CheckSquare,
    Package,
    Home
} from 'lucide-react';

// --- Types ---

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

interface FormStyles {
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    buttonColor: string;
    buttonTextColor: string;
    shadow: boolean;
    hideLabels: boolean;
    rtl: boolean;
    language: 'en' | 'ar' | 'fr';
}

interface GenericTexts {
    requiredError: string;
    invalidError: string;
}

type Language = 'en' | 'ar' | 'fr';

// --- Translations ---

const TRANSLATIONS: Record<Language, {
    formTitle: string;
    fullName: string;
    phoneNumber: string;
    province: string;
    wilaya: string;
    address: string;
    discountCodes: string;
    shippingRates: string;
    shippingOptions: string;
    standardDelivery: string;
    orderSummary: string;
    subtotal: string;
    shipping: string;
    total: string;
    orderNow: string;
    enterCouponCode: string;
    apply: string;
    selectProvince: string;
    selectWilaya: string;
    fullAddress: string;
    requiredError: string;
    invalidError: string;
}> = {
    en: {
        formTitle: 'Complete your order',
        fullName: 'Full Name',
        phoneNumber: 'Phone Number',
        province: 'Province',
        wilaya: 'Wilaya',
        address: 'Address',
        discountCodes: 'Discount Codes',
        shippingRates: 'Shipping Rates',
        shippingOptions: 'Shipping Options',
        standardDelivery: 'Standard Delivery',
        orderSummary: 'Order Summary',
        subtotal: 'Subtotal',
        shipping: 'Shipping',
        total: 'Total',
        orderNow: 'Order Now - {total}',
        enterCouponCode: 'Enter coupon code',
        apply: 'Apply',
        selectProvince: 'Select Province',
        selectWilaya: 'Select Wilaya',
        fullAddress: 'Full Address',
        requiredError: 'This field is required',
        invalidError: 'Please enter a valid value',
    },
    ar: {
        formTitle: 'أكمل طلبك',
        fullName: 'الاسم الكامل',
        phoneNumber: 'رقم الهاتف',
        province: 'الولاية',
        wilaya: 'البلدية',
        address: 'العنوان',
        discountCodes: 'كود الخصم',
        shippingRates: 'أسعار الشحن',
        shippingOptions: 'خيارات الشحن',
        standardDelivery: 'التوصيل العادي',
        orderSummary: 'ملخص الطلب',
        subtotal: 'المجموع الفرعي',
        shipping: 'الشحن',
        total: 'الإجمالي',
        orderNow: 'اطلب الآن - {total}',
        enterCouponCode: 'أدخل كود الخصم',
        apply: 'تطبيق',
        selectProvince: 'اختر الولاية',
        selectWilaya: 'اختر البلدية',
        fullAddress: 'العنوان الكامل',
        requiredError: 'هذا الحقل مطلوب',
        invalidError: 'يرجى إدخال قيمة صحيحة',
    },
    fr: {
        formTitle: 'Complétez votre commande',
        fullName: 'Nom complet',
        phoneNumber: 'Numéro de téléphone',
        province: 'Province',
        wilaya: 'Wilaya',
        address: 'Adresse',
        discountCodes: 'Codes de réduction',
        shippingRates: 'Frais de livraison',
        shippingOptions: 'Options de livraison',
        standardDelivery: 'Livraison standard',
        orderSummary: 'Résumé de commande',
        subtotal: 'Sous-total',
        shipping: 'Livraison',
        total: 'Total',
        orderNow: 'Commander - {total}',
        enterCouponCode: 'Entrez le code promo',
        apply: 'Appliquer',
        selectProvince: 'Sélectionner la province',
        selectWilaya: 'Sélectionner la wilaya',
        fullAddress: 'Adresse complète',
        requiredError: 'Ce champ est requis',
        invalidError: 'Veuillez entrer une valeur valide',
    },
};

// Helper to get translated blocks
const getTranslatedBlocks = (lang: Language): FormBlock[] => {
    const t = TRANSLATIONS[lang];
    return [
        {
            id: 'title',
            type: 'html',
            label: 'Form Title',
            enabled: true,
            content: t.formTitle,
            alignment: 'center',
            fontWeight: 'bold',
            fontSize: 20,
            textColor: '#1f2937'
        },
        {
            id: 'discount',
            type: 'discount',
            label: t.discountCodes,
            enabled: true,
            placeholder: t.enterCouponCode,
            backgroundColor: '#f0fdf4',
            textColor: '#166534'
        },
        {
            id: 'full_name',
            type: 'field',
            label: t.fullName,
            fieldName: 'name',
            enabled: true,
            required: true,
            placeholder: t.fullName,
            showIcon: true,
            minLength: 2,
            maxLength: 250
        },
        {
            id: 'phone',
            type: 'field',
            label: t.phoneNumber,
            fieldName: 'phone',
            enabled: true,
            required: true,
            placeholder: t.phoneNumber,
            showIcon: true,
            invalidErrorText: t.invalidError
        },
        {
            id: 'province',
            type: 'field',
            label: t.province,
            fieldName: 'province',
            enabled: true,
            required: true,
            placeholder: t.selectProvince,
            showIcon: false
        },
        {
            id: 'wilaya',
            type: 'field',
            label: t.wilaya,
            fieldName: 'wilaya',
            enabled: true,
            required: true,
            placeholder: t.selectWilaya,
            showIcon: false
        },
        {
            id: 'address',
            type: 'field',
            label: t.address,
            fieldName: 'address',
            enabled: true,
            required: true,
            placeholder: t.fullAddress,
            showIcon: true,
            minLength: 5
        },
        {
            id: 'shipping',
            type: 'shipping',
            label: t.shippingRates,
            enabled: true,
            backgroundColor: '#eff6ff',
            textColor: '#1e40af'
        },
        {
            id: 'order_summary',
            type: 'order_summary',
            label: t.orderSummary,
            enabled: true,
            backgroundColor: '#f9fafb',
            textColor: '#374151'
        },
        {
            id: 'submit',
            type: 'button',
            label: 'Submit Button',
            enabled: true,
            content: t.orderNow,
            backgroundColor: '#ea580c',
            textColor: '#ffffff',
            fontWeight: 'bold',
            fontSize: 16,
            borderRadius: 8
        }
    ];
};

// --- Default Data ---

const DEFAULT_BLOCKS: FormBlock[] = getTranslatedBlocks('en');

const DEFAULT_STYLES: FormStyles = {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontSize: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    buttonColor: '#ea580c',
    buttonTextColor: '#ffffff',
    shadow: true,
    hideLabels: false,
    rtl: false,
    language: 'en',
};

const DEFAULT_TEXTS: GenericTexts = {
    requiredError: 'This field is required',
    invalidError: 'Please enter a valid value',
};

// --- Color Picker Component ---

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs text-gray-600">{label}</Label>
            <div className="flex gap-2 items-center">
                <input
                    type="color"
                    value={value?.startsWith('#') ? value : '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <Input
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-10 text-xs font-mono flex-1"
                    placeholder="#000000"
                />
            </div>
        </div>
    );
}

// --- Block Icon Helper ---

function getBlockIcon(type: string, id: string) {
    switch (type) {
        case 'html': return <Type className="w-4 h-4" />;
        case 'field':
            if (id.includes('name')) return <User className="w-4 h-4" />;
            if (id.includes('phone')) return <Smartphone className="w-4 h-4" />;
            if (id.includes('address')) return <Home className="w-4 h-4" />;
            if (id.includes('province') || id.includes('wilaya')) return <MapPin className="w-4 h-4" />;
            return <FileText className="w-4 h-4" />;
        case 'summary': return <CreditCard className="w-4 h-4" />;
        case 'discount': return <Tag className="w-4 h-4" />;
        case 'shipping': return <Truck className="w-4 h-4" />;
        case 'order_summary': return <Package className="w-4 h-4" />;
        case 'button': return <CheckSquare className="w-4 h-4" />;
        default: return <FileText className="w-4 h-4" />;
    }
}

// --- Block Editor Component ---

function BlockEditor({
    block,
    onUpdate,
    onClose
}: {
    block: FormBlock;
    onUpdate: (b: FormBlock) => void;
    onClose: () => void
}) {
    return (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-orange-900 text-sm uppercase tracking-wide flex items-center gap-2">
                    {getBlockIcon(block.type, block.id)}
                    Edit: {block.label}
                </h4>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 rounded-full hover:bg-orange-100">
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Common Label Edit */}
            <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Display Label</Label>
                <Input
                    value={block.label}
                    onChange={(e) => onUpdate({ ...block, label: e.target.value })}
                    className="bg-white"
                />
            </div>

            {/* Field-specific settings */}
            {block.type === 'field' && (
                <>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-gray-600">Placeholder Text</Label>
                        <Input
                            value={block.placeholder || ''}
                            onChange={(e) => onUpdate({ ...block, placeholder: e.target.value })}
                            className="bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                            <Label className="text-xs">Required</Label>
                            <Switch
                                checked={block.required || false}
                                onCheckedChange={(c) => onUpdate({ ...block, required: c })}
                            />
                        </div>
                        <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                            <Label className="text-xs">Show Icon</Label>
                            <Switch
                                checked={block.showIcon || false}
                                onCheckedChange={(c) => onUpdate({ ...block, showIcon: c })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600">Min Length</Label>
                            <Input
                                type="number"
                                value={block.minLength || ''}
                                onChange={(e) => onUpdate({ ...block, minLength: parseInt(e.target.value) || undefined })}
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600">Max Length</Label>
                            <Input
                                type="number"
                                value={block.maxLength || ''}
                                onChange={(e) => onUpdate({ ...block, maxLength: parseInt(e.target.value) || undefined })}
                                className="bg-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs text-gray-600">Error Message (Invalid)</Label>
                        <Input
                            value={block.invalidErrorText || ''}
                            onChange={(e) => onUpdate({ ...block, invalidErrorText: e.target.value })}
                            className="bg-white"
                            placeholder="Custom validation error"
                        />
                    </div>
                </>
            )}

            {/* HTML/Title block settings */}
            {block.type === 'html' && (
                <>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-gray-600">Content Text</Label>
                        <Textarea
                            value={block.content || ''}
                            onChange={(e) => onUpdate({ ...block, content: e.target.value })}
                            className="bg-white min-h-[80px]"
                            placeholder="Enter your heading or HTML content..."
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            variant={block.alignment === 'left' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onUpdate({ ...block, alignment: 'left' })}
                            className="w-full"
                        >
                            Left
                        </Button>
                        <Button
                            variant={block.alignment === 'center' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onUpdate({ ...block, alignment: 'center' })}
                            className="w-full"
                        >
                            Center
                        </Button>
                        <Button
                            variant={block.alignment === 'right' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onUpdate({ ...block, alignment: 'right' })}
                            className="w-full"
                        >
                            Right
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600">Font Size</Label>
                            <Input
                                type="number"
                                value={block.fontSize || 16}
                                onChange={(e) => onUpdate({ ...block, fontSize: parseInt(e.target.value) })}
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600">Font Weight</Label>
                            <Select
                                value={block.fontWeight || 'normal'}
                                onValueChange={(v) => onUpdate({ ...block, fontWeight: v as 'normal' | 'bold' })}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="bold">Bold</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <ColorPicker
                        label="Text Color"
                        value={block.textColor || '#000000'}
                        onChange={(v) => onUpdate({ ...block, textColor: v })}
                    />
                </>
            )}

            {/* Button block settings */}
            {block.type === 'button' && (
                <>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-gray-600">Button Text</Label>
                        <Input
                            value={block.content || ''}
                            onChange={(e) => onUpdate({ ...block, content: e.target.value })}
                            className="bg-white"
                        />
                        <p className="text-[10px] text-gray-500">Use {'{total}'} to insert the price</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <ColorPicker
                            label="Background Color"
                            value={block.backgroundColor || '#ea580c'}
                            onChange={(v) => onUpdate({ ...block, backgroundColor: v })}
                        />
                        <ColorPicker
                            label="Text Color"
                            value={block.textColor || '#ffffff'}
                            onChange={(v) => onUpdate({ ...block, textColor: v })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600">Font Size</Label>
                            <Input
                                type="number"
                                value={block.fontSize || 16}
                                onChange={(e) => onUpdate({ ...block, fontSize: parseInt(e.target.value) })}
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600">Border Radius</Label>
                            <Input
                                type="number"
                                value={block.borderRadius || 8}
                                onChange={(e) => onUpdate({ ...block, borderRadius: parseInt(e.target.value) })}
                                className="bg-white"
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Summary/Discount/Shipping/Order Summary block settings */}
            {(block.type === 'summary' || block.type === 'discount' || block.type === 'shipping' || block.type === 'order_summary') && (
                <>
                    {block.type === 'discount' && (
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600">Placeholder Text</Label>
                            <Input
                                value={block.placeholder || ''}
                                onChange={(e) => onUpdate({ ...block, placeholder: e.target.value })}
                                className="bg-white"
                                placeholder="Enter coupon code"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <ColorPicker
                            label="Background Color"
                            value={block.backgroundColor || '#f3f4f6'}
                            onChange={(v) => onUpdate({ ...block, backgroundColor: v })}
                        />
                        <ColorPicker
                            label="Text Color"
                            value={block.textColor || '#1f2937'}
                            onChange={(v) => onUpdate({ ...block, textColor: v })}
                        />
                    </div>
                </>
            )}

            <Button onClick={onClose} className="w-full bg-orange-600 hover:bg-orange-700">
                Done Editing
            </Button>
        </div>
    );
}

// --- Sortable Block Component ---

function SortableBlock({
    block,
    onToggle,
    onEdit,
    isEditing,
    onUpdate,
    onClose
}: {
    block: FormBlock;
    onToggle: (id: string) => void;
    onEdit: (block: FormBlock) => void;
    isEditing: boolean;
    onUpdate: (b: FormBlock) => void;
    onClose: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`rounded-xl border-2 transition-all duration-200 ${block.enabled
                ? 'bg-white border-gray-200 hover:border-orange-300'
                : 'bg-gray-50 border-dashed border-gray-300 opacity-60'
                } ${isDragging ? 'shadow-2xl ring-2 ring-orange-500 scale-[1.02]' : ''} ${isEditing ? 'ring-2 ring-orange-400 border-orange-400' : ''
                } ${isDragging ? 'shadow-2xl ring-2 ring-amber-500 scale-[1.02]' : ''} ${isEditing ? 'ring-2 ring-amber-400 border-amber-400' : ''
                }`}
        >
            <div className="flex items-center gap-3 p-3">
                <div
                    {...attributes}
                    {...listeners}
                    className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center cursor-move hover:bg-orange-200 transition-colors"
                >
                    <GripVertical className="w-4 h-4 text-orange-600" />
                </div>

                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${block.enabled ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-400'
                    }`}>
                    {getBlockIcon(block.type, block.id)}
                </div>

                <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm truncate ${!block.enabled && 'text-gray-400'}`}>
                        {block.label}
                    </div>
                    <div className="text-xs text-gray-400 capitalize">{block.type}</div>
                </div>

                {block.required && (
                    <span className="text-red-500 text-xs font-bold">*</span>
                )}

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-lg ${isEditing ? 'bg-orange-100 text-orange-600' : ''}`}
                        onClick={() => isEditing ? onClose() : onEdit(block)}
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-lg ${block.enabled ? 'text-green-600 bg-green-50' : 'text-gray-400'}`}
                        onClick={() => onToggle(block.id)}
                    >
                        {block.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </Button>
                </div>
            </div>

            {isEditing && (
                <div className="p-3 pt-0">
                    <BlockEditor
                        block={block}
                        onUpdate={onUpdate}
                        onClose={onClose}
                    />
                </div>
            )}
        </div>
    );
}

// --- Preview Block Component ---

function PreviewBlock({ block, styles }: { block: FormBlock; styles: FormStyles }) {
    if (!block.enabled) return null;
    const t = TRANSLATIONS[styles.language || 'en'];

    switch (block.type) {
        case 'html':
            return (
                <div
                    style={{
                        textAlign: block.alignment || 'center',
                        fontSize: `${block.fontSize || 16}px`,
                        fontWeight: block.fontWeight || 'normal',
                        color: block.textColor || styles.textColor,
                    }}
                    className="py-2"
                >
                    {block.content || block.label}
                </div>
            );

        case 'summary':
            return (
                <div
                    className="p-4 rounded-lg flex justify-between items-center"
                    style={{
                        backgroundColor: block.backgroundColor || '#f3f4f6',
                        color: block.textColor || '#1f2937',
                    }}
                >
                    <span className="font-medium">{t.subtotal}</span>
                    <span className="font-bold">19.99 USD</span>
                </div>
            );

        case 'discount':
            return (
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
                            className="flex-1 bg-white border-gray-300 rounded-lg"
                            readOnly
                        />
                        <Button size="sm" variant="outline">Apply</Button>
                    </div>
                </div>
            );

        case 'field':
            return (
                <div className="space-y-1.5">
                    {!styles.hideLabels && (
                        <Label className="text-sm font-medium flex items-center gap-1" style={{ color: styles.textColor }}>
                            {block.label}
                            {block.required && <span className="text-red-500">*</span>}
                        </Label>
                    )}
                    <div className="relative">
                        <Input
                            placeholder={block.placeholder || block.label}
                            className="bg-white h-11 transition-all border-gray-300 rounded-lg"
                            style={{
                                paddingLeft: block.showIcon ? '2.5rem' : '0.75rem',
                            }}
                            readOnly
                        />
                        {block.showIcon && (
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {block.id.includes('name') && <User className="w-4 h-4" />}
                                {block.id.includes('phone') && <Smartphone className="w-4 h-4" />}
                                {block.id.includes('address') && <Home className="w-4 h-4" />}
                                {(block.id.includes('province') || block.id.includes('wilaya')) && <MapPin className="w-4 h-4" />}
                            </div>
                        )}
                    </div>
                </div>
            );

        case 'shipping':
            return (
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
            );

        case 'order_summary':
            return (
                <div
                    className="p-4 rounded-lg space-y-3"
                    style={{
                        backgroundColor: block.backgroundColor || '#f9fafb',
                        color: block.textColor || '#374151',
                    }}
                >
                    <div className="font-semibold flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {t.orderSummary}
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>{t.subtotal}</span>
                            <span>19.99 USD</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t.shipping}</span>
                            <span>500 DA</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2">
                            <span>{t.total}</span>
                            <span>24.99 USD</span>
                        </div>
                    </div>
                </div>
            );

        case 'button':
            return (
                <Button
                    className="w-full h-12 text-base shadow-lg transition-transform hover:scale-[1.02]"
                    style={{
                        backgroundColor: block.backgroundColor || '#4f46e5',
                        color: block.textColor || '#ffffff',
                        fontWeight: block.fontWeight || 'bold',
                        fontSize: `${block.fontSize || 16}px`,
                        borderRadius: `${block.borderRadius || 8}px`,
                    }}
                >
                    {block.content?.replace('{total}', '19.99 USD') || 'Order Now'}
                </Button>
            );

        default:
            return null;
    }
}

// --- Main Page Component ---

export default function LeadFormDesignerPage() {
    const { currentStoreId } = useAppStore();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [mode, setMode] = useState<'popup' | 'embedded'>('embedded');
    const [blocks, setBlocks] = useState<FormBlock[]>(DEFAULT_BLOCKS);
    const [styles, setStyles] = useState<FormStyles>(DEFAULT_STYLES);
    const [texts, setTexts] = useState<GenericTexts>(DEFAULT_TEXTS);
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

    // Handle language change - translate all blocks and toggle RTL
    const handleLanguageChange = (newLang: Language) => {
        // Update texts
        setTexts({
            requiredError: TRANSLATIONS[newLang].requiredError,
            invalidError: TRANSLATIONS[newLang].invalidError,
        });

        // Translate blocks while PRESERVING state (enabled/disabled, colors, etc.)
        setBlocks(prevBlocks => prevBlocks.map(block => {
            const t = TRANSLATIONS[newLang];
            const newBlock = { ...block };

            switch (block.id) {
                case 'title': newBlock.content = t.formTitle; break;
                case 'discount':
                    newBlock.label = t.discountCodes;
                    newBlock.placeholder = t.enterCouponCode;
                    break;
                case 'full_name':
                    newBlock.label = t.fullName;
                    newBlock.placeholder = t.fullName;
                    break;
                case 'phone':
                    newBlock.label = t.phoneNumber;
                    newBlock.placeholder = t.phoneNumber;
                    newBlock.invalidErrorText = t.invalidError;
                    break;
                case 'province':
                    newBlock.label = t.province;
                    newBlock.placeholder = t.selectProvince;
                    break;
                case 'wilaya':
                    newBlock.label = t.wilaya;
                    newBlock.placeholder = t.selectWilaya;
                    break;
                case 'address':
                    newBlock.label = t.address;
                    newBlock.placeholder = t.fullAddress;
                    break;
                case 'shipping': newBlock.label = t.shippingRates; break;
                case 'order_summary': newBlock.label = t.orderSummary; break;
                case 'submit': newBlock.content = t.orderNow; break;
            }
            return newBlock;
        }));

        // Auto-enable RTL for Arabic, and store language in styles
        setStyles(prev => ({ ...prev, rtl: newLang === 'ar', language: newLang }));
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        if (currentStoreId) {
            loadSettings();
        }
    }, [currentStoreId]);

    const loadSettings = async () => {
        if (!currentStoreId) return;
        setIsLoading(true);
        const supabase = createClient();
        const { data } = await supabase
            .from('store_lead_form_settings' as any)
            .select('*')
            .eq('store_id', currentStoreId)
            .single();

        if (data) {
            if (data.mode) setMode(data.mode);
            if (data.fields && Array.isArray(data.fields)) setBlocks(data.fields as FormBlock[]);
            if (data.styles) setStyles({ ...DEFAULT_STYLES, ...data.styles as FormStyles });
            if (data.texts) setTexts({ ...DEFAULT_TEXTS, ...data.texts as GenericTexts });
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        if (!currentStoreId) return;
        setIsSaving(true);
        const supabase = createClient();

        const payload = {
            store_id: currentStoreId,
            mode,
            fields: blocks,
            styles,
            texts,
            rtl: styles.rtl,
        };

        const { error } = await supabase
            .from('store_lead_form_settings' as any)
            .upsert(payload as any, { onConflict: 'store_id' });

        if (error) {
            toast.error('Failed to save settings');
            console.error(error);
        } else {
            toast.success('Form settings saved successfully');
        }
        setIsSaving(false);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleBlockUpdate = useCallback((updatedBlock: FormBlock) => {
        setBlocks(prev => prev.map(b => b.id === updatedBlock.id ? updatedBlock : b));
    }, []);

    const handleToggleBlock = useCallback((id: string) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b));
    }, []);

    if (!currentStoreId) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
                    <p className="text-gray-500">Please select a store first</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Form Designer</h1>
                    <p className="text-gray-500">Customize your checkout lead form</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Panel - Settings */}
                <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] pr-2 custom-scrollbar">

                    {/* Form Mode */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">1</span>
                                Form Mode
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setMode('popup')}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${mode === 'popup'
                                    ? 'border-orange-600 bg-orange-50 text-orange-700'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="font-bold text-lg mb-1">Popup</div>
                                <div className="text-xs text-gray-500">Triggers on button click</div>
                            </button>
                            <button
                                onClick={() => setMode('embedded')}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${mode === 'embedded'
                                    ? 'border-orange-600 bg-orange-50 text-orange-700'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="font-bold text-lg mb-1">Embedded</div>
                                <div className="text-xs text-gray-500">Visible directly on page</div>
                            </button>
                        </CardContent>
                    </Card>

                    {/* Language Selection */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">2</span>
                                Language
                            </CardTitle>
                            <CardDescription>Select form language - all fields will be translated</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => handleLanguageChange('en')}
                                    className={`p-4 rounded-xl border-2 text-center transition-all ${styles.language === 'en'
                                        ? 'border-orange-600 bg-orange-50 text-orange-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">🇬🇧</div>
                                    <div className="font-bold text-sm">English</div>
                                </button>
                                <button
                                    onClick={() => handleLanguageChange('ar')}
                                    className={`p-4 rounded-xl border-2 text-center transition-all ${styles.language === 'ar'
                                        ? 'border-orange-600 bg-orange-50 text-orange-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">🇸🇦</div>
                                    <div className="font-bold text-sm">العربية</div>
                                </button>
                                <button
                                    onClick={() => handleLanguageChange('fr')}
                                    className={`p-4 rounded-xl border-2 text-center transition-all ${styles.language === 'fr'
                                        ? 'border-orange-600 bg-orange-50 text-orange-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">🇫🇷</div>
                                    <div className="font-bold text-sm">Français</div>
                                </button>
                            </div>

                            {styles.language === 'ar' && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                                    <strong>RTL Mode Enabled:</strong> Right-to-left layout is automatically applied for Arabic.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Form Blocks */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">3</span>
                                Form Blocks
                            </CardTitle>
                            <CardDescription>Drag to reorder. Click pencil to edit settings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-2">
                                        {blocks.map((block) => (
                                            <SortableBlock
                                                key={block.id}
                                                block={block}
                                                onToggle={handleToggleBlock}
                                                onEdit={(b) => setEditingBlockId(b.id)}
                                                isEditing={editingBlockId === block.id}
                                                onUpdate={handleBlockUpdate}
                                                onClose={() => setEditingBlockId(null)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </CardContent>
                    </Card>

                    {/* Global Styles */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">4</span>
                                Form Style
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <ColorPicker
                                    label="Text Color"
                                    value={styles.textColor}
                                    onChange={(v) => setStyles({ ...styles, textColor: v })}
                                />
                                <ColorPicker
                                    label="Background"
                                    value={styles.backgroundColor}
                                    onChange={(v) => setStyles({ ...styles, backgroundColor: v })}
                                />
                            </div>

                            <ColorPicker
                                label="Border Color"
                                value={styles.borderColor}
                                onChange={(v) => setStyles({ ...styles, borderColor: v })}
                            />

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label className="text-sm">Border Radius</Label>
                                    <span className="text-xs font-mono text-gray-500">{styles.borderRadius}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="24"
                                    value={styles.borderRadius}
                                    onChange={(e) => setStyles({ ...styles, borderRadius: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label className="text-sm">Border Width</Label>
                                    <span className="text-xs font-mono text-gray-500">{styles.borderWidth}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="4"
                                    value={styles.borderWidth}
                                    onChange={(e) => setStyles({ ...styles, borderWidth: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                                />
                            </div>

                            <div className="space-y-3 pt-3 border-t">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Enable RTL (Arabic)</Label>
                                    <Switch checked={styles.rtl} onCheckedChange={(c) => setStyles({ ...styles, rtl: c })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Hide Field Labels</Label>
                                    <Switch checked={styles.hideLabels} onCheckedChange={(c) => setStyles({ ...styles, hideLabels: c })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Form Shadow</Label>
                                    <Switch checked={styles.shadow} onCheckedChange={(c) => setStyles({ ...styles, shadow: c })} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Generic Messages */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">5</span>
                                Error Messages
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-gray-600">Required Field Error</Label>
                                <Input
                                    value={texts.requiredError}
                                    onChange={(e) => setTexts({ ...texts, requiredError: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-gray-600">Invalid Value Error</Label>
                                <Input
                                    value={texts.invalidError}
                                    onChange={(e) => setTexts({ ...texts, invalidError: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel - Preview */}
                <div className="lg:sticky lg:top-6 h-fit">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border-2 border-gray-300 overflow-hidden shadow-inner">
                        <div className="bg-white/80 backdrop-blur px-4 py-2 border-b flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-semibold text-gray-600">Live Preview</span>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div
                                className="p-6 space-y-4 transition-all duration-300"
                                style={{
                                    backgroundColor: styles.backgroundColor,
                                    color: styles.textColor,
                                    direction: styles.rtl ? 'rtl' : 'ltr',
                                    boxShadow: styles.shadow ? '0 20px 50px -10px rgba(0, 0, 0, 0.15)' : 'none',
                                    borderRadius: `${styles.borderRadius}px`,
                                    borderWidth: `${styles.borderWidth}px`,
                                    borderStyle: 'solid',
                                    borderColor: styles.borderColor,
                                }}
                            >
                                {blocks.map((block) => (
                                    <PreviewBlock key={block.id} block={block} styles={styles} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
