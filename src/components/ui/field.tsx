import type { ReactNode } from "react";
import { Label } from "./label";
import { cn } from "@/lib/utils";

type FieldProps = {
  label: ReactNode;
  htmlFor: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  trailing?: ReactNode;
  className?: string;
  children: ReactNode;
};

export default function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  trailing,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor}>
          {label}
          {required && (
            <span aria-hidden className="text-subtle">
              {" "}
              *
            </span>
          )}
        </Label>
        {trailing}
      </div>
      {children}
      {error ? (
        <span
          id={`${htmlFor}-error`}
          role="alert"
          className="caption-style block text-danger"
        >
          {error}
        </span>
      ) : (
        hint && (
          <span
            id={`${htmlFor}-hint`}
            className="caption-style block leading-[1.3] text-subtle"
          >
            {hint}
          </span>
        )
      )}
    </div>
  );
}

export { Field };
