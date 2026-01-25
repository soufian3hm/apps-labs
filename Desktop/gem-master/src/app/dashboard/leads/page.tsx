'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Search,
    Download,
    Users,
    CheckCircle,
    Clock,
    Package,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Eye,
    X
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Lead {
    id: string;
    store_id: string;
    product_id: string;
    form_data: any;
    submitted_at: string;
    synced_to_sheet: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function LeadsPage() {
    const { products, fetchProducts, currentStoreId } = useAppStore();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [productFilter, setProductFilter] = useState<string>('all');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Stats
    const [stats, setStats] = useState({ total: 0, synced: 0, pending: 0 });

    // Selected Lead for Popup
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    useEffect(() => {
        if (currentStoreId) {
            fetchProducts();
            fetchLeads(1);
            fetchStats();
        }
    }, [currentStoreId, productFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentStoreId) fetchLeads(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchStats = async () => {
        if (!currentStoreId) return;
        const supabase = createClient();

        // Total
        const { count: total } = await supabase
            .from('lead_submissions')
            .select('*, products!inner(store_id)', { count: 'exact', head: true })
            .eq('products.store_id', currentStoreId);

        // Synced
        const { count: synced } = await supabase
            .from('lead_submissions')
            .select('*, products!inner(store_id)', { count: 'exact', head: true })
            .eq('products.store_id', currentStoreId)
            .eq('synced_to_sheet', true);

        setStats({
            total: total || 0,
            synced: synced || 0,
            pending: (total || 0) - (synced || 0)
        });
    };

    const fetchLeads = async (pageNumber: number) => {
        if (!currentStoreId) return;
        setIsLoading(true);

        const supabase = createClient();
        const start = (pageNumber - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE - 1;

        let query = supabase
            .from('lead_submissions')
            .select('*, products!inner(store_id)', { count: 'exact' })
            .eq('products.store_id', currentStoreId)
            .order('submitted_at', { ascending: false })
            .range(start, end);

        if (productFilter !== 'all') {
            query = query.eq('product_id', productFilter);
        }

        if (search) {
            query = query.or(`form_data->>fullName.ilike.%${search}%,form_data->>name.ilike.%${search}%,form_data->>phone.ilike.%${search}%`);
        }

        const { data, count, error } = await query;

        if (error) {
            console.error('Error fetching leads:', error);
            toast.error('Failed to load leads');
        } else {
            setLeads(data as unknown as Lead[]);
            setTotalCount(count || 0);
            setPage(pageNumber);
        }
        setIsLoading(false);
    };

    const handleNextPage = () => {
        if (page * ITEMS_PER_PAGE < totalCount) {
            fetchLeads(page + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            fetchLeads(page - 1);
        }
    };

    const handleExportCSV = async () => {
        if (!currentStoreId) return;
        toast.promise(
            async () => {
                const supabase = createClient();
                let query = supabase
                    .from('lead_submissions')
                    .select('*, products!inner(store_id)')
                    .eq('products.store_id', currentStoreId)
                    .order('submitted_at', { ascending: false });

                if (productFilter !== 'all') query = query.eq('product_id', productFilter);
                if (search) {
                    query = query.or(`form_data->>fullName.ilike.%${search}%,form_data->>name.ilike.%${search}%,form_data->>phone.ilike.%${search}%`);
                }

                const { data, error } = await query;
                if (error || !data) throw error;

                const leadsExport = data as unknown as Lead[];

                const baseHeaders = ['ID', 'Date', 'Product', 'Status', 'Name', 'Phone', 'City', 'Wilaya', 'Address', 'Price', 'Total', 'Currency', 'Variants'];
                const dynamicKeys = new Set<string>();
                leadsExport.forEach(lead => {
                    Object.keys(lead.form_data).forEach(k => {
                        if (!['name', 'fullName', 'phone', 'city', 'wilaya', 'province', 'municipality', 'address', 'variants', 'price', 'total', 'currency', 'language', 'discount_code'].includes(k)) {
                            dynamicKeys.add(k);
                        }
                    });
                });
                const extraHeaders = Array.from(dynamicKeys);

                const csvRows = [[...baseHeaders, ...extraHeaders].join(',')];

                leadsExport.forEach(lead => {
                    const fd = lead.form_data;
                    const product = products.find(p => p.id === lead.product_id);
                    const name = fd.fullName || fd.name || '';

                    const variantsStr = fd.variants ? Object.entries(fd.variants).map(([k, v]) => `${k}: ${v}`).join(' | ') : '';

                    const row = [
                        lead.id,
                        format(new Date(lead.submitted_at), 'yyyy-MM-dd HH:mm'),
                        product?.name || 'Unknown',
                        lead.synced_to_sheet ? 'Synced' : 'Pending',
                        `"${(name || '').replace(/"/g, '""')}"`,
                        `"${(fd.phone || '').replace(/"/g, '""')}"`,
                        `"${(fd.city || '').replace(/"/g, '""')}"`,
                        `"${(fd.wilaya || fd.province || '').replace(/"/g, '""')}"`,
                        `"${(fd.address || '').replace(/"/g, '""')}"`,
                        fd.price || '',
                        fd.total || '',
                        fd.currency || '',
                        `"${variantsStr.replace(/"/g, '""')}"`,
                        ...extraHeaders.map(key => `"${(fd[key] || '').toString().replace(/"/g, '""')}"`)
                    ];
                    csvRows.push(row.join(','));
                });

                const csvContent = csvRows.join('\n');
                // Ad BOM for Excel UTF-8 support
                const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `leads_export_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
                link.click();
            },
            {
                loading: 'Preparing CSV export...',
                success: 'Leads exported successfully',
                error: 'Failed to export leads'
            }
        );
    };

    const colorClasses = {
        indigo: 'bg-indigo-100 text-indigo-600',
        orange: 'bg-orange-100 text-orange-600',
        emerald: 'bg-emerald-100 text-emerald-600',
        amber: 'bg-amber-100 text-amber-600',
    };

    const dashboardStats = [
        { title: 'Total Leads', value: stats.total, icon: Users, color: 'orange' },
        { title: 'Synced', value: stats.synced, icon: CheckCircle, color: 'emerald' },
        { title: 'Pending Sync', value: stats.pending, icon: Clock, color: 'amber' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
                    <p className="text-gray-600 mt-1">Manage your lead submissions</p>
                </div>
                <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-6">
                {dashboardStats.map((stat) => (
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
                                placeholder="Search by name, phone..."
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
                    {leads.length === 0 && !isLoading ? (
                        <div className="py-16 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-3">
                                <Users className="w-6 h-6 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
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
                                        <TableHead>Price</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        leads.map(lead => {
                                            const formData = lead.form_data || {};
                                            const product = products.find(p => p.id === lead.product_id);
                                            const displayName = formData.fullName || formData.name || 'Unknown';
                                            const location = [
                                                formData.city,
                                                formData.wilaya,
                                                formData.province
                                            ].filter(Boolean).join(', ') || '-';

                                            return (
                                                <TableRow key={lead.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedLead(lead)}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                                                <span className="text-xs font-bold text-orange-600">
                                                                    {displayName.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <span className="font-medium">{displayName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{formData.phone || '-'}</TableCell>
                                                    <TableCell>
                                                        <span className="max-w-[150px] truncate block" title={location}>
                                                            {location}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="max-w-[150px] truncate block">
                                                            {product?.name || 'Unknown'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {formData.total || formData.price || product?.price || '-'} {formData.currency || ''}
                                                    </TableCell>
                                                    <TableCell className="text-gray-500 text-sm">
                                                        {format(new Date(lead.submitted_at), 'MMM d, HH:mm')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={lead.synced_to_sheet ? 'default' : 'secondary'} className={lead.synced_to_sheet ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                                                            {lead.synced_to_sheet ? 'Synced' : 'Pending'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}>
                                                            <Eye className="w-4 h-4 text-gray-500" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="border-t p-4 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, totalCount)} to {Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount} results
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={page === 1 || isLoading}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={page * ITEMS_PER_PAGE >= totalCount || isLoading}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Details Modal */}
            <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Lead Details</DialogTitle>
                        <DialogDescription>
                            Submitted on {selectedLead && format(new Date(selectedLead.submitted_at), 'PPP pp')}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLead && (
                        <div className="grid gap-6 py-4">
                            {/* Product Info */}
                            <div className="bg-orange-50 p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-orange-600 font-medium">Product</p>
                                    <p className="font-bold text-orange-900">
                                        {products.find(p => p.id === selectedLead.product_id)?.name || 'Unknown Product'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-orange-600 font-medium">Total</p>
                                    <p className="font-bold text-lg text-orange-900">
                                        {selectedLead.form_data.total || selectedLead.form_data.price || products.find(p => p.id === selectedLead.product_id)?.price || '-'} {selectedLead.form_data.currency || ''}
                                    </p>
                                </div>
                            </div>

                            {/* Variants */}
                            {selectedLead.form_data.variants && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Selected Variants</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(selectedLead.form_data.variants).map(([key, value]) => (
                                            <Badge key={key} variant="outline" className="px-3 py-1">
                                                <span className="font-medium mr-1">{key}:</span> {String(value)}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Customer Details */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                {Object.entries(selectedLead.form_data).map(([key, value]) => {
                                    if (['variants', 'total', 'price', 'currency', 'product_price', 'shipping_price'].includes(key)) return null;

                                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                                    return (
                                        <div key={key} className="border p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">{label}</p>
                                            <p className="font-medium">{String(value)}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Status */}
                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                                <Badge variant={selectedLead.synced_to_sheet ? 'default' : 'secondary'} className={selectedLead.synced_to_sheet ? 'bg-emerald-500' : ''}>
                                    {selectedLead.synced_to_sheet ? 'Synced' : 'Not Synced'}
                                </Badge>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
