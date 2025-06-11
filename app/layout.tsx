import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientCursorEffect from "@/components/client-cursor-effect";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UserProvider } from "@/hooks/useUser";
import AuthStateListener from "@/components/auth-state-listener";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: '%s | KidsDrawingAI',
    default: 'KidsDrawingAI - Transform Children\'s Drawings with AI Magic',
  },
  description: 'Turn your child\'s simple drawings into beautiful artwork with our powerful AI technology. Upload, enhance, and share magical creations in seconds.',
  keywords: [
    'AI drawing transformation',
    'children drawings',
    'kids art enhancement',
    'AI image generator',
    'digital art for kids',
    'drawing to art AI',
    'children creativity',
    'family art activities'
  ],
  authors: [{ name: 'KidsDrawingAI Team' }],
  creator: 'KidsDrawingAI',
  publisher: 'KidsDrawingAI',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://kidsdrawingai.com'),
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'KidsDrawingAI - Transform Children\'s Drawings with AI Magic',
    description: 'Turn your child\'s simple drawings into beautiful artwork with our powerful AI technology. Upload, enhance, and share magical creations in seconds.',
    siteName: 'KidsDrawingAI',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'KidsDrawingAI - AI Drawing Transformation',
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'KidsDrawingAI - Transform Children\'s Drawings with AI Magic',
    description: 'Turn your child\'s simple drawings into beautiful artwork with our powerful AI technology.',
    images: ['/images/twitter-image.jpg'],
    creator: '@KidsDrawingAI',
  },
  
  // App links
  alternates: {
    canonical: '/',
  },
  
  // Robots
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
  
  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  
  // Verification
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} site-background`}>
        <ClientCursorEffect />
        <UserProvider>
          <AuthStateListener />
        <Header />
        <main className="pt-20">{children}</main>
        <Footer />
        <Toaster />
        </UserProvider>
        
        {/* Analytics Scripts - Added at body end for performance */}
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-6Z1P20D37B"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-6Z1P20D37B');
            `,
          }}
        />
        
        {/* Microsoft Clarity */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "rxmousbl8b");
            `,
          }}
        />
      </body>
    </html>
  );
}
