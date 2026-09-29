import { useEffect, useRef } from "react";
import { Place } from "../types";
import { loadGoogleMaps } from "../utils/loadGoogleMaps";

interface Props {
  id: string;
  label: string;
  hint?: string;
  onSelect: (place: Place | null) => void;
}

/** A text box with Google address suggestions. Reports the chosen address and coordinates. */
export default function PlacesInput({ id, label, hint, onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let listener: google.maps.MapsEventListener | undefined;
    loadGoogleMaps().then(() => {
      if (!inputRef.current) return;
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "ca" },
        fields: ["formatted_address", "geometry", "name"],
      });
      // Runs when the person picks a suggestion from the list.
      listener = autocomplete.addListener("place_changed", () => {
        const p = autocomplete.getPlace();
        if (!p.geometry?.location) return onSelect(null);
        onSelect({
          address: p.formatted_address ?? p.name ?? "",
          lat: p.geometry.location.lat(),
          lng: p.geometry.location.lng(),
        });
      });
    });
    return () => listener?.remove();
  }, []);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && <p className="hint" id={`${id}-hint`}>{hint}</p>}
      <input
        id={id}
        ref={inputRef}
        type="text"
        autoComplete="off"
        aria-describedby={hint ? `${id}-hint` : undefined}
        placeholder="Start typing an address or place name"
        // Typing again clears the old choice so a stale address is never submitted.
        onChange={() => onSelect(null)}
      />
    </div>
  );
}
