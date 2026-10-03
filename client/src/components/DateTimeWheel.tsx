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

/** Four wheels (day, hour, minute, AM/PM). Reports the choice as "YYYY-MM-DDTHH:MM". */
export default function DateTimeWheel({ onChange }: { onChange: (value: string) => void }) {
  const days = useMemo(buildDays, []);
  const [day, setDay] = useState(days[1].value); // starts on tomorrow
  const [hour, setHour] = useState("9");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

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
        <Wheel label="AM / PM" items={PERIODS} value={period} onChange={setPeriod} />
      </div>
      <p aria-live="polite"><strong>Pickup: {summary}</strong></p>
    </div>
  );
}