"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue"> {
  defaultValue?: number[]
  value?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      defaultValue,
      value,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      ...props
    },
    ref
  ) => {
    const currentValue = value ?? defaultValue ?? [0]

    return (
      <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <div
            className="absolute h-full bg-brand-500"
            style={{
              width: `${((currentValue[0] - min) / (max - min)) * 100}%`,
            }}
          />
        </div>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue[0]}
          onChange={(e) => {
            onValueChange?.([Number(e.target.value)])
          }}
          className="absolute h-full w-full cursor-pointer opacity-0"
          {...props}
        />
        <div
          className="absolute block h-5 w-5 rounded-full border-2 border-brand-500 bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          style={{
            left: `calc(${((currentValue[0] - min) / (max - min)) * 100}% - 10px)`,
          }}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
