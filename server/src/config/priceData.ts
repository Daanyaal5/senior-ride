import fs from "fs";
import { fileURLToPath } from "url";

/**
 * Reads the price files in server/data/:
 *   areas.csv  - which postal codes and place names belong to each area
 *   prices.csv - trip prices between areas (* = any area)
 *   fees.csv   - hourly assistance rate, urgent fee, waiting fee
 * Each file is re-read automatically when it changes, so no restart is needed.
 * If a file has a mistake, the error is printed in the server terminal and the last good version keeps working.
 */

const dataFile = (name: string) => fileURLToPath(new URL(`../../data/${name}`, import.meta.url));

export interface Area { name: string; postalCodes: string[]; placeNames: string[]; }
export interface PriceRow { from: string; to: string; price: number; }
export interface Fees { assistancePerHour: number; assistanceMaxHours: number; urgentRide: number; waitingPer30Min: number; }

/**
 * Turns CSV text into rows of cells, each with its real line number in the file (for error messages).
 * Skips empty lines, lines starting with #, and the header line.
 */
function parseCsv(text: string): { cells: string[]; line: number }[] {
  const rows = text.split(/\r?\n/)
    .map((l, i) => ({ text: l.trim(), line: i + 1 }))
    .filter((r) => r.text && !r.text.startsWith("#"));
  return rows.slice(1).map((r) => ({ cells: r.text.split(",").map((cell) => cell.trim()), line: r.line }));
}

/** Reads a number cell, or explains which file and line is wrong. */
function toNumber(cell: string, where: string): number {
  const n = Number(cell);
  if (cell === "" || !Number.isFinite(n) || n < 0) throw new Error(`${where}: "${cell}" is not a valid amount`);
  return n;
}

function readAreas(text: string): Area[] {
  const areas = parseCsv(text).map(({ cells: [name, postal = "", places = ""], line }) => {
    if (!name) throw new Error(`areas.csv line ${line}: area name is missing`);
    return {
      name,
      postalCodes: postal.split(/\s+/).filter(Boolean).map((p) => p.toUpperCase()),
      placeNames: places.split("|").map((p) => p.trim().toLowerCase()).filter(Boolean),
    };
  });
  if (!areas.length) throw new Error("areas.csv has no areas");
  return areas;
}

function readPrices(text: string, areas: Area[]): PriceRow[] {
  const known = new Set(areas.map((a) => a.name.toLowerCase()));
  return parseCsv(text).map(({ cells: [from, to, price], line }) => {
    const where = `prices.csv line ${line}`;
    for (const side of [from, to]) {
      if (side !== "*" && !known.has(String(side).toLowerCase())) throw new Error(`${where}: "${side}" is not an area in areas.csv`);
    }
    return { from, to, price: toNumber(price, where) };
  });
}

function readFees(text: string): Fees {
  const map = new Map(parseCsv(text).map(({ cells: [key, amount], line }) => [key, toNumber(amount, `fees.csv line ${line}`)]));
  const get = (key: string) => {
    const v = map.get(key);
    if (v === undefined) throw new Error(`fees.csv: "${key}" is missing`);
    return v;
  };
  return {
    assistancePerHour: get("assistance_per_hour"),
    assistanceMaxHours: get("assistance_max_hours"),
    urgentRide: get("urgent_ride"),
    waitingPer30Min: get("waiting_per_30_min"),
  };
}

// The last good copy of everything, and when each file was last read.
let cache: { areas: Area[]; prices: PriceRow[]; fees: Fees } | null = null;
let stamp = "";

/** Returns the current areas, prices and fees, re-reading the files if any of them changed. */
export function getPriceData() {
  const files = ["areas.csv", "prices.csv", "fees.csv"].map(dataFile);
  const now = files.map((f) => fs.statSync(f).mtimeMs).join("|");
  if (cache && now === stamp) return cache;
  try {
    const [areasText, pricesText, feesText] = files.map((f) => fs.readFileSync(f, "utf8"));
    const areas = readAreas(areasText);
    cache = { areas, prices: readPrices(pricesText, areas), fees: readFees(feesText) };
    stamp = now;
    console.log("Price files loaded.");
  } catch (e) {
    console.error(`PRICE FILE PROBLEM: ${(e as Error).message}. ${cache ? "Still using the last good prices." : ""}`);
    if (!cache) throw e; // nothing good to fall back on
    stamp = now; // don't repeat the same error on every request
  }
  return cache;
}