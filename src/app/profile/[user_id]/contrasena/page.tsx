// app/profile/[user_id]/contrasena/page.tsx
import React from "react";
import { CambiarContrasenaForm } from "@/components/formularios/cambiar-contrasena-form";

export default async function CambiarContrasenaPage({ params }: { params: Promise<{ user_id: string }> }) {
  const { user_id } = await params;
  return <CambiarContrasenaForm userId={user_id} />;
}
