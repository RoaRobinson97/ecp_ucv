// /src/servicios/auth-service.js

import { MOCKED_DB } from '../data/mock-data';
import { ApiService } from './BaseApiService'; 
import { CONFIG } from '../config/config';

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

      // Buscamos el usuario en tu base de datos falsa
      const user = users.find(u => u.email === email && u.password === password);

     if (user) {
        console.log("Mock Login Exitoso:", user);
        
        const payloadStr = JSON.stringify(user);
        
        // 1. Lo pasamos a Base64 normal
        let base64Payload = btoa(unescape(encodeURIComponent(payloadStr)));
        
        // ✨ 2. LO CONVERTIMOS A BASE64URL (Esto evita que la cookie se rompa)
        base64Payload = base64Payload.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        
        const fakeJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${base64Payload}.MockSignature12345`;

        // Guardamos la cookie
        document.cookie = `auth_token=${fakeJwt}; path=/; max-age=86400`; 

        return user;
      
      } else {
        throw new Error("El correo electrónico o la contraseña son incorrectos.");
      }

    } else {
      // --- MODO API REAL ---
      try {
        console.log("Usando API REAL para login...");
        
        const response = await ApiService.post('auth/login', { 
            username: email, 
            password: password 
        });
        
        console.log("API Login Exitoso:", response);

        // ✨ ATENCIÓN PARA PRODUCCIÓN ✨
        // Si tu backend real devuelve el JWT en el body (ej: response.token), 
        // tienes que guardarlo en la cookie aquí también, a menos que tu backend 
        // ya envíe la cabecera 'Set-Cookie' automáticamente.
        if (response.token || response.access_token) {
           const realToken = response.token || response.access_token;
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
        
        const payloadParaBackend = {
            documento_identidad: userData.ci,
            primer_nombre:       userData.first_name,
            apellido:            userData.last_name, 
            fecha_nacimiento:    userData.date_of_birth,
            genero:              userData.gender,
            nivel_educacion:     userData.education_level,
            direccion:           userData.address,
            nombre_usuario:      userData.username, 
            password:            userData.password
        };
        
        console.log('los datos pa ver ', payloadParaBackend)

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