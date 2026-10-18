import Link from 'next/link';

type BrandLogoProps = {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  accessibleLabel?: string;
};

const sizes = {
  sm: {
    mark: 'h-7 w-7',
    wordmark: 'text-base',
    gap: 'gap-2',
  },
  md: {
    mark: 'h-8 w-8',
    wordmark: 'text-xl',
    gap: 'gap-2.5',
  },
  lg: {
    mark: 'h-9 w-9',
    wordmark: 'text-2xl',
    gap: 'gap-3',
  },
};

export function BrandLogo({
  href = '/',
  size = 'md',
  className = '',
  accessibleLabel = 'WearCraft home',
}: BrandLogoProps) {
  const style = sizes[size];

  return (
    <Link
      href={href}
      aria-label={accessibleLabel}
      className={`group inline-flex w-fit items-center ${style.gap} ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className={`${style.mark} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" rx="8" fill="#556052" />
        <path
          d="M11 14L17 34L24 19L31 34L37 14"
          stroke="#F8F7F3"
          strokeWidth="3"
          strokeLinecap="square"
          strokeLinejoin="round"
        />
        <path d="M7 9V6H10M38 6H41V9M41 39V42H38M10 42H7V39" stroke="#B8B9A9" strokeWidth="1.25" />
      </svg>
      <span className={`${style.wordmark} whitespace-nowrap font-semibold leading-none tracking-[-0.055em] text-ink`}>
        Wear<span className="text-olive">Craft</span>
      </span>
    </Link>
  );
}
