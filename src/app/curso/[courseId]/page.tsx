// app/curso/[courseId]/page.tsx

import CourseClientPage from "@/components/ui/curso";

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {

  return <CourseClientPage courseId={params.courseId} />;

}