'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Plus,
    Search,
    MoreVertical,
    Package,
    ExternalLink,
    Edit,
    Trash2,
    Copy,
    Eye,
    Loader2,
    Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsPage() {
    const { products, currentStoreId, stores, fetchProducts, deleteProduct } = useAppStore();
    const [search, setSearch] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const currentStore = stores.find(s => s.id === currentStoreId);

    useEffect(() => {
        if (currentStoreId) {
            fetchProducts();
        }
    }, [currentStoreId]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description?.toLowerCase().includes(search.toLowerCase()))
    );

    const handleDelete = async () => {
        if (productToDelete) {
            setIsDeleting(true);
            await deleteProduct(productToDelete);
            toast.success('Product deleted successfully');
            setDeleteDialogOpen(false);
            setProductToDelete(null);
            setIsDeleting(false);
        }
    };

    const getProductUrl = (slug: string) => {
        if (!currentStore) return '#';
        const storeName = currentStore.name.toLowerCase().replace(/\s+/g, '-');
        return `/${storeName}/${slug}`;
    };

    const handleCopyLink = (slug: string) => {
        const domain = currentStore?.custom_domain || window.location.host;
        const storeName = currentStore?.name.toLowerCase().replace(/\s+/g, '-') || '';
        const url = `${window.location.protocol}//${domain}/${storeName}/${slug}`;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-600 mt-1">Manage your product landing pages</p>
                </div>
                <Link href="/dashboard/products/new">
                    <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all duration-200">
                        <Plus className="w-4 h-4 mr-2" />
                        New Product
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-12"
                />
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <Card className="border-0 shadow-sm">
                    <CardContent className="py-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {search ? 'No products found' : 'No products yet'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {search
                                ? 'Try adjusting your search terms.'
                                : 'Create your first product to start selling.'}
                        </p>
                        {!search && (
                            <Link href="/dashboard/products/new">
                                <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-md shadow-orange-500/20">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Product
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                        <Card key={product.id} className="border-0 shadow-sm overflow-hidden hover-lift group">
                            {/* Product Image */}
                            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                {product.images?.[0] ? (
                                    <img
                                        src={product.images[0].url}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-orange-50 flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-orange-200" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <Badge
                                        variant={product.status === 'published' ? 'default' : 'secondary'}
                                        className={product.status === 'published'
                                            ? 'bg-emerald-500 hover:bg-emerald-600'
                                            : ''
                                        }
                                    >
                                        {product.status}
                                    </Badge>
                                </div>

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <Link href={getProductUrl(product.slug)} target="_blank">
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-orange-600">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                    <Link href={`/dashboard/products/${product.id}`}>
                                        <Button size="sm" className="gap-2 bg-white text-gray-900 hover:bg-gray-100">
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Product Info */}
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                            {product.short_description}
                                        </p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="flex-shrink-0">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/products/${product.id}`}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={getProductUrl(product.slug)} target="_blank">
                                                    <ExternalLink className="w-4 h-4 mr-2" />
                                                    View Live
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleCopyLink(product.slug)}>
                                                <Copy className="w-4 h-4 mr-2" />
                                                Copy Link
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setProductToDelete(product.id);
                                                    setDeleteDialogOpen(true);
                                                }}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                    <div>
                                        <span className="text-lg font-bold text-gray-900">
                                            ${product.price.toFixed(2)}
                                        </span>
                                        {product.compare_price && (
                                            <span className="text-sm text-gray-400 line-through ml-2">
                                                ${product.compare_price.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    {product.theme && (
                                        <div
                                            className="w-6 h-6 rounded-full border-2 border-gray-200"
                                            style={{ backgroundColor: product.theme.primary_color }}
                                            title={product.theme.name}
                                        />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this product? This action cannot be undone and will also delete all associated leads.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
