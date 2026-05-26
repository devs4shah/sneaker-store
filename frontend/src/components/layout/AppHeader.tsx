"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuthStore } from "@/store/authStore";

export function AppHeader() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = useAuthStore((s) => s.user?.role === "ROLE_ADMIN");

  const handleLogout = () => {
    logout();
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="border-b border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/dashboard"
          className="text-lg font-bold text-gray-900 dark:text-zinc-100"
        >
          Pro<span className="text-brand-600 dark:text-brand-400">Sneaker</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Dashboard
          </Link>
          {isAdmin ? (
            <Link
              href="/admin"
              className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Admin
            </Link>
          ) : null}
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
        </nav>
      </div>
    </header>
  );
}
