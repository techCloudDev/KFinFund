import { useState, useEffect, useRef } from "react";

/**
 * Custom hook that returns [ref, inView] where inView becomes true
 * once the element enters the viewport (one-shot — stays true after first intersection).
 */
export function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return [ref, inView];
}
