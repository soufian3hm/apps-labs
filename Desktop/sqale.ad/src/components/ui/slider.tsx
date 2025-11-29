import * as React from "react"
import { cn } from "lib/utils"

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: number
  onValueChange?: (value: number) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>((
  { className, value = 0, onChange, onValueChange, ...props },
  ref,
) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    onValueChange?.(newValue)
    onChange?.(e)
  }

  return (
    <input
      ref={ref}
      type="range"
      value={value}
      onChange={handleChange}
      className={cn(
        "w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black",
        className
      )}
      {...props}
    />
  )
})
Slider.displayName = "Slider"

export { Slider }
