import { STATE_CONFIG } from "@/lib/constants";

export default function StateBadge({ state }: { state: string }) {
  const config = STATE_CONFIG[state];
  if (!config) return null;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${config.color} ${config.bg}`}>
      {config.label}
    </span>
  );
}
