type CardCornerIconProps = {
  className?: string;
};

export function CardCornerIcon({ className }: CardCornerIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6 47V6h41"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="miter"
      />
      <path
        d="M14 47V21h7V14h27"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="miter"
      />
      <path d="M14 21V14" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
