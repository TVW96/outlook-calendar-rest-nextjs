'use client';
import "./globals.css";
import { msalConfig } from "../utilities/authConfig";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { AuthProvider } from "../context/AuthContext";

const msalInstance = new PublicClientApplication(msalConfig);

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MsalProvider instance={msalInstance}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </MsalProvider>
      </body>
    </html >
  );
}
