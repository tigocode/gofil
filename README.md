# GO FIIs - Dashboard de Análise de Fundos Imobiliários

![GO FIIs Logo](https://via.placeholder.com/150x50?text=GO+FIIs) <!-- Substitua por uma imagem real se disponível -->

Uma plataforma web moderna para análise e acompanhamento de Fundos de Investimento Imobiliário (FIIs) brasileiros. Utiliza um algoritmo de 6 pilares para avaliar riscos e oportunidades, oferecendo dashboards interativos, rankings e gestão de carteira.

## 🚀 Funcionalidades

- **Análise de 6 Pilares**: Avaliação automática baseada em P/VP, Dividend Yield, Vacância, Liquidez, Diversificação e Consistência de dividendos.
- **Dashboard Interativo**: Visualização de cards de FIIs com filtros por setor e busca por ticker/nome.
- **Ranking Geral**: Tabela ordenada por score, destacando os melhores ativos.
- **Carteira Pessoal**: Acompanhamento de posições, cálculo de rendimento mensal e score ponderado da carteira.
- **Modal Detalhado**: Análise aprofundada com gráficos de dividendos históricos e raio-X de riscos.
- **Design Responsivo**: Interface otimizada para desktop e mobile, com tema escuro e efeitos glassmorphism.
- **Integração com Dados**: Suporte para dados mockados (expansível para APIs reais).

## 🛠️ Tecnologias Utilizadas

- **Framework**: [Next.js 16](https://nextjs.org/) com App Router
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) com componentes customizados
- **Ícones**: [React Icons](https://react-icons.github.io/react-icons/)
- **Gráficos**: [Chart.js](https://www.chartjs.org/) com [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Linting**: [ESLint](https://eslint.org/) configurado para Next.js
- **Build Tool**: [PostCSS](https://postcss.org/) com Autoprefixer
- **Fonte**: [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts

## 📋 Pré-requisitos

- Node.js 18+ (recomendado: 20+)
- npm, yarn, pnpm ou bun
- Git

## 🏗️ Instalação e Configuração

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/gofil.git
   cd gofil
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   # ou
   bun install
   ```

3. **Configure variáveis de ambiente** (se necessário):
   - Crie um arquivo `.env.local` na raiz do projeto.
   - Adicione variáveis como chaves de API se integrar com dados reais.

4. **Execute o servidor de desenvolvimento**:
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   # ou
   bun dev
   ```

5. **Abra no navegador**:
   - Acesse [http://localhost:3000](http://localhost:3000) para visualizar a aplicação.

## 📁 Estrutura do Projeto

```
gofil/
├── .next/                 # Build do Next.js (gerado)
├── public/                # Arquivos estáticos
├── src/
│   ├── app/               # Páginas do App Router
│   │   ├── dashboard/     # Página do Dashboard
│   │   ├── carteira/      # Página da Carteira
│   │   ├── ranking/       # Página do Ranking
│   │   ├── globals.css    # Estilos globais
│   │   ├── layout.tsx     # Layout raiz
│   │   └── page.tsx       # Página inicial
│   ├── components/        # Componentes reutilizáveis
│   │   ├── FiiCard.tsx    # Card de FII
│   │   ├── WalletRow.tsx  # Linha da carteira
│   │   ├── Navbar.tsx     # Barra de navegação
│   │   └── FiiDetailsModal.tsx # Modal de detalhes
│   ├── data/              # Dados mockados
│   │   └── mocks.ts       # Interfaces e dados de exemplo
│   └── utils/             # Utilitários
│       └── fii-analyzer.ts # Lógica de análise de FIIs
├── .gitignore             # Arquivos ignorados pelo Git
├── eslint.config.mjs      # Configuração do ESLint
├── next.config.ts         # Configuração do Next.js
├── package.json           # Dependências e scripts
├── postcss.config.js      # Configuração do PostCSS
├── README.md              # Este arquivo
├── tailwind.config.ts     # Configuração do Tailwind CSS
└── tsconfig.json          # Configuração do TypeScript
```

## 🎯 Como Usar

1. **Dashboard**: Navegue pelos FIIs, aplique filtros por setor e busque por ticker. Clique em um card para ver detalhes.
2. **Carteira**: Visualize suas posições, rendimento mensal estimado e score da carteira.
3. **Ranking**: Veja a classificação geral dos ativos baseada no score de análise.
4. **Adicionar à Carteira**: Use o botão no modal de detalhes para gerenciar posições.

## 🤝 Contribuição

Contribuições são bem-vindas! Siga estes passos:

1. Fork o projeto.
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`).
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`).
4. Push para a branch (`git push origin feature/nova-funcionalidade`).
5. Abra um Pull Request.

### Diretrizes de Código
- Use TypeScript para tipagem forte.
- Siga as convenções do ESLint.
- Mantenha o design consistente com Tailwind CSS.
- Teste em dispositivos móveis e desktop.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

- **Autor**: [Seu Nome](https://github.com/seu-usuario)
- **Email**: seu-email@example.com
- **LinkedIn**: [Seu LinkedIn](https://linkedin.com/in/seu-perfil)

---

Desenvolvido com ❤️ para investidores em FIIs. Para mais informações, consulte a documentação do [Next.js](https://nextjs.org/docs).
