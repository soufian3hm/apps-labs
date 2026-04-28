'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import type { ProductWithRelations, ProductTheme } from '@/types/supabase';
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
import { toast } from 'sonner';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Palette,
    FormInput,
    Eye,
    Loader2,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Tag,
    Boxes,
    Layers,
    Users,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface StoreData {
    id: string;
    name: string;
    currency_symbol: string;
    currency_position: 'before' | 'after';
    custom_domain?: string;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { themes, fetchThemes, fetchProducts, user } = useAppStore();
    const [product, setProduct] = useState<ProductWithRelations | null>(null);
    const [store, setStore] = useState<StoreData | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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
    const [media, setMedia] = useState<{ id?: string; url: string; alt?: string; type: 'image' | 'video' }[]>([]);

    // Category
    const [category, setCategory] = useState('');

    // Inventory
    const [trackInventory, setTrackInventory] = useState(false);
    const [sku, setSku] = useState('');
    const [quantity, setQuantity] = useState('');

    // Variants
    const [hasVariants, setHasVariants] = useState(false);
    const [variants, setVariants] = useState<{ name: string; values: string[] }[]>([
        { name: 'Size', values: ['Medium'] }
    ]);

    // Highlights
    const [highlights, setHighlights] = useState<string[]>([]);
    const [newHighlight, setNewHighlight] = useState('');

    // Lead Form
    const [formTitle, setFormTitle] = useState('Order Now');
    const [formSubtitle, setFormSubtitle] = useState('');
    const [submitButtonText, setSubmitButtonText] = useState('Submit Order');
    const [successMessage, setSuccessMessage] = useState('Thank you!');

    // Layout config
    const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(DEFAULT_LAYOUT);

    // Collapsible sections
    const [pricingOpen, setPricingOpen] = useState(true);
    const [inventoryOpen, setInventoryOpen] = useState(false);
    const [variantsOpen, setVariantsOpen] = useState(false);
    const [themeOpen, setThemeOpen] = useState(true);
    const [leadFormOpen, setLeadFormOpen] = useState(false);
    const [layoutOpen, setLayoutOpen] = useState(true);

    useEffect(() => {
        fetchThemes();
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        setIsLoading(true);
        const supabase = createClient();

        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                store:stores(id, name, currency_symbol, currency_position, custom_domain),
                theme:product_themes(*),
                images:product_images(*),
                specifications:product_specifications(*),
                lead_form_config:lead_form_configs(
                    *,
                    fields:lead_form_fields(*)
                )
            `)
            .eq('id', id)
            .single();

        if (error || !data) {
            toast.error('Product not found');
            router.push('/dashboard/products');
            return;
        }

        const productData = data as unknown as ProductWithRelations;
        setProduct(productData);
        setStore(data.store as StoreData);

        // Populate form
        setName(productData.name);
        setSlug(productData.slug);
        setDescription(productData.description || '');
        setShortDescription(productData.short_description || '');
        setPrice(productData.price.toString());
        setComparePrice(productData.compare_price?.toString() || '');
        setStatus(productData.status as 'draft' | 'published');
        setSelectedTheme(productData.theme || null);
        setHighlights(productData.highlights || []);
        setLayoutConfig((productData.layout_config as LayoutConfig) || DEFAULT_LAYOUT);

        // Media
        setMedia(productData.images?.map(img => ({
            id: img.id,
            url: img.url,
            alt: img.alt_text || '',
            type: 'image' as const,
        })) || []);

        // Lead form
        const formConfig = productData.lead_form_config;
        if (formConfig) {
            setFormTitle(formConfig.title);
            setFormSubtitle(formConfig.subtitle || '');
            setSubmitButtonText(formConfig.submit_button_text);
            setSuccessMessage(formConfig.success_message);
        }

        setIsLoading(false);
    };

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
        setVariants([...variants, { name: '', values: [''] }]);
    };

    const handleRemoveVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleVariantNameChange = (index: number, variantName: string) => {
        const newVariants = [...variants];
        newVariants[index].name = variantName;
        setVariants(newVariants);
    };

    const handleVariantValueChange = (variantIndex: number, valueIndex: number, value: string) => {
        const newVariants = [...variants];
        newVariants[variantIndex].values[valueIndex] = value;
        setVariants(newVariants);
    };

    const handleAddVariantValue = (variantIndex: number) => {
        const newVariants = [...variants];
        newVariants[variantIndex].values.push('');
        setVariants(newVariants);
    };

    const handleSave = async () => {
        if (!name || !price || !product) {
            toast.error('Please fill in product name and price');
            return;
        }

        setIsSaving(true);

        try {
            const supabase = createClient();

            // Update product
            const { error: productError } = await supabase
                .from('products')
                .update({
                    theme_id: selectedTheme?.id,
                    name,
                    slug,
                    description,
                    short_description: shortDescription,
                    price: parseFloat(price),
                    compare_price: comparePrice ? parseFloat(comparePrice) : null,
                    status,
                    highlights,
                    layout_config: layoutConfig,
                    seo_title: name,
                    seo_description: shortDescription,
                })
                .eq('id', product.id);

            if (productError) throw productError;

            // Handle media - delete removed, add new
            const existingIds = product.images?.map(img => img.id) || [];
            const currentIds = media.filter(m => m.id).map(m => m.id);

            // Delete removed images
            const toDelete = existingIds.filter(id => !currentIds.includes(id));
            if (toDelete.length > 0) {
                await supabase.from('product_images').delete().in('id', toDelete);
            }

            // Add new images
            const newImages = media.filter(m => !m.id);
            if (newImages.length > 0) {
                const imageInserts = newImages.map((img, index) => ({
                    product_id: product.id,
                    url: img.url,
                    alt_text: img.alt || name,
                    image_type: media.indexOf(img) === 0 ? 'hero' : 'gallery',
                    sort_order: media.indexOf(img),
                }));

                await supabase.from('product_images').insert(imageInserts);
            }

            // Update lead form config
            await supabase
                .from('lead_form_configs')
                .update({
                    title: formTitle,
                    subtitle: formSubtitle,
                    submit_button_text: submitButtonText,
                    success_message: successMessage,
                })
                .eq('product_id', product.id);

            toast.success('Product updated successfully!');
            await fetchProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Failed to update product');
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!product) {
        return null;
    }

    // Build preview URL
    const previewUrl = store?.custom_domain
        ? `/${store.custom_domain}/${product.slug}`
        : `/p/${product.slug}`;

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
                        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                        <p className="text-gray-500">{product.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={previewUrl} target="_blank">
                        <Button variant="outline" className="gap-2">
                            <Eye className="w-4 h-4" />
                            Preview
                            <ExternalLink className="w-3 h-3" />
                        </Button>
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
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">-</p>
                            <p className="text-sm text-gray-500">Total Leads</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <Eye className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{media.length}</p>
                            <p className="text-sm text-gray-500">Images</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <Badge
                            className={status === 'published' ? 'bg-emerald-500' : ''}
                        >
                            {status}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-2">Status</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content - Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title & Description */}
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-6 space-y-6">
                            {/* Title */}
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

                            {/* Description */}
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <RichTextEditor
                                    content={description}
                                    onChange={setDescription}
                                    placeholder="Describe your product in detail..."
                                />
                            </div>

                            {/* Media */}
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
                                                <Boxes className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">Inventory</CardTitle>
                                                <CardDescription>
                                                    {trackInventory ? 'Tracking inventory' : 'Not tracked'}
                                                </CardDescription>
                                            </div>
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
                                            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                                                <Layers className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">Variants</CardTitle>
                                                <CardDescription>Add options like size or color</CardDescription>
                                            </div>
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
                                            {variants.map((variant, vIndex) => (
                                                <div key={vIndex} className="p-4 bg-gray-50 rounded-xl space-y-3">
                                                    <div className="flex gap-3">
                                                        <div className="flex-1 space-y-2">
                                                            <Label>Option name</Label>
                                                            <Select
                                                                value={variant.name}
                                                                onValueChange={(v) => handleVariantNameChange(vIndex, v)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select option" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Size">Size</SelectItem>
                                                                    <SelectItem value="Color">Color</SelectItem>
                                                                    <SelectItem value="Material">Material</SelectItem>
                                                                    <SelectItem value="Style">Style</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveVariant(vIndex)}
                                                            className="mt-8"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-gray-500" />
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Option values</Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {variant.values.map((value, valIndex) => (
                                                                <Input
                                                                    key={valIndex}
                                                                    value={value}
                                                                    onChange={(e) => handleVariantValueChange(vIndex, valIndex, e.target.value)}
                                                                    placeholder="Value"
                                                                    className="w-32"
                                                                />
                                                            ))}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleAddVariantValue(vIndex)}
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <Button
                                                variant="outline"
                                                onClick={handleAddVariant}
                                                className="w-full"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add another option
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                </div>

                {/* Right Sidebar */}
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
                                <span className="px-3 py-2 bg-gray-100 border border-r-0 rounded-l-lg text-sm text-gray-500">
                                    {store?.custom_domain ? `/${store.custom_domain}/` : '/p/'}
                                </span>
                                <Input
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    placeholder="product-slug"
                                    className="rounded-l-none"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Layout Customizer */}
                    <LayoutCustomizer
                        value={layoutConfig}
                        onChange={setLayoutConfig}
                    />

                    {/* Theme */}
                    <Collapsible open={themeOpen} onOpenChange={setThemeOpen}>
                        <Card className="border-0 shadow-sm">
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                                                <Palette className="w-5 h-5 text-orange-600" />
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
                                                ? 'border-orange-500 bg-orange-50'
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
                    </Collapsible>

                    {/* Lead Form */}
                    <Collapsible open={leadFormOpen} onOpenChange={setLeadFormOpen}>
                        <Card className="border-0 shadow-sm">
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                <FormInput className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <CardTitle className="text-lg">Lead Form</CardTitle>
                                        </div>
                                        {leadFormOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Form Title</Label>
                                        <Input
                                            value={formTitle}
                                            onChange={(e) => setFormTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Submit Button</Label>
                                        <Input
                                            value={submitButtonText}
                                            onChange={(e) => setSubmitButtonText(e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>

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
                </div>
            </div>
        </div>
    );
}
