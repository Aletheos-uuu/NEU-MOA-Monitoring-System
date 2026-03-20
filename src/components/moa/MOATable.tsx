"use client";

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Edit, MoreHorizontal, Trash2, RotateCcw,
  ExternalLink, History, Building2, Mail, User, Calendar,
} from 'lucide-react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { MoaFormDialog } from './MoaFormDialog';
import { AuditTrailDialog } from './AuditTrailDialog';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { startOfToday, isBefore, parseISO, addMonths, format } from 'date-fns';

interface MOA {
  id: string; hteId: string; companyName: string; address?: string;
  contactPerson?: string; contactEmail?: string; industryType: string;
  effectiveDate: string; expiryDate: string; status: string;
  endorsedByCollege?: string; isDeleted: boolean; auditTrail: any[];
}

interface MOATableProps {
  data: MOA[];
  role: 'admin' | 'faculty' | 'student';
  loading: boolean;
}

/* ── Status helpers ─────────────────────────────────────── */
function StatusPill({ status, isDeleted }: { status: string; isDeleted?: boolean }) {
  if (isDeleted) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        Deleted
      </span>
    );
  }

  if (status.includes('EXPIRING')) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
      Expiring
    </span>
  );
  if (status.includes('EXPIRED')) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      Expired
    </span>
  );
  if (status.includes('APPROVED')) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Approved
    </span>
  );
  if (status.includes('PROCESSING')) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      Processing
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
      {status.split(':')[0]}
    </span>
  );
}

/* ── Row accent by status ─────────────────────────────────── */
function rowAccentClass(moa: MOA, effectiveStatus: string): string {
  if (moa.isDeleted) return 'bg-gray-50/60 opacity-70';
  if (effectiveStatus.includes('EXPIRED')) return 'hover:bg-red-50/30';
  if (effectiveStatus.includes('EXPIRING')) return 'hover:bg-violet-50/30';
  if (effectiveStatus.includes('APPROVED')) return 'hover:bg-emerald-50/20';
  return 'hover:bg-amber-50/20';
}

function getRowLeftColor(effectiveStatus: string, isDeleted: boolean): string {
  if (isDeleted) return 'border-l-gray-300';
  if (effectiveStatus.includes('EXPIRED')) return 'border-l-red-400';
  if (effectiveStatus.includes('EXPIRING')) return 'border-l-violet-400';
  if (effectiveStatus.includes('APPROVED')) return 'border-l-emerald-400';
  return 'border-l-amber-400';
}

/* ── Industry badge ─────────────────────────────────────── */
function IndustryBadge({ industry }: { industry: string }) {
  const colorMap: Record<string, string> = {
    Technology: 'bg-blue-50 text-blue-600 border-blue-100',
    Finance: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Telecom: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    Food: 'bg-orange-50 text-orange-600 border-orange-100',
    Services: 'bg-purple-50 text-purple-600 border-purple-100',
  };
  const cls = colorMap[industry] || 'bg-gray-50 text-gray-600 border-gray-100';
  return (
    <span className={cn('inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border', cls)}>
      {industry}
    </span>
  );
}

