import { motion } from "framer-motion";

const LINKS = [
  { label: "Work", target: "#work", testId: "nav-link-work" },
  { label: "Manifesto", target: "#manifesto", testId: "nav-link-manifesto" },
  { label: "About", target: "#about", testId: "nav-link-about" },
  { label: "Contact", target: "#contact", testId: "nav-link-contact" },
];

export default function Nav() {
  const scrollTo = (target) => {
    if (window.__lenis) {
      window.__lenis.scrollTo(target, { duration: 1.6 });
    }
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 2.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl"
      data-testid="site-nav"
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 md:px-12">
        <button
          onClick={() => scrollTo(0)}
          className="flex items-baseline gap-2"
          data-testid="nav-logo"
        >
          <span className="font-display text-lg font-extrabold tracking-tight">
            AD<span className="text-[#00F0FF]">.</span>
          </span>
          <span className="font-code hidden text-[10px] uppercase tracking-[0.3em] text-white/50 sm:block">
            Aman Deep
          </span>
        </button>
        <nav className="flex items-center gap-6 md:gap-10">
          {LINKS.map((link) => (
            <button
              key={link.target}
              onClick={() => scrollTo(link.target)}
              className="font-code text-[11px] uppercase tracking-[0.25em] text-white/60 transition-colors duration-300 hover:text-[#00F0FF]"
              data-testid={link.testId}
            >
              {link.label}
            </button>
          ))}
          <a
            href="mailto:deep.escape21@gmail.com"
            className="font-code hidden border border-[#00F0FF]/60 px-5 py-2 text-[11px] uppercase tracking-[0.25em] text-[#00F0FF] transition-colors duration-300 hover:bg-[#00F0FF] hover:text-black md:block"
            data-testid="nav-hire-button"
          >
            Hire Me
          </a>
        </nav>
      </div>
    </motion.header>
  );
}
