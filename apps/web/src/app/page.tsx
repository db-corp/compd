import Link from "next/link";
import { Handshake, Camera, Store, ArrowRight, Star, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFCFA]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <h1 className="font-serif text-2xl text-primary-500">Comp'd</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-800 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="bg-primary-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-600 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 pt-20 pb-24 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <Handshake size={14} strokeWidth={1.5} />
          Barter-powered content marketing
        </div>
        <h2 className="font-serif text-5xl md:text-6xl text-neutral-800 max-w-3xl mx-auto leading-tight mb-6">
          Local businesses meet creators.
          <span className="text-primary-500"> Content happens.</span>
        </h2>
        <p className="text-lg text-neutral-500 max-w-xl mx-auto mb-10">
          Trade your products and services for authentic social media content.
          No cash changes hands — just great experiences and great posts.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-primary-500 text-white text-sm font-semibold px-7 py-3.5 rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
          >
            Start free <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 border border-neutral-200 text-neutral-700 text-sm font-semibold px-7 py-3.5 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-neutral-100 px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <h3 className="font-serif text-3xl text-neutral-800 text-center mb-4">
            How it works
          </h3>
          <p className="text-neutral-500 text-center mb-14 max-w-md mx-auto">
            Three steps to authentic content from local creators.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              icon={<Store size={24} strokeWidth={1.5} className="text-secondary-500" />}
              step="1"
              title="Create an offer"
              description="Describe what you'll provide — a meal, a spa treatment, a class — and what content you'd like in return."
            />
            <StepCard
              icon={<Camera size={24} strokeWidth={1.5} className="text-primary-500" />}
              step="2"
              title="Creators apply"
              description="Local creators browse your offers and apply. Review their profiles, ratings, and past work before approving."
            />
            <StepCard
              icon={<Handshake size={24} strokeWidth={1.5} className="text-accent-500" />}
              step="3"
              title="Experience & post"
              description="The creator visits, enjoys the experience, and posts authentic content. You get real social proof — they get a great time."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Shield size={20} strokeWidth={1.5} className="text-secondary-500" />}
            title="Trust tiers"
            description="Creators build reputation through completed deals, lowering deposit requirements and unlocking premium offers."
          />
          <FeatureCard
            icon={<Star size={20} strokeWidth={1.5} className="text-accent-500" />}
            title="Content verification"
            description="Automated checks ensure posts include required tags, hashtags, and meet quality standards before deals close."
          />
          <FeatureCard
            icon={<Zap size={20} strokeWidth={1.5} className="text-primary-500" />}
            title="Real-time deals"
            description="Track every step from application to completion with live chat, status updates, and instant notifications."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 pb-24">
        <div className="max-w-4xl mx-auto bg-primary-500 rounded-2xl px-8 py-14 text-center">
          <h3 className="font-serif text-3xl text-white mb-4">
            Ready to get comp'd?
          </h3>
          <p className="text-primary-100 mb-8 max-w-md mx-auto">
            Join the marketplace where local businesses and creators both win.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-white text-primary-600 text-sm font-semibold px-7 py-3.5 rounded-lg hover:bg-primary-50 transition-colors"
          >
            Create your account <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 px-8 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-neutral-400">
          <span className="font-serif text-lg text-neutral-300">Comp'd</span>
          <span>&copy; {new Date().getFullYear()} Comp'd. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

function StepCard({
  icon,
  step,
  title,
  description,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-xl bg-neutral-50 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <div className="text-xs font-semibold text-primary-500 mb-2">
        STEP {step}
      </div>
      <h4 className="font-semibold text-neutral-800 mb-2">{title}</h4>
      <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white border border-neutral-100 rounded-xl p-6 shadow-sm">
      <div className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h4 className="font-semibold text-neutral-800 mb-2">{title}</h4>
      <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
    </div>
  );
}
