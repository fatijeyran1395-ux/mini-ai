import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mini AI',
  description: 'تولید و ویرایش عکس با هوش مصنوعی',
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="fa">
      <body className="antialiased">{children}</body>
      </html>
  );
}