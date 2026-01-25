'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Store, 
  ArrowLeft, 
  Search,
  ExternalLink,
  Loader2,
  Globe,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminStoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('stores')
        .select(`
          *,
          profiles:user_id (name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStores(data || []);
    } catch (error: any) {
      toast.error('Error fetching stores: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store => 
    store.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    store.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-2xl font-bold text-slate-900">Manage Stores</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search stores by name, slug or owner email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <Card key={store.id} className="p-6 bg-white border border-slate-200 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                  <Store className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Store Slug</span>
                  <span className="text-sm font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {store.slug}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">{store.name}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <UserIcon className="w-4 h-4" />
                  <span>Owner: {store.profiles?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 italic px-6 -mt-1 ml-0.5">
                   ({store.profiles?.email})
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {new Date(store.created_at).toLocaleDateString()}</span>
                </div>
                {store.custom_domain && (
                  <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                    <Globe className="w-4 h-4" />
                    <span>{store.custom_domain}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                <a 
                  href={`https://${store.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'qrified.app'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Visit Store
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
        
        {filteredStores.length === 0 && (
          <div className="py-20 text-center bg-white rounded-xl border border-slate-200">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No stores found</p>
          </div>
        )}
      </div>
    </div>
  );
}
