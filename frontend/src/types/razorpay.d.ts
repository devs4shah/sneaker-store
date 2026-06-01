export interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

export interface RazorpayTheme {
  color?: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: RazorpayPrefill;
  theme?: RazorpayTheme;
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

export interface RazorpayInstance {
  open(): void;
  on(event: string, callback: (response: { error?: { description?: string } }) => void): void;
}

export interface RazorpayConstructor {
  new (options: RazorpayCheckoutOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export {};
