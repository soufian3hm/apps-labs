'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Package,
    Users,
    TrendingUp,
    Plus,
    ExternalLink,
    ArrowRight,
    Sparkles,
    FileText,
    Loader2,
    Box
} from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
    const {
        user,
        products,
        leads,
        currentStoreId,
        fetchProducts,
        fetchLeads,
        stores
    } = useAppStore();

    useEffect(() => {
        if (currentStoreId) {
            fetchProducts();
            fetchLeads();
        }
    }, [currentStoreId]);

    const currentStore = stores.find(s => s.id === currentStoreId);
    const publishedProducts = products.filter(p => p.status === 'published');
    const recentProducts = products.slice(0, 5);
    const recentLeads = leads.slice(0, 5);

    const conversionRate = products.length > 0 && leads.length > 0
        ? ((leads.length / (publishedProducts.length * 100)) * 100).toFixed(1)
        : '0';

    const stats = [
        {
            title: 'Total Products',
            value: products.length,
            icon: Package,
            change: '+12%',
            color: 'orange',
        },
        {
            title: 'Total Leads',
            value: leads.length,
            icon: Users,
            change: '+18%',
            color: 'emerald',
        },
        {
            title: 'Published',
            value: publishedProducts.length,
            icon: TrendingUp,
            change: '+5%',
            color: 'amber',
        },
        {
            title: 'Conversion Rate',
            value: `${conversionRate}%`,
            icon: Sparkles,
            change: '+2.5%',
            color: 'amber',
        },
    ];

    const colorClasses = {
        indigo: 'bg-indigo-100 text-indigo-600',
        emerald: 'bg-emerald-100 text-emerald-600',
        purple: 'bg-purple-100 text-purple-600',
        amber: 'bg-amber-100 text-amber-600',
        orange: 'bg-orange-100 text-orange-600',
    };

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Here's what's happening with {currentStore?.name || 'your store'} today.
                    </p>
                </div>
                <Link href="/dashboard/products/new">
                    <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-md shadow-orange-500/20">
                        <Plus className="w-4 h-4 mr-2" />
                        New Product
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-0 shadow-sm hover-lift">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl ${colorClasses[stat.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <span className="text-emerald-600 font-medium">{stat.change}</span>
                                <span className="text-gray-500 ml-2">from last month</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Products */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold">Recent Products</CardTitle>
                        <Link href="/dashboard/products">
                            <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                                View all
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentProducts.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-orange-600" />
                                </div>
                                <p className="text-gray-500 mb-4">No products yet</p>
                                <Link href="/dashboard/products/new">
                                    <Button size="sm">Create your first product</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentProducts.map(product => (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                            {product.images?.[0] ? (
                                                <img
                                                    src={product.images[0].url}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{product.name}</p>
                                            <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                                        </div>
                                        <Badge
                                            variant={product.status === 'published' ? 'default' : 'secondary'}
                                            className={product.status === 'published' ? 'bg-emerald-500' : ''}
                                        >
                                            {product.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions & Recent Leads */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <Link href="/dashboard/products/new">
                                <div className="p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 transition-colors cursor-pointer group">
                                    <Plus className="w-6 h-6 text-orange-600 mb-2" />
                                    <p className="font-medium text-gray-900">New Product</p>
                                    <p className="text-sm text-gray-500">Create a landing page</p>
                                </div>
                            </Link>
                            <Link href="/dashboard/leads">
                                <div className="p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors cursor-pointer group">
                                    <FileText className="w-6 h-6 text-emerald-600 mb-2" />
                                    <p className="font-medium text-gray-900">View Leads</p>
                                    <p className="text-sm text-gray-500">Check submissions</p>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Recent Leads */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-semibold">Recent Leads</CardTitle>
                            <Link href="/dashboard/leads">
                                <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                                    View all
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {recentLeads.length === 0 ? (
                                <div className="text-center py-6">
                                    <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">No leads yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentLeads.map(lead => {
                                        const formData = lead.form_data as Record<string, string>;
                                        const productName = products.find(p => p.id === lead.product_id)?.name;
                                        const displayName = formData.fullName || formData.name || 'Unknown';

                                        return (
                                            <div
                                                key={lead.id}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                                    <span className="text-orange-700 font-medium">
                                                        {displayName.charAt(0).toUpperCase() || '?'}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {displayName}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {productName || 'Unknown product'}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-gray-400">
                                                    {format(new Date(lead.submitted_at), 'MMM d')}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
