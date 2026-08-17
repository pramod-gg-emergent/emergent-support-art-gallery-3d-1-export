import { useEffect, useState } from "react";
import axios from "axios";
import Lenis from "lenis";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import Nav from "@/components/portfolio/Nav";
import Hero from "@/components/portfolio/Hero";
import Marquee from "@/components/portfolio/Marquee";
import Gallery from "@/components/portfolio/Gallery";
import Manifesto from "@/components/portfolio/Manifesto";
import About from "@/components/portfolio/About";
import Footer from "@/components/portfolio/Footer";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function Portfolio() {
  const [artworks, setArtworks] = useState([]);

  useEffect(() => {
    document.title = "AMAN DEEP — 3D Game Artist";
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
