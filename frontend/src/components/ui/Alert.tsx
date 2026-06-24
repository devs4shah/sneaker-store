type AlertVariant = "success" | "error" | "info" | "warning";

interface AlertProps {
  variant?: AlertVariant;
  message: string;
}

const variantStyles: Record<AlertVariant, string> = {
  success:
    "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300",
  error:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300",
  info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200",
};

export function Alert({ variant = "info", message }: AlertProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`rounded-lg border px-4 py-3 text-sm ${variantStyles[variant]}`}
    >
      {message}
    </div>
  );
}
