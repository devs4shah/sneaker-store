import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Cart | ProSneaker",
  description: "Review items in your shopping cart",
};

export default function CartPage() {
  return <CartView />;
}
