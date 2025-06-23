import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('lucide lucide-webhook', className)}
    >
      <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17" />
      <path d="M6 7.02h5.99c1.1 0 1.95-.94 2.48-1.9A4 4 0 0 1 22 7" />
      <path d="M12 12v10" />
      <path d="M12 2v4" />
      <path d="M20 12h2" />
      <path d="M2 12h2" />
      <path d="m15 9-3-3-3 3" />
      <path d="m9 15 3 3 3-3" />
    </svg>
  );
}
