import ScrollReveal from "./shared/ScrollReveal";

export default function BigStat() {
  return (
    <section className="px-6 md:px-8 py-24 md:py-32">
      <ScrollReveal animation="scale-in">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[5px] border-accent-400 flex items-center justify-center shrink-0">
            <span className="font-serif text-5xl md:text-6xl text-accent-500 font-bold">
              $0
            </span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-neutral-800 text-center md:text-left leading-tight">
            Cash Required.
            <br />
            Always.
          </h2>
        </div>
      </ScrollReveal>
    </section>
  );
}
