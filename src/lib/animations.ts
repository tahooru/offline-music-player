// src/lib/animations.ts
import { Variants, Transition } from "framer-motion";

/**
 * Standardized Animation System for Offline Music Player
 * Adhering strictly to defined durations and transition curves.
 */

// 1. Durations (in seconds for Framer Motion)
export const durations = {
  fast: 0.15,       // 150ms: Progress thumb
  button: 0.15,     // 120-180ms: Button press, Play button
  icon: 0.2,        // 180-220ms: Icon transitions
  normal: 0.3,      // 250-350ms: Heart like, lyrics active, bottom nav
  sheet: 0.4,       // 350-500ms: Bottom sheet, page enter/exit
  slow: 0.5,        // 400-600ms: Mini player expand/collapse, crossfade
  crossfade: 0.6,   // 500-700ms: Album crossfade, Track change
  background: 1.0,  // 700-1200ms: Background transitions
  float: 4.5        // 4-5s: Album floating
};

// 2. Easing Curves
export const easings = {
  standard: "easeInOut", // Smooth, natural
  spring: { type: "spring", stiffness: 300, damping: 25 },
  bouncy: { type: "spring", stiffness: 400, damping: 15 },
};

// 3. Reusable Transitions
export const transitions = {
  standard: { duration: durations.normal, ease: easings.standard },
  fast: { duration: durations.fast, ease: easings.standard },
  slow: { duration: durations.slow, ease: easings.standard },
  spring: easings.spring,
  bouncy: easings.bouncy,
};

// 4. Framer Motion Variants

// Button Press (120-180ms, scale: 1 -> 0.94 -> 1)
export const buttonPressVariants = {
  initial: { scale: 1 },
  tap: { scale: 0.94, transition: { duration: durations.button } },
};

// Heart Like (250-350ms, pop to 1.25)
export const heartLikeVariants = {
  initial: { scale: 1 },
  tap: { scale: 1.25, transition: { duration: durations.normal } },
  liked: { scale: [1, 1.25, 1], transition: { duration: durations.normal } }
};

// Album Hover/Tap (180-250ms, scale: 1 -> 1.03)
export const albumHoverVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.03, transition: { duration: durations.icon } },
  tap: { scale: 0.98, transition: { duration: durations.fast } }
};

// Album Floating (4-5s, translateY: 0 -> -4px -> 0)
export const albumFloatVariants: Variants = {
  initial: { y: 0 },
  animate: { 
    y: [0, -4, 0], 
    transition: { 
      duration: durations.float, 
      repeat: Infinity, 
      ease: "easeInOut" 
    } 
  }
};

// Page Enter/Exit (opacity + y + scale)
export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 15, scale: 0.98 },
  enter: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: easings.standard } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25, ease: easings.standard } }
};

// Bottom Sheet (y: 100% -> 0)
export const bottomSheetVariants: Variants = {
  hidden: { y: "100%" },
  visible: { 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 30, mass: 0.8 } 
  },
  exit: { 
    y: "100%", 
    transition: { duration: 0.3, ease: easings.standard } 
  }
};

// Modal (Confirmations - scale 0.96 -> 1)
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: easings.standard } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2, ease: easings.standard } }
};

// Toast (Slides in/out)
export const toastVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, type: "spring", stiffness: 300, damping: 25 } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.25 } }
};

// Search Expand (width + opacity)
export const searchExpandVariants: Variants = {
  collapsed: { width: "40px", opacity: 0.6 },
  expanded: { width: "100%", opacity: 1, transition: { duration: 0.3, ease: easings.standard } }
};

// Staggered Children (Search Results, Lists)
export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

// Lyrics Reveal
export const lyricsVariants: Variants = {
  inactive: { opacity: 0.4, y: 5, scale: 0.95 },
  active: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } }
};

// Track Change (Artwork + title crossfade)
export const trackChangeVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: durations.crossfade } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.4 } }
};

// Audio Visualizer Bar
export const visualizerBarVariants: Variants = {
  initial: { height: 4 },
  playing: () => ({
    height: [4, Math.random() * 24 + 10, 4],
    transition: { 
      duration: Math.random() * 0.3 + 0.4, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }
  }),
  paused: { height: 4, transition: { duration: 0.3 } }
};
