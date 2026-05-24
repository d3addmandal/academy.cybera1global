"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost" | "white" | "dark";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  external?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none";

const variants = {
  primary:
    "bg-gradient-to-r from-red-600 to-red-800 text-white hover:from-red-500 hover:to-red-700 hover:shadow-[0_8px_20px_rgba(224,0,0,0.35)] hover:-translate-y-0.5",
  outline:
    "border-2 border-red-600 text-red-600 bg-transparent hover:bg-red-600 hover:text-white hover:shadow-[0_8px_20px_rgba(224,0,0,0.2)]",
  ghost:
    "bg-transparent text-white border border-white/30 hover:border-red-500 hover:text-red-400 hover:bg-red-500/10",
  white:
    "bg-white text-gray-900 hover:bg-gray-100 hover:shadow-lg hover:-translate-y-0.5",
  dark: "bg-[#0d1117] text-white border border-gray-700 hover:border-red-600 hover:text-red-400",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  className,
  type = "button",
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = "right",
  external = false,
}: ButtonProps) {
  const classes = cn(
    base,
    variants[variant],
    sizes[size],
    fullWidth ? "w-full" : "",
    className
  );

  const content = (
    <>
      {icon && iconPosition === "left" && icon}
      {children}
      {icon && iconPosition === "right" && icon}
    </>
  );

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  );
}
