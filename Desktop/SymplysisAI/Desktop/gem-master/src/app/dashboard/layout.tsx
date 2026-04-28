'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { sanitizeSlug } from '@/lib/currencies';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/Logo';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sparkles,
    LayoutDashboard,
    Package,
    Users,
    Settings,
    LogOut,
    Plus,
    Store,
    Menu,
    ChevronDown,
    Bell,
    FileEdit,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Link as LinkIcon,
    Shield,
    Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/products', label: 'Products', icon: Package },
    { href: '/dashboard/leads', label: 'Leads', icon: Users },
    { href: '/dashboard/lead-form', label: 'Form Designer', icon: FileEdit },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { stores, currentStoreId, setCurrentStore, user } = useAppStore();

    return (
        <aside className={cn("flex flex-col h-full bg-white border-r border-gray-100", className)}>
            {/* Logo */}
            <div className="flex items-center px-6 py-4 border-b border-gray-100">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <Logo className="h-10" />

                </Link>
            </div>

            {/* Store Selector */}
            <div className="p-4 border-b border-gray-100">
                <Select value={currentStoreId || ''} onValueChange={setCurrentStore}>
                    <SelectTrigger className="w-full h-12 bg-gray-50 border-gray-200">
                        <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-gray-500" />
                            <SelectValue placeholder="Select a store" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {stores.map(store => (
                            <SelectItem key={store.id} value={store.id}>
                                {store.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-1">
                    {navItems.map(item => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                                        isActive
                                            ? "bg-orange-50 text-orange-700"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5", isActive && "text-orange-600")} />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
                    <Avatar className="w-9 h-9">
                        <AvatarImage src={user?.avatar_url || undefined} />
                        <AvatarFallback className="bg-orange-100 text-orange-700 font-medium">
                            {user?.name?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isAuthenticated, user, signOut, checkAuth, isLoading, stores, createStore, fetchStores } = useAppStore();
    const [mounted, setMounted] = useState(false);
    const [showStoreModal, setShowStoreModal] = useState(false);
    const [newStoreName, setNewStoreName] = useState('');
    const [newStoreUrl, setNewStoreUrl] = useState('');
    const [isCreatingStore, setIsCreatingStore] = useState(false);
    const [isCheckingDomain, setIsCheckingDomain] = useState(false);
    const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);

    // Debounced domain availability check
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (newStoreUrl && newStoreUrl.length >= 3) {
                setIsCheckingDomain(true);
                const supabase = createClient();
                const { data, error } = await supabase.rpc('check_domain_available', { domain_slug: newStoreUrl });
                if (!error) {
                    setDomainAvailable(data as boolean);
                } else {
                    setDomainAvailable(null);
                }
                setIsCheckingDomain(false);
            } else {
                setDomainAvailable(null);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [newStoreUrl]);

    useEffect(() => {
        setMounted(true);
        checkAuth();
    }, []);

    useEffect(() => {
        if (mounted && !isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.is_disabled) {
                router.push('/not-activated');
            }
        }
    }, [mounted, isLoading, isAuthenticated, user, router]);

    // Check if user has no stores after loading completes
    useEffect(() => {
        if (mounted && !isLoading && isAuthenticated && stores.length === 0) {
            setShowStoreModal(true);
        }
    }, [mounted, isLoading, isAuthenticated, stores.length]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    const handleCreateStore = async () => {
        if (!newStoreName.trim()) return;

        // Mandate URL check
        if (!newStoreUrl) {
            return;
        }

        if (domainAvailable === false) {
            return;
        }

        setIsCreatingStore(true);
        try {
            const store = await createStore(newStoreName.trim(), undefined, newStoreUrl);
            if (store) {
                setShowStoreModal(false);
                setNewStoreName('');
                setNewStoreUrl('');
                setDomainAvailable(null);
                await fetchStores();
            }
        } catch (error) {
            console.error('Error creating store:', error);
        } finally {
            setIsCreatingStore(false);
        }
    };

    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50/50 flex">
            {/* Store Creation Modal */}
            <Dialog open={showStoreModal} onOpenChange={(open) => {
                // Only allow closing if user has stores
                if (!open && stores.length > 0) {
                    setShowStoreModal(false);
                }
            }}>
                <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => {
                    // Prevent closing by clicking outside if no stores
                    if (stores.length === 0) {
                        e.preventDefault();
                    }
                }}>
                    <DialogHeader>
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-4">
                            <Store className="w-8 h-8 text-white" />
                        </div>
                        <DialogTitle className="text-center text-2xl">Create Your First Store</DialogTitle>
                        <DialogDescription className="text-center">
                            Get started by creating a store. You can add products and manage leads after setting up your store.
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
                                className="h-12"
                                disabled={isCreatingStore}
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
                                        className="h-12 pr-10"
                                        disabled={isCreatingStore}
                                        onKeyPress={(e) => e.key === 'Enter' && handleCreateStore()}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {isCheckingDomain ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                        ) : domainAvailable === true ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        ) : domainAvailable === false ? (
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                        ) : null}
                                    </div>
                                </div>
                                <span className="px-3 py-3 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg text-sm text-gray-500 h-12 flex items-center">
                                    .{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'gem-ecgb.vercel.app'}
                                </span>
                            </div>
                            {newStoreUrl && domainAvailable === false && (
                                <p className="text-xs text-red-500">This subdomain is already taken</p>
                            )}
                            {newStoreUrl && domainAvailable === true && (
                                <p className="text-xs text-green-500">
                                    ✓ Your store will be available at: <strong>{newStoreUrl}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'gem-ecgb.vercel.app'}</strong>
                                </p>
                            )}
                            <p className="text-xs text-gray-500">
                                Only letters, numbers, and hyphens allowed. This cannot be changed later.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleCreateStore}
                            disabled={isCreatingStore || !newStoreName.trim() || !newStoreUrl || domainAvailable !== true}
                            className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                        >
                            {isCreatingStore ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating Store...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Store
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Desktop Sidebar */}
            <Sidebar className="hidden lg:flex w-72 fixed left-0 top-0 bottom-0" />

            {/* Main Content */}
            <div className="flex-1 lg:ml-72">
                {/* Top Bar */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
                    <div className="flex items-center justify-between px-6 py-4">
                        {/* Mobile Menu */}
                        <Sheet>
                            <SheetTrigger asChild className="lg:hidden">
                                <Button variant="ghost" size="icon">
                                    <Menu className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-72">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SheetDescription className="sr-only">Main navigation sidebar for GEM dashboard</SheetDescription>
                                <Sidebar />
                            </SheetContent>
                        </Sheet>

                        <div className="hidden lg:block" />

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard/products/new">
                                <Button className="bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-[1.02] transition-all duration-200">
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Product
                                </Button>
                            </Link>

                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="w-5 h-5 text-gray-600" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={user?.avatar_url || undefined} />
                                            <AvatarFallback className="bg-orange-100 text-orange-700 font-medium text-sm">
                                                {user?.name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div>
                                            <p className="font-medium">{user?.name}</p>
                                            <p className="text-sm text-gray-500">{user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {user?.role === 'admin' && (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link href="/admin" className="text-orange-600 font-semibold">
                                                    <Shield className="w-4 h-4 mr-2" />
                                                    Admin Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/settings">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        className="text-red-600"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

