import { useEffect, useState } from "react";

// Re-renders the component every `ms` milliseconds, and whenever another
// tab changes localStorage. Admin pages use it to stay live.
export default function usePoll(ms = 4000) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    const id = setInterval(bump, ms);
    window.addEventListener("storage", bump);
    return () => {
      clearInterval(id);
      window.removeEventListener("storage", bump);
    };
  }, [ms]);
}
