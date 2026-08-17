import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "characters", label: "Characters" },
  { key: "environments", label: "Environments" },
  { key: "props", label: "Props" },
];

const SPANS = [
  "md:col-span-8 md:h-[62vh]",
  "md:col-span-4 md:h-[62vh]",
  "md:col-span-5 md:h-[52vh]",
  "md:col-span-7 md:h-[52vh]",
  "md:col-span-4 md:h-[58vh]",
  "md:col-span-8 md:h-[58vh]",
  "md:col-span-12 md:h-[64vh]",
];

export default function Gallery({ artworks }) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const visible =
    filter === "all"
      ? artworks
      : artworks.filter((a) => a.category === filter);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section id="work" className="px-6 py-24 md:px-12 md:py-36" data-testid="gallery-section">
      <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-code mb-4 text-[11px] uppercase tracking-[0.35em] text-[#00F0FF]">
            01 — Selected Work
          </p>
          <h2 className="font-display text-4xl font-black tracking-tighter sm:text-5xl lg:text-6xl">
            THE ARCHIVE
          </h2>
        </motion.div>
        <div className="flex flex-wrap gap-6" data-testid="gallery-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`font-code relative pb-2 text-[11px] uppercase tracking-[0.25em] transition-colors duration-300 ${
                filter === f.key ? "text-[#00F0FF]" : "text-white/50 hover:text-white"
              }`}
              data-testid={`filter-${f.key}`}
            >
              {f.label}
              {filter === f.key && (
                <motion.span
                  layoutId="filter-underline"
                  className="absolute inset-x-0 bottom-0 h-px bg-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.8)]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
        <AnimatePresence mode="popLayout">
          {visible.map((art, i) => (
            <motion.button
              layout
              key={art.slug}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setSelected(art)}
              className={`group relative h-[52vh] overflow-hidden border border-white/10 text-left ${SPANS[i % SPANS.length]}`}
              data-testid={`artwork-card-${art.slug}`}
            >
              <motion.img
                layoutId={`art-img-${art.slug}`}
                src={art.image}
                alt={art.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                <div>
                  <p className="font-code mb-2 text-[10px] uppercase tracking-[0.3em] text-[#00F0FF]">
                    {art.category} / {art.year}
                  </p>
                  <h3 className="font-display text-xl font-bold tracking-tight md:text-2xl">
                    {art.title}
                  </h3>
                </div>
                <span className="font-code border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70 transition-colors duration-300 group-hover:border-[#00F0FF] group-hover:text-[#00F0FF]">
                  View
                </span>
              </div>
              <span className="absolute left-0 top-0 h-px w-0 bg-[#00F0FF] transition-[width] duration-500 group-hover:w-full" />
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md md:p-10"
            onClick={() => setSelected(null)}
            data-testid="artwork-modal"
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="grid max-h-[90vh] w-full max-w-6xl grid-cols-1 overflow-hidden border border-white/10 bg-[#0a0a0a] md:grid-cols-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-[40vh] md:h-[90vh]">
                <motion.img
                  layoutId={`art-img-${selected.slug}`}
                  src={selected.image}
                  alt={selected.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:bg-gradient-to-r" />
              </div>
              <div className="flex flex-col justify-between overflow-y-auto p-8 md:p-12">
                <div>
                  <p className="font-code mb-3 text-[11px] uppercase tracking-[0.35em] text-[#00F0FF]">
                    {selected.category} — {selected.year}
                  </p>
                  <h3 className="font-display text-3xl font-black tracking-tighter md:text-4xl">
                    {selected.title}
                  </h3>
                  <p className="mt-6 text-sm leading-relaxed text-white/60">
                    {selected.description}
                  </p>
                </div>
                <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-8">
                  <div>
                    <dt className="font-code text-[10px] uppercase tracking-[0.25em] text-white/40">
                      Software
                    </dt>
                    <dd className="font-code mt-2 text-sm text-white/90">
                      {selected.software.join(" / ")}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-code text-[10px] uppercase tracking-[0.25em] text-white/40">
                      Polycount
                    </dt>
                    <dd className="font-code mt-2 text-sm text-[#00F0FF]">
                      {selected.polycount}
                    </dd>
                  </div>
                </dl>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center border border-white/20 bg-black/60 text-white transition-colors duration-300 hover:border-[#00F0FF] hover:text-[#00F0FF]"
                data-testid="artwork-modal-close"
                aria-label="Close artwork details"
              >
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
