
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

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
    console.log("Starting syncProfile for:", firebaseUser.email);
    
    // NOTE: Check for institutional email. 
    // If you are testing with a non-NEU account, this will trigger a sign-out.
    const isNeuEmail = firebaseUser.email?.endsWith('@neu.edu.ph');
    
    if (!isNeuEmail) {
      const reason = `Access Denied: Email ${firebaseUser.email} is not a valid @neu.edu.ph account.`;
      console.warn(reason);
      
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
        console.log("Found existing profile:", data);
        
        if (data.isBlocked) {
          console.warn("User is blocked in Firestore:", firebaseUser.uid);
          toast({
            variant: 'destructive',
            title: 'Account Blocked',
            description: 'Your account has been disabled. Please contact the administrator.',
          });
          await signOut(auth);
          return;
        }
        setProfile(data);
      } else {
        console.log("No profile found, creating new student profile for:", firebaseUser.uid);
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          fullName: firebaseUser.displayName || 'NEU User',
          role: 'student',
          isBlocked: false,
          canManageMOA: false,
        };
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
      }
    } catch (error: any) {
      console.error("Error in syncProfile:", error);
      toast({
        variant: 'destructive',
        title: 'Profile Error',
        description: 'Failed to synchronize user profile data.',
      });
    }
  };

  useEffect(() => {
    console.log("AuthProvider: Initializing onAuthStateChanged listener...");
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("onAuthStateChanged fired. User:", firebaseUser ? `${firebaseUser.email} (${firebaseUser.uid})` : "null");
      
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
    console.log("Initiating Google Sign-In Popup...");
    try {
      // We don't handle routing here; onAuthStateChanged handles the state transition.
      await signInWithPopup(auth, googleProvider);
      console.log("signInWithPopup resolved successfully.");
    } catch (error: any) {
      console.error("Login Error in signInWithPopup:", error);
      toast({
        variant: 'destructive',
        title: 'Login Error',
        description: error.message || "Failed to sign in with Google.",
      });
    }
  };

  const logout = async () => {
    console.log("Logging out...");
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
