// /src/data/mock-data.ts (Ahora con extensión .ts)

// /src/data/mock-data.ts (Ahora con extensión .ts)

// ✨ CAMBIO: Importamos los tipos globales unificados
import { User, Course } from '@/data/types';

// ----------------------------------------------------
// 1. Datos Mockeados
// ----------------------------------------------------

const MOCK_COURSES_DATA = [
    {
        "id": "1",
        "slug": "diseno-grafico-esencial-1",
        "titulo": "Diseño Gráfico Esencial - #1",
        "descripcion": "Curso de Domina los fundamentos del diseño visual.. Presentado por Academia de Diseño Digital VZLA.",
        "image": "https://picsum.photos/seed/1/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Diseño Gráfico Esencial'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "35 horas",
        "estructuraCostos": "Inversión: $250 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Academia de Diseño Digital VZLA.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-ADDV",
        "userId": "ec-user-014",
        "estado_gestion": "pendiente"
    },
    {
        "id": "2",
        "slug": "desarrollo-frontend-con-react-2",
        "titulo": "Desarrollo Frontend con React - #2",
        "descripcion": "Curso de Crea interfaces web modernas y dinámicas.. Presentado por Hub de Tecnología e Innovación.",
        "image": "https://picsum.photos/seed/2/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Desarrollo Frontend con React'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "28 horas",
        "estructuraCostos": "Inversión: $188 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Hub de Tecnología e Innovación.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-HTI",
        "userId": "ec-user-015",
        "estado_gestion": "aprobado"
    },
    {
        "id": "3",
        "slug": "introduccion-a-las-finanzas-personales-3",
        "titulo": "Introducción a las Finanzas Personales - #3",
        "descripcion": "Curso de Aprende a manejar tu presupuesto e invertir.. Presentado por Centro de Finanzas Modernas.",
        "image": "https://picsum.photos/seed/3/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Introducción a las Finanzas Personales'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "30 horas",
        "estructuraCostos": "Inversión: $305 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Centro de Finanzas Modernas.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-CFM",
        "userId": "ec-user-016",
        "estado_gestion": "rechazado"
    },
    {
        "id": "4",
        "slug": "fotografia-creativa-4",
        "titulo": "Fotografía Creativa - #4",
        "descripcion": "Curso de Explora técnicas avanzadas de composición y luz.. Presentado por Escuela de Fotografía F/22.",
        "image": "https://picsum.photos/seed/4/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Fotografía Creativa'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "25 horas",
        "estructuraCostos": "Inversión: $150 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Escuela de Fotografía F/22.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-F22",
        "userId": "ec-user-017",
        "estado_gestion": "abierto"
    },
    {
        "id": "5",
        "slug": "metodologias-agiles-(scrum/kanban)-5",
        "titulo": "Metodologías Ágiles (Scrum/Kanban) - #5",
        "descripcion": "Curso de Gestiona proyectos eficientemente.. Presentado por Grupo Liderazgo Ágil.",
        "image": "https://picsum.photos/seed/5/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Metodologías Ágiles (Scrum/Kanban)'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "22 horas",
        "estructuraCostos": "Inversión: $245 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Grupo Liderazgo Ágil.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-GLA",
        "userId": "ec-user-018",
        "estado_gestion": "cerrado"
    },
    {
        "id": "6",
        "slug": "alta-cocina-venezolana-6",
        "titulo": "Alta Cocina Venezolana - #6",
        "descripcion": "Curso de Reinterpreta los sabores tradicionales.. Presentado por Instituto Culinario de Caracas.",
        "image": "https://picsum.photos/seed/6/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Alta Cocina Venezolana'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "38 horas",
        "estructuraCostos": "Inversión: $120 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Instituto Culinario de Caracas.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-ICC",
        "userId": "ec-user-019",
        "estado_gestion": "pendiente"
    },
    {
        "id": "7",
        "slug": "diseno-grafico-esencial-7",
        "titulo": "Diseño Gráfico Esencial - #7",
        "descripcion": "Curso de Domina los fundamentos del diseño visual.. Presentado por Academia de Diseño Digital VZLA.",
        "image": "https://picsum.photos/seed/7/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Diseño Gráfico Esencial'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "29 horas",
        "estructuraCostos": "Inversión: $189 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Academia de Diseño Digital VZLA.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-ADDV",
        "userId": "ec-user-014",
        "estado_gestion": "aprobado"
    },
    {
        "id": "8",
        "slug": "desarrollo-frontend-con-react-8",
        "titulo": "Desarrollo Frontend con React - #8",
        "descripcion": "Curso de Crea interfaces web modernas y dinámicas.. Presentado por Hub de Tecnología e Innovación.",
        "image": "https://picsum.photos/seed/8/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Desarrollo Frontend con React'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "32 horas",
        "estructuraCostos": "Inversión: $312 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Hub de Tecnología e Innovación.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-HTI",
        "userId": "ec-user-015",
        "estado_gestion": "rechazado"
    },
    {
        "id": "9",
        "slug": "introduccion-a-las-finanzas-personales-9",
        "titulo": "Introducción a las Finanzas Personales - #9",
        "descripcion": "Curso de Aprende a manejar tu presupuesto e invertir.. Presentado por Centro de Finanzas Modernas.",
        "image": "https://picsum.photos/seed/9/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Introducción a las Finanzas Personales'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "27 horas",
        "estructuraCostos": "Inversión: $172 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Centro de Finanzas Modernas.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-CFM",
        "userId": "ec-user-016",
        "estado_gestion": "abierto"
    },
    {
        "id": "10",
        "slug": "fotografia-creativa-10",
        "titulo": "Fotografía Creativa - #10",
        "descripcion": "Curso de Explora técnicas avanzadas de composición y luz.. Presentado por Escuela de Fotografía F/22.",
        "image": "https://picsum.photos/seed/10/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Fotografía Creativa'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "26 horas",
        "estructuraCostos": "Inversión: $267 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Escuela de Fotografía F/22.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-F22",
        "userId": "ec-user-017",
        "estado_gestion": "cerrado"
    },
    {
        "id": "11",
        "slug": "metodologias-agiles-(scrum/kanban)-11",
        "titulo": "Metodologías Ágiles (Scrum/Kanban) - #11",
        "descripcion": "Curso de Gestiona proyectos eficientemente.. Presentado por Grupo Liderazgo Ágil.",
        "image": "https://picsum.photos/seed/11/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Metodologías Ágiles (Scrum/Kanban)'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "38 horas",
        "estructuraCostos": "Inversión: $221 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Grupo Liderazgo Ágil.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-GLA",
        "userId": "ec-user-018",
        "estado_gestion": "pendiente"
    },
    {
        "id": "12",
        "slug": "alta-cocina-venezolana-12",
        "titulo": "Alta Cocina Venezolana - #12",
        "descripcion": "Curso de Reinterpreta los sabores tradicionales.. Presentado por Instituto Culinario de Caracas.",
        "image": "https://picsum.photos/seed/12/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Alta Cocina Venezolana'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "34 horas",
        "estructuraCostos": "Inversión: $110 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Instituto Culinario de Caracas.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-ICC",
        "userId": "ec-user-019",
        "estado_gestion": "aprobado"
    },
    {
        "id": "13",
        "slug": "diseno-grafico-esencial-13",
        "titulo": "Diseño Gráfico Esencial - #13",
        "descripcion": "Curso de Domina los fundamentos del diseño visual.. Presentado por Academia de Diseño Digital VZLA.",
        "image": "https://picsum.photos/seed/13/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Diseño Gráfico Esencial'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "29 horas",
        "estructuraCostos": "Inversión: $293 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Academia de Diseño Digital VZLA.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-ADDV",
        "userId": "ec-user-014",
        "estado_gestion": "rechazado"
    },
    {
        "id": "14",
        "slug": "desarrollo-frontend-con-react-14",
        "titulo": "Desarrollo Frontend con React - #14",
        "descripcion": "Curso de Crea interfaces web modernas y dinámicas.. Presentado por Hub de Tecnología e Innovación.",
        "image": "https://picsum.photos/seed/14/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Desarrollo Frontend con React'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "30 horas",
        "estructuraCostos": "Inversión: $238 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Hub de Tecnología e Innovación.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-HTI",
        "userId": "ec-user-015",
        "estado_gestion": "abierto"
    },
    {
        "id": "15",
        "slug": "introduccion-a-las-finanzas-personales-15",
        "titulo": "Introducción a las Finanzas Personales - #15",
        "descripcion": "Curso de Aprende a manejar tu presupuesto e invertir.. Presentado por Centro de Finanzas Modernas.",
        "image": "https://picsum.photos/seed/15/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Introducción a las Finanzas Personales'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "29 horas",
        "estructuraCostos": "Inversión: $201 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Centro de Finanzas Modernas.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-CFM",
        "userId": "ec-user-016",
        "estado_gestion": "cerrado"
    },
    {
        "id": "16",
        "slug": "fotografia-creativa-16",
        "titulo": "Fotografía Creativa - #16",
        "descripcion": "Curso de Explora técnicas avanzadas de composición y luz.. Presentado por Escuela de Fotografía F/22.",
        "image": "https://picsum.photos/seed/16/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Fotografía Creativa'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "28 horas",
        "estructuraCostos": "Inversión: $189 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Escuela de Fotografía F/22.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-F22",
        "userId": "ec-user-017",
        "estado_gestion": "pendiente"
    },
    {
        "id": "17",
        "slug": "metodologias-agiles-(scrum/kanban)-17",
        "titulo": "Metodologías Ágiles (Scrum/Kanban) - #17",
        "descripcion": "Curso de Gestiona proyectos eficientemente.. Presentado por Grupo Liderazgo Ágil.",
        "image": "https://picsum.photos/seed/17/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Metodologías Ágiles (Scrum/Kanban)'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "31 horas",
        "estructuraCostos": "Inversión: $312 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Grupo Liderazgo Ágil.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-GLA",
        "userId": "ec-user-018",
        "estado_gestion": "aprobado"
    },
    {
        "id": "18",
        "slug": "alta-cocina-venezolana-18",
        "titulo": "Alta Cocina Venezolana - #18",
        "descripcion": "Curso de Reinterpreta los sabores tradicionales.. Presentado por Instituto Culinario de Caracas.",
        "image": "https://picsum.photos/seed/18/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Alta Cocina Venezolana'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "24 horas",
        "estructuraCostos": "Inversión: $172 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Instituto Culinario de Caracas.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-ICC",
        "userId": "ec-user-019",
        "estado_gestion": "rechazado"
    },
    {
        "id": "19",
        "slug": "diseno-grafico-esencial-19",
        "titulo": "Diseño Gráfico Esencial - #19",
        "descripcion": "Curso de Domina los fundamentos del diseño visual.. Presentado por Academia de Diseño Digital VZLA.",
        "image": "https://picsum.photos/seed/19/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Diseño Gráfico Esencial'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "29 horas",
        "estructuraCostos": "Inversión: $267 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Academia de Diseño Digital VZLA.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-ADDV",
        "userId": "ec-user-014",
        "estado_gestion": "abierto"
    },
    {
        "id": "20",
        "slug": "desarrollo-frontend-con-react-20",
        "titulo": "Desarrollo Frontend con React - #20",
        "descripcion": "Curso de Crea interfaces web modernas y dinámicas.. Presentado por Hub de Tecnología e Innovación.",
        "image": "https://picsum.photos/seed/20/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Desarrollo Frontend con React'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "24 horas",
        "estructuraCostos": "Inversión: $221 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Hub de Tecnología e Innovación.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-HTI",
        "userId": "ec-user-015",
        "estado_gestion": "cerrado"
    },
    {
        "id": "21",
        "slug": "introduccion-a-las-finanzas-personales-21",
        "titulo": "Introducción a las Finanzas Personales - #21",
        "descripcion": "Curso de Aprende a manejar tu presupuesto e invertir.. Presentado por Centro de Finanzas Modernas.",
        "image": "https://picsum.photos/seed/21/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Introducción a las Finanzas Personales'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "33 horas",
        "estructuraCostos": "Inversión: $110 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Centro de Finanzas Modernas.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-CFM",
        "userId": "ec-user-016",
        "estado_gestion": "pendiente"
    },
    {
        "id": "22",
        "slug": "fotografia-creativa-22",
        "titulo": "Fotografía Creativa - #22",
        "descripcion": "Curso de Explora técnicas avanzadas de composición y luz.. Presentado por Escuela de Fotografía F/22.",
        "image": "https://picsum.photos/seed/22/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Fotografía Creativa'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "29 horas",
        "estructuraCostos": "Inversión: $293 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Escuela de Fotografía F/22.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-F22",
        "userId": "ec-user-017",
        "estado_gestion": "aprobado"
    },
    {
        "id": "23",
        "slug": "metodologias-agiles-(scrum/kanban)-23",
        "titulo": "Metodologías Ágiles (Scrum/Kanban) - #23",
        "descripcion": "Curso de Gestiona proyectos eficientemente.. Presentado por Grupo Liderazgo Ágil.",
        "image": "https://picsum.photos/seed/23/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Metodologías Ágiles (Scrum/Kanban)'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "33 horas",
        "estructuraCostos": "Inversión: $238 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Grupo Liderazgo Ágil.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-GLA",
        "userId": "ec-user-018",
        "estado_gestion": "rechazado"
    },
    {
        "id": "24",
        "slug": "alta-cocina-venezolana-24",
        "titulo": "Alta Cocina Venezolana - #24",
        "descripcion": "Curso de Reinterpreta los sabores tradicionales.. Presentado por Instituto Culinario de Caracas.",
        "image": "https://picsum.photos/seed/24/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Alta Cocina Venezolana'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "34 horas",
        "estructuraCostos": "Inversión: $201 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Instituto Culinario de Caracas.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-ICC",
        "userId": "ec-user-019",
        "estado_gestion": "abierto"
    },
    {
        "id": "25",
        "slug": "diseno-grafico-esencial-25",
        "titulo": "Diseño Gráfico Esencial - #25",
        "descripcion": "Curso de Domina los fundamentos del diseño visual.. Presentado por Academia de Diseño Digital VZLA.",
        "image": "https://picsum.photos/seed/25/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Diseño Gráfico Esencial'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "21 horas",
        "estructuraCostos": "Inversión: $189 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Academia de Diseño Digital VZLA.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-ADDV",
        "userId": "ec-user-014",
        "estado_gestion": "cerrado"
    },
    {
        "id": "26",
        "slug": "desarrollo-frontend-con-react-26",
        "titulo": "Desarrollo Frontend con React - #26",
        "descripcion": "Curso de Crea interfaces web modernas y dinámicas.. Presentado por Hub de Tecnología e Innovación.",
        "image": "https://picsum.photos/seed/26/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Desarrollo Frontend con React'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "28 horas",
        "estructuraCostos": "Inversión: $312 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Hub de Tecnología e Innovación.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-HTI",
        "userId": "ec-user-015",
        "estado_gestion": "pendiente"
    },
    {
        "id": "27",
        "slug": "introduccion-a-las-finanzas-personales-27",
        "titulo": "Introducción a las Finanzas Personales - #27",
        "descripcion": "Curso de Aprende a manejar tu presupuesto e invertir.. Presentado por Centro de Finanzas Modernas.",
        "image": "https://picsum.photos/seed/27/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Introducción a las Finanzas Personales'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "34 horas",
        "estructuraCostos": "Inversión: $172 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Centro de Finanzas Modernas.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-CFM",
        "userId": "ec-user-016",
        "estado_gestion": "aprobado"
    },
    {
        "id": "28",
        "slug": "fotografia-creativa-28",
        "titulo": "Fotografía Creativa - #28",
        "descripcion": "Curso de Explora técnicas avanzadas de composición y luz.. Presentado por Escuela de Fotografía F/22.",
        "image": "https://picsum.photos/seed/28/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Fotografía Creativa'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "39 horas",
        "estructuraCostos": "Inversión: $267 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Escuela de Fotografía F/22.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-F22",
        "userId": "ec-user-017",
        "estado_gestion": "rechazado"
    },
    {
        "id": "29",
        "slug": "metodologias-agiles-(scrum/kanban)-29",
        "titulo": "Metodologías Ágiles (Scrum/Kanban) - #29",
        "descripcion": "Curso de Gestiona proyectos eficientemente.. Presentado por Grupo Liderazgo Ágil.",
        "image": "https://picsum.photos/seed/29/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Metodologías Ágiles (Scrum/Kanban)'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "29 horas",
        "estructuraCostos": "Inversión: $221 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Grupo Liderazgo Ágil.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-GLA",
        "userId": "ec-user-018",
        "estado_gestion": "abierto"
    },
    {
        "id": "30",
        "slug": "alta-cocina-venezolana-30",
        "titulo": "Alta Cocina Venezolana - #30",
        "descripcion": "Curso de Reinterpreta los sabores tradicionales.. Presentado por Instituto Culinario de Caracas.",
        "image": "https://picsum.photos/seed/30/400/200",
        "proposito": "Capacitar en las estrategias fundamentales de 'Alta Cocina Venezolana'.",
        "fundamentacion": "Basado en la creciente necesidad de profesionales cualificados en esta área.",
        "duracion": "30 horas",
        "estructuraCostos": "Inversión: $110 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Instituto Culinario de Caracas.",
        "perfiles": "Dirigido a entusiastas y profesionales que buscan actualizarse.",
        "exigencias": "Computadora con conexión a internet estable. Sin prerequisitos estrictos.",
        "estructuraCurricular": "Módulos: Introducción, Desarrollo Práctico, Proyecto Final.",
        "evaluacion": "Evaluación continua: Participación (30%), Tareas (40%), Proyecto Final (30%).",
        "cronograma": "8 semanas de duración. Sesiones sincrónicas semanales.",
        "codigo_proveedor": "PROV-ICC",
        "userId": "ec-user-019",
        "estado_gestion": "cerrado"
    },
    {
        "id": "31",
        "slug": "illustrator-avanzado-31",
        "titulo": "Illustrator Avanzado: Vectores Profesionales - #31",
        "descripcion": "Curso de Domina las herramientas avanzadas de Illustrator para ilustración y diseño vectorial.. Presentado por Academia de Diseño Digital VZLA.",
        "image": "https://picsum.photos/seed/31/400/200",
        "proposito": "Capacitar en técnicas avanzadas de ilustración vectorial y diseño gráfico con Adobe Illustrator.",
        "fundamentacion": "Ideal para diseñadores que buscan perfeccionar su manejo de vectores.",
        "duracion": "40 horas",
        "estructuraCostos": "Inversión: $280 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Academia de Diseño Digital VZLA.",
        "perfiles": "Diseñadores gráficos con conocimientos básicos de Illustrator.",
        "exigencias": "Computadora con Adobe Illustrator instalado y conexión a internet.",
        "estructuraCurricular": "Módulos: Mallas de degradado, Efectos 3D, Automatización, Proyecto Final.",
        "evaluacion": "Evaluación continua: Tareas (50%), Proyecto Final (50%).",
        "cronograma": "8 semanas de duración. Acceso 24/7 a la plataforma.",
        "codigo_proveedor": "PROV-ADDV",
        "userId": "ec-user-014",
        "estado_gestion": "pendiente" // Ejemplo de estado
    },
    {
        "id": "32",
        "slug": "photoshop-para-redes-sociales-32",
        "titulo": "Photoshop para Redes Sociales - #32",
        "descripcion": "Curso de Crea contenido visual impactante para plataformas digitales.. Presentado por Academia de Diseño Digital VZLA.",
        "image": "https://picsum.photos/seed/32/400/200",
        "proposito": "Enseñar a crear y optimizar gráficos para redes sociales usando Photoshop.",
        "fundamentacion": "Fundamental para community managers y diseñadores enfocados en marketing digital.",
        "duracion": "25 horas",
        "estructuraCostos": "Inversión: $190 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Academia de Diseño Digital VZLA.",
        "perfiles": "Principiantes en Photoshop, community managers, emprendedores.",
        "exigencias": "Computadora con Adobe Photoshop instalado y conexión a internet.",
        "estructuraCurricular": "Módulos: Formatos y tamaños, Capas y máscaras, Texto y efectos, Exportación.",
        "evaluacion": "Tareas prácticas semanales (60%), Proyecto final (40%).",
        "cronograma": "6 semanas de duración. Acceso 24/7.",
        "codigo_proveedor": "PROV-ADDV",
        "userId": "ec-user-014",
        "estado_gestion": "aprobado" // Ejemplo de estado
    },
    {
        "id": "33",
        "slug": "diseno-ux-ui-fundamentos-33",
        "titulo": "Diseño UX/UI: Fundamentos - #33",
        "descripcion": "Curso de Aprende los principios del diseño centrado en el usuario.. Presentado por Academia de Diseño Digital VZLA.",
        "image": "https://picsum.photos/seed/33/400/200",
        "proposito": "Introducir los conceptos clave de la Experiencia de Usuario (UX) y la Interfaz de Usuario (UI).",
        "fundamentacion": "Esencial para cualquiera que quiera entrar en el mundo del diseño de productos digitales.",
        "duracion": "30 horas",
        "estructuraCostos": "Inversión: $220 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Academia de Diseño Digital VZLA.",
        "perfiles": "Diseñadores gráficos, desarrolladores web, interesados en diseño digital.",
        "exigencias": "Computadora con conexión a internet. No requiere software específico inicialmente.",
        "estructuraCurricular": "Módulos: Principios UX, Investigación, Arquitectura de Información, Principios UI, Prototipado.",
        "evaluacion": "Quizzes (20%), Ejercicios prácticos (50%), Proyecto final (30%).",
        "cronograma": "7 semanas de duración. Clases grabadas y sesiones de Q&A.",
        "codigo_proveedor": "PROV-ADDV",
        "userId": "ec-user-014",
        "estado_gestion": "pendiente" // Ejemplo de estado
    },
    {
        "id": "34",
        "slug": "animacion-motion-graphics-after-effects-34",
        "titulo": "Animación y Motion Graphics con After Effects - #34",
        "descripcion": "Curso de Da vida a tus diseños con animación y efectos visuales.. Presentado por Academia de Diseño Digital VZLA.",
        "image": "https://picsum.photos/seed/34/400/200",
        "proposito": "Enseñar las bases de la animación 2D y motion graphics usando Adobe After Effects.",
        "fundamentacion": "Alta demanda en publicidad, redes sociales y producción audiovisual.",
        "duracion": "45 horas",
        "estructuraCostos": "Inversión: $310 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Academia de Diseño Digital VZLA.",
        "perfiles": "Diseñadores, editores de video, creativos audiovisuales.",
        "exigencias": "Computadora con Adobe After Effects instalado y conexión a internet.",
        "estructuraCurricular": "Módulos: Interfaz y Keyframes, Animación de Texto, Efectos Visuales, Renderizado.",
        "evaluacion": "Ejercicios semanales (60%), Proyecto final animado (40%).",
        "cronograma": "10 semanas de duración. Acceso 24/7.",
        "codigo_proveedor": "PROV-ADDV",
        "userId": "ec-user-014",
        "estado_gestion": "rechazado" // Ejemplo de estado
    },
    {
        "id": "35",
        "slug": "branding-diseno-identidad-visual-35",
        "titulo": "Branding: Diseño de Identidad Visual - #35",
        "descripcion": "Curso de Crea marcas memorables a través del diseño estratégico.. Presentado por Academia de Diseño Digital VZLA.",
        "image": "https://picsum.photos/seed/35/400/200",
        "proposito": "Enseñar el proceso completo de creación de una identidad visual corporativa.",
        "fundamentacion": "Clave para diseñadores que trabajan con marcas y emprendimientos.",
        "duracion": "30 horas",
        "estructuraCostos": "Inversión: $240 USD. Incluye materiales y certificado.",
        "perfilDocente": "Instructores expertos de Academia de Diseño Digital VZLA.",
        "perfiles": "Diseñadores gráficos, publicistas, estrategas de marca.",
        "exigencias": "Computadora con software de diseño vectorial (Illustrator preferiblemente) e internet.",
        "estructuraCurricular": "Módulos: Conceptos de Branding, Investigación, Diseño de Logo, Manual de Marca, Aplicaciones.",
        "evaluacion": "Análisis de casos (30%), Desarrollo de concepto (30%), Manual de marca final (40%).",
        "cronograma": "7 semanas de duración. Sesiones en vivo y material asincrónico.",
        "codigo_proveedor": "PROV-ADDV",
        "userId": "ec-user-014",
        "estado_gestion": "aprobado" // Ejemplo de estado
    }
];

