import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from "./providers"
import { Navbar } from "../components/layout/navbar";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Educacion Continua y Permanente',
  description: 'Descripcion del modulo de educacion continua y permanente',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          {children}
          </Providers>
      </body>
    </html>
  )
}
