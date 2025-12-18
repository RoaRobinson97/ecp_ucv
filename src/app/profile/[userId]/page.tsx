// components/ui/user-profile.tsx (ACTUALIZADO)
import React from "react";
import { notFound } from "next/navigation";
import { HybridUserProfileClient } from "@/components/ui/hybrid-user-profile-client"; 
import { userService } from "@/servicios/users-service"; // Ajusta la ruta si es diferente

export default async function HybridUserProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const targetUser = await userService.getUserById(userId) as any;

  if (!targetUser) notFound();

  // 🔄 Pasamos los datos al componente cliente
  return <HybridUserProfileClient targetUser={targetUser} />;
}
