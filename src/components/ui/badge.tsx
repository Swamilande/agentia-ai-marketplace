import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Marketplace variants
        category:
          "bg-background/60 backdrop-blur-md text-foreground border-foreground/10 rounded-2xl px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-black",
        live:
          "bg-green-500/80 backdrop-blur-md text-foreground border-none rounded-2xl px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] font-black",
        info:
          "bg-primary/10 border-primary/20 text-primary px-4 py-1 rounded-full text-xs font-medium uppercase tracking-widest backdrop-blur-sm",
        glass:
          "glass-card border-foreground/10 text-foreground rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
