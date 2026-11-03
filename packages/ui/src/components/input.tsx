import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@streetproof/ui/lib/utils";
import * as React from "react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-4xl border border-field-edge bg-input/50 px-4 py-1 text-base transition-[color,box-shadow,background-color] outline-none file:mr-3 file:inline-flex file:h-5.5 file:items-center file:rounded-full file:border file:border-border file:bg-secondary file:px-3 file:text-[13px] file:font-medium file:text-secondary-foreground [&[type=file]]:text-muted-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
