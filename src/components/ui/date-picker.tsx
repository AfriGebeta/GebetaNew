"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type DatePickerProps = {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: (date: Date) => boolean;
};

export default function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(`${value}T00:00:00`) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            "flex h-9 w-full min-w-[180px] cursor-pointer items-center gap-2 rounded-lg border border-line-strong bg-secondary px-3 text-left text-[14px] leading-none text-foreground outline-none transition-[border-color] duration-150 ease-power3-out focus-visible:border-ring",
            !selected && "text-subtle",
            className,
          )}
        >
          <CalendarIcon aria-hidden className="size-3.5 shrink-0 text-subtle" />
          {selected ? format(selected, "MMM d, yyyy") : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          disabled={disabled}
          onSelect={(date) => {
            if (!date) return;
            onChange(format(date, "yyyy-MM-dd"));
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
