"use client";

import confetti from "canvas-confetti";

export function celebrate() {
  const duration = 1500;
  const end = Date.now() + duration;
  const colors = ["#f8b2b2", "#a96ba0", "#413d8f"];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 60,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 60,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export function burst() {
  confetti({
    particleCount: 90,
    spread: 100,
    origin: { y: 0.6 },
    colors: ["#f8b2b2", "#a96ba0", "#413d8f"],
  });
}
