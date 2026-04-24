interface ErrorMessageProps {
  message?: string;
}

export function ErrorMessage({ message = 'Something went wrong. Please try again.' }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-center gap-2">
        <span className="text-red-500">⚠️</span>
        <p className="text-sm text-red-700">{message}</p>
      </div>
    </div>
  );
}
