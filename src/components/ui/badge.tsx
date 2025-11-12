import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/50 hover:shadow-lg hover:shadow-green-500/60",
        warning: "border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/50 hover:shadow-lg hover:shadow-amber-500/60",
        error: "border-transparent bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/50 hover:shadow-lg hover:shadow-red-500/60",
        info: "border-transparent bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/50 hover:shadow-lg hover:shadow-blue-500/60",
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
