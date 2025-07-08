"use client";

import { useState, useEffect } from "react";

interface ShimmerTextProps {
  text: string;
  className?: string;
  textColor?: string;
}

export default function ShimmerText({
  text,
  className = "",
  textColor = "#171717",
}: ShimmerTextProps) {
  const [shimmerIndex, setShimmerIndex] = useState(-1);
  const [colorOffset, setColorOffset] = useState(0);

  // Gradient color combinations for the shimmer effect
  const shimmerGradients = [
    "linear-gradient(135deg, #a7f3d0, #fbbf24, #f3e8ff)",
    "linear-gradient(135deg, #fce7f3, #a7f3d0, #bfdbfe)",
    "linear-gradient(135deg, #ddd6fe, #fce7f3, #fed7aa)",
    "linear-gradient(135deg, #bfdbfe, #ddd6fe, #a7f3d0)",
    "linear-gradient(135deg, #fed7aa, #fce7f3, #ddd6fe)",
    "linear-gradient(135deg, #f3e8ff, #bfdbfe, #fed7aa)",
    "linear-gradient(135deg, #a7f3d0, #f3e8ff, #fce7f3)",
    "linear-gradient(135deg, #fbbf24, #ddd6fe, #bfdbfe)",
  ];

  const letters = text.split("");

  // Get gradient for each letter based on current offset
  const getLetterGradient = (letterIndex: number) => {
    return shimmerGradients[
      (colorOffset + letterIndex) % shimmerGradients.length
    ];
  };

  useEffect(() => {
    let animationTimeout: ReturnType<typeof setTimeout>;
    let cycleInterval: ReturnType<typeof setInterval>;

    const runShimmerAnimation = () => {
      let currentIndex = 0;

      const shimmerEachLetter = () => {
        if (currentIndex < letters.length) {
          setShimmerIndex(currentIndex);
          currentIndex++;
          animationTimeout = setTimeout(shimmerEachLetter, 240);
        } else {
          // All letters shimmered, now fade back
          animationTimeout = setTimeout(() => {
            setShimmerIndex(-1);
            // Change color offset for next cycle to get different color combinations
            setColorOffset((prev) => (prev + 2) % shimmerGradients.length);
          }, 160);
        }
      };

      shimmerEachLetter();
    };

    // Start first animation after 2 seconds
    animationTimeout = setTimeout(() => {
      runShimmerAnimation();
      // Repeat every 4 seconds
      cycleInterval = setInterval(runShimmerAnimation, 4000);
    }, 2000);

    return () => {
      clearTimeout(animationTimeout);
      clearInterval(cycleInterval);
    };
  }, [letters.length, shimmerGradients.length]);

  return (
    <span className={`inline-block ${className}`}>
      {letters.map((letter, index) => (
        <span
          key={`${letter}-${index}-${colorOffset}`}
          className={`inline-block transition-all duration-300 ease-out ${
            shimmerIndex === index ? "animate-pulse" : ""
          }`}
          style={{
            background:
              shimmerIndex === index ? getLetterGradient(index) : "transparent",
            backgroundClip: shimmerIndex === index ? "text" : "unset",
            WebkitBackgroundClip: shimmerIndex === index ? "text" : "unset",
            color: shimmerIndex === index ? "transparent" : textColor,
            textShadow:
              shimmerIndex === index
                ? "0 0 8px rgba(167, 139, 250, 0.3), 0 0 16px rgba(236, 72, 153, 0.2)"
                : "none",
            filter:
              shimmerIndex === index
                ? "brightness(1.1) saturate(1.2)"
                : "brightness(1)",
            transform: shimmerIndex === index ? "scale(1.02)" : "scale(1)",
          }}
        >
          {letter}
        </span>
      ))}
    </span>
  );
}
