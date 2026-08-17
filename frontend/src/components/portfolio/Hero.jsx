import { useMemo, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";

const LINES = [
  { text: "WORLDS", style: "text-white" },
  { text: "BUILT FROM", style: "text-stroke" },
  { text: "POLYGONS", style: "text-[#00F0FF] neon-glow" },
];

const STATS = [
  { value: "03+", label: "Years in games" },
  { value: "50+", label: "Assets shipped" },
  { value: "3D", label: "Only discipline" },
];

const HERO_IMG =
  "https://images.unsplash.com/photo-1750096319146-6310519b5af2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwzfHxjeWJlcnB1bmslMjAzZCUyMGNoYXJhY3RlciUyMHBvcnRyYWl0fGVufDB8fHx8MTc4Njk0NjkxMnww&ixlib=rb-4.1.0&q=85";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const frameX = useTransform(sx, [-0.5, 0.5], [-24, 24]);
  const frameY = useTransform(sy, [-0.5, 0.5], [-16, 16]);

  const embers = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        delay: Math.random() * 9,
        duration: 9 + Math.random() * 11,
        opacity: 0.25 + Math.random() * 0.55,
      })),
    []
  );

  const onMouseMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section
      ref={ref}
      onMouseMove={onMouseMove}
      className="relative flex h-screen flex-col justify-end overflow-hidden"
      data-testid="hero-section"
    >
      {/* background gradient + embers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,240,255,0.08),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(255,0,60,0.06),transparent_50%)]" />
      {embers.map((e) => (
        <motion.span
          key={e.id}
          className="absolute bottom-0 rounded-full bg-[#00F0FF]"
          style={{ left: `${e.left}%`, width: e.size, height: e.size }}
          initial={{ y: "0vh", opacity: 0 }}
          animate={{ y: "-110vh", opacity: [0, e.opacity, e.opacity, 0] }}
          transition={{
            duration: e.duration,
            delay: e.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* clipped artwork frame with parallax */}
      <motion.div
        style={{ y: bgY }}
        className="absolute right-0 top-0 hidden h-full w-[42vw] lg:block"
      >
        <motion.div
          style={{ x: frameX, y: frameY }}
          className="relative mt-[10vh] h-[80vh] w-full overflow-hidden"
          initial={{ clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" }}
          animate={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0 100%)" }}
          transition={{ duration: 1.4, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src={HERO_IMG}
            alt="Neon Oracle — featured character artwork"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/30" />
          <div className="animate-scanline absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#00F0FF]/10 to-transparent" />
        </motion.div>
      </motion.div>

      {/* kinetic headline */}
      <motion.div style={{ y: textY }} className="relative z-10 px-6 pb-10 md:px-12">
        <div className="overflow-hidden">
          <motion.p
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="font-code mb-6 text-[11px] uppercase tracking-[0.35em] text-[#00F0FF]"
            data-testid="hero-overline"
          >
            Aman Deep — 3D Game Artist / Portfolio 2026
          </motion.p>
        </div>
        <h1
          className="font-display text-[13vw] font-black leading-[0.92] tracking-tighter sm:text-[11vw] lg:text-[8.5vw]"
          data-testid="hero-headline"
        >
          {LINES.map((line, i) => (
            <span key={line.text} className="block overflow-hidden">
              <motion.span
                className={`block ${line.style}`}
                initial={{ y: "115%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1.1,
                  delay: 0.55 + i * 0.14,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {line.text}
              </motion.span>
            </span>
          ))}
        </h1>

        <div className="mt-10 flex flex-col justify-between gap-8 border-t border-white/10 pt-6 md:flex-row md:items-end">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.6 }}
            className="max-w-md text-sm leading-relaxed text-white/60"
            data-testid="hero-subcopy"
          >
            Characters, environments and hard-surface props for AAA worlds.
            Obsessed with silhouette, surface and the light that sells the
            fiction.
          </motion.p>
          <div className="flex gap-10 md:gap-14">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.8 + i * 0.12 }}
                data-testid={`hero-stat-${i}`}
              >
                <div className="font-code text-2xl font-bold text-white md:text-3xl">
                  {s.value}
                </div>
                <div className="font-code mt-1 text-[10px] uppercase tracking-[0.25em] text-white/40">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
