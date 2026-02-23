import {NextResponse} from 'next/server';
import {getAuthUser} from '@/lib/authRequest';
import {query} from '@/lib/db';

const FREE_UPLOADS_PER_MONTH = Number(process.env.FREE_UPLOADS_PER_MONTH ?? 5);
const UPLOAD_WATER_CENTS = Number(process.env.UPLOAD_WATER_CENTS ?? 5);

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        {success: false, error: 'Authentication required'},
        {status: 401}
      );
    }

    const [countRows, userRows] = await Promise.all([
      query<{count: number}[]>(
        `SELECT COUNT(*) AS count FROM media
         WHERE userId = ? AND createdAt >= DATE_FORMAT(NOW(), '%Y-%m-01')`,
        [user.id]
      ),
      query<{balanceCents: number; totalWaterContributionCents: number}[]>(
        `SELECT balanceCents, totalWaterContributionCents FROM users WHERE id = ?`,
        [user.id]
      ),
    ]);

    const usedThisMonth = Number(countRows[0]?.count ?? 0);
    const balanceCents = Number(userRows[0]?.balanceCents ?? 0);
    const totalWaterContributionCents = Number(
      userRows[0]?.totalWaterContributionCents ?? 0
    );

    const freeLimit = Math.max(0, FREE_UPLOADS_PER_MONTH);
    const hasFreeSlots = usedThisMonth < freeLimit;
    const canUploadFree = hasFreeSlots;
    const canPayWithBalance = balanceCents >= UPLOAD_WATER_CENTS;
    const canUpload = canUploadFree || canPayWithBalance;

    let reason: string | undefined;
    if (!canUpload) {
      if (!hasFreeSlots && !canPayWithBalance) {
        reason = 'FREE_LIMIT_EXCEEDED_AND_INSUFFICIENT_BALANCE';
      } else if (!hasFreeSlots) {
        reason = 'FREE_LIMIT_EXCEEDED';
      } else {
        reason = 'INSUFFICIENT_BALANCE';
      }
    }

    return NextResponse.json({
      success: true,
      freeUploadsLimit: freeLimit,
      usedThisMonth,
      balanceCents,
      totalWaterContributionCents,
      uploadWaterCents: UPLOAD_WATER_CENTS,
      canUpload,
      reason,
    });
  } catch (e) {
    console.error('Upload allowance error:', e);
    return NextResponse.json(
      {success: false, error: 'Failed to load allowance'},
      {status: 500}
    );
  }
}
