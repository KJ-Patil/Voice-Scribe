import type { Metadata } from 'next';
import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-noto-devanagari',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VoiceScribe - Real-Time Multilingual Speech-to-Text',
  description:
    'Real-time streaming speech-to-text with specialized Indian multilingual & Hinglish support powered by Google Gemini Live API.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'><path d='M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z'/><path d='M19 10v2a7 7 0 0 1-14 0v-2'/><line x1='12' x2='12' y1='19' y2='22'/></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${notoDevanagari.variable} font-sans relative overflow-x-hidden transition-colors duration-300`}>
        {/* Soft Ambient Floating Pastel Blobs */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-400/25 dark:bg-purple-900/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/3 -right-32 w-96 h-96 bg-emerald-400/20 dark:bg-emerald-900/15 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-rose-400/20 dark:bg-rose-900/15 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>

        {children}
      </body>
    </html>
  );
}
