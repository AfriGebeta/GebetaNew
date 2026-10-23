import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function TableContainer({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        "w-full overflow-x-auto rounded-lg bg-card shadow-card",
        className,
      )}
      {...props}
    />
  );
}

function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <table
      data-slot="table"
      className={cn("w-full border-collapse text-[14px] leading-none", className)}
      {...props}
    />
  );
}

function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={className} {...props} />;
}

function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&>tr:last-child]:border-b-0", className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border transition-colors duration-150 ease-power3-out [tbody>&]:hover:bg-hover",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "caption-style h-[38px] whitespace-nowrap px-3 text-left align-middle font-normal text-subtle",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("h-[42px] whitespace-nowrap px-3 align-middle", className)}
      {...props}
    />
  );
}

export {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
};
