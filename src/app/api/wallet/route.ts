import { NextResponse } from 'next/server';
import { query } from '@/src/lib/db';

export async function GET() {
  try {
    const items = await query('SELECT * FROM wallet ORDER BY added_at DESC');
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar carteira' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { ticker, qty, avg_price } = await request.json();
    if (!ticker) return NextResponse.json({ error: 'Ticker é obrigatório' }, { status: 400 });

    const tickerUpper = ticker.toUpperCase();
    const quantity = qty || 0;
    const price = avg_price || 0;

    // No MySQL usamos ON DUPLICATE KEY UPDATE
    await query(`
      INSERT INTO wallet (ticker, qty, avg_price, added_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
        qty = VALUES(qty),
        avg_price = VALUES(avg_price),
        added_at = CURRENT_TIMESTAMP
    `, [tickerUpper, quantity, price]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro na API /api/wallet (POST):', error);
    return NextResponse.json({ error: 'Erro ao salvar item na carteira: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    
    if (!ticker) return NextResponse.json({ error: 'Ticker é obrigatório' }, { status: 400 });

    await query('DELETE FROM wallet WHERE ticker = ?', [ticker.toUpperCase()]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro na API /api/wallet (DELETE):', error);
    return NextResponse.json({ error: 'Erro ao remover item da carteira: ' + error.message }, { status: 500 });
  }
}
