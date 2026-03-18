import { useEffect, useState } from "react";
import { Colors } from "../../ui/tokens";

export function useAdaptiveDark() {
  const getTheme = () => {
    const hour = new Date().getHours();
    const isDaytime = hour >= 6 && hour < 18;
    return {
      bgBase: isDaytime ? Colors.bgElevated : Colors.bgBase,
      isDaytime,
    };
  };

  const [theme, setTheme] = useState(getTheme);

  useEffect(() => {
    const interval = setInterval(
      () => {
        setTheme(getTheme());
      },
      60 * 60 * 1000,
    ); // Update every hour
    return () => clearInterval(interval);
  }, []);

  return theme;
}
