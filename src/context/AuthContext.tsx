'use client';
import { createContext, useContext, useState } from 'react';
import { User } from 'firebase/auth';

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
    const [user] = useState<User | null>({
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

    const [loading] = useState(false);

    const logout = async () => {
        alert("Logout disabled in Demo Mode");
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

