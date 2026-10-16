"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

type SheetContentProps = React.ComponentPropsWithoutRef<
  typeof SheetPrimitive.Content
> & {
  side?: "left" | "right" | "bottom";
};

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ className, children, side = "right", ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[6px] duration-350 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-250 data-[state=closed]:ease-power3-in data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:ease-power3-out" />
    <SheetPrimitive.Content
      ref={ref}
      data-slot="sheet-content"
      className={cn(
        "fixed z-50 flex w-full flex-col bg-background text-foreground outline-none duration-350 data-[state=closed]:animate-out data-[state=closed]:duration-250 data-[state=closed]:ease-power3-in data-[state=open]:animate-in data-[state=open]:ease-power3-out",
        side === "right" &&
          "inset-y-0 right-0 h-dvh border-l border-line-strong data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full",
        side === "left" &&
          "inset-y-0 left-0 h-dvh border-r border-line-strong data-[state=closed]:slide-out-to-left-full data-[state=open]:slide-in-from-left-full",
        side === "bottom" &&
          "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-xl border-t border-line-strong shadow-overlay data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full",
        className,
      )}
      {...props}
    >
      {children}
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line-strong px-6",
        className,
      )}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "flex h-[62px] shrink-0 items-center justify-between gap-2 border-t border-line-strong px-6",
        className,
      )}
      {...props}
    />
  );
}

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("lead-style", className)}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("caption-style text-soft", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
