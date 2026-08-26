"use client";

import type { CSSProperties, ReactNode } from "react";
import type { Theme } from "@/lib/themes/types";
import styles from "./ThemeProvider.module.css";

interface ThemeProviderProps {
  theme: Theme;
  children: ReactNode;
}

export default function ThemeProvider({ theme, children }: ThemeProviderProps) {
  return (
    <div className={styles.wrapper} style={theme.vars as CSSProperties}>
      {children}
    </div>
  );
}
