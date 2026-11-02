// src/utils/session.ts
// Traduce el JWT del backend Go a la sesión que usa la UI (rol, roles, facultad, códigos de proveedor).

type GoClaims = {
    sub?: string;
    v1?: {
        userID?: string;
        roles?: string[];
        faculty?: string;
        providerCode?: string;
        providerID?: string;
        providerName?: string;
    };
};

export type Session = {
    id: string;
    sub: string;
    rol: string;
    roles: string[];
    facultad: string | null;
    codigo_proveedor: string | null;
    provider_id: string | null;
    v1: GoClaims['v1'];
};

// Roles de Go -> nombres que ya usa la UI. course_admin es el proveedor aprobado.
const LEGACY_ROLES: Record<string, string> = {
    root: 'admin',
    deu_admin: 'admin',
    faculty_admin: 'coordinador',
    course_admin: 'proveedor',
    visitante: 'visitante',
};

// Orden de prioridad para elegir el rol principal.
const ROLE_PRIORITY = ['admin', 'coordinador', 'proveedor', 'visitante'];

export function decodeToken(token?: string | null): GoClaims | null {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const binary = atob(base64);
        const json = decodeURIComponent(
            binary.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function sessionFromClaims(claims: GoClaims | null): Session | null {
    if (!claims) return null;
    const v1 = claims.v1 || {};
    const id = String(v1.userID || claims.sub || '');
    if (!id) return null;

    const goRoles = v1.roles || [];
    const legacyRoles = goRoles.map(r => LEGACY_ROLES[r]).filter(Boolean);
    const rol = ROLE_PRIORITY.find(r => legacyRoles.includes(r)) || 'visitante';

    return {
        id,
        sub: id,
        rol,
        roles: Array.from(new Set([...goRoles, ...legacyRoles])),
        facultad: v1.faculty || null,
        codigo_proveedor: v1.providerCode || null,
        provider_id: v1.providerID || null,
        v1,
    };
}

export function sessionFromToken(token?: string | null): Session | null {
    return sessionFromClaims(decodeToken(token));
}

export function isAdminOrCoordinator(session: Session | null): boolean {
    return !!session && (session.rol === 'admin' || session.rol === 'coordinador');
}
