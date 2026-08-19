// src/app/api/utils/fileHandler.ts
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

/**
 * Guarda un archivo físico en la carpeta public/uploads del proyecto
 * y devuelve la URL relativa para ser guardada en la base de datos.
 * 
 * @param file El archivo proveniente del FormData
 * @param folderName El nombre de la subcarpeta (ej: 'providers/123', 'courses/45')
 * @returns La URL pública (ej: '/uploads/providers/123/archivo.pdf') o null si falla
 */
export async function saveFileAndGetUrl(file: File | null, folderName: string): Promise<string | null> {
  // Si no hay archivo o es un texto vacío, lo ignoramos
  if (!file || typeof file === 'string' || !file.name) return null;

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Limpiamos el nombre para que no rompa la URL
    const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const uniqueName = `${Date.now()}-${cleanName}`;

    // Creamos la ruta física
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folderName);
    
    // Creamos la carpeta si no existe
    await mkdir(uploadDir, { recursive: true });

    // Escribimos el archivo
    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    // Devolvemos la ruta relativa
    return `/uploads/${folderName}/${uniqueName}`;
  } catch (error) {
    console.error(`Error guardando el archivo ${file?.name}:`, error);
    return null; 
  }
}