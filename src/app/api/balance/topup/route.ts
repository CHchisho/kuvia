import {NextResponse} from 'next/server';
import {getAuthUser} from '@/lib/authRequest';
import {query} from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        {success: false, error: 'Authentication required'},
        {status: 401}
      );
    }

    const body = await request.json().catch(() => ({}));
    const amountCents =
      typeof body.amountCents === 'number' ? body.amountCents : null;
    const amountEur =
      typeof body.amountEur === 'number' ? body.amountEur : null;

    let cents: number;
    if (amountCents != null && amountCents >= 0) {
      cents = Math.floor(amountCents);
    } else if (amountEur != null && amountEur >= 0) {
      cents = Math.floor(amountEur * 100);
    } else {
      return NextResponse.json(
        {success: false, error: 'Provide amountCents or amountEur'},
        {status: 400}
      );
    }

    if (cents <= 0) {
      return NextResponse.json(
        {success: false, error: 'Amount must be positive'},
        {status: 400}
      );
    }

    // Cap for safety (e.g. 1000 EUR)
    const maxCents = 100_000;
    if (cents > maxCents) {
      return NextResponse.json(
        {success: false, error: `Maximum top-up is ${maxCents / 100} EUR`},
        {status: 400}
      );
    }

    await query(
      `UPDATE users SET balanceCents = balanceCents + ? WHERE id = ?`,
      [cents, user.id]
    );

    const rows = await query<{balanceCents: number}[]>(
      `SELECT balanceCents FROM users WHERE id = ?`,
      [user.id]
    );
    const newBalanceCents = Number(rows[0]?.balanceCents ?? 0);

    return NextResponse.json({
      success: true,
      addedCents: cents,
      balanceCents: newBalanceCents,
    });
  } catch (e) {
    console.error('Top-up error:', e);
    return NextResponse.json(
      {success: false, error: 'Top-up failed'},
      {status: 500}
    );
  }
}
