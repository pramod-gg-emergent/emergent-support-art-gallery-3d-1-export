import { useEffect, useState } from "react";
import axios from "axios";
import Lenis from "lenis";
import "@/App.css";
import Nav from "@/components/portfolio/Nav";
import Hero from "@/components/portfolio/Hero";
import Marquee from "@/components/portfolio/Marquee";
import Gallery from "@/components/portfolio/Gallery";
import Manifesto from "@/components/portfolio/Manifesto";
import About from "@/components/portfolio/About";
import Footer from "@/components/portfolio/Footer";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function App() {
  const [artworks, setArtworks] = useState([]);

  useEffect(() => {
    document.title = "KAI VOSS — 3D Game Artist";
    const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 1 });
    window.__lenis = lenis;
    let frame;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  useEffect(() => {
    axios
      .get(`${API}/artworks`)
      .then((res) => setArtworks(res.data))
      .catch((e) => console.error("failed to load artworks", e));
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white" data-testid="portfolio-app">
      <div className="noise-overlay" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Gallery artworks={artworks} />
        <Manifesto />
        <About />
      </main>
      <Footer />
    </div>
  );
}
