"use client";

import ReactPhoneInput, { type PhoneInputProps as ReactPhoneInputProps } from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<ReactPhoneInputProps, "inputClass" | "buttonClass" | "containerClass" | "dropdownClass"> & {
  id?: string;
  required?: boolean;
  className?: string;
};

export default function PhoneInput({ id, required, className, inputProps, ...props }: PhoneInputProps) {
  return (
    <ReactPhoneInput
      enableSearch
      countryCodeEditable={false}
      searchPlaceholder="Search country"
      containerClass={cn("ds-phone", className)}
      inputProps={{ id, required, ...inputProps }}
      {...props}
    />
  );
}

export { PhoneInput };
