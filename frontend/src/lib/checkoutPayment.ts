import {
  openRazorpayCheckout,
  PaymentDismissedError,
  PaymentFailedError,
} from "@/lib/razorpay";
import { paymentService } from "@/services/paymentService";
import type { Order } from "@/types/order";
import type { PaymentPhase } from "@/types/payment";
import type { User } from "@/types/auth";

export { PaymentDismissedError, PaymentFailedError };

export interface CheckoutPaymentCallbacks {
  onPhaseChange?: (phase: PaymentPhase) => void;
}

export async function processOrderPayment(
  order: Order,
  user: User | null,
  callbacks?: CheckoutPaymentCallbacks,
): Promise<Order> {
  const setPhase = (phase: PaymentPhase) => callbacks?.onPhaseChange?.(phase);

  setPhase("creating_payment");
  const razorpayOrder = await paymentService.createPaymentOrder(order.id);

  setPhase("awaiting_payment");
  const paymentResult = await openRazorpayCheckout({
    razorpayOrderId: razorpayOrder.razorpayOrderId,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    description: `Order ${order.orderNumber}`,
    prefill: user
      ? {
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
        }
      : undefined,
  });

  setPhase("verifying");
  return paymentService.verifyPayment({
    orderId: order.id,
    razorpayOrderId: paymentResult.razorpay_order_id,
    razorpayPaymentId: paymentResult.razorpay_payment_id,
    razorpaySignature: paymentResult.razorpay_signature,
  });
}

export function getPaymentFailureReason(error: unknown): string {
  if (error instanceof PaymentDismissedError) {
    return "Payment was cancelled before completion.";
  }
  if (error instanceof PaymentFailedError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Payment could not be completed.";
}
