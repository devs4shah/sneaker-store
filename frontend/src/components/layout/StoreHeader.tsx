"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuthHydrated } from "@/hooks/useAuthHydrated";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export function StoreHeader() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const logout = useAuthStore((s) => s.logout);
  const totalItems = useCartStore((s) => s.totalItems);
  const refreshCartCount = useCartStore((s) => s.refreshCartCount);
  const resetCart = useCartStore((s) => s.reset);
  const wishlistTotal = useWishlistStore((s) => s.totalItems);
  const refreshWishlist = useWishlistStore((s) => s.refreshWishlist);
  const resetWishlist = useWishlistStore((s) => s.reset);
  const isAdmin = user?.role === "ROLE_ADMIN";
  const authHydrated = useAuthHydrated();

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
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-bold text-gray-900 dark:text-zinc-100">
          Pro<span className="text-brand-600 dark:text-brand-400">Sneaker</span>
        </Link>

        <nav className="flex items-center gap-3 text-sm sm:gap-5">
          <Link
            href="/"
            className="font-medium text-gray-700 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            Shop
          </Link>

          {accessToken ? (
            <>
              <Link
                href="/dashboard"
                className="hidden text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 sm:inline"
              >
                Dashboard
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
                <Link
                  href="/admin"
                  className="hidden text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 sm:inline"
                >
                  Admin
                </Link>
              ) : null}
              {!isAdmin ? (
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
              ) : null}
              <span className="hidden text-gray-500 dark:text-zinc-400 md:inline">
                {user?.firstName}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:inline-block"
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
            </>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
