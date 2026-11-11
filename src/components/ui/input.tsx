import * as React from "react";
import { cn } from "@/lib/utils";

const fieldClasses =
  "w-full min-w-0 rounded-lg border border-line-strong bg-secondary px-3 text-[14px] text-foreground outline-none transition-[border-color] duration-150 ease-power3-out placeholder:text-subtle focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        fieldClasses,
        "flex h-9 leading-none file:mr-3 file:border-0 file:bg-transparent file:text-[12px] file:text-soft",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    data-slot="textarea"
    className={cn(fieldClasses, "min-h-20 py-2 leading-[1.4]", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Input, Textarea };
