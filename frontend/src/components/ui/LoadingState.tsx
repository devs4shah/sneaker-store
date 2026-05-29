interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16" role="status" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-brand-600 dark:border-zinc-700 dark:border-t-brand-400" />
      <p className="mt-4 text-sm text-gray-500 dark:text-zinc-400">{message}</p>
    </div>
  );
}
