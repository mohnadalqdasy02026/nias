import { useEffect, useRef, useState } from 'react';

const reduceMotion = () =>
  typeof window !== 'undefined'
  && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

// Animates a numeric value from 0 up to its target once it mounts.
export default function CountUp({ value, duration = 1100 }) {
  const target = Number(value);
  const finite = Number.isFinite(target);
  const [display, setDisplay] = useState(() => (finite ? 0 : value));
  const rafRef = useRef(0);

  useEffect(() => {
    if (!finite || reduceMotion()) {
      setDisplay(value);
      return undefined;
    }
    let start;
    const step = (now) => {
      if (start === undefined) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(target * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, value, finite, duration]);

  return finite ? display : value;
}
