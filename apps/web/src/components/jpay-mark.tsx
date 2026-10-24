import { cn } from "@/lib/cn";

export function JPayMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-8 w-8", className)}
      role="img"
      aria-label="JPay"
    >
      <defs>
        <linearGradient id="jpay-mark-gradient" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#8F7BFF" />
          <stop offset="1" stopColor="#5B3FE6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9.5" fill="url(#jpay-mark-gradient)" />
      <path
        d="M21.2 8.4h-4.5v9.9c0 1.7-.85 2.65-2.5 2.65-1.2 0-2.05-.6-2.5-1.75l-2.9 1.7c.95 2.15 2.85 3.3 5.5 3.3 3.4 0 5.9-2 5.9-5.7V8.4Z"
        fill="#fff"
      />
      <circle cx="23.2" cy="10.1" r="1.9" fill="#C9BEFF" />
    </svg>
  );
}
