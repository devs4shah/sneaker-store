import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 dark:bg-zinc-950">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
