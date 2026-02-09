import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "./shared/ScrollReveal";

export default function CtaBanner() {
  return (
    <section className="px-6 md:px-8 py-24 md:py-32">
      <ScrollReveal animation="scale-in">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-800 mb-6">
            Start Getting Comp&apos;d — Free
          </h2>
          <p className="text-neutral-500 text-lg md:text-xl mb-10 max-w-lg mx-auto">
            Join the marketplace where local businesses and creators both win.
            No credit card required.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-primary-500 text-white text-base font-bold px-10 py-4.5 rounded-full hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl"
          >
            Get Started Free <ArrowRight size={18} strokeWidth={2} />
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}
