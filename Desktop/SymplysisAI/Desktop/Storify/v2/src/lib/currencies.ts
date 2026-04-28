export interface Currency {
    code: string;
    name: string;
    symbol: string;
    locale: string;
}

export const CURRENCIES: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
    { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
    { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', locale: 'zh-CN' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'hi-IN' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', locale: 'en-CA' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', locale: 'de-CH' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', locale: 'zh-HK' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', locale: 'sv-SE' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', locale: 'ko-KR' },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', locale: 'es-MX' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', locale: 'pt-BR' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', locale: 'ru-RU' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', locale: 'en-ZA' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺', locale: 'tr-TR' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', locale: 'pl-PL' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿', locale: 'th-TH' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', locale: 'id-ID' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', locale: 'ms-MY' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱', locale: 'en-PH' },
    { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', locale: 'vi-VN' },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', locale: 'ur-PK' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', locale: 'bn-BD' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', locale: 'ar-EG' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', locale: 'en-NG' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', locale: 'en-KE' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', locale: 'en-GH' },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', locale: 'sw-TZ' },
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', locale: 'en-UG' },
    { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', locale: 'ar-MA' },
    { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', locale: 'ar-TN' },
    { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', locale: 'ar-DZ' },
    { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د', locale: 'ar-LY' },
    { code: 'SDG', name: 'Sudanese Pound', symbol: 'ج.س', locale: 'ar-SD' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', locale: 'ar-AE' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', locale: 'ar-SA' },
    { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', locale: 'ar-QA' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', locale: 'ar-KW' },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', locale: 'ar-BH' },
    { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', locale: 'ar-OM' },
    { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', locale: 'ar-JO' },
    { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', locale: 'ar-LB' },
    { code: 'SYP', name: 'Syrian Pound', symbol: 'ل.س', locale: 'ar-SY' },
    { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د', locale: 'ar-IQ' },
    { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', locale: 'fa-IR' },
    { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', locale: 'he-IL' },
    { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', locale: 'uk-UA' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', locale: 'cs-CZ' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', locale: 'hu-HU' },
    { code: 'RON', name: 'Romanian Leu', symbol: 'lei', locale: 'ro-RO' },
    { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', locale: 'bg-BG' },
    { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', locale: 'hr-HR' },
    { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин.', locale: 'sr-RS' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr', locale: 'da-DK' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', locale: 'nb-NO' },
    { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr', locale: 'is-IS' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', locale: 'en-NZ' },
    { code: 'CLP', name: 'Chilean Peso', symbol: 'CLP$', locale: 'es-CL' },
    { code: 'COP', name: 'Colombian Peso', symbol: 'COL$', locale: 'es-CO' },
    { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', locale: 'es-PE' },
    { code: 'ARS', name: 'Argentine Peso', symbol: 'AR$', locale: 'es-AR' },
    { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.', locale: 'es-VE' },
    { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.', locale: 'es-BO' },
    { code: 'PYG', name: 'Paraguayan Guaraní', symbol: '₲', locale: 'es-PY' },
    { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', locale: 'es-UY' },
];

export function formatPrice(price: number, symbol: string, position: 'before' | 'after' = 'before'): string {
    const formattedPrice = price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return position === 'before' ? `${symbol}${formattedPrice}` : `${formattedPrice} ${symbol}`;
}

// Sanitize store URL slug - removes non-alphanumeric chars, spaces, etc.
export function sanitizeSlug(input: string): string {
    // If empty or only non-latin chars, return empty
    if (!input) return '';

    // Convert to lowercase
    let slug = input.toLowerCase();

    // Replace spaces with hyphens
    slug = slug.replace(/\s+/g, '-');

    // Remove any character that's not a-z, 0-9, or hyphen
    slug = slug.replace(/[^a-z0-9-]/g, '');

    // Remove multiple consecutive hyphens
    slug = slug.replace(/-+/g, '-');

    // Remove leading/trailing hyphens
    slug = slug.replace(/^-|-$/g, '');

    return slug;
}
