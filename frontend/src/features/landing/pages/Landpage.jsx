import { useState, useEffect } from "react";
import Navbar from "../component/Navbar";
import HeroSection from "../component/HeroSection";
import StepsSection from "../component/StepsSection";
import FeatureHighlights from "../component/FeatureHighlights";
import StatsSection from "../component/StatsSection";
import CTASection from "../component/CTASection";
import Footer from "../component/Footer";
import "../landing.css";

export const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

   // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onMouse = (e) =>
      setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <div className="landing-page">
      <Navbar scrollY={scrollY} />
      <HeroSection mouse={mouse} />
      <StepsSection />
      <FeatureHighlights />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
};
