import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/auth-provider';
import { AppProvider } from '@/components/providers/app-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: 'ChronoCanvas | Ethereal Multilingual Note Studio',
  description: 'A dreamy, full-scale multilingual note-taking & code journaling sanctuary.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Lora:wght@400;600;700&family=Noto+Sans+Bengali:wght@300;400;500;600;700&family=Noto+Serif+Bengali:wght@400;600;700&family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-body antialiased min-h-screen selection:bg-purple-300/40 dark:selection:bg-purple-900/50"
      >
        <AppProvider>
          <TooltipProvider delayDuration={300}>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </TooltipProvider>
        </AppProvider>
      </body>
    </html>
  );
}
