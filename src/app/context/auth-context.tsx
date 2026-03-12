"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie'; 
import { User } from '@/data/types';

export type AuthUser = User | null;

interface AuthContextType {
    isAuthenticated: boolean;
    user: AuthUser; 
    login: (userData: User) => void; 
    logout: () => void;
    isHydrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<AuthUser>(null); 
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // ✨ CAMBIO 1: Buscamos la cookie CORRECTA ('auth_token')
        const token = Cookies.get('auth_token');
        
        if (token) {
            try {
                // ✨ CAMBIO 2: Decodificamos el JWT en el frontend para extraer el usuario
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                const userData: User = JSON.parse(jsonPayload);
                
                if (userData && userData.id && userData.rol) { 
                    setIsAuthenticated(true);
                    setUser(userData); 
                }
            } catch (e) {
                Cookies.remove('auth_token');
                console.error("Error decodificando el auth_token en el cliente:", e);
            }
        }
        setIsHydrated(true);
    }, []);

    const login = (userData: User) => { 
        setIsAuthenticated(true);
        setUser(userData); 
        
        // ✨ CAMBIO 3: Ya NO creamos la cookie 'auth' aquí. 
        // Tu auth-service.js ya se encargó de crear la cookie 'auth_token' 
        // milisegundos antes de llamar a esta función.
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null); 
        // Limpiamos las cookies
        Cookies.remove('auth_token');
        Cookies.remove('auth'); // Borramos la vieja por si quedó pegada en tu navegador
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