import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DressCode - Ruddy Autem",
  description: "DressCode - Ruddy Autem",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='fr'>
      <body>{children}</body>
    </html>
  );
}
