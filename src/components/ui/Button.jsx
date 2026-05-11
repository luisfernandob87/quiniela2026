import * as React from "react"
import { cn } from "../../utils/cn"

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
        {
          "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-500 hover:to-green-600 shadow-md hover:shadow-lg hover:scale-[1.02]": variant === "default",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
          "border border-input bg-background/80 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground hover:shadow-md": variant === "outline",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
          "underline-offset-4 hover:underline text-foreground/70 hover:text-foreground": variant === "ghost",
          "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-400 hover:to-yellow-500 shadow-md hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-[1.02]": variant === "gold",
        },
        {
          "h-10 px-4 py-2": size === "default",
          "h-9 rounded-md px-3": size === "sm",
          "h-11 rounded-md px-8 text-base": size === "lg",
          "h-12 rounded-lg px-10 text-lg font-bold": size === "xl",
        },
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
