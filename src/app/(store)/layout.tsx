import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import "../globals.css";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { DisableDraftMode } from "@/components/DisableDraftMode";
import { VisualEditingWrapper } from "@/components/VisualEditingWrapper";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "DressCode | Ruddy Autem",
  description: "Découvrez les pièces sélectionnées par Ruddy Autem - Mode contemporaine & intemporelle.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      {(await draftMode()).isEnabled && (
        <>
          <DisableDraftMode />
          <VisualEditingWrapper />
        </>
      )}
      <div className='min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white pb-14 sm:pb-0'>
        <Header />
        <main className='flex-1'>{children}</main>
        <BottomNav />
      </div>
      <Toaster
        position='top-center'
        theme='light'
        duration={2000}
        closeButton={false}
        toastOptions={{
          style: {
            marginTop: "24px",
            background: "#ffffff",
            color: "#020617", // slate-950
            borderRadius: "1rem",
            padding: "12px 18px",
            boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(226, 232, 240, 0.95)",
            fontSize: "13px",
            fontWeight: "700",
          },
          classNames: {
            toast: "max-sm:text-center max-sm:justify-center",
            title: "max-sm:text-center max-sm:w-full",
            description: "text-slate-500 font-medium text-xs mt-0.5 max-sm:text-center max-sm:w-full",
            actionButton: "bg-slate-950 text-white font-bold",
            cancelButton: "bg-slate-100 text-slate-700",
          },
        }}
      />
    </LanguageProvider>
  );
}


