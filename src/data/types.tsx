export type UserRole = 
  | 'root' 
  | 'deu_admin' 
  | 'faculty_admin' 
  | 'course_admin' 
  | 'course_manager' 
  | 'visitante' 
  | 'group_admin' 
  | 'group_helper';

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
  es_interno?: string | boolean; // El que probablemente usas en el formulario
  interno?: boolean;             // ✨ El que manda Go realmente
  tipo_lucro?: string;           // ✨ También lo manda Go y lo usamos en la vista
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
  // ✨ Mapeo defensivo para soportar la respuesta de Login de Go
  id?: string; 
  ID?: string; // Go a veces exporta las llaves en mayúscula
  
  // Nombres y correos ahora son opcionales porque el Login de Go NO los devuelve
  nombres?: string;
  apellidos?: string;
  Name?: string; // ✨ El nombre concatenado que devuelve el Login de Go
  cedula?: string;
  fecha_de_nacimiento?: string;
  nivel_educativo?: string;
  direccion?: string;
  email?: string;
  
  // ✨ El cambio crucial: de string a arreglo
  rol?: UserRole; // Lo dejo opcional para no romper tu MOCK_DATA viejo
  roles?: UserRole[]; // El arreglo real que manda el backend
  Roles?: UserRole[]; // Por si Go lo manda con la primera letra mayúscula
  
  codigo_proveedor? : string;
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