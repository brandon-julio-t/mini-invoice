import "@/styles/globals.css";

import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";
import { Analytics } from "@vercel/analytics/react";
import { GeistSans } from "geist/font/sans";
import { MotionConfig } from "motion/react";
import { type Metadata } from "next";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Invoice App",
  description: "Invoice App",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <Head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="Mini Invoice" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body>
        <TRPCReactProvider>
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
          <Toaster position="top-center" richColors />
          <Analytics />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
