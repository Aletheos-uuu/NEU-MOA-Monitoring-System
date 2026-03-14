"use client";

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { MOAList } from '@/components/moa/MOAList';
import { MoaFormDialog } from '@/components/moa/MoaFormDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Cpu, FileText, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function FacultyDashboard() {
  const { profile } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <h1 className="text-3xl font-bold text-primary">Faculty Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Manage your department's agreements and research partnerships.</p>
          </div>
          <div className="flex gap-3">
             <Link href="/ai-tools">
              <Button variant="outline" className="gap-2">
                <Cpu className="h-4 w-4 text-accent" />
                Analyze MOA
              </Button>
            </Link>
            {profile?.canManageMOA && (
              <Button className="gap-2 shadow-md" onClick={() => setIsAddOpen(true)}>
                <PlusCircle className="h-4 w-4" />
                New Agreement
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 mb-8 border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-primary">
              <FileText className="h-5 w-5" />
              Active Partnerships
            </h2>
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Role: <span className="font-bold uppercase">{profile?.role}</span> 
              {profile?.canManageMOA && <span className="ml-2 text-green-600 font-bold">• MANAGEMENT ENABLED</span>}
            </div>
          </div>
          <MOAList role="faculty" />
        </div>

        <MoaFormDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
      </main>
    </div>
  );
}
