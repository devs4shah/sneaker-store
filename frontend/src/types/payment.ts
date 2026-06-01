export interface RazorpayOrderPayload {
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentRequest {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentFailureRequest {
  orderId: string;
  reason?: string;
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export type PaymentPhase =
  | "idle"
  | "creating_order"
  | "creating_payment"
  | "awaiting_payment"
  | "verifying";
