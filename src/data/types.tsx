export type UserRole = 'admin' | 'coordinador' | 'proveedor' | 'visitante';

export interface Publication {
  id: string;
  course_id: string;
  cohort_id?: string; 
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
  estructura_costos?: string;
  perfil_docente?: string;
  perfiles?: string;
  exigencias?: string;
  estructura_curricular?: string;
  evaluacion?: string;
  cronograma?: string;
  codigo_proveedor?: string;
  user_id?: string;
  estado_gestion?: 'pendiente' | 'aprobado' | 'rechazado' | 'cerrado' | 'abierto' | 'solicitud-cierre';
  publications?: Publication[]; 
  documento_legal_id?: string;
}

export interface Solicitud {
  id: string;
  user_id: string;        
  tipo: TipoSolicitud;    
  estado: EstadoSolicitud; // 'pendiente' | 'aprobado' | 'rechazado'
  fecha_creacion: string;
  fecha_actualizacion?: string;
  motivo_rechazo?: string;
  payload?: any; 
}

export type TipoSolicitud = 'codigo-proveedor' | 'formulacion-curso-directa' | 'formulacion-curso-indirecta' | 'cierre-cohorte'
export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada'

export interface PayloadCodigoProveedor {
  tipo_persona: 'natural' | 'juridica';
  nombre_proveedor: string; 
  nombre_usuario?: string;  
  biografia: string;
  avatar_url?: string;
  documentos: {
    cedula?: string;
    rif?: string;
    islr?: string;
    curriculum?: string;
    titulo?: string;
    registro_mercantil?: string;
  };
}

// En tu archivo de tipos (ej. types.ts o el que estés usando)

export interface PayloadFormulacionCurso {
  titulo: string;
  nombre_proveedor?: string; 
  denominacion?: string;
  proposito: string;
  fundamentacion: string;
  duracion: string;
  estructura_costos: string;
  exigencias: string;
  perfil_docente: string;
  perfiles: string;
  estructura_curricular: string;
  evaluacion: string;
  cronograma: string;
  descripcion?: string;
  archivo_proyecto_url?: string;
  contrato_id?: string; 
}

export interface PayloadCierreCohorte {
  curso_id: string;
  titulo_curso: string;
  nombre_cohorte: string;
  fecha_inicio: string;
  fecha_fin: string;
  estudiantes_inscritos: number;
  estudiantes_aprobados: number;
  observaciones?: string;
  archivo_participantes_url: string; // Excel
  archivo_vouchers_url: string;      // PDF o ZIP
  archivo_encuesta_url: string;      // PDF o Excel
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
  biografia?: string;
}

export interface Provider {
  id: string;
  user_id: string;
  codigo_proveedor: string;
  nombre_proveedor: string;
  biografia?: string;
  provider_avatar_url?: string;
  tipo_proveedor: string;
  emails_contacto?: string[]; 
  telefonos_contacto?: string[];
  sitio_web?: string;
}

export type FullProvider = User & Provider;
