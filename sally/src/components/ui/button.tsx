import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/components/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-[#8952E0] text-white hover:bg-[#7A47CC] shadow-sm",
        secondary: "bg-[#F1F1F2] text-[#1D2025] hover:bg-gray-200",
        outline:
          "border border-gray-300 bg-white text-[#1D2025] hover:bg-gray-50",
      },
      size: {
        sm: "h-8 px-3 py-1 text-sm",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-8 text-lg",
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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
