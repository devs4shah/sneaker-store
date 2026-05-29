import { ADMIN_ROLE } from "@/lib/constants";

export function canUseCart(role?: string | null): boolean {
  return Boolean(role) && role !== ADMIN_ROLE;
}
