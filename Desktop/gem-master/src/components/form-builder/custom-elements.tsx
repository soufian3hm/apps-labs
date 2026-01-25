'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Plus,
    Type,
    Image as ImageIcon,
    ShoppingCart,
    MessageCircle,
    Hash,
    LayoutList,
    Circle,
    Square,
    Calendar,
    Link as LinkIcon,
    X,
    Trash2,
    ChevronRight,
    Settings,
    Palette,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    Underline,
    Upload,
    Info,
    GripVertical,
    Eye,
    EyeOff,
    Copy,
    Move,
    Smartphone,
    Monitor,
    ExternalLink,
    HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type CustomElementType =
    | 'title_text'
    | 'image'
    | 'shopify_checkout'
    | 'whatsapp_button'
    | 'quantity_selector'
    | 'text_input'
    | 'dropdown'
    | 'single_choice'
    | 'checkbox'
    | 'date_selector'
    | 'link_button'
    | 'divider'
    | 'spacer'
    | 'rating'
    | 'file_upload'
    | 'phone_input'
    | 'email_input'
    | 'number_input'
    | 'textarea'
    | 'color_picker'
    | 'slider'
    | 'toggle'
    | 'countdown'
    | 'social_links'
    | 'video_embed'
    | 'accordion'
    | 'tabs_element';

export interface CustomElementOption {
    id: string;
    label: string;
    value: string;
    image?: string;
    disabled?: boolean;
}

export interface CustomElementValidation {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
    customError?: string;
}

export interface CustomElementStyles {
    // Typography
    fontSize?: number;
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    fontFamily?: string;
    textColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    lineHeight?: number;
    letterSpacing?: number;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    textDecoration?: 'none' | 'underline' | 'line-through';

    // Background & Border
    backgroundColor?: string;
    backgroundGradient?: string;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';

    // Layout
    padding?: number;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    margin?: number;
    marginTop?: number;
    marginBottom?: number;
    width?: 'full' | 'auto' | 'half' | 'third' | 'quarter';
    height?: number;

    // Effects
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    opacity?: number;
    hoverEffect?: 'none' | 'lift' | 'glow' | 'scale' | 'darken';
    animation?: 'none' | 'fade' | 'slide' | 'bounce' | 'pulse';

    // Icon
    iconSize?: number;
    iconColor?: string;
    iconPosition?: 'left' | 'right' | 'top';
}

export interface CustomElementCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
    value: string;
}

export interface CustomElement {
    id: string;
    type: CustomElementType;
    enabled: boolean;

    // Common Properties
    label: string;
    placeholder?: string;
    helpText?: string;
    defaultValue?: string | number | boolean | string[];

    // Type-specific Properties
    content?: string; // For title_text
    imageUrl?: string; // For image
    imageAlt?: string;
    imageFit?: 'cover' | 'contain' | 'fill' | 'none';

    linkUrl?: string; // For buttons/links
    linkTarget?: '_self' | '_blank';
    linkText?: string;

    phoneNumber?: string; // For WhatsApp
    whatsappMessage?: string;

    options?: CustomElementOption[]; // For dropdown, single_choice, checkbox
    allowMultiple?: boolean; // For checkbox multi-select

    minValue?: number; // For quantity, slider, number
    maxValue?: number;
    step?: number;

    dateFormat?: string; // For date_selector
    minDate?: string;
    maxDate?: string;

    icon?: string;
    iconPosition?: 'left' | 'right';

    // Button specific
    buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    buttonSize?: 'sm' | 'md' | 'lg' | 'xl';
    fullWidth?: boolean;
    loading?: boolean;

    // Countdown specific
    countdownDate?: string;
    countdownFormat?: 'dhms' | 'hms' | 'ms';
    countdownStyle?: 'boxes' | 'inline' | 'flip';

    // Video specific
    videoUrl?: string;
    videoAutoplay?: boolean;
    videoMuted?: boolean;
    videoLoop?: boolean;

    // File Upload specific
    acceptedFileTypes?: string;
    maxFileSize?: number;
    multiple?: boolean;

    // Social Links specific
    socialLinks?: Array<{
        platform: string;
        url: string;
        icon?: string;
    }>;

    // Accordion specific
    accordionItems?: Array<{
        id: string;
        title: string;
        content: string;
    }>;

