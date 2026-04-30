import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FreedomOS',
  description: 'Motor ontológico para migraciones sociales',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FreedomOS',
  },
  icons: {
    icon: [
      { url: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/pwa-192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
