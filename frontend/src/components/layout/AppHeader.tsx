"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuthHydrated } from "@/hooks/useAuthHydrated";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export function AppHeader() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = user?.role === "ROLE_ADMIN";
  const authHydrated = useAuthHydrated();
  const totalItems = useCartStore((s) => s.totalItems);
  const refreshCartCount = useCartStore((s) => s.refreshCartCount);
  const resetCart = useCartStore((s) => s.reset);
  const wishlistTotal = useWishlistStore((s) => s.totalItems);
  const refreshWishlist = useWishlistStore((s) => s.refreshWishlist);
  const resetWishlist = useWishlistStore((s) => s.reset);

  useEffect(() => {
    if (!authHydrated) {
      return;
    }

    if (accessToken && !isAdmin) {
      void refreshCartCount();
      void refreshWishlist();
    }
    if (isAdmin) {
      resetCart();
      resetWishlist();
    }
  }, [
    authHydrated,
    accessToken,
    isAdmin,
    refreshCartCount,
    refreshWishlist,
    resetCart,
    resetWishlist,
  ]);

  const handleLogout = () => {
    logout();
    resetCart();
    resetWishlist();
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="border-b border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/sneakers" className="text-lg font-bold text-gray-900 dark:text-zinc-100">
          Pro<span className="text-brand-600 dark:text-brand-400">Sneaker</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/sneakers"
            className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Shop
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Profile
              </Link>
              {!isAdmin ? (
                <Link
                  href="/orders"
                  className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  My Orders
                </Link>
              ) : null}
              {isAdmin ? (
                <>
                  <Link
                    href="/admin/orders"
                    className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Admin Orders
                  </Link>
                  <Link
                    href="/admin/inventory"
                    className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Inventory
                  </Link>
                  <Link
                    href="/admin/products"
                    className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Products
                  </Link>
                  <Link
                    href="/admin/coupons"
                    className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Coupons
                  </Link>
                  <Link
                    href="/admin/analytics"
                    className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Analytics
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/wishlist"
                    className="relative inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Wishlist
                    {wishlistTotal > 0 ? (
                      <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
                        {wishlistTotal}
                      </span>
                    ) : null}
                  </Link>
                  <Link
                    href="/cart"
                    className="relative inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Cart
                    {totalItems > 0 ? (
                      <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
                        {totalItems}
                      </span>
                    ) : null}
                  </Link>
                </>
              )}
              <span className="hidden text-gray-500 dark:text-zinc-400 sm:inline">
                {user?.firstName} {user?.lastName}
              </span>
              <ThemeToggle />
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-600 px-3 py-1.5 font-semibold text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
              >
                Register
              </Link>
              <ThemeToggle />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
