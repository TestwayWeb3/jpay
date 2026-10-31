import { cn } from "@/lib/cn";

export function JPayMark({ className }: { className?: string }) {
  return (
    <img
      src="/jpay-mark.svg?v=2"
      alt="JPay"
      className={cn("h-8 w-8", className)}
    />
  );
}