const MOCK_PUBLICATIONS_DATA = [
  { id: 'pub-001', courseId: '1', titulo: '¡Bienvenidos al curso de Diseño Gráfico!', contenido: '...', fecha: '2025-10-25' },
  { id: 'pub-002', courseId: '1', titulo: 'Material Adicional: Paletas de Colores', contenido: 'Deben traer un estuche con 14 colores.', fecha: '2025-10-28' },
  { id: 'pub-003', courseId: '2', titulo: 'Recordatorio: Sesión de Hooks Avanzados', contenido: '...', fecha: '2025-11-01' },
  { id: 'pub-004', courseId: '30', titulo: 'Ingredientes Clase 3: Cocina Nikkei', contenido: '...', fecha: '2025-11-05' },

  {
    id: 'pub-005',
    courseId: '19', 
    titulo: 'Consejos Iluminación para Retratos',
    contenido: 'Esta semana exploraremos esquemas básicos de iluminación como Rembrandt y mariposa. Revisen el material adjunto.',
    fecha: '2025-11-10'
  },
  {
    id: 'pub-006',
    courseId: '19',
    titulo: 'Práctica: Sesión Fotográfica',
    contenido: 'Recuerden que la próxima sesión será práctica. Traigan sus cámaras y un modelo si es posible. ¡Vamos a aplicar lo aprendido!',
    fecha: '2025-11-12'
  },
  {
    id: 'pub-007',
    courseId: '19',
    titulo: 'Fecha Límite Entrega Proyecto Final',
    contenido: 'La fecha límite para la entrega del proyecto final (portafolio de retratos) es el 15 de Diciembre. No habrá prórrogas.',
    fecha: '2025-11-15'
  },
];


