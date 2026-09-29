import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Confirmation from "./pages/Confirmation";

/** Maps each web address to a page. */
export default function App() {
  return (
    <>
      <a className="skip" href="#content">Skip to main content</a>
      <Header />
      <div id="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Booking />} />
          <Route path="/confirmation" element={<Confirmation />} />
        </Routes>
      </div>
    </>
  );
}
