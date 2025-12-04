import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" className="stroke-primary" />
      <path d="M12 8a4 4 0 1 0 4 4" className="stroke-foreground" />
      <path d="M12.5 12.5L16 16" className="stroke-foreground" />
      <path d="M15.5 6.5l-1-1 1-1 1 1-1 1z" fill="hsl(var(--accent))" stroke="hsl(var(--accent))" />
    </svg>
  );
}
