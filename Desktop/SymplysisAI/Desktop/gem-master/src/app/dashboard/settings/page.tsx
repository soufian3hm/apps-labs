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
    Trash2,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';

interface TikTokPixel {
    id: string;
    name: string;
    pixelId: string;
    accessToken: string;
    enabled: boolean;
}
import { toast } from 'sonner';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';

export default function SettingsPage() {
    const { user, stores, createStore, fetchStores, checkAuth } = useAppStore();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isSaving, setIsSaving] = useState(false);
    const [newStoreName, setNewStoreName] = useState('');
    const [newStoreUrl, setNewStoreUrl] = useState('');
    const [storeDialogOpen, setStoreDialogOpen] = useState(false);
    const [isCreatingStore, setIsCreatingStore] = useState(false);
    const [isCheckingNewStoreUrl, setIsCheckingNewStoreUrl] = useState(false);
    const [newStoreUrlAvailable, setNewStoreUrlAvailable] = useState<boolean | null>(null);

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

    // Password change
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Marketing settings (TikTok)
    const [tiktokPixels, setTikTokPixels] = useState<TikTokPixel[]>([]);
    const [isSavingMarketing, setIsSavingMarketing] = useState(false);

    // Loading state for store settings
    const [isSettingsLoading, setIsSettingsLoading] = useState(true);

    // Delete store state
    const [isDeleteStoreDialogOpen, setIsDeleteStoreDialogOpen] = useState(false);
    const [deleteStoreNameConfirmation, setDeleteStoreNameConfirmation] = useState('');
    const [isDeletingStore, setIsDeletingStore] = useState(false);

    // Change Trackers
    const profileTracker = useUnsavedChanges({ name }, !user);
    const storeTracker = useUnsavedChanges({
        currencyCode,
        currencySymbol,
        currencyPosition,
        customDomain
    }, isSettingsLoading);
    const telegramTracker = useUnsavedChanges({
        telegramBotToken,
        telegramChatId,
        telegramEnabled
    }, isSettingsLoading);
    const marketingTracker = useUnsavedChanges({ tiktokPixels }, isSettingsLoading);

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

    // Check new store URL availability
    useEffect(() => {
        if (!newStoreUrl || newStoreUrl.length < 3) {
            setNewStoreUrlAvailable(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIsCheckingNewStoreUrl(true);
            const supabase = createClient();
            const { data } = await supabase.rpc('check_domain_available', { domain_slug: newStoreUrl });
            setNewStoreUrlAvailable(data as boolean);
            setIsCheckingNewStoreUrl(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [newStoreUrl]);

    const loadStoreSettings = async (storeId: string) => {
        setIsSettingsLoading(true);
        const supabase = createClient();
        const { data } = await supabase
            .from('stores')
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
            setTikTokPixels((data.tiktok_pixels as unknown as TikTokPixel[]) || []);
        }
        setIsSettingsLoading(false);
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
            profileTracker.resetDiff();
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
            storeTracker.resetDiff();
        } catch (error) {
            console.error('Error saving store settings:', error);
            toast.error('Failed to save store settings');
        } finally {
            setIsSavingStore(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsChangingPassword(true);

        try {
            const supabase = createClient();

            // First, verify the current password by re-authenticating
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user?.email || '',
                password: currentPassword
            });

            if (signInError) {
                toast.error('Current password is incorrect');
                setIsChangingPassword(false);
                return;
            }

            // Now update to new password
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            toast.success('Password changed successfully');
            setPasswordDialogOpen(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            toast.error(error.message || 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
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
                    user_id: authUser.id,
                    name: newStoreName,
                    slug: sanitizedUrl || newStoreName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    custom_domain: sanitizedUrl || null,
                });

            if (error) throw error;

            await fetchStores();
            toast.success('Store created successfully');
            setNewStoreName('');
            setNewStoreUrl('');
            setNewStoreUrlAvailable(null);
            setStoreDialogOpen(false);
        } catch (error) {
            console.error('Error creating store:', error);
            toast.error('Failed to create store');
        } finally {
            setIsCreatingStore(false);
        }
    };

    // Toggle telegram enabled and save immediately
    const handleToggleTelegram = async (enabled: boolean) => {
        if (!selectedStore) return;

        setTelegramEnabled(enabled);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('stores' as any)
                .update({ telegram_enabled: enabled })
                .eq('id', selectedStore);

            if (error) throw error;

            toast.success(enabled ? 'Telegram notifications enabled' : 'Telegram notifications disabled');
            telegramTracker.resetDiff();
        } catch (error) {
            console.error('Error toggling Telegram:', error);
            toast.error('Failed to update Telegram status');
            // Revert on error
            setTelegramEnabled(!enabled);
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
            telegramTracker.resetDiff();
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
            marketingTracker.resetDiff();
        } catch (error) {
            console.error('Error saving marketing settings:', error);
            toast.error('Failed to save marketing settings');
        } finally {
            setIsSavingMarketing(false);
        }
    };

    const handleDeleteStore = async () => {
        if (!selectedStore) return;

        const storeToDelete = stores.find(s => s.id === selectedStore);
        if (!storeToDelete) return;

        if (deleteStoreNameConfirmation !== storeToDelete.name) {
            toast.error('Store name does not match');
            return;
        }

        setIsDeletingStore(true);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('stores')
                .delete()
                .eq('id', selectedStore);

            if (error) throw error;

            toast.success('Store deleted successfully');
            setIsDeleteStoreDialogOpen(false);
            setDeleteStoreNameConfirmation('');

            // Clear selection so the effect can pick the next available store
            setSelectedStore(null);
            await fetchStores();

        } catch (error) {
            console.error('Error deleting store:', error);
            toast.error('Failed to delete store');
        } finally {
            setIsDeletingStore(false);
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
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account and store preferences</p>
            </div>

            {/* Store Selector - Always Visible */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-50 to-amber-50">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                <Store className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Current Store</p>
                                <p className="text-sm text-gray-500">Select a store to configure its settings</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {stores.length === 0 ? (
                                <p className="text-sm text-gray-500">No stores yet</p>
                            ) : (
                                stores.map(store => (
                                    <button
                                        key={store.id}
                                        onClick={() => {
                                            setSelectedStore(store.id);
                                            loadStoreSettings(store.id);
                                        }}
                                        className={`px-4 py-2 rounded-xl transition-all font-medium ${selectedStore === store.id
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                                            }`}
                                    >
                                        {store.name}
                                    </button>
                                ))
                            )}
                            <Dialog open={storeDialogOpen} onOpenChange={setStoreDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="border-dashed border-orange-300 text-orange-600 hover:bg-orange-50">
                                        <Plus className="w-4 h-4 mr-1" />
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
                                            <Label htmlFor="storeUrl">Store Subdomain</Label>
                                            <div className="flex items-center">
                                                <div className="relative flex-1">
                                                    <Input
                                                        id="storeUrl"
                                                        value={newStoreUrl}
                                                        onChange={(e) => setNewStoreUrl(sanitizeSlug(e.target.value))}
                                                        placeholder="my-store"
                                                        className={`rounded-r-none pr-10 ${newStoreUrl.length >= 3 ? (newStoreUrlAvailable === true ? 'border-green-500 focus-visible:ring-green-500' : newStoreUrlAvailable === false ? 'border-red-500 focus-visible:ring-red-500' : '') : ''}`}
                                                    />
                                                    {newStoreUrl.length >= 3 && (
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                            {isCheckingNewStoreUrl ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                                            ) : newStoreUrlAvailable === true ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                            ) : newStoreUrlAvailable === false ? (
                                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                                            ) : null}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r-lg text-sm text-gray-500 whitespace-nowrap">
                                                    .{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'gem-ecgb.vercel.app'}
                                                </span>
                                            </div>
                                            {newStoreUrl.length >= 3 && newStoreUrlAvailable === false && (
                                                <p className="text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    This URL is already taken
                                                </p>
                                            )}
                                            {newStoreUrl.length >= 3 && newStoreUrlAvailable === true && (
                                                <p className="text-xs text-green-600 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    This URL is available!
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                Only letters, numbers, and hyphens. Min 3 characters.
                                            </p>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => {
                                            setStoreDialogOpen(false);
                                            setNewStoreName('');
                                            setNewStoreUrl('');
                                            setNewStoreUrlAvailable(null);
                                        }}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleCreateStore}
                                            disabled={isCreatingStore || !newStoreName || (newStoreUrl.length >= 3 && newStoreUrlAvailable === false)}
                                            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
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
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="store">Store Settings</TabsTrigger>
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
                                <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Lock className="w-4 h-4 mr-2" />
                                            Change
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-2">
                                                <Lock className="w-7 h-7 text-amber-600" />
                                            </div>
                                            <DialogTitle className="text-center">Change Password</DialogTitle>
                                            <DialogDescription className="text-center">
                                                Enter your current and new password
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="currentPassword">Current Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="currentPassword"
                                                        type={showCurrentPassword ? 'text' : 'password'}
                                                        value={currentPassword}
                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                        placeholder="Enter current password"
                                                        className="pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="space-y-2">
                                                <Label htmlFor="newPassword">New Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="newPassword"
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="Enter new password"
                                                        className="pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm new password"
                                                />
                                            </div>
                                            {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                                <p className="text-sm text-red-500">Passwords do not match</p>
                                            )}
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setPasswordDialogOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleChangePassword}
                                                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                                                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                                            >
                                                {isChangingPassword ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Changing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4 mr-2" />
                                                        Change Password
                                                    </>
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
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
                    {selectedStore && (
                        <>
                            {/* Store URL Info */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                            <Globe className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Store URL</CardTitle>
                                            <CardDescription>Your store's public link</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {(() => {
                                        const currentStore = stores.find(s => s.id === selectedStore);
                                        const subdomain = currentStore?.custom_domain;
                                        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'gem-ecgb.vercel.app';

                                        if (subdomain) {
                                            const fullUrl = `https://${subdomain}.${rootDomain}`;
                                            return (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                                        <LinkIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                        <a
                                                            href={fullUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 font-medium hover:text-blue-700 truncate"
                                                        >
                                                            {fullUrl}
                                                        </a>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(fullUrl);
                                                                toast.success('URL copied to clipboard!');
                                                            }}
                                                            className="ml-auto flex-shrink-0"
                                                        >
                                                            Copy
                                                        </Button>
                                                    </div>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                        Subdomain is active and ready to use
                                                    </p>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                                                    <p className="text-sm text-amber-700">
                                                        No subdomain set for this store. Products are accessible via the old URL format.
                                                    </p>
                                                </div>
                                            );
                                        }
                                    })()}
                                </CardContent>
                            </Card>

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
                                        <Label>Custom Subdomain</Label>
                                        <div className="flex items-center">
                                            <div className="relative flex-1">
                                                <Input
                                                    value={customDomain}
                                                    onChange={(e) => setCustomDomain(e.target.value)}
                                                    placeholder="my-store"
                                                    className="rounded-r-none"
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
                                            <span className={`px-3 py-2.5 border border-l-0 rounded-r-lg text-sm whitespace-nowrap ${originalCustomDomain ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-gray-100 text-gray-500'}`}>
                                                .{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'qrified.app'}
                                            </span>
                                        </div>
                                        {customDomain && domainAvailable === false && !originalCustomDomain && (
                                            <p className="text-xs text-red-500">This subdomain is already taken</p>
                                        )}
                                        {customDomain && domainAvailable === true && !originalCustomDomain && (
                                            <p className="text-xs text-green-500">This subdomain is available!</p>
                                        )}
                                        {originalCustomDomain ? (
                                            <p className="text-xs text-amber-600 font-medium flex items-center gap-1.5">
                                                <Shield className="w-3 h-3" />
                                                Store Subdomain cannot be changed once set.
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
                                                Your store URL: <span className="font-medium">{customDomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'qrified.app'}</span>
                                            </p>
                                        </div>
                                    )}
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
                                            onCheckedChange={handleToggleTelegram}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
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

                            {/* Danger Zone */}
                            <Card className="border-red-200 shadow-sm bg-red-50/50">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg text-red-700">Danger Zone</CardTitle>
                                            <CardDescription className="text-red-600/80">Irreversible actions for this store</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white border border-red-100 rounded-xl">
                                        <div>
                                            <p className="font-medium text-gray-900">Delete Store</p>
                                            <p className="text-sm text-gray-500">
                                                Permanently delete this store and all its data (products, orders, settings).
                                                <br />
                                                <span className="font-medium text-red-600">This action cannot be undone.</span>
                                            </p>
                                        </div>
                                        <Dialog open={isDeleteStoreDialogOpen} onOpenChange={setIsDeleteStoreDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="destructive">
                                                    Delete Store
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle className="text-red-600 flex items-center gap-2">
                                                        <AlertCircle className="w-5 h-5" />
                                                        Delete Store
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        This will permanently delete <strong>{stores.find(s => s.id === selectedStore)?.name}</strong> and remove:
                                                        <ul className="list-disc pl-5 mt-2 space-y-1">
                                                            <li>All products and variants</li>
                                                            <li>All orders and customers</li>
                                                            <li>Store configuration and themes</li>
                                                            <li>Marketing pixels and integrations</li>
                                                        </ul>
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="py-4 space-y-4 intro-y">
                                                    <Label>
                                                        To confirm, type <span className="font-bold text-gray-900">{stores.find(s => s.id === selectedStore)?.name}</span> below:
                                                    </Label>
                                                    <Input
                                                        value={deleteStoreNameConfirmation}
                                                        onChange={(e) => setDeleteStoreNameConfirmation(e.target.value)}
                                                        placeholder="Type store name"
                                                        className="border-red-200 focus-visible:ring-red-500"
                                                    />
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => setIsDeleteStoreDialogOpen(false)}
                                                        disabled={isDeletingStore}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={handleDeleteStore}
                                                        disabled={isDeletingStore || deleteStoreNameConfirmation !== stores.find(s => s.id === selectedStore)?.name}
                                                    >
                                                        {isDeletingStore ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Deleting...
                                                            </>
                                                        ) : (
                                                            'Delete Store'
                                                        )}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
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
