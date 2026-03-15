"use client";

import { useState, useMemo, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MOATable } from '@/components/moa/MOATable';
import { FileText, CheckCircle2, Search, Filter, GraduationCap, Clock, AlertTriangle } from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { startOfToday, startOfWeek, startOfMonth, isAfter, isBefore, parseISO, addMonths } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const COLLEGES = [
  "College of Accountancy",
  "College of Agriculture",
  "College of Arts and Sciences",
  "College of Business Administration",
  "College of Communication",
  "College of Criminology",
  "College of Education",
  "College of Engineering and Architecture",
  "College of Informatics and Computing Studies",
  "College of Medical Technology",
  "College of Midwifery",
  "College of Music",
  "College of Nursing",
  "College of Physical Therapy",
  "College of Respiratory Therapy",
  "School of International Relations",
  "College of Law",
  "College of Medicine",
  "School of Graduate Studies"
];

const APPROVED_STATUSES = [
  "APPROVED: Signed by President",
  "APPROVED: On-going notarization",
  "APPROVED: No notarization needed",
];

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

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [moas, setMoas] = useState<MOA[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [datePreset, setDatePreset] = useState('all');

  useEffect(() => {
    const q = query(
      collection(db, 'moas'), 
      where('isDeleted', '==', false),
      where('status', 'in', APPROVED_STATUSES)
    );
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MOA));
        setMoas(data);
        setLoading(false);
      },
      async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'moas',
          operation: 'list',
        }));
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

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
        const search = searchTerm.toLowerCase();
        const effectiveStatus = getEffectiveStatus(moa).toLowerCase();
        return (
          moa.companyName.toLowerCase().includes(search) ||
          moa.address?.toLowerCase().includes(search) ||
          moa.contactPerson?.toLowerCase().includes(search) ||
          moa.contactEmail?.toLowerCase().includes(search) ||
          moa.endorsedByCollege?.toLowerCase().includes(search) ||
          moa.industryType.toLowerCase().includes(search) ||
          effectiveStatus.includes(search)
        );
      }

      return true;
    });
  }, [moas, collegeFilter, datePreset, searchTerm]);

  const stats = useMemo(() => {
    let active = 0;
    let expired = 0;
    let expiring = 0;

    filteredMoas.forEach(m => {
      const effectiveStatus = getEffectiveStatus(m);
      if (effectiveStatus.startsWith('EXPIRED')) {
        expired++;
      } else if (effectiveStatus.startsWith('EXPIRING')) {
        expiring++;
      } else if (effectiveStatus.startsWith('APPROVED')) {
        active++;
      }
    });

    return { 
      active, 
      expired,
      expiring,
      colleges: new Set(filteredMoas.map(m => m.endorsedByCollege)).size
    };
  }, [filteredMoas]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <GraduationCap className="h-7 w-7" />
            Student Portal
          </h1>
          <p className="text-muted-foreground text-sm">Welcome, {profile?.fullName}. Browse verified internship and institutional research opportunities.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Partnerships</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-indigo-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expiring Soon</CardTitle>
              <Clock className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.expiring}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expired</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.expired}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-primary shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Colleges Involved</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.colleges}</div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white p-4 rounded-xl border shadow-sm mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by company, status, or college..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Colleges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Colleges</SelectItem>
                    {COLLEGES.map(college => (
                      <SelectItem key={college} value={college}>{college}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Select value={datePreset} onValueChange={setDatePreset}>
                <SelectTrigger className="w-[150px]">
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

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-tight flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Verified Agreements ({filteredMoas.length})
            </h2>
          </div>
          <MOATable data={filteredMoas} role="student" loading={loading} />
        </div>
      </main>
    </div>
  );
}
