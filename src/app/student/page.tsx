"use client";

import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { MOAList } from '@/components/moa/MOAList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, BookOpen, Briefcase } from 'lucide-react';

export default function StudentDashboard() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Student Portal</h1>
          <p className="text-muted-foreground">Welcome, {profile?.fullName}. Browse internship and research opportunities.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-white">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <Briefcase className="h-6 w-6" />
              </div>
              <CardTitle>Internships</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 text-sm">Find partner companies offering specialized student placements.</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent to-accent/80 text-white">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <CardTitle>Research</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 text-sm">Access agreements for collaborative institutional research.</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-400 text-white">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
              <CardTitle>Scholarships</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 text-sm">View partner-sponsored scholarship opportunities.</p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-semibold mb-4 text-primary">Available Partnerships</h2>
        <MOAList role="student" />
      </main>
    </div>
  );
}
