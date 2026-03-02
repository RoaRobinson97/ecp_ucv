// components/ui/user-profile.tsx
import React from "react";
import { notFound } from "next/navigation";
import { HybridUserProfileClient } from "@/components/ui/hybrid-user-profile-client"; 
import { userService } from "@/servicios/users-service"; 
import { FullProvider, User } from "@/data/types";

export default async function HybridUserProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = params;

  try {

    const targetUser = await userService.getProviderDetails(userId) as FullProvider | User;
    console.log(targetUser)

    if (!targetUser) {
      return notFound();
    }

    return <HybridUserProfileClient targetUser={targetUser} />;
    
  } catch (error) {
    console.error("Error loading profile:", error);
    return notFound();
  }
}