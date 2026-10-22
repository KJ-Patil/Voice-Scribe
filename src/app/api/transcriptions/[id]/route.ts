import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transcriptionUpdateSchema } from '@/lib/validations';

interface RouteContext {
  params: { id: string };
}

// GET /api/transcriptions/:id
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const record = await prisma.transcription.findUnique({
      where: { id },
    });

    if (!record) {
      return NextResponse.json({ error: 'Transcription not found' }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error: any) {
    console.error('Error fetching single transcription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcription', message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/transcriptions/:id - Edit transcription text
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const body = await request.json();
    const validation = transcriptionUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const existing = await prisma.transcription.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Transcription not found' }, { status: 404 });
    }

    const updated = await prisma.transcription.update({
      where: { id },
      data: {
        text: validation.data.text,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating transcription:', error);
    return NextResponse.json(
      { error: 'Failed to update transcription', message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/transcriptions/:id - Delete a record
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const existing = await prisma.transcription.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Transcription not found' }, { status: 404 });
    }

    await prisma.transcription.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: `Record #${id} deleted` });
  } catch (error: any) {
    console.error('Error deleting transcription:', error);
    return NextResponse.json(
      { error: 'Failed to delete transcription', message: error.message },
      { status: 500 }
    );
  }
}
