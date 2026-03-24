import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROPE — Bible Journaling",
  description: "Revelation. Observation. Prayer. Execution.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ivory text-dark antialiased">
        {children}
      </body>
    </html>
  );
}
