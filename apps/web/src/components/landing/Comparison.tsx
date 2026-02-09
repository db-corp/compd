import { Check, X } from "lucide-react";
import ScrollReveal from "./shared/ScrollReveal";

const traditional = [
  { label: "Social media agency", cost: "$3,000–10,000/mo" },
  { label: "Influencer fees", cost: "$200–2,000/post" },
  { label: "Content production", cost: "$500–5,000/shoot" },
  { label: "Platform/management tools", cost: "$100–500/mo" },
];

const compd = [
  { label: "List your offers", included: true },
  { label: "Match with local creators", included: true },
  { label: "Built-in trust & deposits", included: true },
  { label: "Real-time deal tracking", included: true },
  { label: "Content verification", included: true },
  { label: "In-app messaging", included: true },
];

export default function Comparison() {
  return (
    <section className="bg-primary-50 px-6 md:px-8 py-24 md:py-32">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-800 mb-4">
            A Simpler Way to Get Content 🏝
          </h2>
          <p className="text-neutral-500 text-lg md:text-xl max-w-xl mx-auto">
            No more paying for five different apps. Trade what you already have.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="bg-white rounded-3xl shadow-lg border border-neutral-100 overflow-hidden">
            {/* Traditional costs */}
            <div className="p-6 md:p-8 border-b border-neutral-100">
              <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase mb-4">
                Traditional content marketing
              </p>
              <div className="space-y-3">
                {traditional.map(({ label, cost }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-3">
                      <X
                        size={16}
                        strokeWidth={2}
                        className="text-neutral-300"
                      />
                      <span className="text-sm text-neutral-600">{label}</span>
                    </div>
                    <span className="text-sm font-semibold text-neutral-400 line-through">
                      {cost}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comp'd */}
            <div className="p-6 md:p-8 bg-gradient-to-b from-white to-primary-50/50">
              <div className="flex items-center gap-3 mb-5">
                <span className="font-serif text-xl font-bold text-primary-500">
                  Comp&apos;d
                </span>
                <span className="text-xs font-bold bg-primary-100 text-primary-600 px-2.5 py-1 rounded-full">
                  Free to start
                </span>
              </div>
              <div className="space-y-3 mb-8">
                {compd.map(({ label }) => (
                  <div key={label} className="flex items-center gap-3 py-2">
                    <div className="w-5 h-5 rounded-full bg-secondary-100 flex items-center justify-center">
                      <Check
                        size={12}
                        strokeWidth={2.5}
                        className="text-secondary-600"
                      />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
