import * as React from "react";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIMARY =
  "bg-primary text-primary-foreground shadow-btn-primary hover:bg-primary/90";
const SECONDARY =
  "bg-secondary text-secondary-foreground shadow-btn hover:bg-muted";
const DANGER = "bg-secondary text-danger shadow-btn hover:bg-danger/10";
const MD = "px-3 py-2 text-[14px] leading-none";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium leading-none outline-none select-none transition-[background-color,color,box-shadow] duration-150 ease-power3-out focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: PRIMARY,
        secondary: SECONDARY,
        ink: "bg-ink text-ink-foreground shadow-btn-ink hover:bg-ink/85",
        muted: "bg-muted text-foreground shadow-btn hover:bg-raised-hover",
        subtle: "bg-raised text-foreground shadow-btn-subtle hover:bg-muted",
        danger: DANGER,
        ghost: "text-subtle hover:bg-hover hover:text-foreground",
        nav: "w-full justify-start rounded-lg font-normal text-sidebar-foreground hover:text-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-foreground data-[active=true]:shadow-btn",
        item: "w-full items-start justify-start gap-3 rounded-lg text-left font-normal whitespace-normal text-foreground hover:bg-hover",
        link: "rounded-none text-foreground underline decoration-from-font underline-offset-2 hover:text-soft",
        default: PRIMARY,
        outline: SECONDARY,
        destructive: DANGER,
      },
      size: {
        sm: "p-[9px] text-[12px] leading-none",
        md: MD,
        lg: "px-4 py-2.5 text-[14px] leading-none",
        xl: "px-5 py-3 text-[15px] leading-none [&_svg]:size-4",
        icon: "size-[30px] p-0",
        "icon-sm": "size-6 p-0",
        none: "p-0",
        default: MD,
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
    href?: React.ComponentProps<typeof Link>["href"];
    /** Link-only: used when `href` is set. */
    target?: React.AnchorHTMLAttributes<HTMLAnchorElement>["target"];
    rel?: string;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      href,
      type = "button",
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    if (href) {
      return (
        <Link
          href={href}
          className={classes}
          {...(props as Omit<React.ComponentProps<typeof Link>, "href" | "className">)}
        >
          {children}
        </Link>
      );
    }

    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && <Loader2 aria-hidden className="animate-spin" />}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
