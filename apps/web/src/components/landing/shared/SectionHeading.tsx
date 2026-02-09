export default function SectionHeading({
  title,
  subtitle,
  align = "center",
}: {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <h3 className="font-serif text-3xl md:text-4xl text-neutral-800 mb-4">
        {title}
      </h3>
      {subtitle && (
        <p className="text-neutral-500 max-w-lg mb-14 leading-relaxed mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
