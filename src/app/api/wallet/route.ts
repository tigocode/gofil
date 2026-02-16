import { NextResponse } from 'next/server';
import { query } from '@/src/lib/db';

export async function GET() {
  try {
    const items: any = await query('SELECT * FROM wallet ORDER BY added_at DESC');
    // Garantir que campos numéricos sejam de fato números
    const parsedItems = items.map((item: any) => ({
      ...item,
      qty: Number(item.qty || 0),
      avg_price: Number(item.avg_price || 0)
    }));
    return NextResponse.json(parsedItems);
  } catch (error) {
    console.error('Erro ao buscar carteira:', error);
    return NextResponse.json({ error: 'Erro ao buscar carteira' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { ticker, qty, avg_price } = await request.json();
    if (!ticker) return NextResponse.json({ error: 'Ticker é obrigatório' }, { status: 400 });

    const tickerUpper = ticker.toUpperCase();
    const quantity = Number(qty || 0);
    const price = Number(avg_price || 0);

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
