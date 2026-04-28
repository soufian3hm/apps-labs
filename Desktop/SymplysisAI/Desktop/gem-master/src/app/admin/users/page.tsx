'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  ArrowLeft,
  Search,
  Shield,
  Loader2,
  UserRound
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Profile } from '@/types/supabase';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleImpersonate = async (userId: string) => {
    setImpersonatingId(userId);
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to impersonate');
      }

      toast.success('Generated impersonation link. Redirecting...');

      // Redirect to the magic link
      window.location.href = data.link;

    } catch (error: any) {
      toast.error('Impersonation failed: ' + error.message);
    } finally {
      setImpersonatingId(null);
    }
  };

  const fetchUsers = async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast.error('Error fetching users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.rpc('toggle_user_status', {
        target_user_id: userId
      });

      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, is_disabled: data } : u));
      toast.success(`User ${data ? 'disabled' : 'enabled'} successfully`);
    } catch (error: any) {
      toast.error('Error updating user: ' + error.message);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">User</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Role</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Joined</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-slate-900">{user.name}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          User
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <span className={`text-sm font-medium ${user.is_disabled ? 'text-red-600' : 'text-green-600'}`}>
                        {user.is_disabled ? 'Blocked' : 'Active'}
                      </span>
                      <Switch
                        checked={!user.is_disabled}
                        onCheckedChange={() => toggleUserStatus(user.id)}
                        disabled={user.role === 'admin'}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleImpersonate(user.id)}
                      disabled={impersonatingId !== null || user.role === 'admin'}
                      className="gap-2"
                    >
                      {impersonatingId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserRound className="w-4 h-4" />
                      )}
                      Impersonate
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="py-20 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
