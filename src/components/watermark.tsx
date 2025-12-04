import { APP_NAME } from '@/lib/constants';

export function Watermark() {
  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 select-none text-7xl font-black text-foreground/5 opacity-50"
      aria-hidden="true"
    >
      {APP_NAME}
    </div>
  );
}
