import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'DraftCN - Visual Block Builder',
  description: 'A visual drag-and-drop block builder for creating layouts',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <div className="flex flex-col h-screen">
          <Header />
          <main className="flex-1 flex overflow-hidden">{children}</main>
        </div>
      </body>
    </html>
  )
}
