"use client";

import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";
import type React from "react";

const Toaster = ({ ...props }: ToasterProps) => {
  const darkModeActive =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const resolvedTheme = (darkModeActive ? "dark" : "light") as ToasterProps["theme"];

  return (
    <Sonner
      theme={props.theme ?? resolvedTheme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
