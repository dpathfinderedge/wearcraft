import type { Metadata } from 'next';
import './globals.css';
import { Navbar, Footer } from '@/components/layouts';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastProvider } from '@/components/ui';

export const metadata: Metadata = {
  title: 'WearCraft - Premium Clothing Store',
  description: 'Discover premium fashion pieces crafted for the modern wardrobe',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
