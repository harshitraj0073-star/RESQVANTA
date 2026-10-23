"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

export interface ShinyButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
  variant?: "cyan" | "red" | "slate" | "emerald" | "ghost";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

const VARIANT_STYLES: Record<string, string> = {
  cyan: "bg-gradient-to-r from-cyan-600/30 via-cyan-500/25 to-blue-600/30 text-cyan-100 hover:text-white border-transparent hover:shadow-[0_0_28px_rgba(6,182,212,0.45)]",
  red: "bg-gradient-to-r from-rose-600/35 via-rose-500/30 to-red-600/35 text-white border-transparent hover:shadow-[0_0_30px_rgba(244,63,94,0.5)]",
  slate: "bg-slate-900/50 dark:bg-slate-900/70 text-slate-200 hover:text-white border-transparent hover:bg-slate-800/60 hover:shadow-[0_0_24px_rgba(255,255,255,0.08)]",
  emerald: "bg-gradient-to-r from-emerald-600/30 via-emerald-500/25 to-teal-600/30 text-emerald-100 hover:text-white border-transparent hover:shadow-[0_0_28px_rgba(16,185,129,0.45)]",
  ghost: "bg-transparent text-slate-300 border-transparent hover:bg-white/10 hover:text-white",
};

const SIZE_STYLES: Record<string, string> = {
  sm: "px-3.5 py-1.5 text-xs font-semibold rounded-full",
  md: "px-5 py-2.5 text-xs font-bold tracking-wider uppercase rounded-2xl",
  lg: "px-7 py-3.5 text-xs sm:text-sm font-extrabold tracking-wider uppercase rounded-2xl",
};

export const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  (
    {
      children,
      className,
      variant = "cyan",
      size = "md",
      glow = true,
      href,
      target,
      rel,
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      "relative inline-flex items-center justify-center gap-2 overflow-hidden backdrop-blur-2xl border border-transparent select-none cursor-pointer transition-all duration-300 font-sans",
      VARIANT_STYLES[variant] || VARIANT_STYLES.cyan,
      SIZE_STYLES[size] || SIZE_STYLES.md,
      disabled && "opacity-50 cursor-not-allowed pointer-events-none",
      className
    );

    const innerContent = (
      <>
        {/* Shimmer sweep gradient overlay (Ali Imam 21st.dev effect) */}
        <span
          aria-hidden="true"
          className="absolute inset-0 w-[200%] h-full -translate-x-full animate-[shimmer_2.8s_infinite] pointer-events-none bg-gradient-to-r from-transparent via-white/30 dark:via-white/25 to-transparent"
        />

        {/* Specular top sheen */}
        <span
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none rounded-[inherit] bg-gradient-to-b from-white/15 to-transparent opacity-60"
        />

        {/* Ambient radial center glow */}
        {glow && (
          <span
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3),transparent_70%)]"
          />
        )}

        {/* Inner button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </>
    );

    if (href) {
      return (
        <motion.a
          href={href}
          target={target}
          rel={rel}
          whileHover={{ scale: 1.025, y: -1 }}
          whileTap={{ scale: 0.97, y: 1 }}
          transition={{ type: "spring", stiffness: 450, damping: 25 }}
          className={baseClasses}
        >
          {innerContent}
        </motion.a>
      );
    }

    return (
      <motion.button
        ref={ref}
        whileHover={disabled ? undefined : { scale: 1.025, y: -1 }}
        whileTap={disabled ? undefined : { scale: 0.97, y: 1 }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        onClick={onClick}
        disabled={disabled}
        className={baseClasses}
        {...props}
      >
        {innerContent}
      </motion.button>
    );
  }
);

ShinyButton.displayName = "ShinyButton";
export default ShinyButton;
