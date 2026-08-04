"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useRef,
  useState,
} from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onAnimationStart" | "onAnimationEnd" | "onDrag" | "onDragStart" | "onDragEnd"
>;

interface ButtonProps extends NativeButtonProps {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  magnetic?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "text-white shadow-lg shadow-[color-mix(in_srgb,var(--accent-2)_45%,transparent)] bg-[linear-gradient(120deg,var(--accent-1),var(--accent-2),var(--accent-3))] bg-[length:200%_auto] hover:bg-[position:100%_0]",
  secondary:
    "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent-2)]",
  ghost: "bg-transparent text-[var(--text)] hover:bg-[var(--surface-alt)]",
};

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}
let rippleSeq = 0;

export function Button({
  children,
  variant = "primary",
  href,
  magnetic = true,
  className,
  onClick,
  ...rest
}: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.2 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.2 });
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const baseClass = `relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-medium transition-[background-position,transform,border-color] duration-300 ease-out active:scale-[0.97] ${VARIANT_CLASSES[variant]} ${className ?? ""}`;

  function handleMouseMove(e: MouseEvent<HTMLButtonElement>) {
    if (!magnetic) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const id = rippleSeq++;
    setRipples((prev) => [
      ...prev,
      { id, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2, size },
    ]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 650);
    onClick?.(e);
  }

  const rippleNodes = ripples.map((r) => (
    <span
      key={r.id}
      aria-hidden
      className="pointer-events-none absolute rounded-full bg-white/40 animate-[ripple_0.65s_ease-out]"
      style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
    />
  ));

  if (href) {
    return (
      <motion.span style={{ x: springX, y: springY }} className="inline-block">
        <Link
          href={href}
          className={baseClass}
          onMouseMove={handleMouseMove as unknown as (e: MouseEvent<HTMLAnchorElement>) => void}
          onMouseLeave={handleMouseLeave}
        >
          {children}
        </Link>
      </motion.span>
    );
  }

  return (
    <motion.button
      ref={ref}
      className={baseClass}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      whileTap={{ scale: 0.96 }}
      {...rest}
    >
      {children}
      {rippleNodes}
    </motion.button>
  );
}
