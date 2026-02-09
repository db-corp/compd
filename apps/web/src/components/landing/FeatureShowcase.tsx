import {
  Shield,
  Activity,
  CheckCircle,
  Star,
  ArrowUp,
  Clock,
  MapPin,
  Hash,
  AtSign,
} from "lucide-react";
import ScrollReveal from "./shared/ScrollReveal";

export default function FeatureShowcase() {
  return (
    <section id="features" className="px-6 md:px-8 py-16 md:py-24">
      <div className="max-w-6xl mx-auto space-y-24 md:space-y-32">
        {/* Feature 1 — Trust Tiers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <ScrollReveal animation="fade-in-left">
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6 max-w-sm mx-auto lg:mx-0">
              <div className="flex items-center gap-2 mb-6">
                <Shield
                  size={18}
                  strokeWidth={1.5}
                  className="text-secondary-500"
                />
                <span className="text-sm font-bold text-neutral-800">
                  Trust Level
                </span>
              </div>
              <div className="space-y-4">
                {[
                  {
                    tier: "New",
                    deposit: "$10 deposit",
                    active: false,
                    color: "bg-neutral-200",
                  },
                  {
                    tier: "Established",
                    deposit: "$5 deposit",
                    active: true,
                    color: "bg-secondary-400",
                  },
                  {
                    tier: "Trusted",
                    deposit: "No deposit",
                    active: false,
                    color: "bg-neutral-200",
                  },
                  {
                    tier: "VIP",
                    deposit: "Premium offers",
                    active: false,
                    color: "bg-neutral-200",
                  },
                ].map(({ tier, deposit, active, color }) => (
                  <div key={tier} className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${color} ${active ? "ring-4 ring-secondary-100" : ""}`}
                    />
                    <div className="flex-1">
                      <span
                        className={`text-sm ${active ? "font-bold text-neutral-800" : "text-neutral-400"}`}
                      >
                        {tier}
                      </span>
                    </div>
                    <span
                      className={`text-xs ${active ? "font-semibold text-secondary-600" : "text-neutral-300"}`}
                    >
                      {deposit}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-secondary-50 rounded-xl p-3 flex items-center gap-3">
                <ArrowUp
                  size={14}
                  strokeWidth={2}
                  className="text-secondary-500"
                />
                <div className="flex-1">
                  <div className="h-2 bg-secondary-200 rounded-full">
                    <div className="h-2 bg-secondary-500 rounded-full w-[65%]" />
                  </div>
                </div>
                <span className="text-xs font-semibold text-secondary-600">
                  Level 2
                </span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-in-right">
            <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl text-neutral-800 mb-4 leading-tight">
              Trust That Grows
              <br />
              With You 🛡️
            </h3>
            <p className="text-neutral-500 text-lg leading-relaxed max-w-md">
              Every completed deal builds your reputation. Higher tiers mean
              lower deposits and access to premium, high-value offers.
            </p>
          </ScrollReveal>
        </div>

        {/* Feature 2 — Real-Time Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <ScrollReveal
            animation="fade-in-left"
            className="order-2 lg:order-1"
          >
            <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl text-neutral-800 mb-4 leading-tight">
              Every Deal,
              <br />
              Tracked in Real Time 📊
            </h3>
            <p className="text-neutral-500 text-lg leading-relaxed max-w-md">
              From application to content delivery, follow every step. No
              guessing, no chasing — just seamless collaboration.
            </p>
          </ScrollReveal>

          <ScrollReveal
            animation="fade-in-right"
            className="order-1 lg:order-2"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6 max-w-sm mx-auto lg:ml-auto">
              <div className="flex items-center gap-2 mb-6">
                <Activity
                  size={18}
                  strokeWidth={1.5}
                  className="text-primary-500"
                />
                <span className="text-sm font-bold text-neutral-800">
                  Deal Progress
                </span>
              </div>
              <div className="space-y-0">
                {[
                  { step: "Applied", done: true },
                  { step: "Approved", done: true },
                  { step: "Checked in", done: true },
                  { step: "Content pending", current: true },
                  { step: "Completed", done: false },
                ].map(
                  (
                    { step, done, current },
                    i,
                    arr
                  ) => (
                    <div key={step}>
                      <div className="flex items-center gap-3 py-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shrink-0 ${
                            done
                              ? "bg-secondary-500"
                              : current
                                ? "bg-primary-500 ring-4 ring-primary-100"
                                : "bg-neutral-200"
                          }`}
                        >
                          {done ? (
                            <CheckCircle size={14} strokeWidth={2} />
                          ) : current ? (
                            <Clock size={12} strokeWidth={2} />
                          ) : null}
                        </div>
                        <span
                          className={`text-sm ${
                            done
                              ? "text-neutral-400 line-through"
                              : current
                                ? "font-bold text-neutral-800"
                                : "text-neutral-300"
                          }`}
                        >
                          {step}
                        </span>
                        {current && (
                          <span className="ml-auto text-[10px] font-bold text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">
                            NOW
                          </span>
                        )}
                      </div>
                      {i < arr.length - 1 && (
                        <div
                          className={`w-px h-4 ml-3 ${done ? "bg-secondary-300" : "bg-neutral-200"}`}
                        />
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Feature 3 — Content Verification */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <ScrollReveal animation="fade-in-left">
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6 max-w-sm mx-auto lg:mx-0">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle
                  size={18}
                  strokeWidth={1.5}
                  className="text-accent-500"
                />
                <span className="text-sm font-bold text-neutral-800">
                  Content Check
                </span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: "Instagram Reel posted",
                    done: true,
                    icon: Star,
                  },
                  {
                    label: "@harvestkitchen tagged",
                    done: true,
                    icon: AtSign,
                  },
                  {
                    label: "#ad hashtag included",
                    done: true,
                    icon: Hash,
                  },
                  {
                    label: "Location tagged",
                    done: true,
                    icon: MapPin,
                  },
                  {
                    label: "Stories (2 of 2)",
                    done: false,
                    icon: Clock,
                  },
                ].map(({ label, done, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 py-1.5"
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center ${done ? "bg-secondary-100" : "bg-neutral-100"}`}
                    >
                      {done ? (
                        <CheckCircle
                          size={12}
                          strokeWidth={2.5}
                          className="text-secondary-600"
                        />
                      ) : (
                        <Icon
                          size={12}
                          strokeWidth={1.5}
                          className="text-neutral-400"
                        />
                      )}
                    </div>
                    <span
                      className={`text-sm ${done ? "text-neutral-700" : "text-neutral-400"}`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2">
                <div className="flex-1 h-2 bg-neutral-100 rounded-full">
                  <div className="h-2 bg-accent-400 rounded-full w-[80%]" />
                </div>
                <span className="text-xs font-semibold text-accent-500">
                  80%
                </span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-in-right">
            <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl text-neutral-800 mb-4 leading-tight">
              Content You Can
              <br />
              Count On ✅
            </h3>
            <p className="text-neutral-500 text-lg leading-relaxed max-w-md">
              Automated checks make sure every post includes the right tags,
              hashtags, and meets your quality standards — before the deal
              closes.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