const MOCK_USERS_DATA = [

  { id: 'ec-user-001', email: 'course_admin@example.com', password: 'nolodire', rol: 'admin', nombres: 'Admin (Admin)' },

  { id: 'ec-user-002', email: 'arquitectura.urbanismo@gmail.com', password: 'coord-password', rol: 'coordinador', nombres: 'Facultad de Arquitectura y Urbanismo' },
  { id: 'ec-user-003', email: 'agronomia@gmail.com', password: 'coord-password', rol: 'coordinador', nombres: 'Facultad de Agronomía' },
  { id: 'ec-user-004', email: 'faces@gmail.com', password: 'coord-password', rol: 'coordinador', nombres: 'Facultad de Ciencias Económicas y Sociales' },
  { id: 'ec-user-005', email: 'fcjp@gmail.com', password: 'coord-password', rol: 'coordinador', nombres: 'Facultad de Ciencias Jurídicas y Políticas' },
  { id: 'ec-user-006', email: 'fcv@gmail.com', password: 'coord-password', rol: 'coordinador', nombres: 'Facultad de Ciencias Veterinarias' },
  { id: 'ec-user-007', email: 'ciencias@gmail.com', password: 'coord-password', rol: 'coordinador', nombres: 'Facultad de Ciencias' },
  { id: 'ec-user-008', email: 'farmacia@gmail.com', password: 'coord-password', rol: 'coordinador', nombres: 'Facultad de Farmacia' },
  { id: 'ec-user-009', email: 'humanidades.educacion@gmail.com', password: 'coord-password', rol: 'coordinador', nombres: 'Facultad de Humanidades y Educación' },
  { id: 'ec-user-010', email: 'ingenieria@gmail.com', password: 'coord-password', rol: 'coordinador', nombres: 'Facultad de Ingeniería' },
  { id: 'ec-user-011', email: 'medicina@gmail.com', password: 'coord-password', rol: 'coordinador', nombres: 'Facultad de Medicina' },
  { id: 'ec-user-012', email: 'odontologia@gmail.com', password: 'coord-password', rol: 'coordinador', nombres: 'Facultad de Odontología' },
  { id: 'ec-user-013', email: 'direccion.extension@gmail.com', password: 'coord-password', rol: 'coordinador', nombres: 'Dirección de Extensión' },

{ 
    id: 'ec-user-014', 
    nombres: 'Alejandro', 
    apellidos: 'Perez',
    cedula: '17520369',
    fecha_de_nacimiento: '1985-07-07',
    nivel_educativo: 'bachillerato',
    direccion: 'Los Ruices, Caracas',
    email: 'alejandro.perez@acaddiseno.com', 
    password: 'user-password', 
    
    // ✨ CAMBIOS:
    rol: 'proveedor',
    codigo_proveedor: 'PROV-ADDV' 
  },
  { 
    id: 'ec-user-015', 
    nombres: 'Roberto', 
    apellidos: 'Castillo', 
    cedula: '15896321',
    fecha_de_nacimiento: '1982-03-15',
    nivel_educativo: 'universitaria_completa',
    direccion: 'Chacao, Caracas',
    email: 'contacto@hubtecnologico.ve', 
    password: 'user-password', 
    
    // ✨ CAMBIOS:
    rol: 'proveedor',
    codigo_proveedor: 'PROV-HTI'
  },
  { 
    id: 'ec-user-016', 
    nombres: 'Mariana', 
    apellidos: 'Lopez', 
    cedula: '19547896',
    fecha_de_nacimiento: '1990-11-20',
    nivel_educativo: 'postgrado',
    direccion: 'Las Mercedes, Caracas',
    email: 'adm@finanzasmodernas.com', 
    password: 'user-password', 
    
    // ✨ CAMBIOS:
    rol: 'proveedor',
    codigo_proveedor: 'PROV-CFM'
  },
  { 
    id: 'ec-user-017', 
    nombres: 'Luis', 
    apellidos: 'Mendez', 
    cedula: '12456987',
    fecha_de_nacimiento: '1978-01-30',
    nivel_educativo: 'tecnico_superior',
    direccion: 'Sabana Grande, Caracas',
    email: 'info@escuelaf22.com', 
    password: 'user-password', 
    
    // ✨ CAMBIOS:
    rol: 'proveedor',
    codigo_proveedor: 'PROV-F22'
  },
  { 
    id: 'ec-user-018', 
    nombres: 'Sofia', 
    apellidos: 'Vargas', 
    cedula: '21365478',
    fecha_de_nacimiento: '1993-06-12',
    nivel_educativo: 'postgrado',
    direccion: 'Altamira, Caracas',
    email: 'cursos@liderazgoagil.com.ve', 
    password: 'user-password', 
    
    // ✨ CAMBIOS:
    rol: 'proveedor',
    codigo_proveedor: 'PROV-GLA'
  },
  { 
    id: 'ec-user-019', 
    nombres: 'Ricardo', 
    apellidos: 'Chef', 
    cedula: '14523698',
    fecha_de_nacimiento: '1980-09-05',
    nivel_educativo: 'tecnico_superior',
    direccion: 'Bello Monte, Caracas',
    email: 'inscripciones@iccaracas.com', 
    password: 'user-password', 
    
    // ✨ CAMBIOS:
    rol: 'proveedor',
    codigo_proveedor: 'PROV-ICC'
  },

  { 
    id: 'ec-user-020', 
    nombres: 'Andrés',
    apellidos: 'Ríos',
    cedula: '19452871',
    fecha_de_nacimiento: '1992-05-12',
    nivel_educativo: 'universitaria_completa',
    direccion: 'Av. Urdaneta, Caracas',
    email: 'andres.rios@email.com', 
    password: 'user-password', 
    rol: 'visitante' 
  },
  { 
    id: 'ec-user-021', 
    nombres: 'Carla',
    apellidos: 'Soto',
    cedula: '20154896',
    fecha_de_nacimiento: '1994-08-23',
    nivel_educativo: 'tecnico_superior',
    direccion: 'Urb. El Trigal, Valencia',
    email: 'carla.soto@email.com', 
    password: 'user-password', 
    rol: 'visitante' 
  },
  { 
    id: 'ec-user-022', 
    nombres: 'Daniel',
    apellidos: 'Vega',
    cedula: '18754210',
    fecha_de_nacimiento: '1989-11-30',
    nivel_educativo: 'universitaria_incompleta',
    direccion: 'Av. Las Delicias, Maracay',
    email: 'daniel.vega@email.com', 
    password: 'user-password', 
    rol: 'visitante' 
  },
  { 
    id: 'ec-user-023', 
    nombres: 'Emilia',
    apellidos: 'Reyes',
    cedula: '22458796',
    fecha_de_nacimiento: '1996-02-14',
    nivel_educativo: 'postgrado',
    direccion: 'Calle 50, Barquisimeto',
    email: 'emilia.reyes@email.com', 
    password: 'user-password', 
    rol: 'visitante' 
  },
  { 
    id: 'ec-user-024', 
    nombres: 'Felipe',
    apellidos: 'Guerra',
    cedula: '17520369',
    fecha_de_nacimiento: '1985-07-07',
    nivel_educativo: 'bachillerato',
    direccion: 'Los Ruices, Caracas',
    email: 'felipe.guerra@email.com', 
    password: 'user-password', 
    rol: 'visitante' 
  },
  { 
    id: 'ec-user-025', 
    nombres: 'Gloria',
    apellidos: 'Ibáñez',
    cedula: '21054877',
    fecha_de_nacimiento: '1995-09-19',
    nivel_educativo: 'universitaria_completa',
    direccion: 'Av. Los Próceres, Mérida',
    email: 'gloria.ibanez@email.com', 
    password: 'user-password', 
    rol: 'visitante' 
  },

];

export const MOCK_PROVIDERS_DATA = [
  {
    provider_id: 'prov-001',
    id: 'ec-user-014', // Alejandro Perez
    nombre_proveedor: 'Academia de Diseño Venezuela', // Inventé el nombre basado en el email
    codigo: 'PROV-ADDV',
    tipo_proveedor: 'con-fines-de-lucro', 
    estatus_documentacion: 'Pendiente de Revisión', 
    biografia: 'Líderes en formación de diseño digital y UX/UI en Venezuela.',
    emails_contacto: ['info@acaddiseno.com', 'soporte@acaddiseno.com'], 
    telefonos_contacto: ['+58 (212) 555-1234'] 
  },
  { 
    provider_id: 'prov-002', 
    id: 'ec-user-015', // Roberto Castillo
    nombre_proveedor: 'Hub de Tecnología e Innovación', 
    codigo: 'PROV-HTI', 
    tipo_proveedor: 'con-fines-de-lucro', 
    estatus_documentacion: 'Pendiente de Revisión', 
    biografia: 'Impulsando el futuro de la tecnología con bootcamps intensivos.',
    emails_contacto: ['contacto@hubtecnologico.ve'], 
    telefonos_contacto: ['+58 (212) 555-5678', '+58 (212) 555-9012'] 
  },
  { 
    provider_id: 'prov-003', 
    id: 'ec-user-016', // Mariana Lopez
    nombre_proveedor: 'Centro de Finanzas Modernas', 
    codigo: 'PROV-CFM', 
    tipo_proveedor: 'con-fines-de-lucro', 
    estatus_documentacion: 'Pendiente de Revisión', 
    biografia: 'Formación especializada en finanzas, criptomonedas y mercados de capitales.',
    emails_contacto: ['adm@finanzasmodernas.com'], 
    telefonos_contacto: ['+58 (212) 555-3456'] 
  },
  { 
    provider_id: 'prov-004', 
    id: 'ec-user-017', // Luis Mendez
    nombre_proveedor: 'Escuela de Fotografía F/22', 
    codigo: 'PROV-F22', 
    tipo_proveedor: 'sin-fines-de-lucro', 
    estatus_documentacion: 'Pendiente de Revisión', 
    bio: 'Formando fotógrafos con visión artística y social. Organización sin fines de lucro.',
    emails_contacto: ['info@escuelaf22.com'], 
    telefonos_contacto: [] 
  },
  { 
    provider_id: 'prov-005', 
    id: 'ec-user-018', // Sofia Vargas
    nombre_proveedor: 'Grupo Liderazgo Ágil', 
    codigo: 'PROV-GLA', 
    tipo_proveedor: 'con-fines-de-lucro', 
    estatus_documentacion: 'Pendiente de Revisión', 
    biografia: 'Certificaciones internacionales en Scrum, Kanban y metodologías ágiles.',
    emails_contacto: ['cursos@liderazgoagil.com.ve', 'admin@liderazgoagil.com.ve'], 
    telefonos_contacto: ['+58 (212) 555-7890'] 
  },
  { 
    provider_id: 'prov-006', 
    id: 'ec-user-019', // Ricardo Chef
    nombre_proveedor: 'Instituto Culinario de Caracas', 
    codigo: 'PROV-ICC', 
    tipo_proveedor: 'con-fines-de-lucro', 
    estatus_documentacion: 'Pendiente de Revisión', 
    biografia: 'La mejor formación profesional de artes culinarias del país.',
    emails_contacto: ['inscripciones@iccaracas.com'], 
    telefonos_contacto: ['+58 (212) 555-4321'] 
  }
];

