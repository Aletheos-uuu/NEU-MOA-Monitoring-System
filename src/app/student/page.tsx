"use client";

import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { MOAList } from '@/components/moa/MOAList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, BookOpen, Briefcase, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function StudentDashboard() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Student Portal</h1>
          <p className="text-muted-foreground">Welcome, {profile?.fullName}. Browse verified internship and research opportunities.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg border-none">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <Briefcase className="h-6 w-6" />
              </div>
              <CardTitle>Internships</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 text-sm">Find partner companies offering specialized student placements and career paths.</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent to-accent/80 text-white shadow-lg border-none">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <CardTitle>Research</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 text-sm">Access agreements for collaborative institutional research and academic projects.</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-400 text-white shadow-lg border-none">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
              <CardTitle>Scholarships</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 text-sm">View partner-sponsored scholarship opportunities and grant programs.</p>
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-8 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Note for Students</AlertTitle>
          <AlertDescription className="text-blue-700">
            Only fully approved (APPROVED) agreements are listed here. For contact details and specific requirements, please click on "Details".
          </AlertDescription>
        </Alert>

        <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
          <Briefcase className="h-6 w-6" />
          Verified Partnerships
        </h2>
        <MOAList role="student" />
      </main>
    </div>
  );
}
