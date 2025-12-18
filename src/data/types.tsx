export type UserRole = 'admin' | 'coordinador' | 'proveedor' | 'visitante';

export interface Publication {
  id: string;
  courseId: string;
  cohortId?: string; 
  titulo: string;
  contenido: string; 
  fecha: string; 
}

export interface Course {
  id: string;
  slug?: string;
  titulo: string;
  descripcion?: string;
  image?: string;
  proposito?: string;
  fundamentacion?: string;
  duracion?: string;
  estructuraCostos?: string;
  perfilDocente?: string;
  perfiles?: string;
  exigencias?: string;
  estructuraCurricular?: string;
  evaluacion?: string;
  cronograma?: string;
  providerCode?: string;
  userId?: string;
  estado_gestion?: 'pendiente' | 'aprobado' | 'rechazado' | 'cerrado' | 'abierto' | 'solicitud-cierre';
  publications?: Publication[]; 
}

export type TipoSolicitud = 'codigo-proveedor' | 'formulacion-curso-directa' | 'formulacion-curso-indirecta' | 'cierre-cohorte'

export interface SolicitudCierre {
  id: string;
  tipo: TipoSolicitud
}

export interface User {
  id: string;
  nombres: string
  apellidos: string;
  cedula: string;
  fecha_de_nacimiento: string;
  nivel_educativo: string;
  direccion: string;
  email: string;
  rol: UserRole;
  codigo_proveedor? : string
  // email?: string;
  // role: UserRole;
  // name: string;
  // bio?: string;
  // avatarUrl?: string;
  // documentStatus?: string;
  // courses?: Course[]; 
  // providerCode?: string;
  // providerType?: 'con-fines-de-lucro' | 'sin-fines-de-lucro';
  // contactEmails?: string[]; 
  // contactPhones?: string[]; 
}

export interface Provider {
  id: string;
  codigo_proveedor: string;
  nombre_proveedor: string;
  biografia?: string;
  avatarUrl?: string;
}