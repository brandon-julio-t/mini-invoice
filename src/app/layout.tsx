import "@/styles/globals.css";

import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";
import { Analytics } from "@vercel/analytics/react";
import { GeistSans } from "geist/font/sans";
import { MotionConfig } from "motion/react";
import { type Metadata } from "next";

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
