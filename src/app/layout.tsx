import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REAP Technical Assessment",
  description: "Technical assessment for full-stack engineering candidates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
