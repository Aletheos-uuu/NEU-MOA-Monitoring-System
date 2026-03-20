"use client";

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { AlertCircle, CheckCircle2 as CheckCircle, FileText, Users } from 'lucide-react';

export default function LoginPage() {
  const { login, profile, loading } = useAuth();
  const router = useRouter();
  const neuLogo = PlaceHolderImages.find(img => img.id === 'neu-logo');

  useEffect(() => {
    if (profile && !loading) {
      router.push(`/${profile.role}`);
    }
  }, [profile, loading, router]);

  const features = [
    { icon: FileText, text: 'Real-time MOA status tracking' },
    { icon: Users,    text: 'Role-based access for admin, faculty & students' },
    { icon: CheckCircle, text: 'Audit trail for all agreement changes' },
  ];

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row bg-[#0b1d6e]">

      {/* ─── Branding panel ─── */}
      <div
        className="relative flex flex-col justify-between overflow-hidden bg-[#0b1d6e]
                   px-8 pt-10 pb-8
                   lg:w-[52%] lg:px-14 lg:py-0 lg:h-full"
        style={{ animation: 'slideInLeft 0.6s cubic-bezier(0.22,1,0.36,1) both' }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-[360px] h-[360px] rounded-full bg-cyan-500/10 blur-3xl" />
          <svg className="absolute bottom-0 right-0 opacity-10" width="320" height="320" viewBox="0 0 320 320" fill="none">
            <circle cx="320" cy="320" r="280" stroke="white" strokeWidth="1" fill="none" />
            <circle cx="320" cy="320" r="220" stroke="white" strokeWidth="1" fill="none" />
            <circle cx="320" cy="320" r="160" stroke="white" strokeWidth="1" fill="none" />
          </svg>
        </div>

        {/* Logo */}
        <div
          className="relative z-10 flex items-center gap-3 lg:pt-14"
          style={{ animation: 'fadeDown 0.5s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '200ms' }}
        >
          {neuLogo && (
            <div className="h-11 w-11 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-1.5 flex-shrink-0">
              <Image src={neuLogo.imageUrl} alt="NEU Logo" width={40} height={40} className="object-contain" />
            </div>
          )}
          <div>
            <p className="text-white font-bold text-sm leading-tight">New Era University</p>
            <p className="text-blue-300/70 text-[11px] tracking-wide">Est. 1975 · Quezon City, Philippines</p>
          </div>
        </div>

        {/* Headline + features — desktop only */}
        <div className="relative z-10 hidden lg:block">
          <h1
            className="text-[3.2rem] font-extrabold text-white leading-[1.1] tracking-tight mb-4"
            style={{ animation: 'fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '300ms' }}
          >
            MOA<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Monitor
            </span>
          </h1>
          <p
            className="text-blue-200/80 text-base leading-relaxed max-w-[320px] mb-8"
            style={{ animation: 'fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '380ms' }}
          >
            Centralized platform for managing Memorandums of Agreement across all NEU colleges and departments.
          </p>
          <div className="space-y-3.5">
            {features.map(({ icon: Icon, text }, i) => (
              <div
                key={text}
                className="flex items-center gap-3"
                style={{
                  animation: 'slideInLeft 0.5s cubic-bezier(0.22,1,0.36,1) both',
                  animationDelay: `${460 + i * 80}ms`,
                }}
              >
                <div className="h-7 w-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-cyan-400" />
                </div>
                <span className="text-blue-100/90 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile tagline */}
        <div
          className="relative z-10 lg:hidden mt-5 mb-2"
          style={{ animation: 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '200ms' }}
        >
          <h1 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
            MOA <span className="text-cyan-400">Monitor</span>
          </h1>
          <p className="text-blue-200/70 text-sm mt-1.5">
            NEU's institutional partnership management platform.
          </p>
        </div>

        {/* Copyright */}
        <div
          className="relative z-10 hidden lg:block lg:pb-14"
          style={{ animation: 'fadeIn 0.6s ease-out both', animationDelay: '700ms' }}
        >
          <p className="text-blue-400/50 text-xs">
            © {new Date().getFullYear()} New Era University · All rights reserved
          </p>
        </div>
      </div>

      {/* ─── Form panel ─── */}
      <div
        className="flex-1 flex items-center justify-center bg-white rounded-t-3xl lg:rounded-none px-6 py-10 sm:px-10 lg:overflow-y-auto"
        style={{ animation: 'slideInRight 0.6s cubic-bezier(0.22,1,0.36,1) both' }}
      >
        <div
          className="w-full max-w-[400px]"
          style={{ animation: 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '300ms' }}
        >
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">
              Welcome back
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Sign in with your institutional Google account to access the system.
            </p>
          </div>

          {/* Sign-in button */}
          <button
            onClick={login}
            className="group w-full flex items-center gap-3 h-[52px] px-5 rounded-xl font-semibold text-sm text-white
              bg-[#0b1d6e] hover:bg-[#0d228a]
              shadow-[0_4px_14px_rgba(11,29,110,0.35)] hover:shadow-[0_6px_20px_rgba(11,29,110,0.45)]
              transition-all duration-200 hover:scale-[1.015] active:scale-[0.995]"
          >
            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
              <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z"/>
              <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z"/>
              <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z"/>
            </svg>
            <span className="flex-1 text-center">Continue with NEU Google</span>
            <svg
              className="h-4 w-4 opacity-50 group-hover:translate-x-0.5 transition-transform flex-shrink-0"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {/* Domain restriction note */}
          <div
            className="mt-5 flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-100 rounded-xl"
            style={{ animation: 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '450ms' }}
          >
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 text-xs leading-relaxed">
              Access is restricted to{' '}
              <span className="font-semibold font-mono">@neu.edu.ph</span>{' '}
              email addresses only.
            </p>
          </div>

          {/* Access level badges */}
          <div
            className="mt-7 pt-7 border-t border-gray-100"
            style={{ animation: 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '530ms' }}
          >
            <p className="text-[10px] text-gray-400 text-center mb-3 uppercase tracking-widest font-bold">
              Access Levels
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'Admin',   color: 'bg-violet-100 text-violet-700',  delay: 580 },
                { role: 'Faculty', color: 'bg-blue-100   text-blue-700',    delay: 640 },
                { role: 'Student', color: 'bg-emerald-100 text-emerald-700', delay: 700 },
              ].map(({ role, color, delay }) => (
                <div
                  key={role}
                  className={`${color} rounded-lg py-1.5 text-center text-[11px] font-semibold`}
                  style={{
                    animation: 'scaleIn 0.35s cubic-bezier(0.22,1,0.36,1) both',
                    animationDelay: `${delay}ms`,
                  }}
                >
                  {role}
                </div>
              ))}
            </div>
          </div>

          <p className="lg:hidden text-center text-[10px] text-gray-400 mt-8">
            © {new Date().getFullYear()} New Era University · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}