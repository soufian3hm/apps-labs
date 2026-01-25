'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ArrowLeft, 
  Search,
  ExternalLink,
  Loader2,
  Tag,
  Calendar,
  Store as StoreIcon,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          stores:store_id (name, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error('Error fetching products: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    product.stores?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Manage Products</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search products by name, slug or store name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="p-6 bg-white border border-slate-200 hover:shadow-lg transition-all group overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex flex-col items-end">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    product.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {product.status === 'published' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {product.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">{product.name}</h3>
              <p className="text-sm text-slate-500 mb-4 font-mono">{product.slug}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <StoreIcon className="w-4 h-4" />
                  <span>Store: <span className="font-medium">{product.stores?.name || 'Unknown'}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Tag className="w-4 h-4" />
                  <span>Price: <span className="font-bold text-slate-900">${product.price}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {new Date(product.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                <a 
                  href={`https://${product.stores?.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'qrified.app'}/${product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Preview Page
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center bg-white rounded-xl border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
