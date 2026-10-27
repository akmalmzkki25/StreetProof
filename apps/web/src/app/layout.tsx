import type { Metadata } from "next";

import Providers from "@/components/providers";

import "./globals.css";

export const metadata: Metadata = {
  applicationName: "StreetProof",
  title: {
    default: "StreetProof",
    template: "%s · StreetProof",
  },
  description:
    "Facility damage reports become assigned repair work with completion evidence and supervisor-controlled closure.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
