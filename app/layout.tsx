import type { Metadata, Viewport } from "next";
import { WishlistProvider } from "@/components/WishlistProvider";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: `${BRAND_NAME} | Boutique Fashion`,
  description: BRAND_TAGLINE,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <WishlistProvider>{children}</WishlistProvider>
      </body>
    </html>
  );
}
