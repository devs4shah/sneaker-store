import { Suspense } from "react";
import { PaymentFailureView } from "@/components/checkout/PaymentFailureView";
import { LoadingState } from "@/components/ui/LoadingState";

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={<LoadingState message="Loading payment details..." />}>
      <PaymentFailureView />
    </Suspense>
  );
}
