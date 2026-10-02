// src/config/config.js
export const CONFIG = {
    // En el navegador usamos /api, que el proxy (src/app/api/[...path]) reenvía al backend Go.
    // En el servidor (SSR) llamamos al backend directamente.
    API_URL: typeof window !== 'undefined' 
        ? '/api' 
        : (process.env.INTERNAL_API_URL || 'http://localhost:8081'), 
        
    USE_MOCK_DATA: false, 
};
