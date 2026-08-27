// src/config/config.js
export const CONFIG = {
    // Si el código corre en el navegador, usamos la ruta relativa (el navegador le pondrá el https y el dominio automáticamente).
    // Si corre en el servidor Docker (SSR), usamos la IP local estricta.
    API_URL: typeof window !== 'undefined' 
        ? '/api' 
        : 'http://localhost:3000/api', 
        
    USE_MOCK_DATA: false, 
};