interface SubmitButtonProps {
  label: string;
  isLoading?: boolean;
}

export function SubmitButton({ label, isLoading = false }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-600"
    >
      {isLoading ? "Please wait..." : label}
    </button>
  );
}
