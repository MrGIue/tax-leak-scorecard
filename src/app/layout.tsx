import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scorecard",
  description: "Assessment tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ backgroundColor: "#f9fafb" }}>
        {children}
      </body>
    </html>
  );
}
