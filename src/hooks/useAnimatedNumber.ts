import { useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

export function useAnimatedNumber(value: number, duration: number = 2) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    animate(count, value, { duration, ease: "easeOut" });
  }, [value, count, duration]);

  return rounded;
}
