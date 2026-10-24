import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type CardVariant = "default" | "muted" | "glow";

const variantClasses: Record<CardVariant, string> = {
  default: "border-white/10 bg-surface/80 shadow-card",
  muted: "border-white/[0.07] bg-white/[0.02]",
  glow: "border-monad-500/25 bg-monad-500/[0.07] shadow-glow",
};

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border backdrop-blur-xl",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  ),
);

Card.displayName = "Card";
