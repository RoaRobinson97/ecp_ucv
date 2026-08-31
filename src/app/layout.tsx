import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google' // ✨ Cambiamos Inter por Montserrat
import Providers from "./providers"
import { Navbar } from "../components/layout/navbar";

// ✨ Configuramos los pesos y la variable CSS
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Educación Continua y Permanente - UCV',
  description: 'Descripción del módulo de educación continua y permanente',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // ✨ Mantenemos suppressHydrationWarning e inyectamos la clase de Montserrat
    <html lang="es" suppressHydrationWarning className={montserrat.variable}>
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}