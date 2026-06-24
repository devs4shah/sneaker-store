"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <section className="rounded-2xl border border-brand-200 bg-white p-6 shadow-sm dark:border-brand-800 dark:bg-zinc-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
        Admin area
      </p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-zinc-100">Admin dashboard</h1>
      <p className="mt-2 text-gray-600 dark:text-zinc-400">
        Hello {user?.firstName}, you have administrator access to manage the store.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/admin/orders"
          className="inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          Open orders dashboard
        </Link>
        <Link
          href="/admin/inventory"
          className="inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Manage inventory
        </Link>
      </div>
    </section>
  );
}
