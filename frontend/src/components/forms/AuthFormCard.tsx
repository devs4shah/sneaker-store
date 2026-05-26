import type { ReactNode } from "react";

interface AuthFormCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthFormCard({ title, subtitle, children, footer }: AuthFormCardProps) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl shadow-gray-200/60 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-black/40">
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
          ProSneaker
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-zinc-100">{title}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{subtitle}</p>
      </div>
      {children}
      {footer ? (
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-zinc-400">{footer}</div>
      ) : null}
    </div>
  );
}
