"use client"

import { useState, useCallback } from "react"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

let toastListeners: Array<(toast: Toast) => void> = []
let toastCount = 0

export function toast(props: Omit<Toast, "id">) {
  const id = String(toastCount++)
  const newToast = { ...props, id }
  toastListeners.forEach((listener) => listener(newToast))
  return id
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((t: Toast) => {
    setToasts((prev) => [...prev, t])
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== t.id))
    }, 4000)
  }, [])

  const subscribe = useCallback(() => {
    toastListeners.push(addToast)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== addToast)
    }
  }, [addToast])

  return {
    toasts,
    toast: (props: Omit<Toast, "id">) => toast(props),
    subscribe,
    dismiss: (id: string) =>
      setToasts((prev) => prev.filter((t) => t.id !== id)),
  }
}
