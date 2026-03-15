"use client";

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, MoreHorizontal, Trash2, RotateCcw, CheckCircle2, Clock, AlertCircle, ExternalLink, History } from 'lucide-react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { MoaFormDialog } from './MoaFormDialog';
import { AuditTrailDialog } from './AuditTrailDialog';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { startOfToday, isBefore, parseISO, addMonths } from 'date-fns';

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

interface MOATableProps {
  data: MOA[];
  role: 'admin' | 'faculty' | 'student';
  loading: boolean;
}

export function MOATable({ data, role, loading }: MOATableProps) {
  const { profile } = useAuth();
  const [editingMoa, setEditingMoa] = useState<MOA | null>(null);
  const [auditMoa, setAuditMoa] = useState<MOA | null>(null);

  const getEffectiveStatus = (moa: MOA) => {
    const today = startOfToday();
    const expiry = parseISO(moa.expiryDate);
    
    if (isBefore(expiry, today)) {
      return "EXPIRED: No renewal done";
    }
    
    const twoMonthsFromNow = addMonths(today, 2);
    if (isBefore(expiry, twoMonthsFromNow) && moa.status.startsWith('APPROVED')) {
      return "EXPIRING: Two months before expiration";
    }
    
    return moa.status;
  };

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

  const getStatusBadge = (moa: MOA) => {
    const status = getEffectiveStatus(moa);
    if (status.includes('EXPIRING')) return <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 gap-1"><Clock className="h-3 w-3" /> Expiring</Badge>;
    if (status.includes('EXPIRED')) return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> Expired</Badge>;
    if (status.includes('APPROVED')) return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>;
    if (status.includes('PROCESSING')) return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 gap-1"><Clock className="h-3 w-3" /> Processing</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground italic">Syncing records...</div>;

  const isStudent = role === 'student';
  const isAdmin = role === 'admin';
  const isFaculty = role === 'faculty';
  const canManage = isAdmin || (isFaculty && profile?.canManageMOA);

  return (
    <>
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-bold">
              {isStudent ? 'Company Name' : 'Company / HTE ID'}
            </TableHead>
            <TableHead className="font-bold">Contact Details</TableHead>
            <TableHead className="font-bold">
              {isStudent ? 'Location' : 'College / Dept'}
            </TableHead>
            <TableHead className="font-bold">Status</TableHead>
            <TableHead className="font-bold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isStudent ? 4 : 5} className="text-center py-12 text-muted-foreground">
                No matching agreements found.
              </TableCell>
            </TableRow>
          ) : data.map((moa) => (
            <TableRow key={moa.id} className={cn(moa.isDeleted && "bg-destructive/5")}>
              <TableCell>
                <div className="flex flex-col">
                  <span className={cn("font-semibold", moa.isDeleted && "line-through text-muted-foreground")}>
                    {moa.companyName}
                  </span>
                  {!isStudent && (
                    <span className="text-[10px] text-muted-foreground font-mono uppercase">
                      ID: {moa.hteId} | {moa.industryType}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-xs">
                  <span className="font-medium">{moa.contactPerson || 'N/A'}</span>
                  <span className="text-muted-foreground">{moa.contactEmail || 'N/A'}</span>
                </div>
              </TableCell>
              <TableCell>
                {isStudent ? (
                  <span className="text-xs text-muted-foreground line-clamp-1">{moa.address || 'N/A'}</span>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-medium uppercase border-primary/20 bg-primary/5">
                    {moa.endorsedByCollege || 'Not Specified'}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {moa.isDeleted ? (
                  <Badge variant="destructive" className="text-[10px]">DELETED</Badge>
                ) : (
                  getStatusBadge(moa)
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/moa/${moa.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" title="View Details">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-amber-600"
                      onClick={() => setAuditMoa(moa)}
                      title="View Audit Trail"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  )}
                  {canManage && (
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
                        {isAdmin && (
                          moa.isDeleted ? (
                            <DropdownMenuItem onClick={() => handleRecover(moa)} className="gap-2 text-green-600 font-semibold">
                              <RotateCcw className="h-4 w-4" /> Recover
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleSoftDelete(moa)} className="gap-2 text-destructive font-semibold">
                              <Trash2 className="h-4 w-4" /> Soft Delete
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingMoa && (
        <MoaFormDialog 
          open={!!editingMoa} 
          onOpenChange={(open) => !open && setEditingMoa(null)} 
          initialData={editingMoa}
        />
      )}

      {auditMoa && (
        <AuditTrailDialog
          open={!!auditMoa}
          onOpenChange={(open) => !open && setAuditMoa(null)}
          trail={auditMoa.auditTrail}
          companyName={auditMoa.companyName}
        />
      )}
    </>
  );
}
