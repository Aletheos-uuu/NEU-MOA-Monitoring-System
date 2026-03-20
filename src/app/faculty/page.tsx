"use client";

import { useState, useMemo, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoaFormDialog } from '@/components/moa/MoaFormDialog';
import { MOATable } from '@/components/moa/MOATable';
import { FileText, AlertTriangle, Clock, CheckCircle2, Search, PlusCircle, Filter, LayoutDashboard } from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { startOfToday, startOfWeek, startOfMonth, isAfter, isBefore, parseISO, addMonths } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useCountUp } from '@/hooks/use-count-up';

const COLLEGES = [
  "College of Accountancy","College of Agriculture","College of Arts and Sciences",
  "College of Business Administration","College of Communication","College of Criminology",
  "College of Education","College of Engineering and Architecture",
  "College of Informatics and Computing Studies","College of Medical Technology",
  "College of Midwifery","College of Music","College of Nursing",
  "College of Physical Therapy","College of Respiratory Therapy",
  "School of International Relations","College of Law","College of Medicine",
  "School of Graduate Studies",
];

interface MOA {
  id: string; hteId: string; companyName: string; address?: string;
  contactPerson?: string; contactEmail?: string; industryType: string;
  effectiveDate: string; expiryDate: string; status: string;
  endorsedByCollege?: string; isDeleted: boolean; auditTrail: any[];
}

/* ── Animated stat card ─────────────────────────────── */
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  borderColor: string;
  iconColor: string;
  index: number;
}

function StatCard({ title, value, icon: Icon, borderColor, iconColor, index }: StatCardProps) {
  const count = useCountUp(value, 700, index * 80 + 150);
  return (
    <Card
      className={`border-l-4 ${borderColor} shadow-sm card-hover`}
      style={{
        animation: 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both',
        animationDelay: `${index * 80}ms`,
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums">{count}</div>
      </CardContent>
    </Card>
  );
}

export default function FacultyDashboard() {
  const { profile } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [moas, setMoas] = useState<MOA[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [datePreset, setDatePreset] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'moas'), where('isDeleted', '==', false));
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        setMoas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MOA)));
        setLoading(false);
      },
      () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'moas', operation: 'list' }));
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const getEffectiveStatus = (moa: MOA) => {
    const today = startOfToday();
    const expiry = parseISO(moa.expiryDate);
    if (isBefore(expiry, today)) return "EXPIRED: No renewal done";
    if (isBefore(expiry, addMonths(today, 2)) && moa.status.startsWith('APPROVED'))
      return "EXPIRING: Two months before expiration";
    return moa.status;
  };

  const filteredMoas = useMemo(() => {
    return moas.filter(moa => {
      if (collegeFilter !== 'all' && moa.endorsedByCollege !== collegeFilter) return false;
      if (datePreset !== 'all') {
        const effectiveDate = parseISO(moa.effectiveDate);
        if (datePreset === 'today' && !isAfter(effectiveDate, startOfToday())) return false;
        if (datePreset === 'week' && !isAfter(effectiveDate, startOfWeek(new Date()))) return false;
        if (datePreset === 'month' && !isAfter(effectiveDate, startOfMonth(new Date()))) return false;
      }
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const effectiveStatus = getEffectiveStatus(moa).toLowerCase();
        return (
          moa.companyName.toLowerCase().includes(s) ||
          moa.address?.toLowerCase().includes(s) ||
          moa.contactPerson?.toLowerCase().includes(s) ||
          moa.contactEmail?.toLowerCase().includes(s) ||
          moa.endorsedByCollege?.toLowerCase().includes(s) ||
          moa.industryType.toLowerCase().includes(s) ||
          effectiveStatus.includes(s)
        );
      }
      return true;
    });
  }, [moas, collegeFilter, datePreset, searchTerm]);

  const stats = useMemo(() => {
    let active = 0, processing = 0, expired = 0, expiring = 0;
    filteredMoas.forEach(m => {
      const s = getEffectiveStatus(m);
      if (s.startsWith('EXPIRED')) expired++;
      else if (s.startsWith('EXPIRING')) expiring++;
      else if (s.startsWith('APPROVED')) active++;
      else if (s.startsWith('PROCESSING')) processing++;
    });
    return { active, processing, expired, expiring };
  }, [filteredMoas]);

  const statCards = [
    { title: 'Active MOAs',    value: stats.active,     icon: CheckCircle2, borderColor: 'border-l-green-500',  iconColor: 'text-green-500' },
    { title: 'Processing',     value: stats.processing,  icon: Clock,        borderColor: 'border-l-amber-500',  iconColor: 'text-amber-500' },
    { title: 'Expired',        value: stats.expired,     icon: AlertTriangle,borderColor: 'border-l-red-500',    iconColor: 'text-red-500' },
    { title: 'Expiring',       value: stats.expiring,    icon: FileText,     borderColor: 'border-l-indigo-500', iconColor: 'text-indigo-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ── */}
        <div
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
          style={{ animation: 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <LayoutDashboard className="h-7 w-7" />
              Faculty Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Monitor department agreements and manage active institutional partnerships.
            </p>
          </div>
          {profile?.canManageMOA && (
            <div style={{ animation: 'fadeIn 0.4s ease-out both', animationDelay: '100ms' }}>
              <Button
                className="gap-2 shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-px active:translate-y-0"
                onClick={() => setIsAddOpen(true)}
              >
                <PlusCircle className="h-5 w-5" />
                New Agreement
              </Button>
            </div>
          )}
        </div>

        {/* ── Stat cards ── */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((card, i) => (
            <StatCard key={card.title} {...card} index={i} />
          ))}
        </div>

        {/* ── Filters ── */}
        <div
          className="bg-white p-4 rounded-xl border shadow-sm mb-6 space-y-4"
          style={{ animation: 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '350ms' }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by company, status, contact, or college..."
                className="pl-10 transition-all duration-200 focus:ring-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                  <SelectTrigger className="w-[180px] transition-colors hover:bg-accent/30">
                    <SelectValue placeholder="All Colleges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Colleges</SelectItem>
                    {COLLEGES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Select value={datePreset} onValueChange={setDatePreset}>
                <SelectTrigger className="w-[150px] transition-colors hover:bg-accent/30">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Since Today</SelectItem>
                  <SelectItem value="week">Since This Week</SelectItem>
                  <SelectItem value="month">Since This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div
          className="bg-white rounded-xl border shadow-sm overflow-hidden"
          style={{ animation: 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '430ms' }}
        >
          <div className="p-4 border-b bg-muted/30">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-tight flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Agreement Records ({filteredMoas.length})
            </h2>
          </div>
          <MOATable data={filteredMoas} role="faculty" loading={loading} />
        </div>

        <MoaFormDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
      </main>
    </div>
  );
}