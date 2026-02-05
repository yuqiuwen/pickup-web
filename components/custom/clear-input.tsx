import * as React from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ClearableInputProps = Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> & {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
}

export function ClearableInput({
  value,
  onChange,
  onClear,
  className,
  ...props
}: ClearableInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const show = value.length > 0

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("pr-9", className)}
        {...props}
      />

      {show && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={() => {
            onChange("")
            onClear?.()
            inputRef.current?.focus()
          }}
          aria-label="清除输入"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}