/* ── Empty state ─────────────────────────────────────────── */
function EmptyState() {
  return (
    <tr>
      <td colSpan={5} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Building2 className="h-7 w-7 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">No agreements found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ── Loading state ───────────────────────────────────────── */
function LoadingState() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100">
          {Array.from({ length: 5 }).map((_, j) => (
            <td key={j} className="px-4 py-3.5">
              <div className="h-4 bg-gray-100 rounded-lg animate-pulse" style={{ width: j === 0 ? '70%' : j === 4 ? '40%' : '60%' }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ── Main component ──────────────────────────────────────── */
export function MOATable({ data, role, loading }: MOATableProps) {
  const { profile } = useAuth();
  const [editingMoa, setEditingMoa] = useState<MOA | null>(null);
  const [auditMoa, setAuditMoa] = useState<MOA | null>(null);

  const getEffectiveStatus = (moa: MOA) => {
    const today = startOfToday();
    const expiry = parseISO(moa.expiryDate);
    if (isBefore(expiry, today)) return "EXPIRED: No renewal done";
    if (isBefore(expiry, addMonths(today, 2)) && moa.status.startsWith('APPROVED'))
      return "EXPIRING: Two months before expiration";
    return moa.status;
  };

  const handleSoftDelete = (moa: MOA) => {
    if (!profile) return;
    const docRef = doc(db, 'moas', moa.id);
    updateDoc(docRef, {
      isDeleted: true,
      auditTrail: arrayUnion({ userId: profile.uid, userName: profile.fullName, userEmail: profile.email, operation: 'DELETE', timestamp: new Date().toISOString() }),
    }).catch(() => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: { isDeleted: true } }));
    });
  };

  const handleRecover = (moa: MOA) => {
    if (!profile) return;
    const docRef = doc(db, 'moas', moa.id);
    updateDoc(docRef, {
      isDeleted: false,
      auditTrail: arrayUnion({ userId: profile.uid, userName: profile.fullName, userEmail: profile.email, operation: 'RECOVER', timestamp: new Date().toISOString() }),
    }).catch(() => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: { isDeleted: false } }));
    });
  };

  const isAdmin = role === 'admin';
  const isFaculty = role === 'faculty';
  const isStudent = role === 'student';
  const canManage = isAdmin || (isFaculty && profile?.canManageMOA);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              <th className="text-left text-[11px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3.5">
                {isStudent ? 'Company' : 'Company / HTE ID'}
              </th>
              <th className="text-left text-[11px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3.5">
                Contact
              </th>
              <th className="text-left text-[11px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3.5">
                {isStudent ? 'Location' : 'College / Dept'}
              </th>
              <th className="text-left text-[11px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3.5">
                Status
              </th>
              <th className="text-right text-[11px] font-bold uppercase tracking-widest text-gray-400 px-4 py-3.5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LoadingState />
            ) : data.length === 0 ? (
              <EmptyState />
            ) : (
              data.map((moa) => {
                const effectiveStatus = getEffectiveStatus(moa);
                return (
                  <tr
                    key={moa.id}
                    className={cn(
                      'group border-b border-gray-100 border-l-2 transition-colors',
                      rowAccentClass(moa, effectiveStatus),
                      getRowLeftColor(effectiveStatus, moa.isDeleted)
                    )}
                  >
                    {/* Company */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          'font-semibold text-gray-900 text-sm leading-tight',
                          moa.isDeleted && 'line-through text-gray-400'
                        )}>
                          {moa.companyName}
                        </span>
                        {!isStudent && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-gray-400 font-mono">#{moa.hteId}</span>
                            <IndustryBadge industry={moa.industryType} />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700">
                          <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="font-medium">{moa.contactPerson || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{moa.contactEmail || '—'}</span>
                        </div>
                      </div>
                    </td>

                    {/* College / Location */}
                    <td className="px-4 py-3.5">
                      {isStudent ? (
                        <span className="text-xs text-gray-500 leading-relaxed line-clamp-2">{moa.address || '—'}</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-gray-700 leading-tight line-clamp-2">
                            {moa.endorsedByCollege || 'Not specified'}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>Expires {moa.expiryDate}</span>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusPill status={effectiveStatus} isDeleted={moa.isDeleted} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/moa/${moa.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-primary hover:bg-primary/8 opacity-0 group-hover:opacity-100 transition-all"
                            title="View Details"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>

                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-amber-600 hover:bg-amber-50 opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => setAuditMoa(moa)}
                            title="View Audit Trail"
                          >
                            <History className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        {canManage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 shadow-lg">
                              <DropdownMenuItem
                                onClick={() => setEditingMoa(moa)}
                                className="gap-2 text-sm"
                              >
                                <Edit className="h-3.5 w-3.5" />
                                Edit agreement
                              </DropdownMenuItem>
                              {isAdmin && (
                                moa.isDeleted ? (
                                  <DropdownMenuItem
                                    onClick={() => handleRecover(moa)}
                                    className="gap-2 text-sm text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Recover
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleSoftDelete(moa)}
                                    className="gap-2 text-sm text-red-600 focus:text-red-700 focus:bg-red-50"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                  </DropdownMenuItem>
                                )
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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