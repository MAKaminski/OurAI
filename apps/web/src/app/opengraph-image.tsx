import { ImageResponse } from 'next/og';
import { site } from '@/lib/site';

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1e1b4b 100%)',
        color: 'white',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ fontSize: 40, opacity: 0.7 }}>{site.name}</div>
      <div style={{ fontSize: 68, fontWeight: 700, marginTop: 24, lineHeight: 1.1 }}>
        Your whole team, building software with AI — together, live.
      </div>
      <div style={{ fontSize: 30, opacity: 0.8, marginTop: 28 }}>
        Idea intake → AI agents build in parallel → human-approved merges → shipped.
      </div>
    </div>,
    size,
  );
}
