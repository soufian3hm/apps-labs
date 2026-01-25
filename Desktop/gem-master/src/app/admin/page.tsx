'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { 
  Users, 
  Store, 
  Package, 
  FileText, 
  TrendingUp,
  Activity,
  DollarSign,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  total_users: number;
  total_admins: number;
  disabled_users: number;
  total_stores: number;
  total_products: number;
  published_products: number;
  total_leads: number;
  leads_today: number;
  leads_this_week: number;
  leads_this_month: number;
}

export default function AdminDashboard() {
  const { user } = useAppStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('admin_stats')
        .select('*')
        .single();

      if (!error && data) {
        setStats(data as AdminStats);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600 mt-1">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-semibold">Admin Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <Card className="p-6 bg-white border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase">Users</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {stats?.total_users || 0}
            </div>
            <p className="text-sm text-slate-600">
              {stats?.total_admins || 0} admins • {stats?.disabled_users || 0} disabled
            </p>
          </Card>

          {/* Total Stores */}
          <Card className="p-6 bg-white border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Store className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase">Stores</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {stats?.total_stores || 0}
            </div>
            <p className="text-sm text-slate-600">
              Active stores
            </p>
          </Card>

          {/* Total Products */}
          <Card className="p-6 bg-white border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase">Products</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {stats?.total_products || 0}
            </div>
            <p className="text-sm text-slate-600">
              {stats?.published_products || 0} published
            </p>
          </Card>

          {/* Total Leads */}
          <Card className="p-6 bg-white border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase">Leads</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {stats?.total_leads || 0}
            </div>
            <p className="text-sm text-slate-600">
              {stats?.leads_today || 0} today
            </p>
          </Card>
        </div>

        {/* Lead Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">Today</span>
            </div>
            <div className="text-4xl font-bold mb-1">
              {stats?.leads_today || 0}
            </div>
            <p className="text-sm opacity-80">New leads today</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">This Week</span>
            </div>
            <div className="text-4xl font-bold mb-1">
              {stats?.leads_this_week || 0}
            </div>
            <p className="text-sm opacity-80">Leads this week</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">This Month</span>
            </div>
            <div className="text-4xl font-bold mb-1">
              {stats?.leads_this_month || 0}
            </div>
            <p className="text-sm opacity-80">Leads this month</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 bg-white border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/users" className="p-4 border-2 border-slate-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left group">
              <Users className="w-8 h-8 text-slate-400 group-hover:text-orange-600 mb-2" />
              <div className="font-semibold text-slate-900">Manage Users</div>
              <div className="text-sm text-slate-500">View all users</div>
            </Link>

            <Link href="/admin/stores" className="p-4 border-2 border-slate-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left group">
              <Store className="w-8 h-8 text-slate-400 group-hover:text-orange-600 mb-2" />
              <div className="font-semibold text-slate-900">Manage Stores</div>
              <div className="text-sm text-slate-500">View all stores</div>
            </Link>

            <Link href="/admin/products" className="p-4 border-2 border-slate-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left group">
              <Package className="w-8 h-8 text-slate-400 group-hover:text-orange-600 mb-2" />
              <div className="font-semibold text-slate-900">Manage Products</div>
              <div className="text-sm text-slate-500">View all products</div>
            </Link>

            <Link href="/admin/leads" className="p-4 border-2 border-slate-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left group">
              <FileText className="w-8 h-8 text-slate-400 group-hover:text-orange-600 mb-2" />
              <div className="font-semibold text-slate-900">View Leads</div>
              <div className="text-sm text-slate-500">All lead submissions</div>
            </Link>
          </div>
        </Card>

        {/* System Info */}
        <div className="mt-8 p-4 bg-slate-100 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Activity className="w-4 h-4" />
            <span>Admin dashboard is currently in development. More features coming soon.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
