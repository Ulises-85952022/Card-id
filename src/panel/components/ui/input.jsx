import { forwardRef } from "react";
import { cn } from "@panel/lib/utils";

export const Input = forwardRef(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-body-sm text-foreground shadow-sm transition-colors",
      "placeholder:text-muted-foreground file:border-0 file:bg-transparent file:text-body-sm file:font-medium",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0 focus-visible:border-primary",
      "disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
