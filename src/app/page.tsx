import Link from 'next/link'; // <--- 1. Importe isso no topo

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-blue-600">
        Gestor Sales
      </h1>
      <p className="mt-4 text-xl mb-8">
        Automação inteligente para sua ótica.
      </p>

      {/* 2. Adicione este botão */}
      <Link 
        href="/dashboard"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
      >
        Acessar Painel
      </Link>

    </main>
  );
}