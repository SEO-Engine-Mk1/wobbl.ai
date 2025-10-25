import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </Card>
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }