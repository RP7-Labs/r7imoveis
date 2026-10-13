import { cn } from "@/lib/utils";

const tones = {
  petrol: "bg-petrol-500/10 text-petrol-700",
  champagne: "bg-champagne-300/60 text-champagne-900",
  green: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
  gray: "bg-graphite-100 text-graphite-600",
} as const;

export function Badge({
  tone = "petrol",
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
