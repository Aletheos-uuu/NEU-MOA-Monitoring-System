"use client";

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, UserRole } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Users as UsersIcon, ShieldAlert, CheckCircle2, ShieldCheck, Shield } from 'lucide-react';

const roleBadge: Record<string, string> = {
  admin:   'bg-violet-100 text-violet-700 border-violet-200',
  faculty: 'bg-blue-100   text-blue-700   border-blue-200',
  student: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

function UserAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs flex-shrink-0">
      {initials}
    </div>
  );
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const qs = await getDocs(collection(db, 'users'));
        setUsers(qs.docs.map(d => d.data() as UserProfile));
      } catch {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch users.' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      toast({ title: 'Role updated', description: `User role changed to ${newRole}.` });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update role.' });
    }
  };

  const handleBlockToggle = async (uid: string, isBlocked: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { isBlocked });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isBlocked } : u));
      toast({ title: isBlocked ? 'User blocked' : 'User unblocked' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  };

  const handleManagementToggle = async (uid: string, canManageMOA: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { canManageMOA });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, canManageMOA } : u));
      toast({ title: 'Permissions updated', description: canManageMOA ? 'MOA management enabled.' : 'MOA management disabled.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update permissions.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f3f9]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/50 mb-1.5">
            <Shield className="h-3.5 w-3.5" />
            Administration
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            User Management
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage roles, access permissions, and account status for all registered users.
          </p>
        </div>

        {/* Summary chips */}
        {!loading && (
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { label: 'Total', count: users.length, cls: 'bg-gray-100 text-gray-700' },
              { label: 'Admins', count: users.filter(u => u.role === 'admin').length, cls: 'bg-violet-100 text-violet-700' },
              { label: 'Faculty', count: users.filter(u => u.role === 'faculty').length, cls: 'bg-blue-100 text-blue-700' },
              { label: 'Students', count: users.filter(u => u.role === 'student').length, cls: 'bg-emerald-100 text-emerald-700' },
              { label: 'Blocked', count: users.filter(u => u.isBlocked).length, cls: 'bg-red-100 text-red-700' },
            ].map(({ label, count, cls }) => (
              <div key={label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cls}`}>
                {label}: <span className="font-extrabold">{count}</span>
              </div>
            ))}
          </div>
        )}

        {/* User list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center">
              <UsersIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Registered Users</p>
              <p className="text-xs text-gray-400">{users.length} accounts</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-gray-400 px-5 py-3.5">User</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3.5">Role</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3.5">MOA Management</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3.5">Status</th>
                  <th className="text-right text-[11px] font-bold uppercase tracking-widest text-gray-400 px-5 py-3.5">Block</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 bg-gray-100 rounded-lg animate-pulse" style={{ width: j === 0 ? '60%' : '40%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.map((user) => (
                  <tr key={user.uid} className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors group">
                    {/* User info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.fullName} />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[220px]">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-4">
                      <Select defaultValue={user.role} onValueChange={val => handleRoleChange(user.uid, val as UserRole)}>
                        <SelectTrigger className="w-[120px] h-8 text-xs bg-gray-50 border-gray-200 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="faculty">Faculty</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>

                    {/* MOA management (faculty only) */}
                    <td className="px-4 py-4">
                      {user.role === 'faculty' ? (
                        <div className="flex items-center gap-2.5">
                          <Switch
                            checked={user.canManageMOA}
                            onCheckedChange={checked => handleManagementToggle(user.uid, checked)}
                          />
                          {user.canManageMOA ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Enabled
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Disabled</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 italic">N/A</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-4">
                      {user.isBlocked ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      )}
                    </td>

                    {/* Block toggle */}
                    <td className="px-5 py-4 text-right">
                      <Switch
                        checked={user.isBlocked}
                        onCheckedChange={checked => handleBlockToggle(user.uid, checked)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}