import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { Place } from "../types";
import { loadGoogleMaps } from "../utils/loadGoogleMaps";
import { SERVICE_AREA_TEXT, SERVICE_BOUNDS } from "../utils/serviceArea";

interface Props {
  id: string;
  label: string;
  hint?: string;
  initialValue?: string; // address to show when the form is restored
  quickPick?: { label: string; place: Place }; // a one-tap button under the box, e.g. "Airport"
  onSelect: (place: Place | null) => void;
}

const FIELDS = ["formatted_address", "geometry", "name"];

/** Turns a Google result into our simple { address, lat, lng } shape. */
function toPlace(p: google.maps.places.PlaceResult | null): Place | null {
  if (!p?.geometry?.location) return null;
  return { address: p.formatted_address ?? p.name ?? "", lat: p.geometry.location.lat(), lng: p.geometry.location.lng() };
}

/**
 * Finds the best match for an address the person typed without picking a suggestion.
 * Uses the first suggestion inside the service area, then looks up its full address.
 */
async function resolveTyped(text: string): Promise<Place | null> {
  try {
    const { predictions } = await new google.maps.places.AutocompleteService().getPlacePredictions({
      input: text,
      componentRestrictions: { country: "ca" },
      locationRestriction: SERVICE_BOUNDS,
    });
    if (!predictions?.length) return null;
    return await new Promise((resolve) =>
      new google.maps.places.PlacesService(document.createElement("div")).getDetails(
        { placeId: predictions[0].place_id, fields: FIELDS },
        (result, status) => resolve(status === google.maps.places.PlacesServiceStatus.OK ? toPlace(result) : null)
      )
    );
  } catch {
    return null; // Google answers "no results" with an error
  }
}

/**
 * Address box with Google suggestions limited to the service area.
 * Picking a suggestion works, and so does typing the full address and moving on.
 */
export default function PlacesInput({ id, label, hint, initialValue, quickPick, onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const chosen = useRef(!!initialValue); // true once an address has been confirmed
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  // Shows the confirmed address in the box and tells the form about it.
  function accept(place: Place) {
    chosen.current = true;
    if (inputRef.current) inputRef.current.value = place.address;
    setStatus({ ok: true, text: `Address confirmed: ${place.address}` });
    onSelect(place);
  }

  useEffect(() => {
    let listener: google.maps.MapsEventListener | undefined;
    loadGoogleMaps().then(() => {
      if (!inputRef.current) return;
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "ca" },
        bounds: SERVICE_BOUNDS,
        strictBounds: true, // only suggest places inside the service area
        fields: FIELDS,
      });
      // Runs when the person picks a suggestion (or presses Enter in the box).
      listener = autocomplete.addListener("place_changed", () => {
        const place = toPlace(autocomplete.getPlace());
        if (place) accept(place);
        else checkTyped(); // Enter without a suggestion: look up what they typed
      });
    });
    return () => listener?.remove();
  }, []);

  // Looks up a typed address that was not picked from the list.
  async function checkTyped() {
    const text = inputRef.current?.value.trim() ?? "";
    if (!text || chosen.current) return;
    setStatus({ ok: true, text: "Checking the address..." });
    await loadGoogleMaps();
    const place = await resolveTyped(text);
    if (chosen.current) return; // a suggestion was picked meanwhile
    if (place) accept(place);
    else setStatus({ ok: false, text: `We couldn't find that address in ${SERVICE_AREA_TEXT}. Check the spelling, add the postal code, or pick from the list.` });
  }

  // Clicking a suggestion also blurs the box, so wait a moment to let the click win.
  const handleBlur = () => window.setTimeout(checkTyped, 300);

  // Enter should check the address, not submit the whole form.
  const handleKey = (e: KeyboardEvent) => { if (e.key === "Enter") e.preventDefault(); };

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && <p className="hint" id={`${id}-hint`}>{hint}</p>}
      <input
        id={id}
        defaultValue={initialValue}
        ref={inputRef}
        type="text"
        autoComplete="off"
        aria-describedby={`${hint ? `${id}-hint ` : ""}${id}-status`}
        placeholder={`An address in ${SERVICE_AREA_TEXT}`}
        // Typing again clears the old choice so a stale address is never submitted.
        onChange={() => { chosen.current = false; setStatus(null); onSelect(null); }}
        onBlur={handleBlur}
        onKeyDown={handleKey}
      />
      {quickPick && (
        <button type="button" className="quick-pick" onClick={() => accept(quickPick.place)}>{quickPick.label}</button>
      )}
      <p id={`${id}-status`} className={status && !status.ok ? "error" : "hint"} aria-live="polite">{status?.text}</p>
    </div>
  );
}