import type { Metadata } from 'next';
import { Inter, Fira_Code } from 'next/font/google';
import './globals.css';
import { WorkspaceSidebar } from '@/components/layout/WorkspaceSidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const firaCode = Fira_Code({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'SOW - Study & Work OS',
  description: 'Operating System for Studies and Work',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" data-theme="dark">
      <body className={`${inter.variable} ${firaCode.variable}`}>
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          <WorkspaceSidebar />
          <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
