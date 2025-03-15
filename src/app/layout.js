'use client';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { msalConfig } from "../utilities/authConfig";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


const msalInstance = new PublicClientApplication(msalConfig);

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MsalProvider instance={msalInstance}>
          {children}
        </MsalProvider>
      </body>
    </html>
  );
}
