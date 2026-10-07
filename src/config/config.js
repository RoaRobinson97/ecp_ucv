// src/config/config.js
export const CONFIG = {
    // En el navegador usamos NEXT_PUBLIC_API_URL (p. ej. https://api.extension.ucv.ve) para hablar
    // con Go directamente; si no está definida, /api, que el proxy (src/app/api/[...path]) reenvía al backend Go.
    // En el servidor (SSR) llamamos al backend directamente.
    API_URL: typeof window !== 'undefined'
        ? (process.env.NEXT_PUBLIC_API_URL || '/api')
        : (process.env.INTERNAL_API_URL || 'http://localhost:8081'),
        
    USE_MOCK_DATA: false, 
};
