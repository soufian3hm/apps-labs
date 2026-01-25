'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Store, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface StoreData {
    id: string;
    name: string;
    custom_domain: string | null;
    currency_symbol: string;
}

interface ProductData {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: { url: string }[];
}

export default function StoreHomePage() {
    const [store, setStore] = useState<StoreData | null>(null);
    const [products, setProducts] = useState<ProductData[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        async function fetchStore() {
            // Get subdomain from the current hostname
            const host = window.location.host;
            const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'qrified.app';

            let subdomain: string | null = null;

            // Extract subdomain from host
            if (host.includes(rootDomain) && host !== rootDomain) {
                subdomain = host.replace(`.${rootDomain}`, '');
            } else if (host.includes('localhost')) {
                const parts = host.split('.localhost');
                if (parts.length > 1 && parts[0]) {
                    subdomain = parts[0];
                }
            }

            if (!subdomain) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            const supabase = createClient();

            // Fetch store by subdomain (try custom_domain first, then slug)
            let storeData = null;

            // Try custom_domain first
            const { data: domainMatch } = await supabase
                .from('public_stores')
                .select('id, name, custom_domain, currency_symbol')
                .eq('custom_domain', subdomain)
                .maybeSingle();

            if (domainMatch) {
                storeData = domainMatch;
            } else {
                // Try slug as fallback
                const { data: slugMatch } = await supabase
                    .from('public_stores')
                    .select('id, name, custom_domain, currency_symbol')
                    .eq('slug', subdomain)
                    .maybeSingle();

                if (slugMatch) {
                    storeData = slugMatch;
                }
            }

            if (!storeData) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            setStore(storeData as StoreData);

            // Fetch products for this store
            const { data: productsData } = await supabase
                .from('public_products')
                .select('id, name, slug, price, images:product_images(url)')
                .eq('store_id', storeData.id!)
                .eq('status', 'published')
                .order('created_at', { ascending: false });

            if (productsData) {
                setProducts(productsData.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    price: p.price,
                    images: p.images || []
                })) as ProductData[]);
            }

            setLoading(false);
        }

        fetchStore();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Store Not Found</h1>
                    <p className="text-gray-500 mb-6">This store doesn't exist or has been removed.</p>
                    <Link
                        href={`https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'qrified.app'}`}
                        className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                        Get your own store →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            {/* Store Header */}
            <header className="bg-white border-b sticky top-0 z-10 backdrop-blur-md bg-white/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900 truncate">{store?.name}</h1>
                </div>
            </header>

            {/* Products Grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Products Yet</h2>
                        <p className="text-gray-500 text-center max-w-sm">
                            Check back soon! New products are being added to the store.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/products/${product.slug}`}
                                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-orange-500/30 hover:shadow-lg transition-all duration-300 flex flex-col"
                            >
                                <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                                    {product.images?.[0]?.url ? (
                                        <img
                                            src={product.images[0].url}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                                            <ShoppingBag className="w-12 h-12 mb-2 opacity-50" />
                                            <span className="text-xs font-medium uppercase tracking-wider opacity-60">No Image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">
                                        {product.name}
                                    </h3>
                                    <div className="mt-auto pt-2 flex items-center justify-between">
                                        <p className="text-lg font-bold text-gray-900">
                                            {store?.currency_symbol}{product.price}
                                        </p>
                                        <span className="text-xs font-medium text-white bg-black px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                                            View Details
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
            <footer className="py-8 text-center text-sm text-gray-500 border-t mt-auto bg-white">
                <p>© {new Date().getFullYear()} {store?.name}. All rights reserved.</p>
            </footer>
        </div>
    );
}
