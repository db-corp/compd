"use client";

import { useEffect, useRef, useState } from "react";

type Animation = "fade-in-up" | "fade-in-left" | "fade-in-right" | "scale-in";

export default function ScrollReveal({
  children,
  animation = "fade-in-up",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  animation?: Animation;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        animationName: visible ? animation : undefined,
        animationDuration: visible ? "0.6s" : undefined,
        animationTimingFunction: visible ? "ease-out" : undefined,
        animationDelay: visible ? `${delay}ms` : undefined,
        animationFillMode: visible ? "both" : undefined,
      }}
    >
      {children}
    </div>
  );
}
