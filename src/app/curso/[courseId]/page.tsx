import React from 'react';
import { cookies } from 'next/headers';
import { userService } from '@/servicios/users-service';
import { CoursePublicView } from '../../../components/ui/course-public-view';
import { CourseOwnerView } from '../../../components/ui/course-owner-view';

export const dynamic = 'force-dynamic';

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
    const resolvedParams = await params;
    const id = resolvedParams.courseId; 

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const headers: HeadersInit = { 'Cache-Control': 'no-cache' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['Cookie'] = `auth_token=${token}`;
    }

    let course = null;

    try {
        const res = await fetch(`http://localhost:8080/courses/${id}`, { headers, cache: 'no-store' });
        if (res.ok) course = await res.json();
    } catch (e) {}

    if (!course) {
        try {
            const reqRes = await fetch(`http://localhost:8080/course-requests/${id}`, { headers, cache: 'no-store' });
            if (reqRes.ok) course = await reqRes.json();
        } catch (e) {}
    }

    if (!course) {
        return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px' }}>Curso no encontrado</div>;
    }

    const ownerUserId = course.usuario_id || course.user_id;
    if (ownerUserId) {
        try {
            const provRes = await fetch(`http://localhost:8080/providers?usuario_id=${ownerUserId}`, { headers, cache: 'no-store' });
            if (provRes.ok) {
                const provData = await provRes.json();
                if (provData && provData.length > 0) course.providerDetails = provData[0];
            }

            const userRes = await fetch(`http://localhost:8080/users/${ownerUserId}`, { headers, cache: 'no-store' });
            if (userRes.ok) {
                const userData = await userRes.json();
                course.userDetails = userData;
            }
        } catch (err) {
            console.error("Error hidratando proveedor/usuario:", err);
        }
    }

    const reqCohortes = await fetch(`http://localhost:8080/course-cycles?course_id=${id}`, { headers, cache: 'no-store' });
    let cohortes = reqCohortes.ok ? await reqCohortes.json() : [];

    // ✨ FIX ARQUITECTÓNICO: Ordenamos las cohortes de la más NUEVA a la más VIEJA
    cohortes.sort((a: any, b: any) => new Date(b.creado_en || 0).getTime() - new Date(a.creado_en || 0).getTime());

    const reqPubs = await fetch(`http://localhost:8080/publications?course_id=${id}`, { headers, cache: 'no-store' });
    const publicaciones = reqPubs.ok ? await reqPubs.json() : [];

    // Ahora el find() agarrará la primera activa del array YA ORDENADO (es decir, la última real)
    const cohorteActiva = cohortes.find((c: any) => c.estado === 'activa') || (cohortes.length > 0 ? cohortes[0] : null);
    if (cohorteActiva) {
        // Le asignamos solo las publicaciones de esa cohorte específica
        cohorteActiva.publicaciones = publicaciones.filter((p: any) => String(p.cohort_id) === String(cohorteActiva.id));
    }
    course.cohorteActiva = cohorteActiva;
    course.cohortes = cohortes; 

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