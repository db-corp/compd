import ScrollReveal from "./shared/ScrollReveal";

const profiles = [
  {
    name: "Blossom Med Spa",
    type: "business" as const,
    category: "Wellness",
    emoji: "🌸",
    gradient: "from-secondary-400 to-secondary-600",
    rotate: "-rotate-2",
  },
  {
    name: "Jaylen T.",
    type: "creator" as const,
    category: "Lifestyle",
    emoji: "📸",
    gradient: "from-primary-400 to-primary-600",
    rotate: "rotate-1",
  },
  {
    name: "Harvest Kitchen",
    type: "business" as const,
    category: "Food & Dining",
    emoji: "🍽️",
    gradient: "from-accent-300 to-accent-500",
    rotate: "rotate-2",
  },
  {
    name: "Priya K.",
    type: "creator" as const,
    category: "Food & Travel",
    emoji: "✨",
    gradient: "from-primary-500 to-secondary-500",
    rotate: "-rotate-1",
  },
  {
    name: "Iron & Oak Fitness",
    type: "business" as const,
    category: "Fitness",
    emoji: "💪",
    gradient: "from-secondary-500 to-secondary-700",
    rotate: "rotate-2",
  },
];

export default function SocialProof() {
  return (
    <section className="px-6 md:px-8 py-24 md:py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-800 mb-3">
            Businesses &amp; Creators Love Comp&apos;d 🤝
          </h2>
          <p className="text-neutral-500 text-lg md:text-xl mb-16">
            See who&apos;s already trading experiences for content.
          </p>
        </ScrollReveal>

        <div className="flex flex-wrap justify-center gap-5 md:gap-6">
          {profiles.map(
            ({ name, type, category, emoji, gradient, rotate }, i) => (
              <ScrollReveal key={name} delay={i * 60}>
                <div
                  className={`w-40 md:w-48 bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ${rotate}`}
                >
                  {/* Colored header */}
                  <div
                    className={`h-24 bg-gradient-to-br ${gradient} flex items-center justify-center`}
                  >
                    <span className="text-4xl">{emoji}</span>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <p className="text-sm font-bold text-neutral-800 mb-0.5 truncate">
                      {name}
                    </p>
                    <p className="text-xs text-neutral-400 mb-3">{category}</p>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        type === "business"
                          ? "bg-secondary-50 text-secondary-600"
                          : "bg-primary-50 text-primary-500"
                      }`}
                    >
                      {type}
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            )
          )}
        </div>
      </div>
    </section>
  );
}
