import { KeyboardEvent, useEffect, useRef } from "react";

const ROW = 48; // height of one row in px. Must match .wheel-row and .wheel-pad in styles.css

export interface WheelItem { label: string; value: string; }
interface Props { label: string; items: WheelItem[]; value: string; onChange: (value: string) => void; }

/** One rolling wheel. Scroll, drag, tap a row, or use the up/down arrow keys. */
export default function Wheel({ label, items, value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<number>();
  const index = Math.max(0, items.findIndex((i) => i.value === value));

  // Keep the scroll position in step with the selected value (also runs on first load).
  useEffect(() => { ref.current?.scrollTo({ top: index * ROW, behavior: "smooth" }); }, [index]);

  // Once scrolling stops, work out which row is in the middle and select it.
  function handleScroll() {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const i = Math.min(items.length - 1, Math.max(0, Math.round(ref.current!.scrollTop / ROW)));
      if (items[i].value !== value) onChange(items[i].value);
    }, 120);
  }

  // Arrow keys move one row up or down.
  function handleKey(e: KeyboardEvent) {
    const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    onChange(items[Math.min(items.length - 1, Math.max(0, index + step))].value);
  }

  return (
    <div className="wheel-wrap">
      <span className="wheel-label">{label}</span>
      <div className="wheel-box">
        <div className="wheel" ref={ref} role="listbox" tabIndex={0} aria-label={label} onScroll={handleScroll} onKeyDown={handleKey}>
          <div className="wheel-pad" />
          {items.map((i) => (
            <div key={i.value} role="option" aria-selected={i.value === value} className="wheel-row" onClick={() => onChange(i.value)}>{i.label}</div>
          ))}
          <div className="wheel-pad" />
        </div>
      </div>
    </div>
  );
}