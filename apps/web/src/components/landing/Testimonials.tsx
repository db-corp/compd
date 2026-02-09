import { Star } from "lucide-react";
import ScrollReveal from "./shared/ScrollReveal";

const testimonials = [
  {
    quote:
      "We replaced our entire influencer budget with Comp'd. The content feels real because it is real — and it cost us zero cash.",
    name: "Sarah M.",
    role: "Owner, Blossom Med Spa",
    location: "Raleigh, NC",
    type: "business" as const,
    rating: 5,
  },
  {
    quote:
      "I've gotten spa days, amazing dinners, and a gym membership — all by posting content I love making.",
    name: "Jaylen T.",
    role: "Lifestyle Creator",
    location: "Austin, TX",
    type: "creator" as const,
    rating: 5,
  },
  {
    quote:
      "The trust tier system is genius. We know exactly what to expect from every creator before they walk through our door.",
    name: "Marcus & Elena P.",
    role: "Owners, Harvest Kitchen",
    location: "Nashville, TN",
    type: "business" as const,
    rating: 5,
  },
  {
    quote:
      "No more awkward DM negotiations. Everything is clear upfront — what I get, what I post, done.",
    name: "Priya K.",
    role: "Food & Travel Creator",
    location: "Raleigh, NC",
    type: "creator" as const,
    rating: 5,
  },
  {
    quote:
      "23 creator visits this quarter. Our Instagram engagement is up 3x. It's a complete no-brainer for any local business.",
    name: "David L.",
    role: "GM, Iron & Oak Fitness",
    location: "Austin, TX",
    type: "business" as const,
    rating: 5,
  },
  {
    quote:
      "I used to spend hours pitching brands. Now I just browse, apply, and go enjoy an amazing experience. So much better.",
    name: "Amara R.",
    role: "Beauty & Wellness Creator",
    location: "Nashville, TN",
    type: "creator" as const,
    rating: 5,
  },
  {
    quote:
      "The deposit system actually makes me feel protected. And as my tier goes up, I don't even need one anymore.",
    name: "Chris W.",
    role: "Adventure Creator",
    location: "Austin, TX",
    type: "creator" as const,
    rating: 5,
  },
  {
    quote:
      "We tried agencies — $5K/month for generic content. Comp'd gives us authentic posts from people who actually love our food.",
    name: "Nina & Tom S.",
    role: "Owners, The Copper Table",
    location: "Raleigh, NC",
    type: "business" as const,
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="bg-neutral-50 px-6 md:px-8 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-800 mb-3">
            See What People Are Saying 👀
          </h2>
          <p className="text-neutral-500 text-lg md:text-xl">
            Comp&apos;d is the easiest way to trade for content.
          </p>
        </ScrollReveal>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-5">
          {testimonials.map((t, i) => (
            <ScrollReveal key={i} delay={(i % 3) * 75}>
              <div className="break-inside-avoid mb-5 bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      strokeWidth={1.5}
                      className="text-accent-400 fill-accent-400"
                    />
                  ))}
                </div>

                <p className="text-sm text-neutral-700 leading-relaxed mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-neutral-800">
                      {t.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {t.role} &middot; {t.location}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      t.type === "business"
                        ? "bg-secondary-50 text-secondary-600"
                        : "bg-primary-50 text-primary-500"
                    }`}
                  >
                    {t.type}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
