import { motion } from "framer-motion";

const TOOLS = [
  "Blender",
  "ZBrush",
  "Substance 3D",
  "Unreal Engine 5",
  "Maya",
  "Marmoset",
  "Houdini",
  "Photoshop",
];

const PORTRAIT =
  "https://images.unsplash.com/photo-1750096319146-6310519b5af2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwzfHxjeWJlcnB1bmslMjAzZCUyMGNoYXJhY3RlciUyMHBvcnRyYWl0fGVufDB8fHx8MTc4Njk0NjkxMnww&ixlib=rb-4.1.0&q=85";

export default function About() {
  return (
    <section
      id="about"
      className="border-t border-white/10 px-6 py-24 md:px-12 md:py-36"
      data-testid="about-section"
    >
      <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="sticky top-28"
          >
            <p className="font-code mb-4 text-[11px] uppercase tracking-[0.35em] text-[#00F0FF]">
              03 — About
            </p>
            <h2 className="font-display mb-10 text-4xl font-black tracking-tighter sm:text-5xl">
              THE ARTIST
            </h2>
            <div className="relative overflow-hidden border border-white/10">
              <img
                src={PORTRAIT}
                alt="Aman Deep — featured artwork"
                className="h-[60vh] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-transparent to-transparent" />
              <p className="font-code absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.3em] text-white/70">
                Aman Deep — 3D Game Artist
              </p>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col justify-center md:col-span-7 md:pl-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="max-w-xl text-lg leading-relaxed text-white/80 md:text-xl">
              I'm Aman — a 3D game artist with 3+ years of professional
              experience at Supranic Games. I take assets from blockout to
              engine-ready: high-poly sculpts, clean topology, PBR texturing
              and cinematic presentation.
            </p>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/50">
              50+ assets shipped across production. Currently open for
              freelance character, environment and hard-surface prop work, and
              select full-time opportunities.
            </p>
          </motion.div>

          <div className="mt-16">
            <p className="font-code mb-6 text-[11px] uppercase tracking-[0.35em] text-white/40">
              Toolbox
            </p>
            <div className="grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-4">
              {TOOLS.map((tool, i) => (
                <motion.div
                  key={tool}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="font-code flex h-20 items-center justify-center bg-[#050505] px-3 text-center text-[11px] uppercase tracking-[0.2em] text-white/70 transition-colors duration-300 hover:bg-[#00F0FF]/5 hover:text-[#00F0FF]"
                  data-testid={`tool-${tool.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                >
                  {tool}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
