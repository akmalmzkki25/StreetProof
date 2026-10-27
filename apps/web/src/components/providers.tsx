"use client";

import { Toaster } from "@streetproof/ui/components/sonner";
import { TooltipProvider } from "@streetproof/ui/components/tooltip";

import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
