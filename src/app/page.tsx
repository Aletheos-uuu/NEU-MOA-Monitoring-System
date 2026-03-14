"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!profile) {
        router.push('/login');
      } else {
        router.push(`/${profile.role}`);
      }
    }
  }, [profile, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="space-y-4 text-center">
        <Skeleton className="h-12 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
    </div>
  );
}
