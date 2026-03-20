import type { Metadata } from "next";
import { IBM_Plex_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-playfair",
});

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
      <body
        className={`min-h-screen ${ibmPlexSans.className} ${playfairDisplay.variable}`}
        style={{ backgroundColor: "#F5F6F8" }}
      >
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (window.self === window.top) return;
                function postHeight() {
                  var h = document.documentElement.scrollHeight;
                  window.parent.postMessage({ type: 'scorecard-resize', height: h }, '*');
                }
                var ro = new ResizeObserver(postHeight);
                ro.observe(document.body);
                postHeight();
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
