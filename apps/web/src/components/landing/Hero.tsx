import Link from "next/link";
import {
  ArrowRight,
  Star,
  MapPin,
  Camera,
  Bell,
  TrendingUp,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 px-6 md:px-8 pt-28 md:pt-36 pb-20 md:pb-32">
      {/* Decorative blurred circles */}
      <div className="absolute top-16 right-[18%] w-80 h-80 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 left-[5%] w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute top-1/2 left-1/3 w-44 h-44 rounded-full bg-secondary-400/20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left — copy */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white/90 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
            🤝 The barter marketplace for local business
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] text-white leading-[1.05] tracking-tight mb-6">
            Trade
            <br />
            Experiences.
            <br />
            <span className="text-accent-200">Get Content.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/75 max-w-md mb-10 leading-relaxed">
            Local businesses trade products and services for authentic creator
            content. No cash, no agencies — just great partnerships.
          </p>

          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-white text-primary-600 text-base font-bold px-8 py-4 rounded-full hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
          >
            Get Started Free <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </div>

        {/* Right — floating card composition */}
        <div className="relative hidden lg:block h-[520px]">
          {/* Main deal card */}
          <div
            className="absolute top-8 right-4 bg-white rounded-2xl shadow-2xl p-5 w-[280px] rotate-2 hover:rotate-0 transition-transform duration-500"
            style={{ animation: "float 6s ease-in-out infinite" }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <span className="text-lg">🍕</span>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-800 text-sm">
                  Dinner for two
                </h4>
                <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <MapPin size={10} strokeWidth={1.5} /> Raleigh, NC
                </p>
              </div>
            </div>
            <div className="flex gap-2 mb-3">
              <span className="text-[11px] font-medium bg-secondary-50 text-secondary-600 px-2 py-0.5 rounded-full">
                Food & Dining
              </span>
              <span className="text-[11px] font-medium bg-accent-50 text-accent-500 px-2 py-0.5 rounded-full">
                ~$120 value
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-3">
              <Camera size={11} strokeWidth={1.5} /> 1 Reel + 2 Stories
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    strokeWidth={1.5}
                    className="text-accent-400 fill-accent-400"
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-primary-500">
                3 spots left
              </span>
            </div>
          </div>

          {/* Notification toast */}
          <div
            className="absolute -top-2 left-0 bg-white rounded-xl shadow-xl p-3 w-[220px] -rotate-3"
            style={{ animation: "float 7s ease-in-out infinite 0.5s" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <Bell size={14} strokeWidth={1.5} className="text-green-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-800">
                  New application!
                </p>
                <p className="text-[10px] text-neutral-400">
                  Sarah applied to your offer
                </p>
              </div>
            </div>
          </div>

          {/* Stats badge */}
          <div
            className="absolute bottom-16 left-8 bg-white rounded-xl shadow-xl p-4 w-[200px] -rotate-2"
            style={{ animation: "float 8s ease-in-out infinite 1s" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-50 flex items-center justify-center">
                <TrendingUp
                  size={18}
                  strokeWidth={1.5}
                  className="text-secondary-500"
                />
              </div>
              <div>
                <p className="text-lg font-bold text-neutral-800">94%</p>
                <p className="text-[10px] text-neutral-400">Completion rate</p>
              </div>
            </div>
          </div>

          {/* Creator avatar card */}
          <div
            className="absolute bottom-36 right-0 bg-white rounded-xl shadow-xl p-3 rotate-3"
            style={{ animation: "float 6.5s ease-in-out infinite 0.3s" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-xs font-bold">
                JT
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-800">
                  Jaylen T.
                </p>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={9}
                      strokeWidth={1.5}
                      className="text-accent-400 fill-accent-400"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
