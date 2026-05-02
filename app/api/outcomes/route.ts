import { NextRequest, NextResponse } from 'next/server';

type OutcomeType = 'applied' | 'interview' | 'offer' | 'rejected' | 'hired';

interface OutcomeEvent {
  id: string;
  userId: string;
  jobId: string;
  outcome: OutcomeType;
  source?: string;
  notes?: string;
  createdAt: string;
}

interface OutcomePayload {
  userId?: string;
  jobId?: string;
  outcome?: OutcomeType;
  source?: string;
  notes?: string;
}

const MAX_EVENTS = 2000;
const events: OutcomeEvent[] = [];

function isValidOutcome(value: string | undefined): value is OutcomeType {
  return value === 'applied' || value === 'interview' || value === 'offer' || value === 'rejected' || value === 'hired';
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OutcomePayload;

    if (!body.userId || !body.jobId || !isValidOutcome(body.outcome)) {
      return NextResponse.json(
        { error: { message: 'userId, jobId and valid outcome are required' } },
        { status: 400 }
      );
    }

    const event: OutcomeEvent = {
      id: `evt_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
      userId: body.userId,
      jobId: body.jobId,
      outcome: body.outcome,
      source: body.source,
      notes: body.notes,
      createdAt: new Date().toISOString(),
    };

    events.push(event);
    if (events.length > MAX_EVENTS) {
      events.splice(0, events.length - MAX_EVENTS);
    }

    return NextResponse.json({ ok: true, event });
  } catch {
    return NextResponse.json(
      { error: { message: 'Failed to store outcome event' } },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const jobId = req.nextUrl.searchParams.get('jobId');

  const filtered = events.filter(event => {
    if (userId && event.userId !== userId) return false;
    if (jobId && event.jobId !== jobId) return false;
    return true;
  });

  const summary = filtered.reduce<Record<OutcomeType, number>>(
    (acc, event) => {
      acc[event.outcome] += 1;
      return acc;
    },
    {
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      hired: 0,
    }
  );

  return NextResponse.json({
    total: filtered.length,
    summary,
    events: filtered.slice(-100).reverse(),
  });
}
