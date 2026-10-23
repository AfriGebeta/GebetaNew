"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type OtpInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  name?: string;
  disabled?: boolean;
  className?: string;
};

export default function OtpInput({
  value,
  onChange,
  name = "otp",
  disabled,
  className,
}: OtpInputProps) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  const focus = (index: number) => refs.current[index]?.focus();

  const setDigit = (index: number, digit: string) => {
    const next = [...value];
    next[index] = digit;
    onChange(next);
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setDigit(index, digit);
    if (digit && index < value.length - 1) focus(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) focus(index - 1);
    if (e.key === "ArrowLeft" && index > 0) focus(index - 1);
    if (e.key === "ArrowRight" && index < value.length - 1) focus(index + 1);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, value.length);
    if (!digits) return;
    e.preventDefault();
    onChange(value.map((_, i) => digits[i] ?? ""));
    focus(Math.min(digits.length, value.length - 1));
  };

  return (
    <div data-slot="otp-input" className={cn("flex justify-center gap-2", className)}>
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          name={`${name}-${index}`}
          aria-label={`Digit ${index + 1}`}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="size-11 rounded-lg border border-line-strong bg-secondary text-center text-[16px] font-medium text-foreground outline-none transition-[border-color] duration-150 ease-power3-out focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      ))}
    </div>
  );
}

export { OtpInput };
