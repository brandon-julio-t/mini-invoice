import "@/styles/globals.css";

import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";
import { Analytics } from "@vercel/analytics/react";
import { Inter as FontSans } from "next/font/google";
import { MotionConfig } from "motion/react";
import { type Metadata } from "next";
import { ThemeProvider } from "@/components/ui/theme-provider";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Invoice App",
  description: "Invoice App",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} antialiased`}
    >
      <body>
        <TRPCReactProvider>
          <MotionConfig reducedMotion="user">
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}

              <Toaster position="top-center" richColors />
            </ThemeProvider>
          </MotionConfig>

          <Analytics />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
