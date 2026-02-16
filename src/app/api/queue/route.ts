import { NextResponse } from 'next/server';
import db from '@/src/lib/db';

export async function GET() {
  const pending = db.prepare("SELECT ticker FROM extraction_queue WHERE status = 'pending'").all();
  return NextResponse.json(pending);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ticker = body.ticker?.toUpperCase().trim();
    
    if (!ticker || ticker.length < 5) {
      return NextResponse.json({ error: 'Ticker inválido (mínimo 5 caracteres)' }, { status: 400 });
    }

    console.log(`Adicionando ticker à fila: ${ticker}`);

    const insert = db.prepare("INSERT OR IGNORE INTO extraction_queue (ticker, status) VALUES (?, 'pending')");
    const result = insert.run(ticker);

    if (result.changes === 0) {
      return NextResponse.json({ message: `Ticker ${ticker} já está na fila ou já foi processado.` }, { status: 200 });
    }

    return NextResponse.json({ success: true, message: `Ticker ${ticker} adicionado à fila de busca.` });
  } catch (error: any) {
    console.error('Erro na API /api/queue:', error);
    return NextResponse.json({ error: 'Erro interno ao adicionar à fila: ' + error.message }, { status: 500 });
  }
}
