"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface MOA {
  id: string;
  title: string;
  partner: string;
  expiryDate: string;
  status: 'active' | 'pending' | 'expired';
  category: string;
}

const mockMoas: MOA[] = [
  { id: '1', title: 'IT Partnership for Research', partner: 'Tech Solutions Inc.', expiryDate: '2025-12-31', status: 'active', category: 'Academic' },
  { id: '2', title: 'Student Internship Agreement', partner: 'Global Systems Ltd.', expiryDate: '2024-06-15', status: 'pending', category: 'Internship' },
  { id: '3', title: 'Community Outreach Extension', partner: 'Local NGO Union', expiryDate: '2023-11-20', status: 'expired', category: 'Extension' },
  { id: '4', title: 'Joint Faculty Development', partner: 'International University X', expiryDate: '2026-08-01', status: 'active', category: 'Faculty Exchange' },
];

export function MOAList({ role }: { role: string }) {
  const getStatusIcon = (status: MOA['status']) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'expired': return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: MOA['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {mockMoas.map((moa) => (
        <Card key={moa.id} className="group hover:shadow-md transition-all border-l-4 border-l-primary/20 hover:border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">{moa.category}</Badge>
            {getStatusIcon(moa.status)}
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">{moa.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1 mb-4">{moa.partner}</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase">Expires</span>
                <span className="text-xs font-medium">{moa.expiryDate}</span>
              </div>
              <Link href={`/moa/${moa.id}`}>
                <Button variant="ghost" size="sm" className="gap-1 hover:bg-primary hover:text-white">
                  Details
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
