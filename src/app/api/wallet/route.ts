import { NextResponse } from 'next/server';
import db from '@/src/lib/db';

export async function GET() {
  try {
    const items = db.prepare('SELECT * FROM wallet ORDER BY added_at DESC').all();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar carteira' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { ticker, qty, avg_price } = await request.json();
    if (!ticker) return NextResponse.json({ error: 'Ticker é obrigatório' }, { status: 400 });

    const upsert = db.prepare(`
      INSERT INTO wallet (ticker, qty, avg_price, added_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(ticker) DO UPDATE SET
        qty=excluded.qty,
        avg_price=excluded.avg_price,
        added_at=CURRENT_TIMESTAMP
    `);
    upsert.run(ticker.toUpperCase(), qty || 0, avg_price || 0);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar item na carteira' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    
    if (!ticker) return NextResponse.json({ error: 'Ticker é obrigatório' }, { status: 400 });

    const del = db.prepare('DELETE FROM wallet WHERE ticker = ?');
    del.run(ticker.toUpperCase());

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover item da carteira' }, { status: 500 });
  }
}
