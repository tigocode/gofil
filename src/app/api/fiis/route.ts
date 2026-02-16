import { NextResponse } from 'next/server';
import { query } from '@/src/lib/db';

export async function GET() {
  try {
    const fiis: any = await query('SELECT * FROM fiis ORDER BY ticker ASC');
    // Parse dividends JSON
    const parsedFiis = fiis.map((fii: any) => ({
      ...fii,
      dividends: typeof fii.dividends === 'string' ? JSON.parse(fii.dividends || '[]') : fii.dividends
    }));
    return NextResponse.json(parsedFiis);
  } catch (error: any) {
    console.error('Erro ao buscar FIIs:', error);
    return NextResponse.json({ error: 'Erro ao buscar FIIs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { ticker, name, sector, price, pvp, dy_12m, vacancy, liquidity, assets_count, dividends } = data;

    await query(`
      INSERT INTO fiis (ticker, name, sector, price, pvp, dy_12m, vacancy, liquidity, assets_count, dividends, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
        name=VALUES(name),
        sector=VALUES(sector),
        price=VALUES(price),
        pvp=VALUES(pvp),
        dy_12m=VALUES(dy_12m),
        vacancy=VALUES(vacancy),
        liquidity=VALUES(liquidity),
        assets_count=VALUES(assets_count),
        dividends=VALUES(dividends),
        updated_at=CURRENT_TIMESTAMP
    `, [
      ticker, 
      name, 
      sector, 
      price, 
      pvp, 
      dy_12m, 
      vacancy, 
      liquidity, 
      assets_count, 
      JSON.stringify(dividends)
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Erro ao salvar FII: ' + error.message }, { status: 500 });
  }
}
