'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import ChatWidget from '@/components/ChatWidget';

const inter = Inter({ subsets: ['latin'] });

const metadata = {
  title: 'Pulse Clinic',
  description: 'Healthcare platform for patients and doctors',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-white`}>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
