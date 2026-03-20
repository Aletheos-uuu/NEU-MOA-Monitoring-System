"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ADMIN_EMAILS } from '@/lib/admin.config';

export type UserRole = 'student' | 'faculty' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  isBlocked: boolean;
  canManageMOA: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const syncProfile = async (firebaseUser: User) => {
    const isNeuEmail = firebaseUser.email?.endsWith('@neu.edu.ph');

    if (!isNeuEmail) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Only @neu.edu.ph accounts are allowed to access this system.',
      });
      await signOut(auth);
      return;
    }

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;

        if (data.isBlocked) {
          toast({
            variant: 'destructive',
            title: 'Account Blocked',
            description: 'Your account has been disabled. Please contact the administrator.',
          });
          await signOut(auth);
          return;
        }

        // Keep display name in sync if it was a placeholder
        if (firebaseUser.displayName && data.fullName === 'NEU User') {
          await updateDoc(userRef, { fullName: firebaseUser.displayName });
          data.fullName = firebaseUser.displayName;
        }

        setProfile(data);
      } else {
        // ── New user: assign role from admin.config.ts if email matches ──
        const isPresetAdmin = ADMIN_EMAILS.map(e => e.toLowerCase()).includes(
          (firebaseUser.email ?? '').toLowerCase()
        );

        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          fullName: firebaseUser.displayName || 'NEU User',
          role: isPresetAdmin ? 'admin' : 'student',
          isBlocked: false,
          canManageMOA: false,
        };

        await setDoc(userRef, newProfile);
        setProfile(newProfile);

        if (isPresetAdmin) {
          toast({
            title: 'Admin access granted',
            description: `Welcome, ${newProfile.fullName}. You have been assigned the admin role.`,
          });
        }
      }
    } catch (error: any) {
      console.error('Error in syncProfile:', error);
      toast({
        variant: 'destructive',
        title: 'Profile Error',
        description: 'Failed to synchronize user profile data.',
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        await syncProfile(firebaseUser);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login Error',
        description: error.message || 'Failed to sign in with Google.',
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}