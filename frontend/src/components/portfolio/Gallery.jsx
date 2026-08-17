import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import MarmosetViewer from "@/components/portfolio/MarmosetViewer";

function StackImage({ src, alt, testId }) {
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ tx: 0, ty: 0 });
  const Z = 2.2;
  return (
    <div
      className={`relative overflow-hidden ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
      onClick={() => setZoomed((z) => !z)}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const fx = (e.clientX - r.left) / r.width;
        const fy = (e.clientY - r.top) / r.height;
        const clamp = (v, min) => Math.min(0, Math.max(min, v));
        setPan({
          tx: clamp(r.width / 2 - Z * fx * r.width, r.width * (1 - Z)),
          ty: clamp(r.height / 2 - Z * fy * r.height, r.height * (1 - Z)),
        });
      }}
      data-testid={testId}
    >
      <img
        src={src}
        alt={alt}
        className="block w-full transition-transform duration-300 ease-out"
        style={{
          transform: zoomed ? `translate(${pan.tx}px, ${pan.ty}px) scale(${Z})` : "scale(1)",
          transformOrigin: "0 0",
        }}
      />
    </div>
  );
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "characters", label: "Characters" },
  { key: "environments", label: "Environments" },
  { key: "props", label: "Props" },
  { key: "low-poly", label: "Low Poly" },
];

const CATEGORY_LABELS = {
  characters: "Characters",
  environments: "Environments",
  props: "Props",
  "low-poly": "Low Poly",
};

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
  const [activeMedia, setActiveMedia] = useState(0);
  const [landscape, setLandscape] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ tx: 0, ty: 0 });
  const ZOOM = 2.2;

  useEffect(() => {
    setActiveMedia(0);
    setLandscape(false);
    setZoomed(false);
  }, [selected]);

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
              <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.08]">
                <motion.img
                  layoutId={`art-img-${art.slug}`}
                  src={art.image}
                  alt={art.title}
                  className={`h-full w-full ${art.fit ? "object-contain p-8" : "object-cover"}`}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                <div>
                  <p className="font-code mb-2 text-[10px] uppercase tracking-[0.3em] text-[#00F0FF]">
                    {CATEGORY_LABELS[art.category] || art.category} / {art.year}
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

      {visible.length === 0 && (
        <p
          className="font-code border border-dashed border-white/15 px-6 py-16 text-center text-[11px] uppercase tracking-[0.3em] text-white/40"
          data-testid="gallery-empty"
        >
          Stylized low poly pieces dropping soon — check back
        </p>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: "none", transition: { duration: 0.25 } }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md md:p-10"
            onClick={() => setSelected(null)}
            data-testid="artwork-modal"
          >
            <motion.div
              data-lenis-prevent
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0, pointerEvents: "none", transition: { duration: 0.25 } }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`max-h-[90vh] w-full border border-white/10 bg-[#0a0a0a] ${
                selected.stack
                  ? "flex max-w-3xl flex-col overflow-y-auto"
                  : landscape
                    ? "flex max-w-5xl flex-col overflow-y-auto"
                    : "grid max-w-6xl grid-cols-1 overflow-hidden md:grid-cols-2"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {selected.stack && (
                <motion.div
                  initial={{ scale: 0.94, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="flex shrink-0 flex-col"
                  data-testid="artwork-modal-stack"
                >
                  {(() => {
                    const all =
                      selected.media && selected.media.length
                        ? selected.media
                        : [{ type: "image", url: selected.image, label: "Hero Render", stacked: true }];
                    const stackedItems = all.filter((m) => m.stacked);
                    const column = stackedItems.length ? stackedItems : all;
                    const extra = stackedItems.length ? all.filter((m) => !m.stacked) : [];
                    return (
                      <>
                        {column.map((m, i) =>
                          m.type === "video" ? (
                            <video key={i} src={m.url} controls muted loop className="block w-full" data-testid={`stack-video-${i}`} />
                          ) : m.type === "model" ? (
                            <div key={i} className="relative h-[70vh]">
                              <MarmosetViewer url={m.url} />
                            </div>
                          ) : (
                            <img
                              key={i}
                              src={m.url}
                              alt={`${selected.title} — ${m.label}`}
                              className="block w-full"
                              data-testid={`stack-img-${i}`}
                            />
                          )
                        )}
                        {extra.length > 0 && (
                          <div className="flex flex-col gap-10 border-t border-white/10 px-6 py-10 md:px-10" data-testid="artwork-modal-extra">
                            {extra.map((m, i) => (
                              <div key={i}>
                                <p className="font-code mb-3 text-[10px] uppercase tracking-[0.3em] text-[#00F0FF]">
                                  {m.label || "Render"}
                                </p>
                                {m.type === "video" ? (
                                  <video src={m.url} controls muted loop className="block w-full" data-testid={`extra-video-${i}`} />
                                ) : m.type === "model" ? (
                                  <div className="relative h-[60vh]">
                                    <MarmosetViewer url={m.url} />
                                  </div>
                                ) : (
                                  <StackImage src={m.url} alt={`${selected.title} — ${m.label}`} testId={`extra-img-${i}`} />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </motion.div>
              )}
              {!selected.stack && (
              <div
                className={`relative overflow-hidden ${landscape ? "h-[42vh] w-full shrink-0 md:h-[60vh]" : "h-[40vh] md:h-[90vh]"}`}
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  const fx = (e.clientX - r.left) / r.width;
                  const fy = (e.clientY - r.top) / r.height;
                  const clamp = (v, min) => Math.min(0, Math.max(min, v));
                  setPan({
                    tx: clamp(r.width / 2 - ZOOM * fx * r.width, r.width * (1 - ZOOM)),
                    ty: clamp(r.height / 2 - ZOOM * fy * r.height, r.height * (1 - ZOOM)),
                  });
                }}
              >
                {(() => {
                  const media = [
                    { type: "image", url: selected.image, label: "Hero Render" },
                    ...(selected.media || []),
                  ];
                  const active = media[Math.min(activeMedia, media.length - 1)];
                  const isVideo = active.type === "video";
                  const isModel = active.type === "model";
                  return (
                    <>
                      {isModel ? (
                        <MarmosetViewer key={active.url} url={active.url} />
                      ) : isVideo ? (
                        <video
                          key={active.url}
                          src={active.url}
                          controls
                          autoPlay
                          muted
                          loop
                          className="h-full w-full object-cover"
                          data-testid="artwork-modal-video"
                        />
                      ) : (
                        <>
                          {landscape && (
                            <img
                              src={active.url}
                              alt=""
                              aria-hidden="true"
                              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
                            />
                          )}
                          <div
                            onClick={() => setZoomed((z) => !z)}
                            className={`h-full w-full transition-transform duration-300 ease-out ${
                              zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                            }`}
                            style={{
                              transform: zoomed
                                ? `translate(${pan.tx}px, ${pan.ty}px) scale(${ZOOM})`
                                : "scale(1)",
                              transformOrigin: "0 0",
                            }}
                            data-testid="artwork-modal-zoom"
                          >
                            <motion.img
                              layoutId={`art-img-${selected.slug}`}
                              src={active.url}
                              alt={`${selected.title} — ${active.label}`}
                              onLoad={(e) =>
                                setLandscape(e.target.naturalWidth > e.target.naturalHeight * 0.85)
                              }
                              className={`h-full w-full ${landscape ? "relative object-contain" : "object-cover"}`}
                              data-testid="artwork-modal-image"
                            />
                          </div>
                        </>
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:bg-gradient-to-r" />
                      <span
                        className="font-code absolute left-4 top-4 border border-[#00F0FF]/50 bg-black/70 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[#00F0FF]"
                        data-testid="artwork-modal-media-label"
                      >
                        {active.label || "Render"}
                      </span>
                      {media.length > 1 && (
                        <div className="absolute inset-x-4 bottom-4 flex gap-2 overflow-x-auto" data-testid="artwork-modal-thumbs">
                          {media.map((m, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setActiveMedia(i);
                                setLandscape(m.type !== "image");
                                setZoomed(false);
                              }}
                              className={`h-14 w-20 shrink-0 overflow-hidden border transition-colors duration-300 ${
                                i === activeMedia ? "border-[#00F0FF]" : "border-white/20 hover:border-white/60"
                              }`}
                              data-testid={`media-thumb-${i}`}
                              aria-label={`Show ${m.label || `media ${i + 1}`}`}
                            >
                              {m.type === "video" ? (
                                <span className="font-code flex h-full w-full items-center justify-center bg-black text-[9px] uppercase tracking-[0.15em] text-[#00F0FF]">
                                  Video
                                </span>
                              ) : m.type === "model" ? (
                                <span className="font-code flex h-full w-full items-center justify-center bg-black text-[9px] uppercase tracking-[0.15em] text-[#FF003C]">
                                  3D
                                </span>
                              ) : (
                                <img src={m.url} alt={m.label} className="h-full w-full object-cover" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              )}
              <div className={`flex flex-col justify-between ${selected.stack ? "shrink-0 overflow-visible p-10 md:p-16" : "overflow-y-auto p-8 md:p-12"}`}>
                <div>
                  <p className={`font-code mb-3 uppercase tracking-[0.35em] text-[#00F0FF] ${selected.stack ? "text-xs" : "text-[11px]"}`}>
                    {CATEGORY_LABELS[selected.category] || selected.category} — {selected.year}
                  </p>
                  <h3 className={`font-display font-black tracking-tighter ${selected.stack ? "text-4xl md:text-6xl" : "text-3xl md:text-4xl"}`}>
                    {selected.title}
                  </h3>
                  <p className={`leading-relaxed text-white/60 ${selected.stack ? "mt-8 text-base md:text-lg" : "mt-6 text-sm"}`}>
                    {selected.description}
                  </p>
                </div>
                <dl className={`grid grid-cols-2 gap-6 border-t border-white/10 ${selected.stack ? "mt-12 pt-10" : "mt-10 pt-8"}`}>
                  <div>
                    <dt className="font-code text-[10px] uppercase tracking-[0.25em] text-white/40">
                      Software
                    </dt>
                    <dd className={`font-code mt-2 text-white/90 ${selected.stack ? "text-base" : "text-sm"}`}>
                      {selected.software.join(" / ")}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-code text-[10px] uppercase tracking-[0.25em] text-white/40">
                      Polycount
                    </dt>
                    <dd className={`font-code mt-2 text-[#00F0FF] ${selected.stack ? "text-base" : "text-sm"}`}>
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
