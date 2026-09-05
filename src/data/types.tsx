export type UserRole = 
  | 'root' 
  | 'deu_admin'
  | 'coordinador'
  | 'faculty_admin' 
  | 'course_admin' 
  | 'course_manager' 
  | 'visitante' 
  | 'group_admin' 
  | 'group_helper'
  | 'proveedor';

export interface Publication {
  id: string;
  course_id: string;
  cohort_id?: string; // Vincula la publicación a una cohorte específica
  titulo: string;
  contenido: string; 
  fecha: string; 
}

// ✨ NUEVA INTERFAZ: Estructura de la cohorte
export interface Cohorte {
  id?: string;
  course_id: string;
  nombre_cohorte: string;
  fecha_inicio: string;
  fecha_fin: string;
  capacidad: number;
  estado: string; // 'activa' | 'cerrada'
  creado_en?: string;
  publicaciones?: Publication[]; // Las publicaciones ahora viven dentro de su cohorte
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
    estado_gestion?: 'pendiente' | 'under_review' | 'aprobado' | 'aprobada' | 'rechazado' | 'rechazada' | 'cerrado' | 'abierto' | 'solicitud-cierre';
    documento_legal_id?: string;
    estado?: string;
    publications?: Publication[]; // Mantenido por retrocompatibilidad temporal
    cohortes?: Cohorte[]; // ✨ Añadido: Historial de cohortes ensamblado
}

export interface Solicitud {
  id: string;
  user_id: string;        
  tipo: TipoSolicitud;    
  estado: EstadoSolicitud; // 'pendiente' | 'aprobada' | 'rechazada'
  fecha_creacion: string;
  fecha_actualizacion?: string;
  motivo_rechazo?: string;
  payload?: any; 
}

export type TipoSolicitud = 'codigo-proveedor' | 'formulacion-curso-directa' | 'formulacion-curso-indirecta' | 'cierre-cohorte'
export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada'

export interface PayloadCodigoProveedor {
  tipo_persona: 'natural' | 'juridica';
  es_interno?: string | boolean; 
  interno?: boolean;             
  tipo_lucro?: string;           
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
  // ✨ CAMPOS AÑADIDOS PARA MERCY
  contenido_competencias?: string;
  bibliografia?: string; 
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
  id?: string; 
  ID?: string; 
  nombres?: string;
  apellidos?: string;
  Name?: string; 
  cedula?: string;
  fecha_de_nacimiento?: string;
  nivel_educativo?: string;
  direccion?: string;
  email?: string;
  rol?: UserRole; 
  roles?: UserRole[]; 
  Roles?: UserRole[]; 
  codigo_proveedor? : string;
  biografia?: string;
  coordinador_id?: string; 
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
  coordinador_id?: string; 
}

export type FullProvider = User & Provider;