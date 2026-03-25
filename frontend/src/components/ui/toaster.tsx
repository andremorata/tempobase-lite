"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      closeButton
      richColors
      position="top-right"
      theme={theme as ToasterProps["theme"]}
      {...props}
    />
  );
}