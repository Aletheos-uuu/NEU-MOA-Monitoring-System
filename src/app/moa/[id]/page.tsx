"use client";

import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Building2, User, Download, ArrowLeft, ShieldCheck, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function MoaDetailPage({ params }: { params: { id: string } }) {
  const { profile } = useAuth();

  // Mock data for the specific MOA
  const moa = {
    id: params.id,
    title: 'IT Partnership for Collaborative Research 2024',
    partner: 'Tech Solutions Global Inc.',
    description: 'A comprehensive agreement focusing on artificial intelligence research and student placement programs for the College of Computer Studies.',
    status: 'active',
    category: 'Academic/Industry',
    signDate: '2024-01-15',
    expiryDate: '2025-12-31',
    representative: 'Dr. Jane Smith (NEU) & Mark Lee (Tech Solutions)',
    documentUrl: '#',
    clauses: [
      'Joint intellectual property ownership for software artifacts.',
      'Allocation of 10 internship slots per semester.',
      'Access to partner computing infrastructure for faculty.',
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href={`/${profile?.role}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary hover:bg-primary/90">{moa.category}</Badge>
              <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 capitalize">{moa.status}</Badge>
            </div>
            <h1 className="text-4xl font-bold text-primary tracking-tight leading-tight">{moa.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="font-medium">{moa.partner}</span>
            </div>
          </div>
          <Button size="lg" className="gap-2 shadow-lg">
            <Download className="h-5 w-5" />
            Download PDF
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary">
                <Info className="h-5 w-5" />
                Agreement Summary
              </h2>
              <p className="text-muted-foreground leading-relaxed bg-white p-6 rounded-xl border">
                {moa.description}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                Key Provisions
              </h2>
              <ul className="space-y-3">
                {moa.clauses.map((clause, idx) => (
                  <li key={idx} className="flex gap-3 bg-white p-4 rounded-lg border border-l-4 border-l-accent">
                    <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{clause}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="space-y-6">
            <Card className="border-t-4 border-t-accent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Effective Date</p>
                    <p className="text-sm font-semibold">{moa.signDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-destructive/10 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Expiry Date</p>
                    <p className="text-sm font-semibold">{moa.expiryDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Representatives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                   <div className="bg-accent/10 p-2 rounded-lg">
                    <User className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-snug">{moa.representative}</p>
                    <p className="text-[10px] uppercase text-muted-foreground font-bold mt-1">Designated Signatories</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="relative h-48 rounded-xl overflow-hidden border">
              <Image 
                src="https://picsum.photos/seed/doc99/600/400" 
                fill 
                className="object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
                alt="MOA Document Preview"
                data-ai-hint="document"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button variant="secondary" className="gap-2 bg-white/90 backdrop-blur-sm">
                  <FileText className="h-4 w-4" />
                  Preview Document
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
