import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Swagger – Project Management',
  description: 'Deliver every project on time and on budget.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background font-sans antialiased">{children}</body>
    </html>
  );
}