    // Tabs specific
    tabItems?: Array<{
        id: string;
        title: string;
        content: string;
    }>;

    // Validation
    validation?: CustomElementValidation;

    // Styling
    styles?: CustomElementStyles;

    // Conditional Logic
    conditionalLogic?: {
        enabled: boolean;
        action: 'show' | 'hide';
        conditions: CustomElementCondition[];
        conjunction: 'and' | 'or';
    };

    // Advanced
    dataAttribute?: string;
    cssClass?: string;
    ariaLabel?: string;

    // Ordering
    order: number;
}

// ============================================================================
// ELEMENT DEFINITIONS
// ============================================================================

interface ElementDefinition {
    type: CustomElementType;
    label: string;
    description: string;
    icon: React.ReactNode;
    category: 'basic' | 'input' | 'selection' | 'action' | 'media' | 'layout' | 'advanced';
    defaultProps: Partial<CustomElement>;
}

export const ELEMENT_DEFINITIONS: ElementDefinition[] = [
    // Basic
    {
        type: 'title_text',
        label: 'Title or Text',
        description: 'Add headings, paragraphs, or rich text content',
        icon: <Type className="w-5 h-5" />,
        category: 'basic',
        defaultProps: {
            label: 'Text Block',
            content: 'Your text here...',
            styles: {
                fontSize: 16,
                fontWeight: 'normal',
                textAlign: 'left',
                textColor: '#1f2937'
            }
        }
    },
    {
        type: 'image',
        label: 'Image or GIF',
        description: 'Upload images, GIFs, or embed from URL',
        icon: <ImageIcon className="w-5 h-5" />,
        category: 'media',
        defaultProps: {
            label: 'Image',
            imageUrl: '',
            imageAlt: 'Image',
            imageFit: 'cover',
            styles: {
                borderRadius: 8,
                width: 'full'
            }
        }
    },
    {
        type: 'shopify_checkout',
        label: 'Shopify checkout button',
        description: 'Direct checkout button linked to Shopify',
        icon: <ShoppingCart className="w-5 h-5" />,
        category: 'action',
        defaultProps: {
            label: 'Checkout',
            content: 'Buy Now',
            linkUrl: '',
            buttonVariant: 'primary',
            buttonSize: 'lg',
            fullWidth: true,
            styles: {
                backgroundColor: '#5c6ac4',
                textColor: '#ffffff',
                borderRadius: 8,
                fontWeight: 'semibold'
            }
        }
    },
    {
        type: 'whatsapp_button',
        label: 'WhatsApp button',
        description: 'Open WhatsApp with pre-filled message',
        icon: <MessageCircle className="w-5 h-5" />,
        category: 'action',
        defaultProps: {
            label: 'WhatsApp',
            content: 'Chat on WhatsApp',
            phoneNumber: '',
            whatsappMessage: 'Hi, I am interested in your product!',
            buttonVariant: 'primary',
            fullWidth: true,
            styles: {
                backgroundColor: '#25D366',
                textColor: '#ffffff',
                borderRadius: 8,
                fontWeight: 'semibold'
            }
        }
    },
    {
        type: 'quantity_selector',
        label: 'Quantity selector field',
        description: 'Let customers choose quantity with +/- buttons',
        icon: <Hash className="w-5 h-5" />,
        category: 'input',
        defaultProps: {
            label: 'Quantity',
            defaultValue: 1,
            minValue: 1,
            maxValue: 99,
            step: 1,
            styles: {
                width: 'auto'
            }
        }
    },
    {
        type: 'text_input',
        label: 'Text input',
        description: 'Single line text field for short answers',
        icon: <Type className="w-5 h-5 rotate-45" />,
        category: 'input',
        defaultProps: {
            label: 'Text Field',
            placeholder: 'Enter text...',
            validation: {
                required: false
            },
            styles: {
                borderRadius: 8
            }
        }
    },
    {
        type: 'dropdown',
        label: 'Dropdown list',
        description: 'Select one option from a dropdown menu',
        icon: <LayoutList className="w-5 h-5" />,
        category: 'selection',
        defaultProps: {
            label: 'Select Option',
            placeholder: 'Choose an option...',
            options: [
                { id: '1', label: 'Option 1', value: 'option_1' },
                { id: '2', label: 'Option 2', value: 'option_2' },
                { id: '3', label: 'Option 3', value: 'option_3' }
            ],
            validation: {
                required: false
            }
        }
    },
    {
        type: 'single_choice',
        label: 'Single-choice input',
        description: 'Radio buttons for selecting one option',
        icon: <Circle className="w-5 h-5" />,
        category: 'selection',
        defaultProps: {
            label: 'Choose One',
            options: [
                { id: '1', label: 'Choice A', value: 'choice_a' },
                { id: '2', label: 'Choice B', value: 'choice_b' }
            ],
            styles: {
                padding: 12
            }
        }
    },
    {
        type: 'checkbox',
        label: 'Checkbox',
        description: 'Single or multiple checkboxes',
        icon: <Square className="w-5 h-5" />,
        category: 'selection',
        defaultProps: {
            label: 'I agree to the terms',
            defaultValue: false,
            allowMultiple: false
        }
    },
    {
        type: 'date_selector',
        label: 'Date selector',
        description: 'Calendar date picker input',
        icon: <Calendar className="w-5 h-5" />,
        category: 'input',
        defaultProps: {
            label: 'Select Date',
            dateFormat: 'YYYY-MM-DD',
            validation: {
                required: false
            }
        }
    },
    {
        type: 'link_button',
        label: 'Link button',
        description: 'Customizable button that links to URL',
        icon: <LinkIcon className="w-5 h-5" />,
        category: 'action',
        defaultProps: {
            label: 'Link Button',
            content: 'Click Here',
            linkUrl: 'https://',
            linkTarget: '_blank',
            buttonVariant: 'outline',
            fullWidth: false,
            styles: {
                borderRadius: 8,
                textAlign: 'center'
            }
        }
    },
    {
        type: 'divider',
        label: 'Divider',
        description: 'Horizontal line separator',
        icon: <GripVertical className="w-5 h-5 rotate-90" />,
        category: 'layout',
        defaultProps: {
            label: 'Divider',
            styles: {
                marginTop: 16,
                marginBottom: 16,
                borderColor: '#e5e7eb',
                borderWidth: 1
            }
        }
    },
    {
        type: 'spacer',
        label: 'Spacer',
        description: 'Adds empty vertical space',
        icon: <Move className="w-5 h-5" />,
        category: 'layout',
        defaultProps: {
            label: 'Spacer',
            styles: {
                height: 24
            }
        }
    },
    {
        type: 'email_input',
        label: 'Email input',
        description: 'Email field with validation',
        icon: <Type className="w-5 h-5" />,
        category: 'input',
        defaultProps: {
            label: 'Email Address',
            placeholder: 'you@example.com',
            validation: {
                required: false,
                pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
                customError: 'Please enter a valid email address'
            }
        }
    },
    {
        type: 'phone_input',
        label: 'Phone input',
        description: 'Phone number with country code',
        icon: <Smartphone className="w-5 h-5" />,
        category: 'input',
        defaultProps: {
            label: 'Phone Number',
            placeholder: '+1 (555) 123-4567',
            validation: {
                required: false
            }
        }
    },
    {
        type: 'number_input',
        label: 'Number input',
        description: 'Numeric input with min/max',
        icon: <Hash className="w-5 h-5" />,
        category: 'input',
        defaultProps: {
            label: 'Number',
            minValue: 0,
            maxValue: 100,
            step: 1
        }
    },
    {
        type: 'textarea',
        label: 'Multi-line text',
        description: 'Larger text area for longer responses',
        icon: <Type className="w-5 h-5" />,
        category: 'input',
        defaultProps: {
            label: 'Comments',
            placeholder: 'Enter your message...',
            styles: {
                height: 120
            }
        }
    },
    {
        type: 'file_upload',
        label: 'File upload',
        description: 'Allow users to upload files',
        icon: <Upload className="w-5 h-5" />,
        category: 'input',
        defaultProps: {
            label: 'Upload File',
            helpText: 'Max file size: 10MB'
        }
    },
    {
        type: 'rating',
        label: 'Star rating',
        description: 'Star-based rating selector',
        icon: <Type className="w-5 h-5" />,
        category: 'input',
        defaultProps: {
            label: 'Rating',
            minValue: 1,
            maxValue: 5,
            defaultValue: 0
        }
    },
    {
        type: 'slider',
        label: 'Range slider',
        description: 'Slider for selecting a value range',
        icon: <Settings className="w-5 h-5" />,
        category: 'input',
        defaultProps: {
            label: 'Select Value',
            minValue: 0,
            maxValue: 100,
            step: 1,
            defaultValue: 50
        }
    },
    {
        type: 'toggle',
        label: 'Toggle switch',
        description: 'On/off toggle switch',
        icon: <Settings className="w-5 h-5" />,
        category: 'selection',
        defaultProps: {
            label: 'Enable Feature',
            defaultValue: false
        }
    },
    {
        type: 'video_embed',
        label: 'Video embed',
        description: 'Embed YouTube or Vimeo videos',
        icon: <Monitor className="w-5 h-5" />,
        category: 'media',
        defaultProps: {
            label: 'Video',
            linkUrl: '',
            styles: {
                borderRadius: 8,
                width: 'full'
            }
        }
    }
];

