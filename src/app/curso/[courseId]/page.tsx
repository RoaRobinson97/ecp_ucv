import React from 'react';
import { cookies } from 'next/headers';
import { userService } from '@/servicios/users-service';
import { courseService } from '@/servicios/cursos-service';
import { CoursePublicView } from '../../../components/ui/course-public-view';
import { CourseOwnerView } from '../../../components/ui/course-owner-view';

export const dynamic = 'force-dynamic';

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
    const resolvedParams = await params;
    const id = resolvedParams.courseId; 

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    // El servicio trae el curso (también uno en revisión, si quien consulta es su dueño o un
    // revisor), su proveedor y sus cohortes activas con publicaciones.
    let course: any = null;
    try {
        course = await courseService.getCourseById(id);
    } catch (e) {}

    if (!course) {
        return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px' }}>Curso no encontrado</div>;
    }

    const ownerUserId = course.usuario_id || course.user_id;
    if (ownerUserId) {
        course.userDetails = await userService.getUserById(ownerUserId);
    }

    let currentUser: any = null;
    if (token) {
        try { currentUser = await userService.getUserFromToken(token); } catch(e) {}
    }

    const userId = String(currentUser?.id || currentUser?.sub || currentUser?.userID || '');
    const courseOwnerId = String(ownerUserId || '');
    const rol = currentUser?.rol || '';
    const roles = currentUser?.roles || [];

    const isAdminOrCoord = rol === 'admin' || rol === 'coordinador' || roles.includes('admin') || roles.includes('coordinador');
    const isOwner = userId === courseOwnerId;

    if (isAdminOrCoord || isOwner) {
        return <CourseOwnerView initialCourse={course} currentUser={currentUser} />;
    } else {
        const safeCourse = {
            id: course.id,
            titulo: course.titulo || course.nombre,
            proposito: course.proposito || null,
            fundamentacion: course.fundamentacion || course.descripcion || null,
            duracion: course.duracion || null,
            estructura_costos: course.estructura_costos || null,
            perfil_docente: course.perfil_docente || null,
            perfiles: course.perfiles || null,
            exigencias: course.exigencias || null,
            estructura_curricular: course.estructura_curricular || null,
            evaluacion: course.evaluacion || null,
            cronograma: course.cronograma || null,
            link_certificados: course.link_certificados || null,
            codigo_proveedor: course.codigo_proveedor || null,
            
            usuario_id: ownerUserId,
            providerDetails: course.providerDetails || null,
            userDetails: course.userDetails || null,
            cohorteActiva: course.cohorteActiva || null,
            cohortes: course.cohortes || []
        };
        
        return <CoursePublicView course={safeCourse} />;
    }
}