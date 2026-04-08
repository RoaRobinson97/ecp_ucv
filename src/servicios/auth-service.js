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
    
    // htmlDate viene como "2009-05-15"
    const parts = htmlDate.split('-'); // ["2009", "05", "15"]
    
    if (parts.length !== 3) return htmlDate;

    const year = parts[0];
    const month = parseInt(parts[1], 10); // Quita el cero: "05" -> 5
    const day = parseInt(parts[2], 10);   // Quita el cero: "15" -> 15

    return `${day}-${month}-${year}`; // Retorna "15-5-2009"
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

        // Captura del JWT
        if (response.token || response.access_token || response.Token) {
           const realToken = response.token || response.access_token || response.Token;
           document.cookie = `auth_token=${realToken}; path=/; max-age=86400; Secure; samesite=strict`;
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
      // --- MODO MOCK ---
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
      console.log("Mock Register Exitoso:", newUser);
      return newUser;

    } else {
      // --- MODO API REAL ---
      try {
        console.log("Usando API REAL para registro...");
        
        // Mapeo exacto contra las estructuras de Golang
        const payloadParaBackend = {
            cedula: userData.ci,
            nombres: userData.first_name,
            apellidos: userData.last_name, 
            fecha_de_nacimiento: formatDateForBackend(userData.date_of_birth),
            genero: userData.gender.toLowerCase(),
            nivel_educativo: userData.education_level,
            direccion: userData.address,
            email: userData.username || userData.email, 
            password: userData.password
        };
        
        console.log('Payload a enviar:', payloadParaBackend);

        const response = await ApiService.post('users', payloadParaBackend);

        console.log("Registro API Exitoso:", response);
        return response;

      } catch (error) {
        console.error("Error en registro real:", error.message);
        
        if (error.message.includes("409") || error.message.toLowerCase().includes("duplicate")) {
             throw new Error("Este correo o cédula ya están registrados.");
        }
        throw error;
      }
    }
  }

}

export const authService = new AuthService();