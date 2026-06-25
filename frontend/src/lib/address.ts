import type { CheckoutFormValues } from "@/lib/validations/checkout";
import type { Address } from "@/types/address";

export function addressToCheckoutValues(address: Address): CheckoutFormValues {
  const streetLines = [address.addressLine1, address.addressLine2].filter(Boolean);
  const shippingAddress = `${address.fullName} | ${address.phoneNumber}\n${streetLines.join(", ")}`;
  const city = address.state ? `${address.city}, ${address.state}` : address.city;

  return {
    shippingAddress,
    city,
    postalCode: address.postalCode,
    country: address.country,
  };
}

export function formatAddressSummary(address: Address): string {
  const lines = [
    address.fullName,
    address.phoneNumber,
    address.addressLine1,
    address.addressLine2,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country,
  ].filter(Boolean);

  return lines.join("\n");
}
