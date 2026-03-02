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
  codigo_proveedor?: string;
  userId?: string;
  estado_gestion?: 'pendiente' | 'aprobado' | 'rechazado' | 'cerrado' | 'abierto' | 'solicitud-cierre';
  publications?: Publication[]; 
  documento_legal_id: string;
}

export interface Solicitud {
  id: string;
  userId: string;        
  tipo: TipoSolicitud;    
  estado: EstadoSolicitud; // 'pendiente' | 'aprobado' | 'rechazado'
  fechaCreacion: string;
  fechaActualizacion?: string;
  motivoRechazo?: string;
  payload?: any; 
}

export type TipoSolicitud = 'codigo-proveedor' | 'formulacion-curso-directa' | 'formulacion-curso-indirecta' | 'cierre-cohorte'
export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada'

export interface PayloadCodigoProveedor {
  tipoPersona: 'natural' | 'juridica';
  nombreProveedor: string; 
  nombreUsuario?: string;  
  biografia: string;
  avatarUrl?: string;
  documentos: {
    cedula?: string;
    rif?: string;
    islr?: string;
    curriculum?: string;
    titulo?: string;
    registroMercantil?: string;
  };
}

// En tu archivo de tipos (ej. types.ts o el que estés usando)

export interface PayloadFormulacionCurso {
  titulo: string;
  nombreProveedor?: string; 
  denominacion?: string;
  proposito: string;
  fundamentacion: string;
  duracion: string;
  estructuraCostos: string;
  exigencias: string;
  perfilDocente: string;
  perfiles: string;
  estructuraCurricular: string;
  evaluacion: string;
  cronograma: string;
  descripcion?: string;
  enteAvalante?: string;
  archivoProyectoUrl?: string;
  contratoId?: string; 
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
  avatarUrl?: string;
  biografia?: string;
}

export interface Provider {
  id: string;
  user_id: string;
  codigo_proveedor: string;
  nombre_proveedor: string;
  biografia?: string;
  avatarUrl?: string;
  tipo_proveedor: string;
  // ✨ NUEVOS CAMPOS DE CONTACTO
  emails_contacto?: string[]; 
  telefonos_contacto?: string[];
  sitio_web?: string;
}

export type FullProvider = User & Provider;
