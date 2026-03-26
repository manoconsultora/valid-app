import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  description: 'Sistema de Validación Documental para eventos',
  title: 'VALID',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
