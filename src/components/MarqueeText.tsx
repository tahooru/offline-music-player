"use client";

import React, { useRef, useState, useEffect } from "react";

interface MarqueeTextProps {
  children: React.ReactNode;
  className?: string;
}

export function MarqueeText({ children, className = "" }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [children]);

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden flex whitespace-nowrap ${isOverflowing ? '[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]' : ''} ${className}`}
    >
      <div className={isOverflowing ? "animate-marquee flex min-w-full w-max" : "flex min-w-full truncate"}>
        <span ref={textRef} className={isOverflowing ? "pr-12" : "truncate"}>
          {children}
        </span>
        {isOverflowing && (
           <span className="pr-12" aria-hidden="true">{children}</span>
        )}
      </div>
    </div>
  );
}
