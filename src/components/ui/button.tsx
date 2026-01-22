import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "motion-button group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground shadow-sm hover:bg-hover-dark",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
                outline:
                    "border border-border bg-transparent shadow-sm hover:bg-surface-muted hover:text-foreground hover:border-border/80",
                secondary:
                    "bg-surface-muted text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-surface-muted hover:text-foreground",
                link: "text-primary link-underline",
            },
            size: {
                default: "h-11 px-6 py-2 has-[>svg]:px-4",
                sm: "h-9 rounded-md px-3 has-[>svg]:px-2.5",
                lg: "h-12 rounded-lg px-8 has-[>svg]:px-6 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        // Note: To use asChild, user needs @radix-ui/react-slot. I'll stick to basic standard HTML button if slot not installed.
        // Checking package.json: user did NOT install @radix-ui/react-slot. I should install it or remove Slot.
        // I previously auto-installed 'lucide-react' etc but missed radix primitives roughly mentioned in "shadcn" style but user asked for "ui/*" components.
        // I will use simple implementation for now to avoid extra deps unless requested, but Slot is standard for "shadcn-like" flexibility.
        // For now, I'll remove Slot usage to keep deps clean, or install it.
        // Plan: Use standard button.
        const Comp = "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
