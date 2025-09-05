/**
 * Canvas Confetti Type Declarations - Animation Library Types
 * 
 * TypeScript type definitions for the canvas-confetti library.
 * Used for celebration animations and visual feedback throughout the app.
 */
declare module 'canvas-confetti' {
  interface Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
  }
  type ConfettiFn = (opts?: Options) => Promise<null> | null;
  const confetti: ConfettiFn & { reset?: () => void };
  export default confetti;
}
