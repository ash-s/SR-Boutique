import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { FloatingSupport } from "@/components/shop/FloatingSupport";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-[var(--background)]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingSupport />
      </div>
    </CartProvider>
  );
}
