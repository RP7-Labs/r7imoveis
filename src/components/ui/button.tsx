import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petrol-500 disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "bg-petrol-500 text-white hover:bg-petrol-600 active:bg-petrol-700",
  champagne:
    "bg-champagne-300 text-petrol-900 hover:bg-champagne-400 active:bg-champagne-500",
  outline:
    "border border-petrol-500/30 text-petrol-600 hover:border-petrol-500 hover:bg-petrol-50",
  ghost: "text-petrol-600 hover:bg-petrol-50",
  whatsapp: "bg-[#0e7a3f] text-white hover:bg-[#0b6a36] active:bg-[#095c2e]",
  danger: "bg-red-600 text-white hover:bg-red-700",
} as const;

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}
