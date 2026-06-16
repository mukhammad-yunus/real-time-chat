import type { InputHTMLAttributes } from "react";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function Field({ label, hint, error, id, ...props }: FieldProps) {
  const inputId = id ?? props.name;
  const descriptionId = `${inputId}-description`;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-semibold">
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={hint || error ? descriptionId : undefined}
        className="min-h-11 w-full rounded-xl border bg-white px-3.5 text-base shadow-sm transition focus:border-mint-500 sm:text-sm"
      />
      {error ? (
        <p id={descriptionId} role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p id={descriptionId} className="text-sm text-ink-700">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
