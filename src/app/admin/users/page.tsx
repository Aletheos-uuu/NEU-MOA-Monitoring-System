
"use client";

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, UserRole } from '@/context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Users as UsersIcon, ShieldAlert, CheckCircle2, ShieldCheck, Settings2 } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(usersData);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch users.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      toast({ title: 'Success', description: 'User role updated.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update role.' });
    }
  };

  const handleBlockToggle = async (uid: string, isBlocked: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { isBlocked });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isBlocked } : u));
      toast({ title: isBlocked ? 'User Blocked' : 'User Unblocked', description: `User status updated successfully.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  };

  const handleManagementToggle = async (uid: string, canManageMOA: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { canManageMOA });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, canManageMOA } : u));
      toast({ title: 'Permissions Updated', description: canManageMOA ? 'Management access granted.' : 'Management access revoked.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update permissions.' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <UsersIcon className="h-8 w-8" />
            User Management
          </h1>
          <p className="text-muted-foreground">Manage administrative roles, blocked users, and faculty management permissions.</p>
        </div>

        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>User Details</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>MOA Management</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">Loading users...</TableCell>
                </TableRow>
              ) : users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-primary">{user.fullName}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={user.role} onValueChange={(val) => handleRoleChange(user.uid, val as UserRole)}>
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {user.role === 'faculty' ? (
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={user.canManageMOA} 
                          onCheckedChange={(checked) => handleManagementToggle(user.uid, checked)}
                        />
                        <span className="text-xs font-medium">
                          {user.canManageMOA ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" /> Enabled
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Disabled</span>
                          )}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.isBlocked ? (
                      <Badge variant="destructive" className="gap-1 px-2 py-0.5 text-[10px]">
                        <ShieldAlert className="h-3 w-3" />
                        BLOCKED
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 gap-1 px-2 py-0.5 text-[10px]">
                        <CheckCircle2 className="h-3 w-3" />
                        ACTIVE
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-muted-foreground">{user.isBlocked ? 'Unblock' : 'Block'}</span>
                      <Switch 
                        checked={user.isBlocked} 
                        onCheckedChange={(checked) => handleBlockToggle(user.uid, checked)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
