import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'BBB Event 2025 - Registration',
    template: '%s | BBB Event 2025'
  },
  description: 'Official registration portal for BBB Event 2025. Register now for an unforgettable experience with exclusive ticket options including Platinum, Gold, and Silver packages.',
  keywords: ['BBB Event', 'Event Registration', 'Ticket Booking', '2025 Event', 'Online Registration', 'Event Tickets'],
  authors: [{ name: 'BBB Event Team' }],
  creator: 'BBB Event Organization',
  publisher: 'BBB Event',
  applicationName: 'BBB Event Registration',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'BBB Event 2025 - Official Registration',
    description: 'Register now for BBB Event 2025. Choose from Platinum, Gold, and Silver ticket packages.',
    siteName: 'BBB Event 2025',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BBB Event 2025',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'BBB Event 2025 - Registration Open',
    description: 'Register now for BBB Event 2025. Exclusive ticket packages available.',
    images: ['/og-image.jpg'],
    creator: '@bbbevent',
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  
  manifest: '/site.webmanifest',
  
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  
  category: 'Events',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
