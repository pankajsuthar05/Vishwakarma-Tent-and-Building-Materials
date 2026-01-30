'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // BYPASS AUTH: Providing a static dummy user for demo purposes
    const [user, setUser] = useState<User | null>({
        uid: 'demo-owner-123',
        email: 'owner@example.com',
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: '',
        tenantId: null,
        delete: async () => { },
        getIdToken: async () => '',
        getIdTokenResult: async () => ({} as any),
        reload: async () => { },
        toJSON: () => ({}),
        displayName: 'Demo Owner',
        phoneNumber: null,
        photoURL: null,
    } as unknown as User);

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Disabled Firebase listener for "Direct Open" mode
    /*
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
        if (!user) {
          router.push('/login');
        }
      });
  
      return () => unsubscribe();
    }, [router]);
    */

    const logout = async () => {
        // await signOut(auth);
        // router.push('/login');
        alert("Logout disabled in Demo Mode");
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
