import type { Metadata } from 'next';
import './globals.css';
import { AppChrome } from '@/components/layouts/AppChrome';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastProvider } from '@/components/ui';

export const metadata: Metadata = {
  title: 'WearCraft | Thoughtful Wardrobe Essentials',
  description: 'Thoughtfully selected wardrobe essentials for everyday life.',
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
            <AppChrome>{children}</AppChrome>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
