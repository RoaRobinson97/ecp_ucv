// components/ui/user-profile.tsx
import React from "react";
import { notFound } from "next/navigation";
import { HybridUserProfileClient } from "@/components/ui/hybrid-user-profile-client"; 
import { userService } from "@/servicios/users-service"; 
import { FullProvider, User } from "@/data/types";

// ✨ FIX 1: params ahora se declara como una Promesa
export default async function HybridUserProfilePage({ params }: { params: Promise<{ user_id: string }> }) {
  
  // ✨ FIX 2: Esperamos a que la promesa se resuelva antes de usar user_id
  const resolvedParams = await params;
  const { user_id } = resolvedParams;

  try {
    const targetUser = await userService.getProviderDetails(user_id) as FullProvider | User;

    if (!targetUser) {
      return notFound();
    }

    return <HybridUserProfileClient targetUser={targetUser} />;
    
  } catch (error) {
    console.error("Error loading profile:", error);
    return notFound();
  }
}