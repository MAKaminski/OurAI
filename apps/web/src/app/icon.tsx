import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/** Browser-tab favicon: the OurAI git-branch mark with two-color sparkle nodes. */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        borderRadius: 7,
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <line x1="7" y1="4" x2="7" y2="20" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M7 13 C 7 17, 17 15, 17 19"
          stroke="#e5e7eb"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="7" cy="4" r="2.8" fill="#3b82f6" />
        <circle cx="17" cy="20" r="2.8" fill="#8b5cf6" />
      </svg>
    </div>,
    size,
  );
}
