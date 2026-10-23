import { useEffect, useMemo, useState } from "react";
import Wheel, { WheelItem } from "./Wheel";

const pad = (n: number) => String(n).padStart(2, "0");
const range = (items: string[]): WheelItem[] => items.map((v) => ({ label: v, value: v }));

const HOURS = range(Array.from({ length: 12 }, (_, i) => String(i + 1)));
const MINUTES = range(["00", "15", "30", "45"]);
const PERIODS = range(["AM", "PM"]);

/** Builds the next 60 days as wheel rows, e.g. { label: "Tomorrow", value: "2026-10-04" }. */
function buildDays(): WheelItem[] {
  return Array.from({ length: 60 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
    return { label, value };
  });
}

/** Reads a saved "YYYY-MM-DDTHH:MM" back into wheel values. Returns null if it is empty or odd. */
function parseInitial(v?: string) {
  const m = v?.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return null;
  const h24 = Number(m[2]);
  return { day: m[1], hour: String(h24 % 12 || 12), minute: m[3], period: h24 >= 12 ? "PM" : "AM" };
}

/** Four wheels (day, hour, minute, AM/PM). Reports the choice as "YYYY-MM-DDTHH:MM". */
export default function DateTimeWheel({ onChange, initial }: { onChange: (value: string) => void; initial?: string }) {
  const days = useMemo(buildDays, []);
  const saved = parseInitial(initial);
  const [day, setDay] = useState(saved && days.some((d) => d.value === saved.day) ? saved.day : days[1].value); // saved day, else tomorrow
  const [hour, setHour] = useState(saved?.hour ?? "9");
  const [minute, setMinute] = useState(saved?.minute ?? "00");
  const [period, setPeriod] = useState(saved?.period ?? "AM");

  // Convert the 12-hour wheels to a 24-hour value whenever any wheel changes.
  const value = `${day}T${pad((Number(hour) % 12) + (period === "PM" ? 12 : 0))}:${minute}`;
  useEffect(() => onChange(value), [value]);

  const summary = new Date(value).toLocaleString("en-CA", { dateStyle: "full", timeStyle: "short" });

  return (
    <div className="field">
      <p className="hint">Roll each wheel to choose your pickup day and time.</p>
      <div className="wheels">
        <Wheel label="Day" items={days} value={day} onChange={setDay} />
        <Wheel label="Hour" items={HOURS} value={hour} onChange={setHour} />
        <Wheel label="Minute" items={MINUTES} value={minute} onChange={setMinute} />
        <Wheel label="AM/PM" items={PERIODS} value={period} onChange={setPeriod} />
      </div>
      <p aria-live="polite"><strong>Pickup: {summary}</strong></p>
    </div>
  );
}