// ============================================================================
// COLOR PICKER COMPONENT
// ============================================================================

function ColorPicker({
    label,
    value,
    onChange,
    showOpacity = false
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    showOpacity?: boolean;
}) {
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

// ============================================================================
// ELEMENT SETTINGS PANEL
// ============================================================================

interface ElementSettingsPanelProps {
    element: CustomElement;
    onUpdate: (element: CustomElement) => void;
    onDelete: () => void;
    onDuplicate: () => void;
    userId?: string;
}

export function ElementSettingsPanel({
    element,
    onUpdate,
    onDelete,
    onDuplicate,
    userId
}: ElementSettingsPanelProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'style' | 'advanced'>('general');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !userId) return;

        const file = files[0];
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File too large. Max 10MB.');
            return;
        }

        setIsUploading(true);
        const supabase = createClient();

        try {
            const fileName = `${userId}/form-elements/${Date.now()}-${file.name}`;
            const { data, error } = await supabase.storage
                .from('product-media')
                .upload(fileName, file);

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from('product-media')
                .getPublicUrl(data.path);

            onUpdate({ ...element, imageUrl: urlData.publicUrl });
            toast.success('Image uploaded!');
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const updateStyle = (key: keyof CustomElementStyles, value: any) => {
        onUpdate({
            ...element,
            styles: { ...element.styles, [key]: value }
        });
    };

    const updateValidation = (key: keyof CustomElementValidation, value: any) => {
        onUpdate({
            ...element,
            validation: { ...element.validation, [key]: value }
        });
    };

    const addOption = () => {
        const newOption: CustomElementOption = {
            id: uuidv4(),
            label: `Option ${(element.options?.length || 0) + 1}`,
            value: `option_${(element.options?.length || 0) + 1}`
        };
        onUpdate({
            ...element,
            options: [...(element.options || []), newOption]
        });
    };

    const updateOption = (id: string, updates: Partial<CustomElementOption>) => {
        onUpdate({
            ...element,
            options: element.options?.map(opt =>
                opt.id === id ? { ...opt, ...updates } : opt
            )
        });
    };

    const removeOption = (id: string) => {
        onUpdate({
            ...element,
            options: element.options?.filter(opt => opt.id !== id)
        });
    };

    const definition = ELEMENT_DEFINITIONS.find(d => d.type === element.type);

    return (
        <div className="h-full flex flex-col bg-white border-l border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                        {definition?.icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{definition?.label}</h3>
                        <p className="text-xs text-gray-500">{element.id.slice(0, 8)}...</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={onDuplicate} className="h-8 w-8">
                        <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex">
                    {(['general', 'style', 'advanced'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    {activeTab === 'general' && (
                        <>
                            {/* Label */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Label</Label>
                                <Input
                                    value={element.label}
                                    onChange={(e) => onUpdate({ ...element, label: e.target.value })}
                                    placeholder="Field label"
                                />
                            </div>

                            {/* Placeholder - for input types */}
                            {['text_input', 'email_input', 'phone_input', 'number_input', 'textarea', 'dropdown'].includes(element.type) && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Placeholder</Label>
                                    <Input
                                        value={element.placeholder || ''}
                                        onChange={(e) => onUpdate({ ...element, placeholder: e.target.value })}
                                        placeholder="Placeholder text..."
                                    />
                                </div>
                            )}

                            {/* Content - for text/button elements */}
                            {['title_text', 'link_button', 'shopify_checkout', 'whatsapp_button'].includes(element.type) && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        {element.type === 'title_text' ? 'Content' : 'Button Text'}
                                    </Label>
                                    {element.type === 'title_text' ? (
                                        <Textarea
                                            value={element.content || ''}
                                            onChange={(e) => onUpdate({ ...element, content: e.target.value })}
                                            placeholder="Enter your text..."
                                            className="min-h-[100px]"
                                        />
                                    ) : (
                                        <Input
                                            value={element.content || ''}
                                            onChange={(e) => onUpdate({ ...element, content: e.target.value })}
                                            placeholder="Button text"
                                        />
                                    )}
                                </div>
                            )}

                            {/* Image Upload */}
                            {element.type === 'image' && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Image</Label>
                                    {element.imageUrl ? (
                                        <div className="relative rounded-lg overflow-hidden border border-gray-200">
                                            <img
                                                src={element.imageUrl}
                                                alt={element.imageAlt}
                                                className="w-full h-32 object-cover"
                                            />
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8"
                                                onClick={() => onUpdate({ ...element, imageUrl: '' })}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
                                        >
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">Click to upload</p>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e.target.files)}
                                        className="hidden"
                                    />
                                    <Input
                                        value={element.imageUrl || ''}
                                        onChange={(e) => onUpdate({ ...element, imageUrl: e.target.value })}
                                        placeholder="Or paste image URL..."
                                    />
                                    <Input
                                        value={element.imageAlt || ''}
                                        onChange={(e) => onUpdate({ ...element, imageAlt: e.target.value })}
                                        placeholder="Alt text for accessibility"
                                    />
                                    <Select
                                        value={element.imageFit || 'cover'}
                                        onValueChange={(v) => onUpdate({ ...element, imageFit: v as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Image fit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cover">Cover</SelectItem>
                                            <SelectItem value="contain">Contain</SelectItem>
                                            <SelectItem value="fill">Fill</SelectItem>
                                            <SelectItem value="none">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Link URL - for button/link elements */}
                            {['link_button', 'shopify_checkout'].includes(element.type) && (
                                <>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Link URL</Label>
                                        <Input
                                            value={element.linkUrl || ''}
                                            onChange={(e) => onUpdate({ ...element, linkUrl: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm">Open in new tab</Label>
                                        <Switch
                                            checked={element.linkTarget === '_blank'}
                                            onCheckedChange={(c) => onUpdate({ ...element, linkTarget: c ? '_blank' : '_self' })}
                                        />
                                    </div>
                                </>
                            )}

                            {/* WhatsApp Settings */}
                            {element.type === 'whatsapp_button' && (
                                <>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Phone Number</Label>
                                        <Input
                                            value={element.phoneNumber || ''}
                                            onChange={(e) => onUpdate({ ...element, phoneNumber: e.target.value })}
                                            placeholder="+1234567890"
                                        />
                                        <p className="text-xs text-gray-500">Include country code without + or spaces</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Pre-filled Message</Label>
                                        <Textarea
                                            value={element.whatsappMessage || ''}
                                            onChange={(e) => onUpdate({ ...element, whatsappMessage: e.target.value })}
                                            placeholder="Hello! I'm interested in..."
                                        />
                                    </div>
                                </>
                            )}

                            {/* Quantity/Number Settings */}
                            {['quantity_selector', 'number_input', 'slider'].includes(element.type) && (
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Min</Label>
                                        <Input
                                            type="number"
                                            value={element.minValue ?? 0}
                                            onChange={(e) => onUpdate({ ...element, minValue: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Max</Label>
                                        <Input
                                            type="number"
                                            value={element.maxValue ?? 100}
                                            onChange={(e) => onUpdate({ ...element, maxValue: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Step</Label>
                                        <Input
                                            type="number"
                                            value={element.step ?? 1}
                                            onChange={(e) => onUpdate({ ...element, step: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Options for dropdown/choices */}
                            {['dropdown', 'single_choice', 'checkbox'].includes(element.type) && element.allowMultiple !== false && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Options</Label>
                                        <Button variant="outline" size="sm" onClick={addOption}>
                                            <Plus className="w-4 h-4 mr-1" />
                                            Add
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {element.options?.map((opt, idx) => (
                                            <div key={opt.id} className="flex gap-2 items-center">
                                                <span className="text-xs text-gray-400 w-5">{idx + 1}</span>
                                                <Input
                                                    value={opt.label}
                                                    onChange={(e) => updateOption(opt.id, { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                                    placeholder="Option label"
                                                    className="flex-1"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                                                    onClick={() => removeOption(opt.id)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Validation */}
                            <Separator />
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Validation</Label>
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm text-gray-600">Required</Label>
                                    <Switch
                                        checked={element.validation?.required ?? false}
                                        onCheckedChange={(c) => updateValidation('required', c)}
                                    />
                                </div>
                                {['text_input', 'textarea', 'email_input'].includes(element.type) && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-gray-600">Min Length</Label>
                                            <Input
                                                type="number"
                                                value={element.validation?.minLength ?? ''}
                                                onChange={(e) => updateValidation('minLength', e.target.value ? Number(e.target.value) : undefined)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-gray-600">Max Length</Label>
                                            <Input
                                                type="number"
                                                value={element.validation?.maxLength ?? ''}
                                                onChange={(e) => updateValidation('maxLength', e.target.value ? Number(e.target.value) : undefined)}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-600">Custom Error Message</Label>
                                    <Input
                                        value={element.validation?.customError ?? ''}
                                        onChange={(e) => updateValidation('customError', e.target.value)}
                                        placeholder="This field is invalid"
                                    />
                                </div>
                            </div>

                            {/* Help Text */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Help Text</Label>
                                <Input
                                    value={element.helpText || ''}
                                    onChange={(e) => onUpdate({ ...element, helpText: e.target.value })}
                                    placeholder="Additional instructions..."
                                />
                            </div>
                        </>
                    )}

                    {activeTab === 'style' && (
                        <>
                            {/* Typography */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                    <Type className="w-4 h-4" />
                                    Typography
                                </h4>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-600">Font Size</Label>
                                        <Input
                                            type="number"
                                            value={element.styles?.fontSize ?? 14}
                                            onChange={(e) => updateStyle('fontSize', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-600">Font Weight</Label>
                                        <Select
                                            value={element.styles?.fontWeight ?? 'normal'}
                                            onValueChange={(v) => updateStyle('fontWeight', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="normal">Normal</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="semibold">Semibold</SelectItem>
                                                <SelectItem value="bold">Bold</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <ColorPicker
                                    label="Text Color"
                                    value={element.styles?.textColor ?? '#1f2937'}
                                    onChange={(v) => updateStyle('textColor', v)}
                                />

                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-600">Text Alignment</Label>
                                    <div className="flex gap-1">
                                        {(['left', 'center', 'right'] as const).map(align => (
                                            <Button
                                                key={align}
                                                variant={element.styles?.textAlign === align ? 'default' : 'outline'}
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => updateStyle('textAlign', align)}
                                            >
                                                {align === 'left' && <AlignLeft className="w-4 h-4" />}
                                                {align === 'center' && <AlignCenter className="w-4 h-4" />}
                                                {align === 'right' && <AlignRight className="w-4 h-4" />}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Background & Border */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                    <Palette className="w-4 h-4" />
                                    Background & Border
                                </h4>

                                <ColorPicker
                                    label="Background Color"
                                    value={element.styles?.backgroundColor ?? 'transparent'}
                                    onChange={(v) => updateStyle('backgroundColor', v)}
                                />

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label className="text-xs text-gray-600">Border Radius</Label>
                                        <span className="text-xs text-gray-400">{element.styles?.borderRadius ?? 0}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="32"
                                        value={element.styles?.borderRadius ?? 0}
                                        onChange={(e) => updateStyle('borderRadius', Number(e.target.value))}
                                        className="w-full accent-orange-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-600">Border Width</Label>
                                        <Input
                                            type="number"
                                            value={element.styles?.borderWidth ?? 0}
                                            onChange={(e) => updateStyle('borderWidth', Number(e.target.value))}
                                            min="0"
                                            max="10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-600">Border Style</Label>
                                        <Select
                                            value={element.styles?.borderStyle ?? 'solid'}
                                            onValueChange={(v) => updateStyle('borderStyle', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                <SelectItem value="solid">Solid</SelectItem>
                                                <SelectItem value="dashed">Dashed</SelectItem>
                                                <SelectItem value="dotted">Dotted</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <ColorPicker
                                    label="Border Color"
                                    value={element.styles?.borderColor ?? '#e5e7eb'}
                                    onChange={(v) => updateStyle('borderColor', v)}
                                />
                            </div>

                            <Separator />

                            {/* Layout */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                    <Move className="w-4 h-4" />
                                    Layout
                                </h4>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-600">Padding</Label>
                                        <Input
                                            type="number"
                                            value={element.styles?.padding ?? 0}
                                            onChange={(e) => updateStyle('padding', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-600">Margin Bottom</Label>
                                        <Input
                                            type="number"
                                            value={element.styles?.marginBottom ?? 0}
                                            onChange={(e) => updateStyle('marginBottom', Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-600">Width</Label>
                                    <Select
                                        value={element.styles?.width ?? 'full'}
                                        onValueChange={(v) => updateStyle('width', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="full">Full Width</SelectItem>
                                            <SelectItem value="auto">Auto</SelectItem>
                                            <SelectItem value="half">50%</SelectItem>
                                            <SelectItem value="third">33%</SelectItem>
                                            <SelectItem value="quarter">25%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {['spacer', 'divider'].includes(element.type) && (
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-600">Height</Label>
                                        <Input
                                            type="number"
                                            value={element.styles?.height ?? 24}
                                            onChange={(e) => updateStyle('height', Number(e.target.value))}
                                        />
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Effects */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Effects
                                </h4>

                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-600">Shadow</Label>
                                    <Select
                                        value={element.styles?.shadow ?? 'none'}
                                        onValueChange={(v) => updateStyle('shadow', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="sm">Small</SelectItem>
                                            <SelectItem value="md">Medium</SelectItem>
                                            <SelectItem value="lg">Large</SelectItem>
                                            <SelectItem value="xl">Extra Large</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-600">Hover Effect</Label>
                                    <Select
                                        value={element.styles?.hoverEffect ?? 'none'}
                                        onValueChange={(v) => updateStyle('hoverEffect', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="lift">Lift Up</SelectItem>
                                            <SelectItem value="glow">Glow</SelectItem>
                                            <SelectItem value="scale">Scale</SelectItem>
                                            <SelectItem value="darken">Darken</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label className="text-xs text-gray-600">Opacity</Label>
                                        <span className="text-xs text-gray-400">{Math.round((element.styles?.opacity ?? 1) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={(element.styles?.opacity ?? 1) * 100}
                                        onChange={(e) => updateStyle('opacity', Number(e.target.value) / 100)}
                                        className="w-full accent-orange-500"
                                    />
                                </div>
                            </div>

                            {/* Button-specific styles */}
                            {['link_button', 'shopify_checkout', 'whatsapp_button'].includes(element.type) && (
                                <>
                                    <Separator />
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-sm">Button Options</h4>
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm text-gray-600">Full Width</Label>
                                            <Switch
                                                checked={element.fullWidth ?? true}
                                                onCheckedChange={(c) => onUpdate({ ...element, fullWidth: c })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-gray-600">Size</Label>
                                            <Select
                                                value={element.buttonSize ?? 'md'}
                                                onValueChange={(v) => onUpdate({ ...element, buttonSize: v as any })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="sm">Small</SelectItem>
                                                    <SelectItem value="md">Medium</SelectItem>
                                                    <SelectItem value="lg">Large</SelectItem>
                                                    <SelectItem value="xl">Extra Large</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {activeTab === 'advanced' && (
                        <>
                            {/* Visibility */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-sm">Visibility</h4>
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm text-gray-600">Element Enabled</Label>
                                    <Switch
                                        checked={element.enabled}
                                        onCheckedChange={(c) => onUpdate({ ...element, enabled: c })}
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Custom Attributes */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm">Custom Attributes</h4>
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-600">Data Attribute</Label>
                                    <Input
                                        value={element.dataAttribute || ''}
                                        onChange={(e) => onUpdate({ ...element, dataAttribute: e.target.value })}
                                        placeholder="data-custom-value"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-600">CSS Class</Label>
                                    <Input
                                        value={element.cssClass || ''}
                                        onChange={(e) => onUpdate({ ...element, cssClass: e.target.value })}
                                        placeholder="my-custom-class"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-gray-600">ARIA Label</Label>
                                    <Input
                                        value={element.ariaLabel || ''}
                                        onChange={(e) => onUpdate({ ...element, ariaLabel: e.target.value })}
                                        placeholder="Accessible label"
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Conditional Logic */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm">Conditional Logic</h4>
                                    <Switch
                                        checked={element.conditionalLogic?.enabled ?? false}
                                        onCheckedChange={(c) => onUpdate({
                                            ...element,
                                            conditionalLogic: {
                                                ...element.conditionalLogic,
                                                enabled: c,
                                                action: element.conditionalLogic?.action ?? 'show',
                                                conditions: element.conditionalLogic?.conditions ?? [],
                                                conjunction: element.conditionalLogic?.conjunction ?? 'and'
                                            }
                                        })}
                                    />
                                </div>
                                {element.conditionalLogic?.enabled && (
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-500">
                                            When enabled, this element will {element.conditionalLogic.action} based on conditions you set.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Element Info */}
                            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                    <Info className="w-4 h-4" />
                                    Element Info
                                </h4>
                                <div className="text-xs text-gray-500 space-y-1">
                                    <p><span className="font-medium">ID:</span> {element.id}</p>
                                    <p><span className="font-medium">Type:</span> {element.type}</p>
                                    <p><span className="font-medium">Order:</span> {element.order}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

// ============================================================================
// ADD ELEMENT DIALOG
// ============================================================================

interface AddElementDialogProps {
    onAdd: (type: CustomElementType) => void;
    trigger?: React.ReactNode;
}

export function AddElementDialog({ onAdd, trigger }: AddElementDialogProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = [
        { id: 'all', label: 'All' },
        { id: 'basic', label: 'Basic' },
        { id: 'input', label: 'Input Fields' },
        { id: 'selection', label: 'Selection' },
        { id: 'action', label: 'Buttons' },
        { id: 'media', label: 'Media' },
        { id: 'layout', label: 'Layout' }
    ];

    const filteredElements = ELEMENT_DEFINITIONS.filter(el => {
        const matchesCategory = selectedCategory === 'all' || el.category === selectedCategory;
        const matchesSearch = el.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            el.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleAdd = (type: CustomElementType) => {
        onAdd(type);
        setOpen(false);
        setSearchQuery('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="outline"
                        className="w-full border-dashed border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50 py-6 group"
                    >
                        <Plus className="w-5 h-5 mr-2 text-gray-400 group-hover:text-orange-500 transition-colors" />
                        <span className="text-gray-500 group-hover:text-orange-600 transition-colors font-medium">
                            Add a custom field, button, text or image
                        </span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl">Add a custom field, button, text or image</DialogTitle>
                </DialogHeader>

                <div className="p-6 pt-4 space-y-4">
                    {/* Search */}
                    <Input
                        placeholder="Search elements..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11"
                    />

                    {/* Categories */}
                    <div className="flex gap-2 flex-wrap">
                        {categories.map(cat => (
                            <Button
                                key={cat.id}
                                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategory(cat.id)}
                                className={selectedCategory === cat.id ? 'bg-orange-500 hover:bg-orange-600' : ''}
                            >
                                {cat.label}
                            </Button>
                        ))}
                    </div>

                    {/* Elements Grid */}
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-2">
                            {filteredElements.map(el => (
                                <div
                                    key={el.type}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50/50 transition-all cursor-pointer group"
                                    onClick={() => handleAdd(el.type)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center text-gray-500 group-hover:text-orange-600 transition-colors">
                                            {el.icon}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 flex items-center gap-2">
                                                {el.label}
                                                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                                            </p>
                                            <p className="text-sm text-gray-500">{el.description}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Add
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// HELPER: Create new element
// ============================================================================

export function createCustomElement(type: CustomElementType, order: number): CustomElement {
    const definition = ELEMENT_DEFINITIONS.find(d => d.type === type);

    return {
        id: uuidv4(),
        type,
        enabled: true,
        order,
        label: definition?.defaultProps.label || 'New Element',
        ...definition?.defaultProps
    } as CustomElement;
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export { ColorPicker };
