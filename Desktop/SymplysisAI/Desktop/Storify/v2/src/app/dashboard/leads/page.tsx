'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Search,
    Download,
    Users,
    CheckCircle,
    Clock,
    Package
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function LeadsPage() {
    const { leads, products, fetchLeads, fetchProducts, currentStoreId } = useAppStore();
    const [search, setSearch] = useState('');
    const [productFilter, setProductFilter] = useState<string>('all');

    useEffect(() => {
        if (currentStoreId) {
            fetchProducts().then(() => fetchLeads());
        }
    }, [currentStoreId]);

    const filteredLeads = leads.filter(lead => {
        const formData = lead.form_data as Record<string, string>;
        const matchesSearch =
            formData.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            formData.phone?.includes(search) ||
            formData.city?.toLowerCase().includes(search.toLowerCase());
        const matchesProduct = productFilter === 'all' || lead.product_id === productFilter;
        return matchesSearch && matchesProduct;
    });

    const syncedLeads = leads.filter(l => l.synced_to_sheet).length;
    const pendingLeads = leads.filter(l => !l.synced_to_sheet).length;

    const stats = [
        {
            title: 'Total Leads',
            value: leads.length,
            icon: Users,
            color: 'orange',
        },
        {
            title: 'Synced',
            value: syncedLeads,
            icon: CheckCircle,
            color: 'emerald',
        },
        {
            title: 'Pending Sync',
            value: pendingLeads,
            icon: Clock,
            color: 'amber',
        },
    ];

    const colorClasses = {
        indigo: 'bg-indigo-100 text-indigo-600',
        orange: 'bg-orange-100 text-orange-600',
        emerald: 'bg-emerald-100 text-emerald-600',
        amber: 'bg-amber-100 text-amber-600',
    };

    const handleExportCSV = () => {
        if (filteredLeads.length === 0) {
            toast.error('No leads to export');
            return;
        }

        const headers = ['Name', 'Phone', 'City', 'Municipality', 'Product', 'Date', 'Status'];
        const rows = filteredLeads.map(lead => {
            const formData = lead.form_data as Record<string, string>;
            const product = products.find(p => p.id === lead.product_id);
            return [
                formData.fullName || '',
                formData.phone || '',
                formData.city || '',
                formData.municipality || '',
                product?.name || '',
                format(new Date(lead.submitted_at), 'yyyy-MM-dd HH:mm'),
                lead.synced_to_sheet ? 'Synced' : 'Pending',
            ];
        });

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Leads exported successfully');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
                    <p className="text-gray-600 mt-1">Manage your lead submissions</p>
                </div>
                <Button
                    onClick={handleExportCSV}
                    variant="outline"
                    className="gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-0 shadow-sm">
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
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search by name, phone, or city..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={productFilter} onValueChange={setProductFilter}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Filter by product" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Products</SelectItem>
                                {products.map(product => (
                                    <SelectItem key={product.id} value={product.id}>
                                        {product.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                    {filteredLeads.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                                <Users className="w-6 h-6 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
                            <p className="text-gray-500">
                                Leads will appear here when customers submit forms on your product pages.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLeads.map(lead => {
                                        const formData = lead.form_data as Record<string, string>;
                                        const product = products.find(p => p.id === lead.product_id);
                                        return (
                                            <TableRow key={lead.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-medium text-orange-600">
                                                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">
                                                                {formData.fullName?.charAt(0) || '?'}
                                                            </Badge>
                                                        </div>
                                                        <span className="font-medium">{formData.fullName || 'Unknown'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{formData.phone || '-'}</TableCell>
                                                <TableCell>
                                                    {[formData.city, formData.municipality].filter(Boolean).join(', ') || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Package className="w-4 h-4 text-gray-400" />
                                                        <span className="truncate max-w-[150px]">
                                                            {product?.name || 'Unknown'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-500">
                                                    {format(new Date(lead.submitted_at), 'MMM d, yyyy HH:mm')}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={lead.synced_to_sheet ? 'default' : 'secondary'}
                                                        className={lead.synced_to_sheet ? 'bg-emerald-500' : ''}
                                                    >
                                                        {lead.synced_to_sheet ? 'Synced' : 'Pending'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
