import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'POS Cesariel',
  description: 'Sistema de punto de venta',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
