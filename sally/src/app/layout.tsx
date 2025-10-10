import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { SessionProvider } from '@/contexts/SessionContext';
import { JobsProvider } from '@/contexts/JobsContext';
import { SessionDebugUntilConversationalAI } from '@/components/session-debug';
import { RoleDebugDev } from '@/components/role-debug';
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sally - AI Recruitment Platform",
  description: "Advanced AI-powered recruitment and candidate management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <SessionProvider>
            <JobsProvider>
              {children}
              {/* Session debug widget - shows from get-started until conversational-ai */}
              {/* <SessionDebugUntilConversationalAI /> */}
              {/* Role debug widget - shows current role information */}
              {/* <RoleDebugDev /> */}
            </JobsProvider>
          </SessionProvider>
        </AuthProvider>

        {/* Load development utilities - Commented out as files don't exist yet */}
        {/* {process.env.NODE_ENV === 'development' && (
          <>
            <Script id="refresh-token-tester" strategy="afterInteractive">
              {`
                import('/src/lib/test-refresh-token.js').then(module => {
                  window.testRefreshToken = module.RefreshTokenTester;
                  console.log('🧪 Refresh Token Tester loaded! Use window.testRefreshToken in console.');
                }).catch(() => {
                  console.log('⚠️ Refresh Token Tester not available');
                });
              `}
            </Script>

            <Script id="session-utils" strategy="afterInteractive">
              {`
                import('/src/lib/session-utils.js').then(module => {
                  // Session utils are automatically attached to window in the module
                  console.log('📋 Session Utils loaded! Use window.sessionUtils in console.');
                }).catch(() => {
                  console.log('⚠️ Session Utils not available');
                });
              `}
            </Script>
          </>
        )} */}
      </body>
    </html>
  );
}
