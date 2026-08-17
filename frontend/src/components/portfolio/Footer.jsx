import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const SOCIALS = [
  { label: "ArtStation", href: "https://www.artstation.com/ad0021", testId: "social-artstation" },
  { label: "Instagram", href: "https://instagram.com/ad_mehta21", testId: "social-instagram" },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-white/10 bg-black px-6 pb-10 pt-24 md:px-12 md:pt-36"
      data-testid="footer-section"
    >
      <p className="font-code mb-6 text-[11px] uppercase tracking-[0.35em] text-[#00F0FF]">
        04 — Contact
      </p>
      <motion.h2
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-[13vw] font-black leading-[0.9] tracking-tighter text-stroke transition-colors duration-500 hover:text-white md:text-[10vw]"
      >
        LET'S TALK
      </motion.h2>

      <div className="mt-16 flex flex-col justify-between gap-10 border-t border-white/10 pt-10 md:flex-row md:items-center">
        <a
          href="mailto:deep.escape21@gmail.com"
          className="group font-code flex items-center gap-3 text-lg text-white transition-colors duration-300 hover:text-[#00F0FF] md:text-2xl"
          data-testid="footer-email-link"
        >
          deep.escape21@gmail.com
          <ArrowUpRight
            size={22}
            className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
          />
        </a>
        <div className="flex flex-wrap gap-8">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-code text-[11px] uppercase tracking-[0.25em] text-white/50 transition-colors duration-300 hover:text-[#00F0FF]"
              data-testid={s.testId}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-16 flex flex-col justify-between gap-4 md:flex-row">
        <p className="font-code text-[10px] uppercase tracking-[0.25em] text-white/30">
          © 2026 Aman Deep — All renders are personal work
        </p>
        <div className="flex items-center gap-8">
          <p className="font-code text-[10px] uppercase tracking-[0.25em] text-white/30">
            Built with polygons & caffeine
          </p>
          <a
            href="/admin"
            className="font-code text-[10px] uppercase tracking-[0.25em] text-white/30 transition-colors duration-300 hover:text-[#00F0FF]"
            data-testid="footer-studio-link"
          >
            Studio
          </a>
        </div>
      </div>
    </footer>
  );
}
