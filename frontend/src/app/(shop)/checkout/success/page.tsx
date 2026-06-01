import { Suspense } from "react";
import { PaymentSuccessView } from "@/components/checkout/PaymentSuccessView";
import { LoadingState } from "@/components/ui/LoadingState";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading order confirmation..." />}>
      <PaymentSuccessView />
    </Suspense>
  );
}
