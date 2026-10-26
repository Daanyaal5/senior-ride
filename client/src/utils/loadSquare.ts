let loading: Promise<any> | null = null;

/** Loads Square's card-form script once. Uses the test (sandbox) script unless VITE_SQUARE_ENV is "production". */
export function loadSquare(): Promise<any> {
  const w = window as any;
  if (w.Square) return Promise.resolve(w.Square);
  if (loading) return loading;

  const src = import.meta.env.VITE_SQUARE_ENV === "production"
    ? "https://web.squarecdn.com/v1/square.js"
    : "https://sandbox.web.squarecdn.com/v1/square.js";

  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve(w.Square);
    script.onerror = () => { loading = null; reject(new Error("The payment form could not load. Please refresh the page or call us.")); };
    document.head.appendChild(script);
  });
  return loading;
}