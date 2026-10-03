import { useState } from "react";

interface Props { src: string; alt: string; hint: string; }

/**
 * Shows a photo from client/public/images/. If the file is not there yet,
 * a labelled placeholder box is shown instead, so the layout always looks right.
 */
export default function Photo({ src, alt, hint }: Props) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    return <div className="photo placeholder" role="img" aria-label={alt}><span>Photo goes here<br /><small>{hint}</small></span></div>;
  }
  return <img className="photo" src={src} alt={alt} loading="lazy" onError={() => setMissing(true)} />;
}