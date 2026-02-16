import { NextResponse } from 'next/server';
import db from '@/src/lib/db';

export async function GET() {
  const pending = db.prepare("SELECT ticker FROM extraction_queue WHERE status = 'pending'").all();
  return NextResponse.json(pending);
}

export async function POST(request: Request) {
  try {
    const { ticker } = await request.json();
    if (!ticker) return NextResponse.json({ error: 'Ticker é obrigatório' }, { status: 400 });

    const insert = db.prepare("INSERT OR IGNORE INTO extraction_queue (ticker) VALUES (?)");
    insert.run(ticker.toUpperCase());

    return NextResponse.json({ success: true, message: `Ticker ${ticker} adicionado à fila de busca.` });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao adicionar à fila' }, { status: 500 });
  }
}
