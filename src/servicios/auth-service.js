// /src/servicios/auth-service.js

import { MOCKED_DB } from '../data/mock-data';
import { ApiService } from './BaseApiService'; 
import { CONFIG } from '../config/config';

/**
 * Convierte 'YYYY-MM-DD' (de Next.js/HTML) a 'D-M-YYYY' (lo que pide Go)
 * eliminando ceros a la izquierda (ej: 05 -> 5).
 */
function formatDateForBackend(htmlDate) {
    if (!htmlDate) return "";
    
    // htmlDate viene del input date como "1988-09-03"
    const parts = htmlDate.split('-'); 
    
    if (parts.length !== 3) return htmlDate;

    // Retornamos invirtiendo el orden, pero manteniendo los strings originales (con ceros)
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // Retorna "03-09-1988"
}

class AuthService {

  /**
   * Inicia sesión con correo y contraseña
   */
  async login(email, password) {
    console.log(`Intentando login para: ${email}`);
    await new Promise(resolve => setTimeout(resolve, 500)); 

    if (CONFIG.USE_MOCK_DATA) {
      // --- MODO MOCK ---
      const users = MOCKED_DB.users;

      if (!users) {
        console.error("Mock Login Fallido: Falta tabla users.");
        throw new Error("Error de configuración del sistema.");
      }

      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        console.log("Mock Login Exitoso:", user);
        
        const payloadStr = JSON.stringify(user);
        let base64Payload = btoa(unescape(encodeURIComponent(payloadStr)));
        base64Payload = base64Payload.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const fakeJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${base64Payload}.MockSignature12345`;
        
        document.cookie = `auth_token=${fakeJwt}; path=/; max-age=86400`; 

        return user;
      } else {
        throw new Error("El correo electrónico o la contraseña son incorrectos.");
      }

    } else {
      // --- MODO API REAL ---
      try {
        console.log("Usando API REAL para login...");
        
        // Llave 'usuario' exigida por el backend, no 'username' ni 'email'
        const response = await ApiService.post('auth/login', { 
            usuario: email, 
            password: password 
        });
        
        console.log("API Login Exitoso:", response);

        const realToken = response.token || response.access_token || response.Token || response.jwt;
        
        if (realToken) {
           // ✨ CORRECCIÓN: Quitamos 'Secure' y pasamos a 'Lax' para que no se pierda en localhost
           document.cookie = `auth_token=${realToken}; path=/; max-age=86400; SameSite=Lax`;
        } else {
           console.warn("⚠️ ALERTA: El backend no devolvió ningún token en el JSON.");
        }

        return response;

      } catch (error) {
        console.error("Error en login real:", error.message);
        throw error; 
      }
    }
  }

  /**
   * Registra un nuevo usuario
   * @param {object} userData - Datos que vienen del RegisterForm
   */
  async register(userData) {
    console.log(`Intentando registrar: ${userData.username || userData.email}`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (CONFIG.USE_MOCK_DATA) {
      // --- MODO MOCK (Se mantiene igual) ---
      const users = MOCKED_DB.users;
      const incomingEmail = userData.username || userData.email;
      
      const existingUser = users.find(u => u.email === incomingEmail);
      if (existingUser) throw new Error("Correo ya registrado.");

      const newUser = {
        id: `ec-user-${users.length + 100}`,
        nombres: userData.first_name,
        apellidos: userData.last_name,
        cedula: userData.ci, 
        fecha_de_nacimiento: userData.date_of_birth,
        nivel_educativo: userData.education_level,
        direccion: userData.address,
        email: incomingEmail,
        password: userData.password,
        rol: 'visitante',
      };

      users.push(newUser);
      return newUser;

    } else {
      // --- MODO API REAL ---
      try {
        console.log("Usando API REAL para registro...");
        
        // ✨ CORRECCIÓN 2: Replicar el comportamiento de Postman usando FormData
        const goFormData = new FormData();
        
        goFormData.append('cedula', userData.ci);
        goFormData.append('nombres', userData.first_name);
        goFormData.append('apellidos', userData.last_name);
        goFormData.append('fecha_de_nacimiento', formatDateForBackend(userData.date_of_birth));
        goFormData.append('genero', userData.gender.toLowerCase());
        goFormData.append('nivel_educativo', userData.education_level);
        goFormData.append('direccion', userData.address);
        goFormData.append('email', userData.username || userData.email);
        goFormData.append('password', userData.password);
        
        // Aseguramos que se envía el rol si la base de datos lo requiere
        goFormData.append('rol', userData.rol || 'visitante'); 

        // ✨ OJO AL TERCER PARÁMETRO 'true': 
        // Esto le indica a BaseApiService que envíe un form-data y NO un JSON
        const response = await ApiService.post('users', goFormData, true);

        console.log("Registro API Exitoso:", response);
        return response;

     } catch (error) {
        console.error("Error en registro real:", error.message);
        
        const msg = error.message.toLowerCase();
        
        // ✨ CORRECCIÓN: Quitamos el "400" (para evitar falsos positivos con fechas/formatos)
        // y agregamos la frase exacta que envía Go: "user already exists"
        if (msg.includes("user already exists") || msg.includes("duplicate") || msg.includes("409")) {
             throw new Error("Este correo electrónico o cédula ya se encuentran registrados en el sistema.");
        }
        
        // Limpiamos el prefijo técnico para que el toast se vea más limpio si ocurre otro error
        const cleanMessage = error.message.replace("Fallo en la comunicación API: ", "");
        throw new Error(cleanMessage);
      }
    }
  }

}

export const authService = new AuthService();