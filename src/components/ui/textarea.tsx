import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground flex min-h-24 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-[color,box-shadow,border-color,background-color] outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-senralis-main focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-senralis-main/20",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
