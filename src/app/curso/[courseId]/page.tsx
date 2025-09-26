// app/curso/[courseId]/page.tsx
// Este es un Server Component por defecto

import CourseClientPage from "@/components/ui/curso";

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  // ✅ Pasa el courseId a un Client Component
  return <CourseClientPage courseId={params.courseId} />;
}