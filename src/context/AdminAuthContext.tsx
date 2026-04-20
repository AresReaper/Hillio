import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AdminUser {
  uid: string;
  email: string | null;
  username: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  lastTripId: string | null;
  setLastTripId: (id: string | null) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [lastTripId, setLastTripIdState] = useState<string | null>(() => {
    return localStorage.getItem('last_trip_id');
  });

  const setLastTripId = (id: string | null) => {
    setLastTripIdState(id);
    if (id) {
      localStorage.setItem('last_trip_id', id);
    } else {
      localStorage.removeItem('last_trip_id');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setAdmin({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Admin',
        });
      } else {
        setAdmin(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AdminAuthContext.Provider value={{ 
      admin, 
      logout, 
      isAuthenticated: !!admin, 
      loading,
      lastTripId, 
      setLastTripId 
    }}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
