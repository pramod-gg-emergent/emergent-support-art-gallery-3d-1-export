import { motion } from "framer-motion";

const CHAPTERS = [
  {
    num: "01",
    title: "SILHOUETTE FIRST",
    body: "If it doesn't read at thumbnail size, it doesn't ship. Every character and prop starts as a shape that cuts through noise — before a single detail is sculpted.",
  },
  {
    num: "02",
    title: "SURFACE IS MEMORY",
    body: "Wear, grime and edge damage tell the player where an asset has been. I texture like a historian — every scratch is a decision, not a filter.",
  },
  {
    num: "03",
    title: "LIGHT SELLS FICTION",
    body: "Cinematic lighting is the last 10% that does 90% of the work. I light every portfolio piece like a film still, because presentation is part of the craft.",
  },
];

export default function Manifesto() {
  return (
    <section
      id="manifesto"
      className="border-t border-white/10 px-6 py-24 md:px-12 md:py-36"
      data-testid="manifesto-section"
    >
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="font-code mb-4 text-[11px] uppercase tracking-[0.35em] text-[#00F0FF]"
      >
        02 — Manifesto
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="font-display mb-20 max-w-3xl text-4xl font-black tracking-tighter sm:text-5xl lg:text-6xl"
      >
        HOW I BUILD
      </motion.h2>

      <div className="flex flex-col">
        {CHAPTERS.map((c, i) => (
          <motion.div
            key={c.num}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="group grid grid-cols-1 gap-6 border-t border-white/10 py-12 transition-colors duration-500 hover:bg-white/[0.02] md:grid-cols-12 md:gap-10 md:py-16"
            data-testid={`manifesto-chapter-${c.num}`}
          >
            <span className="font-code text-6xl font-bold text-white/15 transition-colors duration-500 group-hover:text-[#00F0FF]/60 md:col-span-3 md:text-8xl">
              {c.num}
            </span>
            <h3 className="font-display text-2xl font-bold tracking-tight md:col-span-4 md:text-3xl">
              {c.title}
            </h3>
            <p className="max-w-xl text-sm leading-relaxed text-white/60 md:col-span-5">
              {c.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
