import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary/20 text-primary border-primary/30',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          'border-red-500/30 bg-red-500/15 text-red-400',
        outline: 'text-foreground border-border',
        safe: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400',
        moderate: 'border-amber-500/30 bg-amber-500/15 text-amber-400',
        severe: 'border-orange-500/30 bg-orange-500/15 text-orange-400',
        extreme: 'border-rose-500/40 bg-rose-500/20 text-rose-400 font-bold animate-pulse-subtle',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
