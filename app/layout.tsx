import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Brazilian Phonk Generator - Vee o Robô Safado',
  description: 'Generate Brazilian Phonk music with custom lyrics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
