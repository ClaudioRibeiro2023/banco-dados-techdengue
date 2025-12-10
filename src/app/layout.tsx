import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'TechDengue Dashboard',
    template: '%s | TechDengue',
  },
  description: 'Plataforma de gerenciamento e análise de dados para combate à dengue e outras arboviroses. Monitore criadouros, acompanhe atividades e gere relatórios.',
  keywords: ['dengue', 'arboviroses', 'saúde pública', 'monitoramento', 'criadouros', 'epidemiologia', 'dashboard'],
  authors: [{ name: 'TechDengue' }],
  creator: 'TechDengue',
  publisher: 'TechDengue',
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TechDengue',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'TechDengue Dashboard',
    title: 'TechDengue Dashboard',
    description: 'Plataforma de gerenciamento e análise de dados para combate à dengue',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechDengue Dashboard',
    description: 'Plataforma de gerenciamento e análise de dados para combate à dengue',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="dns-prefetch" href="https://api.mapbox.com" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
