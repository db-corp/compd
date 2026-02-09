import { Store, Camera, Handshake } from "lucide-react";
import ScrollReveal from "./shared/ScrollReveal";

const steps = [
  {
    icon: Store,
    number: "01",
    color: "bg-secondary-50 text-secondary-500",
    accent: "bg-secondary-500",
    title: "List your offer",
    description:
      "Describe what you'll provide — a meal, a spa day, a gym pass — and what content you'd like in return.",
  },
  {
    icon: Camera,
    number: "02",
    color: "bg-primary-50 text-primary-500",
    accent: "bg-primary-500",
    title: "Match with creators",
    description:
      "Local creators browse and apply. Review their profiles, trust tiers, and past work before approving.",
  },
  {
    icon: Handshake,
    number: "03",
    color: "bg-accent-50 text-accent-500",
    accent: "bg-accent-400",
    title: "Trade & post",
    description:
      "The creator visits, enjoys the experience, and posts. You get social proof — they get a great time.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-neutral-50 px-6 md:px-8 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-800 mb-4">
            Not Just Another Marketplace 🔥
          </h2>
          <p className="text-neutral-500 text-lg md:text-xl max-w-xl mx-auto">
            Comp&apos;d has everything you need to trade products for content.
            All in one place.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map(
            ({ icon: Icon, number, color, accent, title, description }, i) => (
              <ScrollReveal key={number} delay={i * 100}>
                <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 hover:shadow-lg transition-shadow duration-300 h-full">
                  {/* Large step number — decorative */}
                  <span className="absolute top-4 right-6 font-serif text-7xl text-neutral-100 leading-none select-none">
                    {number}
                  </span>

                  <div className="relative">
                    <div
                      className={`w-14 h-14 rounded-2xl ${color.split(" ")[0]} flex items-center justify-center mb-6`}
                    >
                      <Icon
                        size={26}
                        strokeWidth={1.5}
                        className={color.split(" ")[1]}
                      />
                    </div>

                    <h3 className="font-bold text-xl text-neutral-800 mb-3">
                      {title}
                    </h3>
                    <p className="text-neutral-500 leading-relaxed">
                      {description}
                    </p>
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
