"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Users, LayoutDashboard, LogOut } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Navbar() {
  const { profile, logout } = useAuth();
  const neuLogo = PlaceHolderImages.find(img => img.id === 'neu-logo');

  if (!profile) return null;

  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href={`/${profile.role}`} className="flex items-center gap-3 font-bold text-primary text-xl">
              {neuLogo && (
                <Image 
                  src={neuLogo.imageUrl} 
                  alt="NEU Logo" 
                  width={40} 
                  height={40} 
                  className="object-contain"
                  data-ai-hint={neuLogo.imageHint}
                />
              )}
              <span>NEU MOA Monitor</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              {profile.role === 'admin' && (
                <>
                  <Link href="/admin" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link href="/admin/users" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    <Users className="h-4 w-4" />
                    User Management
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right mr-2">
              <span className="text-xs font-semibold text-primary uppercase">{profile.role}</span>
              <span className="text-sm font-medium">{profile.fullName}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
