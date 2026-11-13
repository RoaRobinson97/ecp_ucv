// app/profile/[user_id]/editar/page.tsx
import React from "react";
import { EditarPerfilForm } from "@/components/formularios/editar-perfil-form";

export default async function EditarPerfilPage({ params }: { params: Promise<{ user_id: string }> }) {
  const { user_id } = await params;
  return <EditarPerfilForm userId={user_id} />;
}
