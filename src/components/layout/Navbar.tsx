"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Users, LayoutDashboard, LogOut, Menu } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const { profile, logout } = useAuth();
  const neuLogo = PlaceHolderImages.find(img => img.id === 'neu-logo');

  if (!profile) return null;

  const NavLinks = () => (
    <>
      {profile.role === 'admin' && (
        <>
          <Link 
            href="/admin" 
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link 
            href="/admin/users" 
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
          >
            <Users className="h-4 w-4" />
            User Management
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px]">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="text-left text-primary flex items-center gap-2">
                      {neuLogo && (
                        <Image 
                          src={neuLogo.imageUrl} 
                          alt="NEU Logo" 
                          width={32} 
                          height={32} 
                          className="object-contain"
                        />
                      )}
                      Menu
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4">
                    <NavLinks />
                    <div className="border-t pt-4 mt-4">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Account</p>
                      <div className="flex flex-col gap-1 mb-4">
                        <span className="text-sm font-semibold">{profile.fullName}</span>
                        <span className="text-xs text-muted-foreground uppercase">{profile.role}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2 text-destructive hover:text-destructive" 
                        onClick={logout}
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

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
              <span className="hidden xs:inline">NEU MOA Monitor</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 ml-4">
              <NavLinks />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right mr-2">
              <span className="text-xs font-semibold text-primary uppercase">{profile.role}</span>
              <span className="text-sm font-medium">{profile.fullName}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="hidden sm:inline-flex text-muted-foreground hover:text-destructive">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
