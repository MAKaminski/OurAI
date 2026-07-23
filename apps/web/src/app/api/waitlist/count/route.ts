import { NextResponse } from 'next/server';
import { getWaitlistCount } from '@/lib/waitlist/count';
import { waitlistCountFlag } from '@/lib/flags';

export const dynamic = 'force-dynamic';

/**
 * Returns the pre-signup count only when it should be revealed: the feature
 * flag is on AND the count has reached the minimum threshold. Until then the
 * exact number isn't exposed at all.
 */
export async function GET() {
  const { enabled, minReveal } = waitlistCountFlag();
  if (!enabled) return NextResponse.json({ reveal: false });

  const count = await getWaitlistCount();
  if (count === null || count < minReveal) {
    return NextResponse.json({ reveal: false });
  }
  return NextResponse.json({ reveal: true, count });
}
