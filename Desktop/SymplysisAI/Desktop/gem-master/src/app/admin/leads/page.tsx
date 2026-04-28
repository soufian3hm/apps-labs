'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  ArrowLeft, 
  Search,
  Loader2,
  Calendar,
  Store as StoreIcon,
  Package as PackageIcon,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('lead_submissions')
        .select(`
          *,
          products:product_id (
            name,
            slug,
            stores:store_id (name, slug)
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      toast.error('Error fetching leads: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const searchLower = searchQuery.toLowerCase();
    const formDataStr = JSON.stringify(lead.form_data).toLowerCase();
    const productName = lead.products?.name?.toLowerCase() || '';
    const storeName = lead.products?.stores?.name?.toLowerCase() || '';
    
    return formDataStr.includes(searchLower) || 
           productName.includes(searchLower) || 
           storeName.includes(searchLower);
  });

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
            <h1 className="text-2xl font-bold text-slate-900">All Lead Submissions</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search leads by customer info, product, or store..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="p-6 bg-white border border-slate-200 hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Lead Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Lead Details</span>
                    <span className="ml-auto text-xs text-slate-400 font-mono">{lead.id}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(lead.form_data).map(([key, value]: [string, any]) => (
                      <div key={key}>
                        <label className="text-xs font-bold text-slate-400 uppercase block mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                        <div className="text-slate-900 font-medium">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Source Info */}
                <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <StoreIcon className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Store</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{lead.products?.stores?.name}</div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <PackageIcon className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Product</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{lead.products?.name}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Submitted</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {new Date(lead.submitted_at).toLocaleString()}
                      </div>
                    </div>

                    {lead.ip_address && (
                      <div className="pt-2">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">
                          IP: {lead.ip_address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {filteredLeads.length === 0 && (
          <div className="py-20 text-center bg-white rounded-xl border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No leads found</p>
          </div>
        )}
      </div>
    </div>
  );
}
