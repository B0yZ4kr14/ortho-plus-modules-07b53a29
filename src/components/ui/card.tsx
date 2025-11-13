import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-2xl border-0 bg-card text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "shadow-xl hover:shadow-2xl backdrop-blur-sm bg-card/95 shadow-primary/5",
        elevated: "shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-0 backdrop-blur-sm bg-card/95 hover:-translate-y-2 shadow-primary/10",
        interactive: "shadow-xl hover:shadow-2xl hover:-translate-y-2 cursor-pointer backdrop-blur-sm bg-card/95 hover:bg-card active:translate-y-0 shadow-primary/5 hover:shadow-primary/10",
        gradient: "bg-gradient-to-br from-card via-card to-card/80 shadow-2xl hover:shadow-[0_25px_60px_rgba(0,0,0,0.35)] border-0 relative overflow-hidden backdrop-blur-sm shadow-primary/10",
        metric: "shadow-xl border-l-4 border-l-primary/60 hover:shadow-2xl hover:border-l-primary hover:-translate-y-1 bg-gradient-to-br from-card via-card to-muted/10 backdrop-blur-sm shadow-primary/8 hover:shadow-primary/12",
      },
      depth: {
        subtle: "shadow-lg hover:shadow-xl shadow-primary/5",
        normal: "shadow-xl hover:shadow-2xl shadow-primary/8",
        intense: "shadow-2xl hover:shadow-[0_25px_60px_rgba(0,0,0,0.35)] shadow-primary/10",
      },
    },
    defaultVariants: {
      variant: "default",
      depth: "normal",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, depth, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(cardVariants({ variant, depth }), className)} 
      {...props} 
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
