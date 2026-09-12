export function UfitGoBrandMark({ className = '', showDot = true }) {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <svg
        viewBox="-4 -3 40 40"
        className="h-full w-full"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M27 21 A 14 14 0 1 1 11 5 A 11 11 0 1 0 27 21 Z"
          fill="#dcb232"
        />
        <path
          d="M10 29 V 17 C 10 9, 18 7, 18 2 C 18 7, 26 9, 26 17 V 29 Z"
          fill="#115e59"
        />
        <rect x="8" y="29" width="20" height="3" fill="#115e59" />
      </svg>

      {showDot && (
        <span className="absolute -top-1.5 right-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white shadow-sm" />
      )}
    </div>
  );
}
