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
import { FileText, AlertTriangle, Clock, CheckCircle2, Search, PlusCircle, Filter } from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { startOfToday, startOfWeek, startOfMonth, isAfter, parseISO } from 'date-fns';

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

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [moas, setMoas] = useState<MOA[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [datePreset, setDatePreset] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'moas'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MOA));
      setMoas(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const colleges = useMemo(() => {
    const unique = new Set(moas.map(m => m.endorsedByCollege).filter(Boolean));
    return Array.from(unique).sort();
  }, [moas]);

  const filteredMoas = useMemo(() => {
    return moas.filter(moa => {
      // College Filter
      if (collegeFilter !== 'all' && moa.endorsedByCollege !== collegeFilter) return false;

      // Date Preset Filter
      if (datePreset !== 'all') {
        const effectiveDate = parseISO(moa.effectiveDate);
        if (datePreset === 'today' && !isAfter(effectiveDate, startOfToday())) return false;
        if (datePreset === 'week' && !isAfter(effectiveDate, startOfWeek(new Date()))) return false;
        if (datePreset === 'month' && !isAfter(effectiveDate, startOfMonth(new Date()))) return false;
      }

      // Search Filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          moa.companyName.toLowerCase().includes(search) ||
          moa.address?.toLowerCase().includes(search) ||
          moa.contactPerson?.toLowerCase().includes(search) ||
          moa.contactEmail?.toLowerCase().includes(search) ||
          moa.endorsedByCollege?.toLowerCase().includes(search) ||
          moa.industryType.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [moas, collegeFilter, datePreset, searchTerm]);

  const stats = useMemo(() => {
    // Stats are computed from the FILTERED list as per requirements
    const active = filteredMoas.filter(m => !m.isDeleted && m.status.startsWith('APPROVED')).length;
    const processing = filteredMoas.filter(m => !m.isDeleted && m.status.startsWith('PROCESSING')).length;
    const expired = filteredMoas.filter(m => !m.isDeleted && m.status.startsWith('EXPIRED')).length;
    const expiring = filteredMoas.filter(m => !m.isDeleted && m.status.startsWith('EXPIRING')).length;

    return { active, processing, expired, expiring };
  }, [filteredMoas]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Admin Console</h1>
            <p className="text-muted-foreground text-sm">System-wide monitoring and institutional partnership oversight.</p>
          </div>
          <Button className="gap-2 shadow-lg" onClick={() => setIsAddOpen(true)}>
            <PlusCircle className="h-5 w-5" />
            New Agreement
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active MOAs</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.active}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Approved agreements</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Processing</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.processing}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Pending approval</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expired</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.expired}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Ended partnerships</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-indigo-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expiring</CardTitle>
              <FileText className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.expiring}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Renewal required</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl border shadow-sm mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by company, contact, or college..." 
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
                    {colleges.map(college => (
                      <SelectItem key={college} value={college || ''}>{college}</SelectItem>
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

        {/* Table View */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-tight flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Agreement Records ({filteredMoas.length})
            </h2>
          </div>
          <MOATable data={filteredMoas} role="admin" loading={loading} />
        </div>

        <MoaFormDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
      </main>
    </div>
  );
}
