import { useEffect, useState } from "react";

const LEVELS = [100, 115, 130, 150]; // page text size in percent. Bigger steps so the change is obvious.

/** A−  A  A+ buttons plus a high-contrast switch. Choices are remembered between visits. */
export default function AccessibilityControls() {
  // Read the saved level, ignoring anything invalid so the buttons can never get stuck.
  const [level, setLevel] = useState(() => {
    const saved = Number(localStorage.getItem("textLevel"));
    return Number.isInteger(saved) && saved >= 0 && saved < LEVELS.length ? saved : 0;
  });
  const [contrast, setContrast] = useState(() => localStorage.getItem("contrast") === "on");

  // Apply the choices to the whole page whenever they change.
  useEffect(() => {
    document.documentElement.style.fontSize = `${LEVELS[level]}%`;
    document.documentElement.dataset.contrast = contrast ? "high" : "normal";
    localStorage.setItem("textLevel", String(level));
    localStorage.setItem("contrast", contrast ? "on" : "off");
  }, [level, contrast]);

  return (
    <div className="a11y" role="group" aria-label="Display settings">
      <button type="button" disabled={level === 0} onClick={() => setLevel(level - 1)} aria-label="Smaller text">A−</button>
      <button type="button" onClick={() => setLevel(0)} aria-label="Reset text size">A</button>
      <button type="button" disabled={level === LEVELS.length - 1} onClick={() => setLevel(level + 1)} aria-label="Larger text">A+</button>
      <span className="a11y-size" aria-live="polite">Text {LEVELS[level]}%</span>
      <button type="button" aria-pressed={contrast} onClick={() => setContrast(!contrast)}>High contrast</button>
    </div>
  );
}