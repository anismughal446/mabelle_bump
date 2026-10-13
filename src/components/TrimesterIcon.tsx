/**
 * Aesthetic, hand-crafted SVG icons for each pregnancy stage.
 * Replaces the plain emoji avatars with soft, on-brand line illustrations.
 */
export default function TrimesterIcon({ stage }: { stage: string }) {
  const stroke = "#c88566";
  const soft = "#f4e3dc";
  const sage = "#8ca08a";

  const common = {
    width: 56,
    height: 56,
    viewBox: "0 0 56 56",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  } as const;

  if (stage === "1st") {
    // tiny seedling / early bump
    return (
      <svg {...common}>
        <circle cx="28" cy="28" r="26" fill={soft} />
        <path d="M28 38c0-6 0-9 0-12" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M28 26c-4 0-7-3-7-7 4 0 7 3 7 7Z" fill={sage} />
        <path d="M28 30c4 0 7-3 7-7-4 0-7 3-7 7Z" fill={stroke} />
        <circle cx="28" cy="40" r="1.6" fill={stroke} />
      </svg>
    );
  }

  if (stage === "2nd") {
    // gentle growing bump silhouette
    return (
      <svg {...common}>
        <circle cx="28" cy="28" r="26" fill={soft} />
        <path
          d="M24 15c1.6 0 3 1.4 3 3s-1.4 3-3 3-3-1.4-3-3 1.4-3 3-3Z"
          fill={stroke}
        />
        <path
          d="M24 23c2.4 0 4 1.8 4 4v3c3.2.4 5.6 3 5.6 6.2 0 1.6-1.3 2.8-2.9 2.8H21c-1.5 0-2.6-1.4-2.4-2.9l1.4-9.4c.3-2.1 2-3.7 4-3.7Z"
          fill={stroke}
        />
      </svg>
    );
  }

  if (stage === "3rd") {
    // full round bump
    return (
      <svg {...common}>
        <circle cx="28" cy="28" r="26" fill={soft} />
        <path d="M23 14c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3Z" fill={stroke} />
        <path
          d="M23 22c2.3 0 4 1.7 4.2 3.9.2 2 .3 3.6.3 4.8 3.7.6 6.5 3.8 6.5 7.6 0 1.7-1.4 3.1-3.1 3.1H20c-1.6 0-2.8-1.5-2.5-3.1l2-13.2c.3-1.9 1.8-3.1 3.5-3.1Z"
          fill={stroke}
        />
        <circle cx="31" cy="35" r="3.4" fill={soft} />
      </svg>
    );
  }

  // postpartum — mother cradling baby
  return (
    <svg {...common}>
      <circle cx="28" cy="28" r="26" fill={soft} />
      <path d="M24 14c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3Z" fill={stroke} />
      <path
        d="M24 22c2.6 0 4.4 2 4.4 4.6v3.6c0 3.4-1.4 5.8-4.4 5.8h-2.2c-2.4 0-3.6-2-3.2-4.2l1.4-6.5c.4-2 1.9-3.3 4-3.3Z"
        fill={stroke}
      />
      <circle cx="34" cy="30" r="5" fill={sage} />
      <circle cx="34" cy="28.6" r="1.7" fill={soft} />
      <path d="M31.5 33.5c1.4 1.2 3.6 1.2 5 0" stroke={soft} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
