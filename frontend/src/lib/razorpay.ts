import { RAZORPAY_KEY_ID } from "@/lib/constants";
import type { RazorpayCheckoutOptions, RazorpayPrefill } from "@/types/razorpay";
import type { RazorpaySuccessResponse } from "@/types/payment";

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
const SCRIPT_ID = "razorpay-checkout-js";

let scriptLoadPromise: Promise<void> | null = null;

export class PaymentDismissedError extends Error {
  constructor(message = "Payment was cancelled") {
    super(message);
    this.name = "PaymentDismissedError";
  }
}

export class PaymentFailedError extends Error {
  constructor(message = "Payment failed") {
    super(message);
    this.name = "PaymentFailedError";
  }
}

export function getRazorpayKeyId(): string {
  if (!RAZORPAY_KEY_ID) {
    throw new Error(
      "NEXT_PUBLIC_RAZORPAY_KEY is not configured. Add it to your .env.local file.",
    );
  }
  return RAZORPAY_KEY_ID;
}

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only be loaded in the browser"));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Razorpay checkout script")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout script"));
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

export interface OpenRazorpayCheckoutParams {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  description: string;
  prefill?: RazorpayPrefill;
}

export async function openRazorpayCheckout(
  params: OpenRazorpayCheckoutParams,
): Promise<RazorpaySuccessResponse> {
  await loadRazorpayScript();

  const RazorpayConstructor = window.Razorpay;
  if (!RazorpayConstructor) {
    throw new Error("Razorpay checkout is unavailable");
  }

  const key = getRazorpayKeyId();

  return new Promise<RazorpaySuccessResponse>((resolve, reject) => {
    const options: RazorpayCheckoutOptions = {
      key,
      amount: params.amount,
      currency: params.currency,
      name: "ProSneaker",
      description: params.description,
      order_id: params.razorpayOrderId,
      prefill: params.prefill,
      theme: { color: "#2563eb" },
      handler: (response) => {
        resolve({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => reject(new PaymentDismissedError()),
        escape: true,
        backdropclose: false,
      },
    };

    const instance = new RazorpayConstructor(options);

    instance.on("payment.failed", (response) => {
      const description =
        response.error?.description ?? "Your payment could not be completed.";
      reject(new PaymentFailedError(description));
    });

    instance.open();
  });
}
