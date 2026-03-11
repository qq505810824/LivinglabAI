'use client';

import { useRouter } from 'next/navigation';

interface PageBackProps {
  label?: string;
  href?: string;
}

export function PageBack({ label = 'Back', href }: PageBackProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-background-tertiary text-xs">
        ←
      </span>
      <span>{label}</span>
    </button>
  );
}

