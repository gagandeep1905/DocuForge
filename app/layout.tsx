import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'DocuForge — Project documentation, made simpler',
    template: '%s · DocuForge',
  },
  description:
    'Turn a student software project into a structured documentation pack. Start with a ZIP or a public GitHub repository.',
  applicationName: 'DocuForge',
};

export const viewport: Viewport = {
  themeColor: '#f8f7fc',
  colorScheme: 'light',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
