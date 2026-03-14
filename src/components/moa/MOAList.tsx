
"use client";

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock, CheckCircle2, AlertCircle, Trash2, RotateCcw, Edit, MoreHorizontal, MapPin, Mail, User, Building2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { MoaFormDialog } from './MoaFormDialog';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MOA {
  id: string;
  hteId: string;
  companyName: string;
  address?: string;
  contactPerson?: string;
  contactEmail?: string;
  industryType: string;
  effectiveDate: string;
  expiryDate: string;
  status: string;
  endorsedByCollege?: string;
  isDeleted: boolean;
  auditTrail: any[];
}

const APPROVED_STATUSES = [
  "APPROVED: Signed by President",
  "APPROVED: On-going notarization",
  "APPROVED: No notarization needed",
];

export function MOAList({ role }: { role: 'admin' | 'faculty' | 'student' }) {
  const [moas, setMoas] = useState<MOA[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMoa, setEditingMoa] = useState<MOA | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    let q;
    
    if (role === 'admin') {
      q = query(collection(db, 'moas'));
    } else if (role === 'faculty') {
      q = query(collection(db, 'moas'), where('isDeleted', '==', false));
    } else {
      // Students must query only non-deleted, approved MOAs to satisfy Security Rules
      q = query(
        collection(db, 'moas'), 
        where('isDeleted', '==', false),
        where('status', 'in', APPROVED_STATUSES)
      );
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MOA));
        setMoas(data);
        setLoading(false);
      }, 
      async (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'moas',
          operation: role === 'admin' ? 'list' : 'list', // list operation maps to rule 'read' on collection
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [role]);

  const handleSoftDelete = (moa: MOA) => {
    if (!profile) return;
    const docRef = doc(db, 'moas', moa.id);
    updateDoc(docRef, {
      isDeleted: true,
      auditTrail: arrayUnion({
        userId: profile.uid,
        userName: profile.fullName,
        userEmail: profile.email,
        operation: 'DELETE',
        timestamp: new Date().toISOString(),
      })
    }).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: { isDeleted: true },
      }));
    });
  };

  const handleRecover = (moa: MOA) => {
    if (!profile) return;
    const docRef = doc(db, 'moas', moa.id);
    updateDoc(docRef, {
      isDeleted: false,
      auditTrail: arrayUnion({
        userId: profile.uid,
        userName: profile.fullName,
        userEmail: profile.email,
        operation: 'RECOVER',
        timestamp: new Date().toISOString(),
      })
    }).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: { isDeleted: false },
      }));
    });
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('APPROVED')) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status.includes('PROCESSING')) return <Clock className="h-4 w-4 text-amber-500" />;
    if (status.includes('EXPIRED')) return <AlertCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const canEdit = role === 'admin' || (role === 'faculty' && profile?.canManageMOA);
  const canDelete = role === 'admin';

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading agreements...</div>;

  if (moas.length === 0) return (
    <div className="text-center py-10 border-2 border-dashed rounded-xl text-muted-foreground">
      No agreements found matching your access level.
    </div>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {moas.map((moa) => (
        <Card 
          key={moa.id} 
          className={cn(
            "group hover:shadow-md transition-all border-l-4 h-full flex flex-col",
            moa.isDeleted ? "border-l-destructive bg-destructive/5 opacity-80" : "border-l-primary/20 hover:border-l-primary"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                {moa.industryType}
              </Badge>
              {moa.isDeleted && <Badge variant="destructive" className="text-[8px] h-4">DELETED</Badge>}
            </div>
            {canEdit ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingMoa(moa)} className="gap-2">
                    <Edit className="h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  {canDelete && (
                    moa.isDeleted ? (
                      <DropdownMenuItem onClick={() => handleRecover(moa)} className="gap-2 text-green-600">
                        <RotateCcw className="h-4 w-4" /> Recover
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleSoftDelete(moa)} className="gap-2 text-destructive">
                        <Trash2 className="h-4 w-4" /> Soft Delete
                      </DropdownMenuItem>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : getStatusIcon(moa.status)}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <CardTitle className={cn(
              "text-lg line-clamp-1 group-hover:text-primary transition-colors",
              moa.isDeleted && "line-through text-muted-foreground"
            )}>
              {moa.companyName}
            </CardTitle>
            
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="line-clamp-1">{moa.address || 'No address provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-3 w-3 shrink-0" />
                <span className="line-clamp-1">{moa.contactPerson || 'No contact person'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="line-clamp-1">{moa.contactEmail || 'No contact email'}</span>
              </div>
              
              {role !== 'student' && (
                <>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-3 w-3 shrink-0" />
                    <span className="line-clamp-1">HTE ID: {moa.hteId}</span>
                  </div>
                  <div className="pt-2">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Status</p>
                    <p className="text-xs italic text-muted-foreground line-clamp-2">{moa.status}</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase">Expires</span>
                <span className="text-xs font-medium">{moa.expiryDate}</span>
              </div>
              <Link href={`/moa/${moa.id}`}>
                <Button variant="ghost" size="sm" className="gap-1 hover:bg-primary hover:text-white">
                  Details
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}

      {editingMoa && (
        <MoaFormDialog 
          open={!!editingMoa} 
          onOpenChange={(open) => !open && setEditingMoa(null)} 
          initialData={editingMoa}
        />
      )}
    </div>
  );
}
