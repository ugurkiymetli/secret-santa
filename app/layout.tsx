import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yılbaşı Çekilişi | Secret Santa",
  description:
    "Hediye çekilişinizi kolayca organize edin. Sevdiklerinizle hediyeleşmenin en eğlenceli yolu!",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Yılbaşı Çekilişi | Secret Santa",
    description:
      "Hediye çekilişinizi kolayca organize edin. Sevdiklerinizle hediyeleşmenin en eğlenceli yolu!",
    url: "https://secret-santa-app.vercel.app", // Replace with actual URL if known, or leave generic
    siteName: "Secret Santa",
    images: [
      {
        url: "/favicon.ico", // Using favicon as requested
        width: 64, // Standard favicon size, though larger is better for OG
        height: 64,
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Yılbaşı Çekilişi | Secret Santa",
    description:
      "Hediye çekilişinizi kolayca organize edin. Sevdiklerinizle hediyeleşmenin en eğlenceli yolu!",
    images: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#fff",
              borderRadius: "0.75rem", // rounded-xl
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", // shadow-2xl
            },
            success: {
              iconTheme: {
                primary: "#4ade80", // green-400
                secondary: "rgba(0, 0, 0, 0.7)",
              },
            },
            error: {
              iconTheme: {
                primary: "#f87171", // red-400
                secondary: "rgba(0, 0, 0, 0.7)",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
