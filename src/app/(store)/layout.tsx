import Header from "@/components/Header";
import "../globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { draftMode } from "next/headers";
import { DisableDraftMode } from "@/components/DisableDraftMode";
import { frFR } from "@clerk/localizations";
import { VisualEditingWrapper } from "@/components/VisualEditingWrapper";

export const metadata: Metadata = {
  title: "DressCode - Ruddy Autem",
  description: "DressCode - Ruddy Autem",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider dynamic localization={frFR}>
      <html lang='en'>
        <body>
          {(await draftMode()).isEnabled && (
            <>
              <DisableDraftMode />
              <VisualEditingWrapper />
            </>
          )}
          <main>
            <Header />
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
