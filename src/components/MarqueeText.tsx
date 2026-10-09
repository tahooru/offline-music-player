"use client";

import React, { useRef, useEffect, useState } from "react";

interface MarqueeTextProps {
  text: string;
  className?: string;
}

export function MarqueeText({ text, className = "" }: MarqueeTextProps) {
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
  }, [text]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden flex whitespace-nowrap ${className}`}>
      <div className={`${isOverflowing ? "animate-marquee" : ""}`}>
        <span ref={textRef} className="mr-8">{text}</span>
      </div>
      {isOverflowing && (
        <div className="absolute top-0 animate-marquee2 whitespace-nowrap" aria-hidden="true">
          <span className="mr-8">{text}</span>
        </div>
      )}
    </div>
  );
}
