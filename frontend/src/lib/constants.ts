export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY ?? "";

/** Store catalog and checkout amounts are in Indian Rupees */
export const STORE_CURRENCY = "INR";
export const STORE_LOCALE = "en-IN";

export const AUTH_STORAGE_KEY = "prosneaker-auth";
export const CART_STORAGE_KEY = "prosneaker-cart";
export const WISHLIST_STORAGE_KEY = "prosneaker-wishlist";
export const AUTH_TOKEN_COOKIE = "prosneaker-token";
export const AUTH_ROLE_COOKIE = "prosneaker-role";

export const ADMIN_ROLE = "ROLE_ADMIN" as const;
