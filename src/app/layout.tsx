import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROPE — Bible Journaling",
  description: "A daily rhythm of Revelation, Observation, Prayer, and Execution.",
};

import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          shimmer: true,
          socialButtonsVariant: "blockButton",
        },
        variables: {
          colorPrimary: "#5c4327", // Brown
          colorText: "#2e2418", // Dark brown
          colorBackground: "#f5efe3", // Ivory
          colorInputBackground: "#ebe4d4", // Cream
          colorInputText: "#2e2418",
          borderRadius: "1rem",
        },
      }}
    >
      <html lang="en" className="overflow-x-hidden" suppressHydrationWarning>
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const saved = localStorage.getItem("rope_dark_mode");
                    const theme = saved !== null ? (saved === "true") : window.matchMedia("(prefers-color-scheme: dark)").matches;
                    if (theme) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
        </head>
        <body className="min-h-screen bg-ivory text-dark antialiased overflow-x-hidden">
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
