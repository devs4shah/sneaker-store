import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout | ProSneaker",
  description: "Complete your sneaker order",
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
