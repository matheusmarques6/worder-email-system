"use client"

import { Toaster as SonnerToaster } from "sonner"

type ToasterProps = React.ComponentProps<typeof SonnerToaster>

function Toaster(props: ToasterProps) {
  return <SonnerToaster richColors position="top-right" {...props} />
}

export { Toaster }
