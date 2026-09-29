import { useEffect, useState } from "react";

const SIZES = [100, 118, 136]; // page text size in percent

/** A−  A  A+ buttons plus a high-contrast switch. Choices are remembered between visits. */
export default function AccessibilityControls() {
  const [size, setSize] = useState(() => Number(localStorage.getItem("textSize")) || 100);
  const [contrast, setContrast] = useState(() => localStorage.getItem("contrast") === "on");

  // Apply the choices to the whole page whenever they change.
  useEffect(() => {
    document.documentElement.style.fontSize = `${size}%`;
    document.documentElement.dataset.contrast = contrast ? "high" : "normal";
    localStorage.setItem("textSize", String(size));
    localStorage.setItem("contrast", contrast ? "on" : "off");
  }, [size, contrast]);

  // Moves to the next smaller or larger size, staying inside the list.
  const step = (dir: number) => {
    const i = Math.min(SIZES.length - 1, Math.max(0, SIZES.indexOf(size) + dir));
    setSize(SIZES[i]);
  };

  return (
    <div className="a11y" role="group" aria-label="Display settings">
      <button type="button" onClick={() => step(-1)} aria-label="Smaller text">A−</button>
      <button type="button" onClick={() => setSize(100)} aria-label="Normal text">A</button>
      <button type="button" onClick={() => step(1)} aria-label="Larger text">A+</button>
      <button type="button" aria-pressed={contrast} onClick={() => setContrast(!contrast)}>High contrast</button>
    </div>
  );
}
