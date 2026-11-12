import type { Metadata } from 'next';
import {
  Plus_Jakarta_Sans,
  Outfit,
  Hind_Siliguri,
  Noto_Sans_Bengali,
  Lora,
  Noto_Serif_Bengali,
  JetBrains_Mono,
} from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth/auth-provider';
import { AppProvider } from '@/components/providers/app-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const outfitFont = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const bengaliDisplayFont = Hind_Siliguri({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bengali-display',
  display: 'swap',
});

const bengaliFont = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-bengali',
  display: 'swap',
});

const serifFont = Lora({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const bengaliSerifFont = Noto_Serif_Bengali({
  subsets: ['bengali'],
  weight: ['400', '600', '700'],
  variable: '--font-bengali-serif',
  display: 'swap',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

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
      </head>
      <body
        className={`
          ${sansFont.variable}
          ${outfitFont.variable}
          ${bengaliDisplayFont.variable}
          ${bengaliFont.variable}
          ${serifFont.variable}
          ${bengaliSerifFont.variable}
          ${monoFont.variable}
          font-body antialiased min-h-screen selection:bg-purple-300/40 dark:selection:bg-purple-900/50
        `}
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