// /src/data/mock-data.ts
const MOCK_SOLICITUDES_DATA: any[] = [
  // 1. SOLICITUD DE CÓDIGO (NATURAL) - PENDIENTE
  {
    id: 'sol-001',
    userId: 'ec-user-020',
    tipo: 'codigo-proveedor',
    estado: 'pendiente',
    fechaCreacion: '2026-02-01',
    payload: {
      tipoPersona: 'natural',
      nombreProveedor: 'Andrés Ríos Consultores',
      nombreUsuario: 'Andrés Ríos', // ✨ NUEVO
      biografia: 'Consultoría en optimización de procesos industriales.',
      documentos: { 
        cedula: '/docs/cedula_andres.pdf', 
        rif: '/docs/rif_andres.pdf', 
        curriculum: '/docs/cv_andres.pdf' 
      }
    }
  },

  // 2. FORMULACIÓN DIRECTA - PENDIENTE
  {
    id: 'sol-002',
    userId: 'ec-user-014',
    tipo: 'formulacion-curso-directa',
    estado: 'pendiente',
    fechaCreacion: '2026-02-03',
    payload: {
      titulo: 'Diseño Gráfico Esencial - #1',
      nombreProveedor: 'Academia Visual Pro', // ✨ NUEVO
      duracion: '35 horas',
      proposito: 'Dominar fundamentos visuales.',
      fundamentacion: 'Necesidad de digitalización empresarial.',
      estructuraCostos: '$250 por participante.',
      perfilDocente: 'Diseñador Senior con 10 años de experiencia.',
      perfiles: 'Ingreso: Bachilleres. Egreso: Diseñador Junior.',
      exigencias: 'Adobe Creative Suite.',
      estructuraCurricular: 'Módulo 1: Teoría del color, Módulo 2: Composición.',
      evaluacion: 'Proyecto de identidad visual.',
      cronograma: 'Lunes y Miércoles 6:00 PM.'
    }
  },

  // 3. FORMULACIÓN INDIRECTA - RECHAZADA
  {
    id: 'sol-003',
    userId: 'ec-user-015',
    tipo: 'formulacion-curso-indirecta',
    estado: 'rechazada',
    fechaCreacion: '2026-01-20',
    motivoRechazo: 'El ente avalante no posee convenio vigente con la universidad.',
    payload: {
      titulo: 'Blockchain aplicado a Logística',
      nombreProveedor: 'Tech Solutions & Logistics', // ✨ NUEVO
      enteAvalante: 'CryptoTrade International',
      archivoProyectoUrl: '/convenios/blockchain_v1.pdf',
      duracion: '45 horas',
      proposito: 'Trazabilidad de suministros usando Smart Contracts.',
      fundamentacion: 'Modernización de aduanas.',
      estructuraCostos: 'Costo total: $1500 (Subvencionado).',
      perfilDocente: 'PhD en Computación distribuida.',
      perfiles: 'Profesionales del área logística.',
      exigencias: 'Conocimientos previos de bases de datos.',
      estructuraCurricular: 'Conceptos de Ledger, Nodos y Consenso.',
      evaluacion: 'Examen teórico-práctico.',
      cronograma: 'Intensivo de 2 semanas.'
    }
  },

  // 4. CIERRE DE COHORTE - PENDIENTE
  {
    id: 'sol-004',
    userId: 'ec-user-016',
    tipo: 'cierre-cohorte',
    estado: 'pendiente',
    fechaCreacion: '2026-02-05',
    payload: {
      // En cierres, solemos usar el proveedor del curso original
      nombreProveedor: 'Academia Visual Pro', // ✨ NUEVO
      cursoId: '3',
      cohorteId: 'FIN-2025-II',
      actaCierreUrl: '/cargas/acta_cierre_3.pdf',
      notasFinalesUrl: '/cargas/notas_3.xlsx',
      resumenResultados: '40 aprobados, 2 reprobados, 1 retiro.'
    }
  },

  // 5. SOLICITUD DE CÓDIGO (JURÍDICA) - PENDIENTE
  {
    id: 'sol-005',
    userId: 'ec-user-021',
    tipo: 'codigo-proveedor',
    estado: 'pendiente',
    fechaCreacion: '2026-02-06',
    payload: {
      tipoPersona: 'juridica',
      nombreUsuario: 'Carla Soto', // ✨ NUEVO
      biografia: 'Agencia especializada en desarrollo de aplicaciones móviles.',
      documentos: { 
        cedula: '/docs/legal_carla.pdf', 
        rif: '/docs/rif_sototech.pdf', 
        registroMercantil: '/docs/reg_mercantil.pdf' 
      }
    }
  },

  // 6. FORMULACIÓN DIRECTA - APROBADA
  {
    id: 'sol-006',
    userId: 'ec-user-017',
    tipo: 'formulacion-curso-directa',
    estado: 'aprobada',
    fechaCreacion: '2026-01-10',
    payload: {
      titulo: 'Fotografía Creativa - #4',
      nombreProveedor: 'Luis Méndez Fotografía', // ✨ NUEVO
      duracion: '25 horas',
      proposito: 'Explorar técnicas de composición avanzada.',
      fundamentacion: 'Mercado de contenido digital en auge.',
      estructuraCostos: '$150 por persona.',
      perfilDocente: 'Luis Méndez - Fotógrafo Profesional.',
      perfiles: 'Entusiastas de la fotografía con cámara propia.',
      exigencias: 'Cámara DSLR o Mirrorless.',
      estructuraCurricular: 'Luz, Composición, Edición en Lightroom.',
      evaluacion: 'Portafolio de 10 fotos.',
      cronograma: 'Sábados presenciales.',
      contratoId: 'CONT-2026-001',
    }
  },

  // 7. FORMULACIÓN INDIRECTA - PENDIENTE
  {
    id: 'sol-007',
    userId: 'ec-user-018',
    tipo: 'formulacion-curso-indirecta',
    estado: 'pendiente',
    fechaCreacion: '2026-02-07',
    payload: {
      titulo: 'Agilidad Organizacional con Scrum',
      nombreProveedor: 'Gestión Ágil Consultores', // ✨ NUEVO
      enteAvalante: 'Agile Institute South America',
      archivoProyectoUrl: '/proyectos/agilidad_scrum.pdf',
      duracion: '32 horas',
      proposito: 'Certificar Scrum Masters internos.',
      fundamentacion: 'Mejora de eficiencia en equipos remotos.',
      estructuraCostos: 'Financiado por ente externo.',
      perfilDocente: 'Trainer Certificado por Scrum.org.',
      perfiles: 'Líderes de equipo y gerentes.',
      exigencias: 'Uso de plataformas colaborativas (Miro/Trello).',
      estructuraCurricular: 'Roles, Eventos y Artefactos de Scrum.',
      evaluacion: 'Simulacro de examen oficial.',
      cronograma: 'Martes y Jueves (Virtual).'
    }
  },

  // 8. CIERRE DE COHORTE - APROBADA
  {
    id: 'sol-008',
    userId: 'ec-user-019',
    tipo: 'cierre-cohorte',
    estado: 'aprobada',
    fechaCreacion: '2025-12-15',
    payload: {
      nombreProveedor: 'Luis Méndez Fotografía', // ✨ NUEVO
      cursoId: '6',
      cohorteId: 'COC-2025-I',
      actaCierreUrl: '/archivos/acta_final.pdf',
      notasFinalesUrl: '/archivos/notas_finales.csv',
      resumenResultados: 'Exito total, 100% de aprobación.'
    }
  },

  // 9. FORMULACIÓN DIRECTA - PENDIENTE
  {
    id: 'sol-009',
    userId: 'ec-user-022',
    tipo: 'formulacion-curso-directa',
    estado: 'pendiente',
    fechaCreacion: '2026-02-08',
    payload: {
      titulo: 'Marketing para Emprendedores',
      nombreProveedor: 'Growth Hacking Vzla', // ✨ NUEVO
      duracion: '20 horas',
      proposito: 'Vender a través de redes sociales.',
      fundamentacion: 'Necesidad de autoempleo.',
      estructuraCostos: '$100 (becas disponibles).',
      perfilDocente: 'Especialista en Growth Hacking.',
      perfiles: 'Emprendedores locales.',
      exigencias: 'Smartphone con acceso a internet.',
      estructuraCurricular: 'Instagram, TikTok y Ads básicos.',
      evaluacion: 'Plan de marketing real.',
      cronograma: 'Sesiones grabadas y tutoría semanal.'
    }
  },

  // 10. SOLICITUD DE CÓDIGO (NATURAL) - PENDIENTE
  {
    id: 'sol-010',
    userId: 'ec-user-023',
    tipo: 'codigo-proveedor',
    estado: 'pendiente',
    fechaCreacion: '2026-02-09',
    payload: {
      tipoPersona: 'natural',
      nombreProveedor: 'Emilia Reyes - Artes Plásticas',
      nombreUsuario: 'Emilia Reyes', // ✨ NUEVO
      biografia: 'Escultora con especialización en técnicas de resina.',
      documentos: { 
        cedula: '/docs/emilia_c.pdf', 
        rif: '/docs/emilia_r.pdf', 
        titulo: '/docs/emilia_t.pdf' 
      }
    }
  }
];

// ----------------------------------------------------
// 2. Exportación de la Base de Datos Centralizada
// ----------------------------------------------------

/**
 * MOCKED_DB centraliza todas las colecciones para que el BaseApiService
 * pueda accederlas usando el nombre de la entidad (ej: 'courses', 'users').
 */
export const MOCKED_DB = {
  'courses': MOCK_COURSES_DATA,
  'users': MOCK_USERS_DATA,
  'publications': MOCK_PUBLICATIONS_DATA,
  'providers': MOCK_PROVIDERS_DATA,
  'solicitudes': MOCK_SOLICITUDES_DATA 
};


// ----------------------------------------------------
// 3. Lógica de ID para el Mock (Se mantiene igual)
// ------------------------------------------------------

// Define el tipo de la función si es necesario, aunque TS puede inferirlo
export const generateMockId = (prefix: string): string => `${prefix}${nextMockId++}`;

// El contador debe definirse primero
let nextMockId = 1000;

