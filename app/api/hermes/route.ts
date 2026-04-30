import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: { message: 'ANTHROPIC_KEY is not configured' } },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    const upstream = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { error: { message: 'Failed to reach Anthropic' } },
      { status: 502 }
    );
  }
}
