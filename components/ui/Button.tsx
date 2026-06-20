import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded font-body font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
          size === "md" ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs",
          variant === "primary" &&
            "bg-tag text-white hover:bg-tag-dark",
          variant === "secondary" &&
            "bg-ink-600 text-paper hover:bg-ink-500 border border-ink-500",
          variant === "ghost" &&
            "bg-transparent text-paper/80 hover:bg-ink-700 hover:text-paper",
          variant === "danger" &&
            "bg-transparent border border-tag text-tag hover:bg-tag/10",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
