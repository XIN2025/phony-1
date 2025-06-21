import { authOptions } from '@/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/github`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with GitHub');
    }

    // Redirect back to settings page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/create`);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return NextResponse.json({ error: 'Failed to process GitHub OAuth' }, { status: 500 });
  }
}
