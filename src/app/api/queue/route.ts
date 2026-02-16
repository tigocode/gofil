import { NextResponse } from 'next/server';
import { query } from '@/src/lib/db';

export async function GET() {
  try {
    const pending = await query("SELECT ticker FROM extraction_queue WHERE status = 'pending'");
    return NextResponse.json(pending);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ticker = body.ticker?.toUpperCase().trim();
    
    if (!ticker || ticker.length < 5) {
      return NextResponse.json({ error: 'Ticker inválido (mínimo 5 caracteres)' }, { status: 400 });
    }

    console.log(`Adicionando ticker à fila: ${ticker}`);

    // No MySQL usamos INSERT IGNORE
    await query("INSERT IGNORE INTO extraction_queue (ticker, status) VALUES (?, 'pending')", [ticker]);

    return NextResponse.json({ success: true, message: `Ticker ${ticker} adicionado à fila de busca.` });
  } catch (error: any) {
    console.error('Erro na API /api/queue:', error);
    return NextResponse.json({ error: 'Erro interno ao adicionar à fila: ' + error.message }, { status: 500 });
  }
}
