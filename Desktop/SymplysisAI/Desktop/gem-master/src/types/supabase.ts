// Supabase Database Types

// Generic Database type for Supabase client
export type Database = {
    public: {
        Tables: {
            [key: string]: {
                Row: Record<string, unknown>;
                Insert: Record<string, unknown>;
                Update: Record<string, unknown>;
            };
        };
        Views: {
            [key: string]: {
                Row: Record<string, unknown>;
            };
        };
        Functions: {
            [key: string]: {
                Args: Record<string, unknown>;
                Returns: unknown;
            };
        };
        Enums: {
            [key: string]: string;
        };
    };
};

export interface Profile {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    role: 'user' | 'admin';
    is_disabled: boolean;
    created_at: string;
    updated_at: string;
}

export interface Store {
    id: string;
    user_id: string;
    name: string;
    slug: string;
    description?: string;
    logo_url?: string;
    custom_domain?: string;
    currency_code?: string;
    currency_symbol?: string;
    currency_position?: 'before' | 'after';
    telegram_bot_token?: string;
    telegram_chat_id?: string;
    telegram_enabled?: boolean;
    tiktok_pixels?: any;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    store_id: string;
    theme_id?: string;
    name: string;
    slug: string;
    description?: string;
    short_description?: string;
    price: number;
    compare_price?: number;
    status: 'draft' | 'published';
    highlights?: string[];
    layout_config?: any;
    seo_title?: string;
    seo_description?: string;
    variant_selection_title?: string;
    variants?: any;
    variant_prices?: any;
    created_at: string;
    updated_at: string;
}

export interface ProductTheme {
    id: string;
    name: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    text_color: string;
    heading_font: string;
    body_font: string;
    font_family?: string;
    button_style: string;
    card_style: string;
    is_dark: boolean;
    created_at: string;
}

export interface ProductImage {
    id: string;
    product_id: string;
    url: string;
    alt_text?: string;
    image_type: 'hero' | 'gallery' | 'thumbnail';
    sort_order: number;
    created_at: string;
}

export interface ProductVideo {
    id: string;
    product_id: string;
    url: string;
    thumbnail_url?: string;
    title?: string;
    sort_order: number;
    created_at: string;
}

export interface ProductSpecification {
    id: string;
    product_id: string;
    label: string;
    value: string;
    sort_order: number;
    created_at: string;
}

export interface ProductCustomField {
    id: string;
    product_id: string;
    field_type: string;
    label: string;
    value?: string;
    options?: any;
    sort_order: number;
    created_at: string;
}

export interface LeadFormConfig {
    id: string;
    product_id: string;
    title: string;
    subtitle?: string;
    button_text: string;
    submit_button_text?: string;
    success_message: string;
    collect_phone: boolean;
    collect_address: boolean;
    collect_notes: boolean;
    enable_quantity: boolean;
    show_price_on_form: boolean;
    created_at: string;
    updated_at: string;
    fields?: LeadFormField[];
}

export interface LeadFormField {
    id: string;
    lead_form_config_id: string;
    field_type: string;
    label: string;
    placeholder?: string;
    required: boolean;
    validation_pattern?: string;
    options?: any;
    sort_order: number;
    created_at: string;
}

export interface LeadSubmission {
    id: string;
    product_id: string;
    form_data: Record<string, any>;
    synced_to_sheet: boolean;
    ip_address?: string;
    user_agent?: string;
    submitted_at: string;
}

// Extended type with relations
export interface ProductWithRelations extends Product {
    store?: Store;
    theme?: ProductTheme | null;
    images?: ProductImage[];
    videos?: ProductVideo[];
    specifications?: ProductSpecification[];
    custom_fields?: ProductCustomField[];
    lead_form_config?: LeadFormConfig | null;
}
