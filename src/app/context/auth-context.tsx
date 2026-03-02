// /app/context/auth-context.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie'; 
import {User, UserRole } from '@/data/types'

// Tipo de usuario para el estado, puede ser User o null
export type AuthUser = User | null;

interface AuthContextType {
    isAuthenticated: boolean;
    user: AuthUser; // ✨ CAMBIO: Ahora es el objeto User completo
    login: (userData: User) => void; // ✨ CAMBIO: Ahora recibe el objeto User completo
    logout: () => void;
    isHydrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<AuthUser>(null); // ✨ CAMBIO: Estado para el objeto User completo
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const authCookie = Cookies.get('auth');
        if (authCookie) {
            try {
                // ✨ CAMBIO: Parseamos el objeto User completo
                const userData: User = JSON.parse(authCookie);
                
                // Verificamos que al menos los campos esenciales existan
                if (userData && userData.id && userData.rol) { 
                    setIsAuthenticated(true);
                    setUser(userData); // ✨ CAMBIO: Guardamos el objeto completo
                }
            } catch (e) {
                // En caso de que la cookie esté corrupta, la borramos
                Cookies.remove('auth');
                console.error("Error parsing auth cookie:", e);
            }
        }
        setIsHydrated(true);
    }, []);

    // ✨ CAMBIO: La función recibe el objeto de usuario completo
    const login = (userData: User) => { 
        setIsAuthenticated(true);
        setUser(userData); // Guardamos el objeto completo
        
        // Guardamos el objeto User completo en la cookie (expira en 7 días)
        // La cookie guardará { id: '...', email: '...', role: '...', name: '...', codigo_proveedor?: '...' }
        Cookies.set('auth', JSON.stringify(userData), { expires: 7 }); 
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null); // Borramos el objeto User
        Cookies.remove('auth');
    };

    const value = { isAuthenticated, user, login, logout, isHydrated }; 

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}