"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

interface WishlistContextType {
  ids: Set<string>;
  isLoaded: boolean;
  isInWishlist: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setIds(new Set());
      setIsLoaded(true);
      return;
    }
    const { data } = await supabase
      .from("wishlist")
      .select("product_id")
      .eq("user_id", user.id);
    setIds(new Set((data || []).map((w) => w.product_id)));
    setIsLoaded(true);
  }, [supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isInWishlist = useCallback((productId: string) => ids.has(productId), [ids]);

  const toggle = useCallback(
    async (productId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = `/login?redirect=/product/${productId}`;
        return;
      }
      if (ids.has(productId)) {
        await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
        setIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        await supabase.from("wishlist").insert({
          user_id: user.id,
          product_id: productId,
        });
        setIds((prev) => new Set(prev).add(productId));
      }
    },
    [ids, supabase]
  );

  return (
    <WishlistContext.Provider value={{ ids, isLoaded, isInWishlist, toggle, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
