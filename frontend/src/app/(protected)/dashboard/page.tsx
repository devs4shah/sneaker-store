"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Dashboard</h1>
      <p className="mt-2 text-gray-600 dark:text-zinc-400">
        Welcome back, {user?.firstName}! You are signed in as{" "}
        <span className="font-medium text-gray-900 dark:text-zinc-200">{user?.email}</span>.
      </p>
      <p className="mt-4 text-sm text-gray-500 dark:text-zinc-500">
        Role: <span className="font-mono text-gray-700 dark:text-zinc-300">{user?.role}</span>
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard/profile"
          className="inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          Edit profile
        </Link>
        <Link
          href="/dashboard/addresses"
          className="inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Manage addresses
        </Link>
      </div>
    </section>
  );
}
