import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DressCode - Ruddy Autem",
  description: "DressCode - Ruddy Autem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
