"use client";

import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { MOAList } from '@/components/moa/MOAList';
import { Button } from '@/components/ui/button';
import { FileText, PlusCircle, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function FacultyDashboard() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Faculty Dashboard</h1>
            <p className="text-muted-foreground">Manage your department's agreements and research partnerships.</p>
          </div>
          <div className="flex gap-3">
             <Link href="/ai-tools">
              <Button variant="outline" className="gap-2">
                <Cpu className="h-4 w-4" />
                Analyze MOA
              </Button>
            </Link>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              New Proposal
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 mb-8 border shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-primary">Your Active Projects</h2>
          <MOAList role="faculty" />
        </div>
      </main>
    </div>
  );
}
