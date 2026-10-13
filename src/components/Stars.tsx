export function Stars({ value, size = "text-sm" }: { value: number; size?: string }) {
  return (
    <span className={`${size} text-terracotta`} aria-label={`${value} out of 5`}>
      {"★".repeat(Math.round(value))}
      <span className="text-ink/20">{"★".repeat(5 - Math.round(value))}</span>
    </span>
  );
}
