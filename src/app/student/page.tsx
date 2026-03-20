"use client";

import { useState, useMemo, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MOATable } from '@/components/moa/MOATable';
import {
  FileText, AlertTriangle, Clock, CheckCircle2,
  Search, SlidersHorizontal, GraduationCap, Building2,
} from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { startOfToday, startOfWeek, startOfMonth, isAfter, isBefore, parseISO, addMonths } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

const APPROVED_STATUSES = [
  "APPROVED: Signed by President",
  "APPROVED: On-going notarization",
  "APPROVED: No notarization needed",
];

interface MOA {
  id: string; hteId: string; companyName: string; address?: string;
  contactPerson?: string; contactEmail?: string; industryType: string;
  effectiveDate: string; expiryDate: string; status: string;
  endorsedByCollege?: string; isDeleted: boolean; auditTrail: any[];
}

const statConfig = [
  { key: 'active',   label: 'Active Partners',  desc: 'Available for placement', icon: CheckCircle2,  bar: 'bg-emerald-500', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
  { key: 'expiring', label: 'Expiring Soon',    desc: 'Within next 2 months',    icon: Clock,         bar: 'bg-violet-500',  iconBg: 'bg-violet-50',  iconColor: 'text-violet-500' },
  { key: 'expired',  label: 'Expired',          desc: 'No longer active',         icon: AlertTriangle, bar: 'bg-red-500',     iconBg: 'bg-red-50',     iconColor: 'text-red-500' },
  { key: 'colleges', label: 'Colleges Covered', desc: 'Across departments',       icon: Building2,     bar: 'bg-blue-500',    iconBg: 'bg-blue-50',    iconColor: 'text-blue-500' },
] as const;

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
    let active = 0, expired = 0, expiring = 0;
    filteredMoas.forEach(m => {
      const s = getEffectiveStatus(m);
      if (s.startsWith('EXPIRED')) expired++;
      else if (s.startsWith('EXPIRING')) expiring++;
      else if (s.startsWith('APPROVED')) active++;
    });
    return { active, expired, expiring, colleges: new Set(filteredMoas.map(m => m.endorsedByCollege)).size };
  }, [filteredMoas]);

  return (
    <div className="min-h-screen bg-[#f0f3f9]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Personalised header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/50 mb-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            Student Portal
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Internship Opportunities
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Welcome, <span className="font-semibold text-gray-700">{profile?.fullName}</span>. Browse verified institutional partnerships available for placement.
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-7">
          {statConfig.map(({ key, label, desc, icon: Icon, bar, iconBg, iconColor }, i) => (
            <div
              key={key}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`h-1 ${bar}`} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</p>
                  <div className={`h-9 w-9 rounded-xl ${iconBg} flex items-center justify-center`}>
                    <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
                  </div>
                </div>
                <p className="text-[2.5rem] font-extrabold text-gray-900 leading-none mb-1">
                  {stats[key as keyof typeof stats]}
                </p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by company, college, or status…"
                className="pl-10 h-10 bg-gray-50 border-gray-200 placeholder:text-gray-400 focus:bg-white transition-colors rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <Select value={collegeFilter} onValueChange={setCollegeFilter}>
                  <SelectTrigger className="w-[210px] h-10 bg-gray-50 border-gray-200 rounded-xl text-sm">
                    <SelectValue placeholder="All Colleges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Colleges</SelectItem>
                    {COLLEGES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Select value={datePreset} onValueChange={setDatePreset}>
                <SelectTrigger className="w-[150px] h-10 bg-gray-50 border-gray-200 rounded-xl text-sm">
                  <SelectValue placeholder="All Time" />
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
            <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Verified Agreements</p>
              <p className="text-xs text-gray-400">{filteredMoas.length} partnerships available</p>
            </div>
          </div>
          <MOATable data={filteredMoas} role="student" loading={loading} />
        </div>
      </main>
    </div>
  );
}