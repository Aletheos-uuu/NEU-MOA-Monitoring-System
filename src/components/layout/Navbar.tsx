"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Users, LayoutDashboard, LogOut, Menu, ChevronDown } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

const roleBadgeStyles: Record<string, string> = {
  admin:   'bg-violet-100 text-violet-700 border-violet-200',
  faculty: 'bg-blue-100   text-blue-700   border-blue-200',
  student: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

function UserAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        'rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 transition-transform duration-150',
        size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs'
      )}
    >
      {initials}
    </div>
  );
}

export function Navbar() {
  const { profile, logout } = useAuth();
  const neuLogo = PlaceHolderImages.find(img => img.id === 'neu-logo');

  if (!profile) return null;

  const roleLabel = profile.role.charAt(0).toUpperCase() + profile.role.slice(1);

  const NavLinks = () => (
    <>
      {profile.role === 'admin' && (
        <>
          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors py-2 border-b border-transparent hover:border-primary"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors py-2 border-b border-transparent hover:border-primary"
          >
            <Users className="h-4 w-4" />
            Users
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
      style={{ animation: 'fadeDown 0.4s cubic-bezier(0.22,1,0.36,1) both' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">

          {/* Left */}
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600 transition-colors hover:bg-gray-100">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                  <SheetHeader className="p-6 pb-4 border-b">
                    <SheetTitle className="text-left">
                      <div className="flex items-center gap-3">
                        {neuLogo && (
                          <Image src={neuLogo.imageUrl} alt="NEU" width={36} height={36} className="object-contain" />
                        )}
                        <div>
                          <p className="font-bold text-primary text-sm">NEU MOA Monitor</p>
                          <p className="text-xs text-gray-500">New Era University</p>
                        </div>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="p-6 space-y-1">
                    <NavLinks />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                      <UserAvatar name={profile.fullName} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{profile.fullName}</p>
                        <span className={cn(
                          'inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                          roleBadgeStyles[profile.role] || 'bg-gray-100 text-gray-600 border-gray-200'
                        )}>
                          {roleLabel}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 h-9 transition-colors"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Brand */}
            <Link href={`/${profile.role}`} className="flex items-center gap-3 group">
              {neuLogo && (
                <Image
                  src={neuLogo.imageUrl}
                  alt="NEU"
                  width={36}
                  height={36}
                  className="object-contain transition-transform duration-200 group-hover:scale-105"
                />
              )}
              <div className="hidden sm:block">
                <p className="font-bold text-primary text-sm leading-tight">NEU MOA Monitor</p>
                <p className="text-[10px] text-gray-400 leading-tight">New Era University</p>
              </div>
            </Link>

            {/* Desktop nav */}
            {profile.role === 'admin' && (
              <div className="hidden md:flex items-center gap-1 ml-6">
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all duration-150"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all duration-150"
                >
                  <Users className="h-3.5 w-3.5" />
                  Users
                </Link>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 h-10 px-3 rounded-xl hover:bg-gray-100 transition-all duration-150 group">
                  <UserAvatar name={profile.fullName} />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-gray-900 leading-tight max-w-[120px] truncate">
                      {profile.fullName}
                    </p>
                    <span className={cn(
                      'inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border leading-none',
                      roleBadgeStyles[profile.role] || 'bg-gray-100 text-gray-600 border-gray-200'
                    )}>
                      {roleLabel}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden sm:block group-hover:text-gray-600 transition-all duration-150 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-lg">
                <div className="px-3 py-2.5 border-b">
                  <p className="text-sm font-semibold text-gray-900 truncate">{profile.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                </div>
                <DropdownMenuSeparator className="hidden" />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 focus:text-red-700 focus:bg-red-50 gap-2 mt-1 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}