"use client";

import Tilt from "react-parallax-tilt";
import type { ReactNode } from "react";

export function TiltCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Tilt
      className={className}
      tiltMaxAngleX={8}
      tiltMaxAngleY={8}
      perspective={1000}
      scale={1.02}
      transitionSpeed={1200}
      glareEnable
      glareMaxOpacity={0.12}
      glareColor="#ffffff"
      glarePosition="all"
      glareBorderRadius="inherit"
    >
      {children}
    </Tilt>
  );
}
