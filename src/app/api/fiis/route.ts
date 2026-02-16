import { NextResponse } from 'next/server';
import db from '@/src/lib/db';

export async function GET() {
  try {
    const fiis = db.prepare('SELECT * FROM fiis ORDER BY ticker ASC').all();
    // Parse dividends JSON
    const parsedFiis = fiis.map((fii: any) => ({
      ...fii,
      dividends: JSON.parse(fii.dividends || '[]')
    }));
    return NextResponse.json(parsedFiis);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar FIIs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { ticker, name, sector, price, pvp, dy_12m, vacancy, liquidity, assets_count, dividends } = data;

    const upsert = db.prepare(`
      INSERT INTO fiis (ticker, name, sector, price, pvp, dy_12m, vacancy, liquidity, assets_count, dividends, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(ticker) DO UPDATE SET
        name=excluded.name,
        sector=excluded.sector,
        price=excluded.price,
        pvp=excluded.pvp,
        dy_12m=excluded.dy_12m,
        vacancy=excluded.vacancy,
        liquidity=excluded.liquidity,
        assets_count=excluded.assets_count,
        dividends=excluded.dividends,
        updated_at=CURRENT_TIMESTAMP
    `);

    upsert.run(
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
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Erro ao salvar FII' }, { status: 500 });
  }
}
