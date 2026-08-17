const ITEMS = [
  "CHARACTERS",
  "ENVIRONMENTS",
  "PROPS",
  "WORLD BUILDING",
  "HARD SURFACE",
  "CINEMATIC LIGHTING",
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div
      className="relative overflow-hidden border-y border-white/10 py-8 md:py-12"
      data-testid="editorial-marquee"
    >
      <div className="animate-marquee flex w-max items-center gap-12 whitespace-nowrap pr-12">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-12">
            <span
              className={`font-display text-6xl font-black tracking-tighter md:text-8xl ${
                i % 2 === 0 ? "text-stroke" : "text-stroke-cyan"
              }`}
            >
              {item}
            </span>
            <span className="h-2 w-2 rotate-45 bg-[#FF003C]" />
          </span>
        ))}
      </div>
    </div>
  );
}
