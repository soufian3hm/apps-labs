'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { CURRENCIES, sanitizeSlug } from '@/lib/currencies';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import {
    User,
    Store,
    Bell,
    Shield,
    Plus,
    Loader2,
    Check,
    Globe,
    DollarSign,
    Link as LinkIcon,
    AlertCircle,
    CheckCircle2,
    Send,
    MessageCircle,
    BarChart2,
    Trash2
} from 'lucide-react';

interface TikTokPixel {
    id: string;
    name: string;
    pixelId: string;
    accessToken: string;
    enabled: boolean;
}
import { toast } from 'sonner';

export default function SettingsPage() {
    const { user, stores, createStore, fetchStores, checkAuth } = useAppStore();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isSaving, setIsSaving] = useState(false);
    const [newStoreName, setNewStoreName] = useState('');
    const [newStoreUrl, setNewStoreUrl] = useState('');
    const [storeDialogOpen, setStoreDialogOpen] = useState(false);
    const [isCreatingStore, setIsCreatingStore] = useState(false);

    // Store settings
    const [selectedStore, setSelectedStore] = useState<string | null>(null);
    const [currencyCode, setCurrencyCode] = useState('USD');
    const [currencySymbol, setCurrencySymbol] = useState('$');
    const [currencyPosition, setCurrencyPosition] = useState<'before' | 'after'>('before');
    const [customDomain, setCustomDomain] = useState('');
    const [originalCustomDomain, setOriginalCustomDomain] = useState<string | null>(null);
    const [isCheckingDomain, setIsCheckingDomain] = useState(false);
    const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);
    const [isSavingStore, setIsSavingStore] = useState(false);

    // Telegram settings
    const [telegramBotToken, setTelegramBotToken] = useState('');
    const [telegramChatId, setTelegramChatId] = useState('');
    const [telegramEnabled, setTelegramEnabled] = useState(false);
    const [isSavingTelegram, setIsSavingTelegram] = useState(false);
    const [isTesting, setIsTesting] = useState(false);

    // Marketing settings (TikTok)
    const [tiktokPixels, setTikTokPixels] = useState<TikTokPixel[]>([]);
    const [isSavingMarketing, setIsSavingMarketing] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    useEffect(() => {
        if (stores.length > 0 && !selectedStore) {
            setSelectedStore(stores[0].id);
            loadStoreSettings(stores[0].id);
        }
    }, [stores]);

    const loadStoreSettings = async (storeId: string) => {
        const supabase = createClient();
        const { data } = await supabase
            .from('stores' as any)
            .select('*')
            .eq('id', storeId)
            .single();

        if (data) {
            setCurrencyCode(data.currency_code || 'USD');
            setCurrencySymbol(data.currency_symbol || '$');
            setCurrencyPosition((data.currency_position as 'before' | 'after') || 'before');
            setCustomDomain(data.custom_domain || '');
            setOriginalCustomDomain(data.custom_domain || null);
            setDomainAvailable(null);
            // Telegram settings
            setTelegramBotToken(data.telegram_bot_token || '');
            setTelegramChatId(data.telegram_chat_id || '');
            setTelegramEnabled(data.telegram_enabled || false);
            // Marketing settings
            setTikTokPixels(data.tiktok_pixels || []);
        }
    };

    const checkDomainAvailability = useCallback(async (slug: string) => {
        if (!slug || slug.length < 3) {
            setDomainAvailable(null);
            return;
        }

        setIsCheckingDomain(true);
        const supabase = createClient();

        const { data, error } = await supabase.rpc('check_domain_available', { domain_slug: slug });

        if (!error && data !== null) {
            // Also check if it's our own domain
            const currentStore = stores.find(s => s.id === selectedStore);
            if (currentStore?.custom_domain === slug) {
                setDomainAvailable(true);
            } else {
                setDomainAvailable(data as boolean);
            }
        }

        setIsCheckingDomain(false);
    }, [selectedStore, stores]);

    useEffect(() => {
        const sanitized = sanitizeSlug(customDomain);
        if (sanitized !== customDomain) {
            setCustomDomain(sanitized);
        }

        const timer = setTimeout(() => {
            if (sanitized) {
                checkDomainAvailability(sanitized);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [customDomain, checkDomainAvailability]);

    const handleSaveProfile = async () => {
        if (!user) return;

        setIsSaving(true);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('profiles')
                .update({ name })
                .eq('id', user.id);

            if (error) throw error;

            await checkAuth();
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveStoreSettings = async () => {
        if (!selectedStore) return;

        if (customDomain && domainAvailable === false) {
            toast.error('This URL is already taken');
            return;
        }

        setIsSavingStore(true);

        try {
            const supabase = createClient();

            const payload: any = {
                currency_code: currencyCode,
                currency_symbol: currencySymbol,
                currency_position: currencyPosition,
            };

            // Only allow setting custom_domain if it wasn't set before
            if (!originalCustomDomain && customDomain) {
                payload.custom_domain = customDomain;
            }

            const { error } = await supabase
                .from('stores' as any)
                .update(payload)
                .eq('id', selectedStore);

            if (error) throw error;

            await fetchStores();
            toast.success('Store settings saved');
        } catch (error) {
            console.error('Error saving store settings:', error);
            toast.error('Failed to save store settings');
        } finally {
            setIsSavingStore(false);
        }
    };

    const handleCreateStore = async () => {
        if (!newStoreName) return;

        const sanitizedUrl = sanitizeSlug(newStoreUrl);

        // Check URL availability if provided
        if (sanitizedUrl) {
            const supabase = createClient();
            const { data } = await supabase.rpc('check_domain_available', { domain_slug: sanitizedUrl });
            if (!data) {
                toast.error('This store URL is already taken');
                return;
            }
        }

        setIsCreatingStore(true);

        try {
            const supabase = createClient();
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (!authUser) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('stores')
                .insert({
                    owner_id: authUser.id,
                    name: newStoreName,
                    slug: sanitizedUrl || newStoreName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    custom_domain: sanitizedUrl || null,
                });

            if (error) throw error;

            await fetchStores();
            toast.success('Store created successfully');
            setNewStoreName('');
            setNewStoreUrl('');
            setStoreDialogOpen(false);
        } catch (error) {
            console.error('Error creating store:', error);
            toast.error('Failed to create store');
        } finally {
            setIsCreatingStore(false);
        }
    };

    const handleSaveTelegram = async () => {
        if (!selectedStore) return;

        setIsSavingTelegram(true);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('stores' as any)
                .update({
                    telegram_bot_token: telegramBotToken || null,
                    telegram_chat_id: telegramChatId || null,
                    telegram_enabled: telegramEnabled,
                })
                .eq('id', selectedStore);

            if (error) throw error;

            await fetchStores();
            toast.success('Telegram settings saved');
        } catch (error) {
            console.error('Error saving Telegram settings:', error);
            toast.error('Failed to save Telegram settings');
        } finally {
            setIsSavingTelegram(false);
        }
    };

    const handleTestTelegram = async () => {
        if (!telegramBotToken || !telegramChatId) {
            toast.error('Please enter bot token and chat ID first');
            return;
        }

        setIsTesting(true);

        try {
            const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: telegramChatId,
                    text: '✅ *Test Notification*\n\nYour Telegram integration is working correctly!\n\n🏪 GEM',
                    parse_mode: 'Markdown',
                }),
            });

            const result = await response.json();

            if (result.ok) {
                toast.success('Test message sent! Check your Telegram.');
            } else {
                toast.error(`Telegram error: ${result.description}`);
            }
        } catch (error) {
            console.error('Telegram test error:', error);
            toast.error('Failed to send test message');
        } finally {
            setIsTesting(false);
        }
    };

    const handleSaveMarketing = async () => {
        if (!selectedStore) return;

        setIsSavingMarketing(true);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('stores' as any)
                .update({ tiktok_pixels: tiktokPixels })
                .eq('id', selectedStore);

            if (error) throw error;

            toast.success('Marketing settings saved');
        } catch (error) {
            console.error('Error saving marketing settings:', error);
            toast.error('Failed to save marketing settings');
        } finally {
            setIsSavingMarketing(false);
        }
    };


    const handleCurrencyChange = (code: string) => {
        setCurrencyCode(code);
        const currency = CURRENCIES.find(c => c.code === code);
        if (currency) {
            setCurrencySymbol(currency.symbol);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account and store preferences</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="store">Store Settings</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="marketing">Marketing</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Profile</CardTitle>
                                    <CardDescription>Manage your personal information</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        disabled
                                        className="h-12 bg-gray-50"
                                    />
                                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Card */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Security</CardTitle>
                                    <CardDescription>Manage your security settings</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium">Change Password</p>
                                    <p className="text-sm text-gray-500">Update your password regularly</p>
                                </div>
                                <Button variant="outline" size="sm">Change</Button>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium">Two-Factor Authentication</p>
                                    <p className="text-sm text-gray-500">Add extra security</p>
                                </div>
                                <Badge variant="secondary">Coming Soon</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Store Settings Tab */}
                <TabsContent value="store" className="space-y-6">
                    {/* Store Selection */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                    <Store className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Your Stores</CardTitle>
                                    <CardDescription>Select a store to configure</CardDescription>
                                </div>
                            </div>
                            <Dialog open={storeDialogOpen} onOpenChange={setStoreDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Store
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Store</DialogTitle>
                                        <DialogDescription>
                                            Add a new store to organize your products.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="storeName">Store Name</Label>
                                            <Input
                                                id="storeName"
                                                value={newStoreName}
                                                onChange={(e) => setNewStoreName(e.target.value)}
                                                placeholder="e.g., My Electronics Store"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="storeUrl">Store URL (optional)</Label>
                                            <div className="flex items-center">
                                                <span className="px-3 py-2 bg-gray-100 border border-r-0 rounded-l-lg text-sm text-gray-500">
                                                    storify.com/
                                                </span>
                                                <Input
                                                    id="storeUrl"
                                                    value={newStoreUrl}
                                                    onChange={(e) => setNewStoreUrl(sanitizeSlug(e.target.value))}
                                                    placeholder="my-store"
                                                    className="rounded-l-none"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Leave empty if using non-English name. Only letters, numbers, and hyphens.
                                            </p>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setStoreDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleCreateStore}
                                            disabled={isCreatingStore || !newStoreName}
                                        >
                                            {isCreatingStore ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                'Create Store'
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            {stores.length === 0 ? (
                                <div className="text-center py-8">
                                    <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No stores yet. Create your first store.</p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {stores.map(store => (
                                        <button
                                            key={store.id}
                                            onClick={() => {
                                                setSelectedStore(store.id);
                                                loadStoreSettings(store.id);
                                            }}
                                            className={`px-4 py-2 rounded-xl transition-all ${selectedStore === store.id
                                                ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                                                : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-200'
                                                }`}
                                        >
                                            {store.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {selectedStore && (
                        <>
                            {/* Currency Settings */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Currency</CardTitle>
                                            <CardDescription>Set your store's currency and display format</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Currency</Label>
                                            <Select value={currencyCode} onValueChange={handleCurrencyChange}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[300px]">
                                                    {CURRENCIES.map(c => (
                                                        <SelectItem key={c.code} value={c.code}>
                                                            {c.symbol} - {c.name} ({c.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Custom Symbol (optional)</Label>
                                            <Input
                                                value={currencySymbol}
                                                onChange={(e) => setCurrencySymbol(e.target.value)}
                                                placeholder="e.g., دينار or DZD"
                                            />
                                            <p className="text-xs text-gray-500">
                                                You can write anything: DZD, دينار, $, etc.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Symbol Position</Label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setCurrencyPosition('before')}
                                                className={`flex-1 p-3 rounded-xl border-2 transition-all text-center ${currencyPosition === 'before'
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <p className="font-medium">{currencySymbol}100.00</p>
                                                <p className="text-xs text-gray-500">Before price</p>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCurrencyPosition('after')}
                                                className={`flex-1 p-3 rounded-xl border-2 transition-all text-center ${currencyPosition === 'after'
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <p className="font-medium">100.00 {currencySymbol}</p>
                                                <p className="text-xs text-gray-500">After price</p>
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Store URL */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                            <Globe className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Store URL</CardTitle>
                                            <CardDescription>Your products will be available at this URL</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Custom URL</Label>
                                        <div className="flex items-center">
                                            <span className={`px-3 py-2.5 border border-r-0 rounded-l-lg text-sm ${originalCustomDomain ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-gray-100 text-gray-500'}`}>
                                                storify.com/
                                            </span>
                                            <div className="relative flex-1">
                                                <Input
                                                    value={customDomain}
                                                    onChange={(e) => setCustomDomain(e.target.value)}
                                                    placeholder="my-store"
                                                    className="rounded-l-none pr-10"
                                                    disabled={!!originalCustomDomain}
                                                />
                                                {customDomain && !originalCustomDomain && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        {isCheckingDomain ? (
                                                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                                        ) : domainAvailable === true ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        ) : domainAvailable === false ? (
                                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                                        ) : null}
                                                    </div>
                                                )}
                                                {originalCustomDomain && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        <Shield className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {customDomain && domainAvailable === false && !originalCustomDomain && (
                                            <p className="text-xs text-red-500">This URL is already taken</p>
                                        )}
                                        {customDomain && domainAvailable === true && !originalCustomDomain && (
                                            <p className="text-xs text-green-500">This URL is available!</p>
                                        )}
                                        {originalCustomDomain ? (
                                            <p className="text-xs text-amber-600 font-medium flex items-center gap-1.5">
                                                <Shield className="w-3 h-3" />
                                                Store URL cannot be changed once set.
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-500">
                                                Only English letters, numbers, and hyphens allowed
                                            </p>
                                        )}
                                    </div>

                                    {customDomain && (
                                        <div className="p-3 bg-gray-50 rounded-xl">
                                            <p className="text-sm text-gray-600">
                                                <LinkIcon className="w-4 h-4 inline mr-1" />
                                                Your store URL: <span className="font-medium">storify.com/{customDomain}</span>
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Save Button */}
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSaveStoreSettings}
                                    disabled={isSavingStore || (Boolean(customDomain) && domainAvailable === false)}
                                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                                >
                                    {isSavingStore ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Save Store Settings
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Notifications</CardTitle>
                                    <CardDescription>Configure your notification preferences</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium">Email Notifications</p>
                                    <p className="text-sm text-gray-500">Receive email when you get new leads</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium">Weekly Reports</p>
                                    <p className="text-sm text-gray-500">Get weekly summary of your leads</p>
                                </div>
                                <Switch />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium">Marketing Updates</p>
                                    <p className="text-sm text-gray-500">Receive updates about new features</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Telegram Integration */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <MessageCircle className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-lg">Telegram Notifications</CardTitle>
                                    <CardDescription>Get instant order notifications on Telegram</CardDescription>
                                </div>
                                <Switch
                                    checked={telegramEnabled}
                                    onCheckedChange={setTelegramEnabled}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!selectedStore ? (
                                <p className="text-sm text-gray-500">Select a store in the Store Settings tab first.</p>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="botToken">Bot Token</Label>
                                        <Input
                                            id="botToken"
                                            type="password"
                                            value={telegramBotToken}
                                            onChange={(e) => setTelegramBotToken(e.target.value)}
                                            placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
                                            className="font-mono text-sm"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Get this from <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">@BotFather</a> on Telegram
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="chatId">Chat ID</Label>
                                        <Input
                                            id="chatId"
                                            value={telegramChatId}
                                            onChange={(e) => setTelegramChatId(e.target.value)}
                                            placeholder="-1001234567890 or 123456789"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Get your ID from <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">@userinfobot</a> or use a group chat ID
                                        </p>
                                    </div>
                                    <Separator />
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={handleTestTelegram}
                                            disabled={isTesting || !telegramBotToken || !telegramChatId}
                                        >
                                            {isTesting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Test Notification
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={handleSaveTelegram}
                                            disabled={isSavingTelegram}
                                            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                                        >
                                            {isSavingTelegram ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Save Telegram Settings
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Marketing Tab */}
                <TabsContent value="marketing" className="space-y-6">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                                    <BarChart2 className="w-5 h-5 text-pink-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">TikTok Pixel Integration</CardTitle>
                                    <CardDescription>Install standard tracking pixels and events API</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {!selectedStore ? (
                                <p className="text-sm text-gray-500">Select a store in the Store Settings tab first.</p>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        {tiktokPixels.map((pixel, index) => (
                                            <div key={pixel.id} className="p-4 bg-gray-50 rounded-xl space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                value={pixel.name}
                                                                onChange={(e) => {
                                                                    const newPixels = [...tiktokPixels];
                                                                    newPixels[index].name = e.target.value;
                                                                    setTikTokPixels(newPixels);
                                                                }}
                                                                placeholder="Pixel Name (e.g. Main Pixel)"
                                                                className="h-8 text-sm font-medium w-48 bg-white"
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                <Label className="text-xs text-gray-500">Active</Label>
                                                                <Switch
                                                                    checked={pixel.enabled}
                                                                    onCheckedChange={(checked) => {
                                                                        const newPixels = [...tiktokPixels];
                                                                        newPixels[index].enabled = checked;
                                                                        setTikTokPixels(newPixels);
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newPixels = tiktokPixels.filter((_, i) => i !== index);
                                                            setTikTokPixels(newPixels);
                                                        }}
                                                        className="text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Pixel ID</Label>
                                                        <Input
                                                            value={pixel.pixelId}
                                                            onChange={(e) => {
                                                                const newPixels = [...tiktokPixels];
                                                                newPixels[index].pixelId = e.target.value;
                                                                setTikTokPixels(newPixels);
                                                            }}
                                                            placeholder="CXXXXXXXXXXXXXX"
                                                            className="bg-white font-mono text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Access Token (Optional - for API)</Label>
                                                        <Input
                                                            value={pixel.accessToken}
                                                            onChange={(e) => {
                                                                const newPixels = [...tiktokPixels];
                                                                newPixels[index].accessToken = e.target.value;
                                                                setTikTokPixels(newPixels);
                                                            }}
                                                            type="password"
                                                            placeholder="Events API Access Token"
                                                            className="bg-white font-mono text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <Button
                                            variant="outline"
                                            className="w-full border-dashed"
                                            onClick={() => {
                                                setTikTokPixels([
                                                    ...tiktokPixels,
                                                    {
                                                        id: crypto.randomUUID(),
                                                        name: `Pixel ${tiktokPixels.length + 1}`,
                                                        pixelId: '',
                                                        accessToken: '',
                                                        enabled: true
                                                    }
                                                ]);
                                            }}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Another Pixel
                                        </Button>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button
                                            onClick={handleSaveMarketing}
                                            disabled={isSavingMarketing}
                                            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                                        >
                                            {isSavingMarketing ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Save Marketing Settings
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
