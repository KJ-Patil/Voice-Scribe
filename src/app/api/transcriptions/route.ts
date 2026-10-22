import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transcriptionCreateSchema, transcriptionQuerySchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limiter';

// GET /api/transcriptions - List with search, filter, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsedQuery = transcriptionQuerySchema.safeParse({
      search: searchParams.get('search') || undefined,
      language: searchParams.get('language') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 10,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsedQuery.error.format() },
        { status: 400 }
      );
    }

    const { search, language, page, limit } = parsedQuery.data;
    const skip = (page - 1) * limit;

    // Build parameterized Prisma query
    const whereClause: any = {};

    if (search && search.trim() !== '') {
      whereClause.text = {
        contains: search.trim(),
      };
    }

    if (language && language !== 'All' && language !== 'Auto-detect') {
      whereClause.language = language;
    }

    // Execute count and paginated query in parallel
    const [total, transcriptions] = await Promise.all([
      prisma.transcription.count({ where: whereClause }),
      prisma.transcription.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      data: transcriptions,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching transcriptions:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve transcriptions', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/transcriptions - Create a new record
export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        {
          status: 429,
          headers: { 'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString() },
        }
      );
    }

    const body = await request.json();
    const validation = transcriptionCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { text, language, duration_s } = validation.data;

    // Prisma parameterized insert supporting UTF-8 Devanagari
    const record = await prisma.transcription.create({
      data: {
        text,
        language: language || 'Auto-detect',
        duration_s: duration_s || 0.0,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    console.error('Error saving transcription:', error);
    return NextResponse.json(
      { error: 'Failed to create transcription', message: error.message },
      { status: 500 }
    );
  }
}
