"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie'; 
import { User, UserRole } from '@/data/types';
import { ApiService } from '@/servicios/BaseApiService';
import { sessionFromToken } from '@/utils/session';

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
        const token = Cookies.get('auth_token');
        
        if (token) {
            try {
                // El JWT de Go se traduce a la sesión que usa la UI (rol, roles, facultad, proveedor).
                const session = sessionFromToken(token);
                if (!session) throw new Error('token inválido');
                const userId: any = session.id;
                
                if (userId) { 
                    setIsAuthenticated(true);
                    
                    // 1. Seteamos los datos básicos del JWT inmediatamente para no bloquear la UI
                    setUser({
                        ...session,
                        Name: session.v1?.providerName || 'Usuario'
                    } as User); 

                    // ✨ 2. EL PUNTO CIEGO RESUELTO: Buscamos el perfil completo en segundo plano
                    // Usamos el userService o ApiService que ya tienes configurado
                    ApiService.get('users', userId)
                        .then((fullProfile) => {
                            if (fullProfile) {
                                setUser(prevUser => ({
                                    ...prevUser, // Mantenemos lo del JWT
                                    ...fullProfile, // Sobrescribimos con lo de la Base de Datos
                                    // Ajustamos el nombre según la llave real que devuelva tu backend (nombre, nombres, Name, etc.)
                                    Name: fullProfile.nombre || fullProfile.nombres || fullProfile.Name || prevUser?.Name,
                                    // Aseguramos que el código de proveedor se cargue si existe
                                    codigo_proveedor: fullProfile.codigo_proveedor || prevUser?.codigo_proveedor
                                }));
                            }
                        })
                        .catch((error) => {
                            console.error("El JWT es válido, pero falló la carga del perfil completo:", error);
                        });
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
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null); 
        Cookies.remove('auth_token');
        Cookies.remove('auth'); 
        
        // ✨ CORRECCIÓN: Redirección dura al home. Esto purga el estado de React y limpia la pantalla.
        window.location.href = '/'; 
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