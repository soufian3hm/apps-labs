'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import type { ProductTheme } from '@/types/supabase';
import { formatPrice } from '@/lib/currencies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { MediaUpload } from '@/components/ui/media-upload';
import { LayoutCustomizer, DEFAULT_LAYOUT, type LayoutConfig } from '@/components/ui/layout-customizer';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Palette,
    FormInput,
    Loader2,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Tag,
    Boxes,
    Layers,
    X
} from 'lucide-react';
import Link from 'next/link';

interface StoreData {
    id: string;
    name: string;
    slug: string;
    currency_symbol: string;
    currency_position: 'before' | 'after';
    custom_domain?: string;
}

export default function NewProductPage() {
    const router = useRouter();
    const { currentStoreId, themes, fetchThemes, user } = useAppStore();
    const [isSaving, setIsSaving] = useState(false);
    const [store, setStore] = useState<StoreData | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [price, setPrice] = useState('');
    const [comparePrice, setComparePrice] = useState('');
    const [status, setStatus] = useState<'draft' | 'published'>('draft');
    const [selectedTheme, setSelectedTheme] = useState<ProductTheme | null>(null);

    // Media
    const [media, setMedia] = useState<{ url: string; alt?: string; type: 'image' | 'video' }[]>([]);

    // Category
    const [category, setCategory] = useState('');

    // Inventory
    const [trackInventory, setTrackInventory] = useState(false);
    const [sku, setSku] = useState('');
    const [quantity, setQuantity] = useState('');

    // Variants
    const [hasVariants, setHasVariants] = useState(false);
    const [variants, setVariants] = useState<{ name: string; type: string; values: string[] }[]>([
        { name: '', type: 'textual_buttons', values: [] }
    ]);
    const [variantInputValues, setVariantInputValues] = useState<Record<number, string>>({});
    const [variantSelectionTitle, setVariantSelectionTitle] = useState('Choose the Variant');
    const [variantPrices, setVariantPrices] = useState<Record<string, { price: string; compare_price: string }>>({});

    // Highlights
    const [highlights, setHighlights] = useState<string[]>([]);
    const [newHighlight, setNewHighlight] = useState('');



    // Layout config
    const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(DEFAULT_LAYOUT);

    // Collapsible sections
    const [pricingOpen, setPricingOpen] = useState(true);
    const [inventoryOpen, setInventoryOpen] = useState(false);
    const [variantsOpen, setVariantsOpen] = useState(false);
    const [themeOpen, setThemeOpen] = useState(true);

    const [layoutOpen, setLayoutOpen] = useState(true);

    useEffect(() => {
        fetchThemes();
        loadStoreData();
    }, [currentStoreId]);

    const loadStoreData = async () => {
        if (!currentStoreId) return;
        const supabase = createClient();
        const { data } = await supabase
            .from('stores')
            .select('id, name, slug, currency_symbol, currency_position, custom_domain')
            .eq('id', currentStoreId)
            .single();

        if (data) {
            setStore(data as StoreData);
        }
    };

    useEffect(() => {
        if (themes.length > 0 && !selectedTheme) {
            setSelectedTheme(themes[0]);
        }
    }, [themes, selectedTheme]);

    // Auto-generate slug from name
    useEffect(() => {
        if (!slug && name) {
            setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
        }
    }, [name, slug]);

    // Track initialization
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        if (themes.length > 0) {
            // Small delay to ensure selectedTheme is set
            const timer = setTimeout(() => setIsInitializing(false), 500);
            return () => clearTimeout(timer);
        }
    }, [themes]);

    const { isDirty, resetDiff } = useUnsavedChanges({
        name, slug, description, shortDescription, price, comparePrice, status, selectedTheme,
        media, category, trackInventory, sku, quantity,
        hasVariants, variants, variantPrices, variantSelectionTitle, highlights, layoutConfig
    }, isInitializing);

    const handleAddHighlight = () => {
        if (newHighlight) {
            setHighlights([...highlights, newHighlight]);
            setNewHighlight('');
        }
    };

    const handleRemoveHighlight = (index: number) => {
        setHighlights(highlights.filter((_, i) => i !== index));
    };

    const handleAddVariant = () => {
        setVariants([...variants, { name: '', type: 'textual_buttons', values: [] }]);
    };

    const handleRemoveVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
        const newInputValues = { ...variantInputValues };
        delete newInputValues[index];
        setVariantInputValues(newInputValues);
    };

    const getVariantCombinations = () => {
        const validVariants = variants.filter(v => v.values.length > 0);
        if (validVariants.length === 0) return [];

        const generate = (index: number, current: string[]): string[][] => {
            if (index === validVariants.length) return [current];
            const keys: string[][] = [];
            for (const val of validVariants[index].values) {
                keys.push(...generate(index + 1, [...current, val]));
            }
            return keys;
        };

        return generate(0, []).map(c => c.join(' / '));
    };

    const handleVariantNameChange = (index: number, variantName: string) => {
        setVariants(prev => prev.map((v, i) =>
            i === index ? { ...v, name: variantName } : v
        ));
    };

    const handleVariantTypeChange = (index: number, type: string) => {
        setVariants(prev => prev.map((v, i) =>
            i === index ? { ...v, type } : v
        ));
    };

    const handleConfirmVariantValue = (index: number) => {
        const inputValue = variantInputValues[index] || '';
        if (inputValue.trim()) {
            const values = inputValue.split(/[,،]/).map(v => v.trim()).filter(v => v);
            setVariants(prev => prev.map((v, i) =>
                i === index ? { ...v, values: [...v.values, ...values] } : v
            ));
            setVariantInputValues(prev => ({ ...prev, [index]: '' }));
        }
    };

    const handleVariantValueKeyDown = (variantIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            handleConfirmVariantValue(variantIndex);
        }
    };

    const handleRemoveVariantValue = (variantIndex: number, valueIndex: number) => {
        setVariants(prev => prev.map((v, i) =>
            i === variantIndex ? { ...v, values: v.values.filter((_, valI) => valI !== valueIndex) } : v
        ));
    };

    const handleSave = async () => {
        if (!name || !price || !currentStoreId) {
            toast.error('Please fill in product name and price');
            return;
        }

        if (!selectedTheme) {
            toast.error('Please select a theme');
            return;
        }

        setIsSaving(true);

        try {
            const supabase = createClient();

            // Create product
            const { data: productData, error: productError } = await supabase
                .from('products')
                .insert({
                    store_id: currentStoreId,
                    theme_id: selectedTheme.id,
                    name,
                    slug,
                    description,
                    short_description: shortDescription,
                    price: parseFloat(price),
                    compare_price: comparePrice ? parseFloat(comparePrice) : null,
                    status,
                    highlights,
                    layout_config: layoutConfig as any,
                    seo_title: name,
                    seo_description: shortDescription,
                    variant_selection_title: variantSelectionTitle,
                    variants: variants,
                    variant_prices: variantPrices,
                })
                .select()
                .single();

            if (productError) throw productError;

            // Add images
            if (media.length > 0 && productData) {
                const imageInserts = media.map((m, index) => ({
                    product_id: productData.id,
                    url: m.url,
                    alt_text: m.alt || name,
                    image_type: index === 0 ? 'hero' : 'gallery',
                    sort_order: index,
                }));

                await supabase.from('product_images').insert(imageInserts);
            }

            // Create lead form config


            toast.success('Product created successfully!');
            resetDiff();
            router.push('/dashboard/products');
        } catch (error) {
            console.error('Error creating product:', error);
            toast.error('Failed to create product');
        } finally {
            setIsSaving(false);
        }
    };

    const categories = [
        'Electronics',
        'Clothing & Apparel',
        'Home & Garden',
        'Health & Beauty',
        'Sports & Outdoors',
        'Toys & Games',
        'Food & Beverages',
        'Books & Media',
        'Jewelry & Accessories',
        'Other',
    ];

    const currencySymbol = store?.currency_symbol || '$';
    const currencyPosition = store?.currency_position || 'before';

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/products">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
                        <p className="text-gray-500">Create a new product landing page</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/products">
                        <Button variant="outline">Discard</Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="status" className="text-sm">Published</Label>
                        <Switch
                            id="status"
                            checked={status === 'published'}
                            onCheckedChange={(checked) => setStatus(checked ? 'published' : 'draft')}
                        />
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 w-full"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Product
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title & Description */}
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Title</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Short sleeve t-shirt"
                                    className="h-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <RichTextEditor
                                    content={description}
                                    onChange={setDescription}
                                    placeholder="Describe your product in detail..."
                                    userId={user?.id}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Media</Label>
                                <MediaUpload
                                    media={media}
                                    onChange={setMedia}
                                    userId={user?.id || 'anonymous'}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Collapsible open={pricingOpen} onOpenChange={setPricingOpen}>
                        <Card className="border-0 shadow-sm">
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                                                <DollarSign className="w-5 h-5 text-green-600" />
                                            </div>
                                            <CardTitle className="text-lg">Pricing</CardTitle>
                                        </div>
                                        {pricingOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="p-6 pt-0 space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                                    {currencySymbol}
                                                </span>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    step="0.01"
                                                    value={price}
                                                    onChange={(e) => setPrice(e.target.value)}
                                                    placeholder="0.00"
                                                    className="h-12 pl-12"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="comparePrice">Compare at price</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                                    {currencySymbol}
                                                </span>
                                                <Input
                                                    id="comparePrice"
                                                    type="number"
                                                    step="0.01"
                                                    value={comparePrice}
                                                    onChange={(e) => setComparePrice(e.target.value)}
                                                    placeholder="0.00"
                                                    className="h-12 pl-12"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {price && (
                                        <div className="p-3 bg-gray-50 rounded-xl">
                                            <p className="text-sm text-gray-600">
                                                Preview: <span className="font-bold text-lg">
                                                    {formatPrice(parseFloat(price) || 0, currencySymbol, currencyPosition)}
                                                </span>
                                                {comparePrice && (
                                                    <span className="ml-2 line-through text-gray-400">
                                                        {formatPrice(parseFloat(comparePrice), currencySymbol, currencyPosition)}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>

                    {/* Inventory */}
                    <Collapsible open={inventoryOpen} onOpenChange={setInventoryOpen}>
                        <Card className="border-0 shadow-sm">
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                                                <Boxes className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <CardTitle className="text-lg">Inventory</CardTitle>
                                        </div>
                                        {inventoryOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="p-6 pt-0 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="trackInventory">Track quantity</Label>
                                        <Switch
                                            id="trackInventory"
                                            checked={trackInventory}
                                            onCheckedChange={setTrackInventory}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="sku">SKU</Label>
                                        <Input
                                            id="sku"
                                            value={sku}
                                            onChange={(e) => setSku(e.target.value)}
                                            placeholder="SKU-12345"
                                        />
                                    </div>

                                    {trackInventory && (
                                        <div className="space-y-2">
                                            <Label htmlFor="quantity">Quantity</Label>
                                            <Input
                                                id="quantity"
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                placeholder="0"
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>

                    {/* Variants */}
                    <Collapsible open={variantsOpen} onOpenChange={setVariantsOpen}>
                        <Card className="border-0 shadow-sm">
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                                                <Layers className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <CardTitle className="text-lg">Variants</CardTitle>
                                        </div>
                                        {variantsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="p-6 pt-0 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="hasVariants">This product has options</Label>
                                        <Switch
                                            id="hasVariants"
                                            checked={hasVariants}
                                            onCheckedChange={setHasVariants}
                                        />
                                    </div>

                                    {hasVariants && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="variantTitle">Selection Title</Label>
                                                <Input
                                                    id="variantTitle"
                                                    value={variantSelectionTitle}
                                                    onChange={(e) => setVariantSelectionTitle(e.target.value)}
                                                    placeholder="Choose the Variant"
                                                />
                                            </div>

                                            {variants.map((variant, vIndex) => (
                                                <div key={vIndex} className="p-4 bg-gray-50 rounded-xl space-y-4">
                                                    <div className="grid grid-cols-12 gap-3 items-end">
                                                        {/* Option Name */}
                                                        <div className="col-span-3 space-y-2">
                                                            <Label className="text-xs text-gray-500">Option</Label>
                                                            <Input
                                                                value={variant.name}
                                                                onChange={(e) => handleVariantNameChange(vIndex, e.target.value)}
                                                                placeholder="e.g. Size, Color"
                                                                className="bg-white"
                                                            />
                                                        </div>
                                                        {/* Type */}
                                                        <div className="col-span-3 space-y-2">
                                                            <Label className="text-xs text-gray-500">Type</Label>
                                                            <Select
                                                                value={variant.type || 'textual_buttons'}
                                                                onValueChange={(v) => handleVariantTypeChange(vIndex, v)}
                                                            >
                                                                <SelectTrigger className="bg-white">
                                                                    <SelectValue placeholder="Select type" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="dropdown">Dropdown list</SelectItem>
                                                                    <SelectItem value="textual_buttons">Textual buttons</SelectItem>
                                                                    <SelectItem value="radio_buttons">Radio buttons</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        {/* Value */}
                                                        <div className="col-span-5 space-y-2">
                                                            <Label className="text-xs text-gray-500">Value</Label>
                                                            <div className="flex flex-wrap gap-2 p-2 bg-white border rounded-md min-h-[40px] items-center">
                                                                {variant.values.map((value, valIndex) => (
                                                                    <span
                                                                        key={valIndex}
                                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-pink-50 text-pink-700 border border-pink-200 rounded-md text-sm"
                                                                    >
                                                                        {value}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveVariantValue(vIndex, valIndex)}
                                                                            className="hover:text-pink-900"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </span>
                                                                ))}
                                                                <input
                                                                    type="text"
                                                                    value={variantInputValues[vIndex] || ''}
                                                                    onChange={(e) => {
                                                                        setVariantInputValues({ ...variantInputValues, [vIndex]: e.target.value });
                                                                    }}
                                                                    onKeyDown={(e) => handleVariantValueKeyDown(vIndex, e)}
                                                                    onBlur={() => handleConfirmVariantValue(vIndex)}
                                                                    placeholder={variant.values.length === 0 ? 'Type and press Enter' : ''}
                                                                    className="flex-1 min-w-[100px] outline-none bg-transparent text-sm px-2"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleConfirmVariantValue(vIndex)}
                                                                    className="md:hidden px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                                                >
                                                                    Add
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Delete */}
                                                        <div className="col-span-1 flex justify-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleRemoveVariant(vIndex)}
                                                                className="text-gray-400 hover:text-red-500"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <Button variant="outline" onClick={handleAddVariant} className="w-full text-blue-600 border-dashed">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add an option
                                            </Button>

                                            {getVariantCombinations().length > 0 && (
                                                <div className="mt-6 border rounded-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-gray-50 border-b">
                                                            <tr>
                                                                <th className="px-4 py-3 font-medium text-gray-700">Variant</th>
                                                                <th className="px-4 py-3 font-medium text-gray-700">Price</th>
                                                                <th className="px-4 py-3 font-medium text-gray-700">Compare at</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y">
                                                            {getVariantCombinations().map((combo) => (
                                                                <tr key={combo} className="bg-white">
                                                                    <td className="px-4 py-3 font-medium">{combo}</td>
                                                                    <td className="px-4 py-3">
                                                                        <div className="relative">
                                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{currencySymbol}</span>
                                                                            <Input
                                                                                type="number"
                                                                                className="h-8 pl-6 w-24"
                                                                                placeholder={price || '0'}
                                                                                value={variantPrices[combo]?.price || ''}
                                                                                onChange={(e) => setVariantPrices(prev => ({
                                                                                    ...prev,
                                                                                    [combo]: { ...prev[combo], price: e.target.value }
                                                                                }))}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <div className="relative">
                                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{currencySymbol}</span>
                                                                            <Input
                                                                                type="number"
                                                                                className="h-8 pl-6 w-24"
                                                                                placeholder={comparePrice || '0'}
                                                                                value={variantPrices[combo]?.compare_price || ''}
                                                                                onChange={(e) => setVariantPrices(prev => ({
                                                                                    ...prev,
                                                                                    [combo]: { ...prev[combo], compare_price: e.target.value }
                                                                                }))}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Category */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Tag className="w-5 h-5 text-amber-600" />
                                </div>
                                <CardTitle className="text-lg">Category</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* URL Handle */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">URL Handle</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center">
                                <span className="px-3 py-2 bg-gray-100 border border-r-0 rounded-l-lg text-sm text-gray-500 max-w-[150px] truncate">
                                    {store?.custom_domain
                                        ? `${store.custom_domain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'qrified.app'}/products/`
                                        : `${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'qrified.app'}/${store?.slug || 'store'}/`
                                    }
                                </span>
                                <Input
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    placeholder="product-slug"
                                    className="rounded-l-none"
                                />
                            </div>
                        </CardContent>
                    </Card >

                    {/* Layout Customizer */}
                    < LayoutCustomizer
                        value={layoutConfig}
                        onChange={setLayoutConfig}
                    />

                    {/* Theme */}
                    < Collapsible open={themeOpen} onOpenChange={setThemeOpen} >
                        <Card className="border-0 shadow-sm">
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                <Palette className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <CardTitle className="text-lg">Theme</CardTitle>
                                        </div>
                                        {themeOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="space-y-3">
                                    {themes.map((theme) => (
                                        <button
                                            key={theme.id}
                                            type="button"
                                            onClick={() => setSelectedTheme(theme)}
                                            className={`w-full p-3 rounded-xl border-2 transition-all text-left ${selectedTheme?.id === theme.id
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div
                                                    className="w-5 h-5 rounded-full"
                                                    style={{ backgroundColor: theme.primary_color }}
                                                />
                                                <div
                                                    className="w-5 h-5 rounded-full"
                                                    style={{ backgroundColor: theme.secondary_color }}
                                                />
                                            </div>
                                            <p className="font-medium text-sm">{theme.name}</p>
                                        </button>
                                    ))}
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible >

                    {/* Lead Form */}


                    {/* Highlights */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Highlights</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    value={newHighlight}
                                    onChange={(e) => setNewHighlight(e.target.value)}
                                    placeholder="e.g., Free Shipping"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddHighlight()}
                                />
                                <Button onClick={handleAddHighlight} size="icon">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            {highlights.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {highlights.map((h, i) => (
                                        <Badge key={i} variant="secondary" className="pr-1">
                                            {h}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveHighlight(i)}
                                                className="ml-1 hover:text-red-500"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div >
            </div >
        </div >
    );
}
