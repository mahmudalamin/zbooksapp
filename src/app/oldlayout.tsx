// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'zBooks - Your Premier Online Bookstore',
    template: '%s | zBooks'
  },
  description: 'Discover your next great read at zBooks. Browse thousands of books across all genres with fast shipping and excellent customer service.',
  keywords: 'books, online bookstore, fiction, non-fiction, literature, reading, buy books online',
  authors: [{ name: 'zBooks Team' }],
  creator: 'zBooks',
  publisher: 'zBooks',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zbooks.com',
    siteName: 'zBooks',
    title: 'zBooks - Your Premier Online Bookstore',
    description: 'Discover your next great read at zBooks. Browse thousands of books across all genres with fast shipping and excellent customer service.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'zBooks - Online Bookstore',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'zBooks - Your Premier Online Bookstore',
    description: 'Discover your next great read at zBooks. Browse thousands of books across all genres.',
    images: ['/og-image.jpg'],
    creator: '@zbooks',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  category: 'e-commerce',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Additional meta tags for better SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BookStore",
              "name": "zBooks",
              "description": "Your premier online bookstore with thousands of books across all genres",
              "url": "https://zbooks.com",
              "logo": "https://zbooks.com/logo.png",
              "image": "https://zbooks.com/og-image.jpg",
              "telephone": "+1-555-123-4567",
              "email": "hello@zbooks.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "123 Book Street",
                "addressLocality": "Reading City",
                "addressRegion": "RC",
                "postalCode": "12345",
                "addressCountry": "US"
              },
              "openingHours": "Mo-Fr 09:00-18:00, Sa 10:00-16:00",
              "sameAs": [
                "https://facebook.com/zbooks",
                "https://twitter.com/zbooks",
                "https://instagram.com/zbooks"
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Books",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Book",
                      "name": "Fiction Books"
                    }
                  },
                  {
                    "@type": "Offer", 
                    "itemOffered": {
                      "@type": "Book",
                      "name": "Non-Fiction Books"
                    }
                  }
                ]
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://zbooks.com/products?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <Providers>
            {children}
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Providers>
        </ErrorBoundary>

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration);
                  }).catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
