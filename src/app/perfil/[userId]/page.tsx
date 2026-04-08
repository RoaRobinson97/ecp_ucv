// app/profile-dynamic/[user_id]/page.tsx

import React from 'react';

// Esta directiva fuerza el renderizado dinámico en el servidor.
// El componente se genera en cada solicitud.
export const dynamic = 'force-dynamic';

async function getUserData(user_id: string) {
  // Simulación de una llamada a la API o base de datos en el servidor
  console.log(`Buscando datos del usuario ${user_id} en el servidor...`);
  return {
    name: `Usuario Dinámico ${user_id}`,
    bio: `Esta es la biografía del usuario ${user_id}. Renderizado completamente en el servidor.`,
  };
}

export default async function DynamicUserProfilePage({ params }: { params: { user_id: string } }) {
  const { user_id } = params;
  const user = await getUserData(user_id);

  return (
    <div className="flex flex-col items-center mt-20 p-8 bg-white shadow-lg rounded-lg max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Perfil Dinámico de {user.name}</h1>
      <p className="text-gray-700 text-center">{user.bio}</p>
      <p className="mt-4 text-sm text-gray-500">Renderizado de forma completamente dinámica.</p>
    </div>
  );
}