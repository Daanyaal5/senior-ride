import { MouseEvent, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/** Smoothly scrolls to the price section on the home page (instantly if the visitor prefers less motion). */
export function scrollToPrices() {
  const section = document.getElementById("prices");
  if (!section) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}

/**
 * A "Prices" link that never reloads the page.
 * - On the home page: scrolls down to the prices.
 * - On any other page: goes to the home page, which then scrolls to the prices (see Home.tsx).
 * onClick runs first, e.g. to close the phone menu.
 */
export default function PricesLink({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();       // stop the browser's full page reload
    onClick?.();
    if (pathname === "/") {
      window.history.replaceState(null, "", "/#prices");
      window.setTimeout(scrollToPrices, 60); // a moment for the phone menu to close and unlock scrolling
    } else {
      navigate("/#prices");
    }
  };

  return <a href="/#prices" className={className} onClick={go}>{children}</a>;
}