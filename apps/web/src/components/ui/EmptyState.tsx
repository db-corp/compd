import { type LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <Icon size={40} strokeWidth={1.5} className="text-neutral-300 mb-3" />
      )}
      <h3 className="text-sm font-medium text-neutral-600">{title}</h3>
      {description && (
        <p className="text-xs text-neutral-400 mt-1 max-w-xs">{description}</p>
      )}
    </div>
  );
}
