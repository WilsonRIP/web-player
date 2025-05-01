import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../src/styles/global.css";
import { PlaylistProvider } from "../../src/components/PlaylistContext";
import { Sidebar } from "../../src/components/Sidebar";
import { ThemeProvider } from "../../src/components/theme-provider";
import { Toaster } from "../../src/components/ui/toaster";
import { SettingsProvider } from "../../src/components/SettingsContext";
import { ThemeApplicator } from "../../src/components/ThemeApplicator";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Web Media Player",
  description: "A web-based media player for audio and video files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SettingsProvider>
          <ThemeApplicator />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <PlaylistProvider>
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
              <Toaster />
            </PlaylistProvider>
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
