import { useEffect, useRef, useState } from "react";

/**
 * Hero background. A light poster image shows instantly, then the video starts.
 * Phones get a smaller video (hero-mobile), wider screens get the full one (hero).
 * The video is skipped if the visitor has "reduce motion" or "data saver" turned on.
 * Files in client/public/: images/hero-poster.webp, hero.webm, hero.mp4, hero-mobile.webm, hero-mobile.mp4
 */
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPoster, setShowPoster] = useState(true);
  const [file, setFile] = useState<"hero" | "hero-mobile" | null>(null); // which video to play, or none

  // Decide whether to play, and which size.
  useEffect(() => {
    const saveData = (navigator as any).connection?.saveData;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const videoOff = import.meta.env.VITE_HERO_VIDEO === "off"; // set in client/.env to skip the video entirely
    if (videoOff || saveData || reduceMotion) return; // poster only
    const isPhone = window.matchMedia("(max-width: 700px)").matches;
    const timer = window.setTimeout(() => setFile(isPhone ? "hero-mobile" : "hero"), 300); // let the text and poster appear first
    return () => window.clearTimeout(timer);
  }, []);

  // iPhones only autoplay videos that are muted, so set it directly and start playback ourselves.
  // If the phone still refuses (for example in Low Power Mode), the poster simply stays.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.play().catch(() => {});
  }, [file]);

  return (
    <>
      {showPoster && <img className="hero-video" src="/images/hero-poster.webp" alt="" aria-hidden="true" decoding="async" onError={() => setShowPoster(false)} />}
      {file && (
        <video ref={videoRef} key={file} className="hero-video" autoPlay muted loop playsInline preload="auto" aria-hidden="true"
          onPlaying={() => setShowPoster(false)}>
          <source src={`/${file}.webm`} type="video/webm" />
          <source src={`/${file}.mp4`} type="video/mp4" />
        </video>
      )}
    </>
  );
}