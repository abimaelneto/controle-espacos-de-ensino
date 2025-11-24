# Admin Frontend

Interface administrativa para o sistema de controle de espaços de ensino.

## Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **React Router** - Roteamento
- **Zustand** - Gerenciamento de estado
- **shadcn/ui** - Componentes UI (adaptado para PUCPR)
- **Tailwind CSS** - Estilização
- **Axios** - Cliente HTTP

## Estrutura

```
src/
├── components/
│   ├── ui/          # Componentes base (shadcn/ui)
│   ├── features/    # Componentes de features
│   └── layout.tsx   # Layout principal
├── pages/           # Páginas da aplicação
├── stores/          # Stores Zustand
├── services/        # Serviços de API
├── hooks/           # Custom hooks
├── lib/             # Utilitários
└── types/           # Tipos TypeScript
```

## Scripts

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview
npm run preview

# Lint
npm run lint
```

## Desenvolvimento

O frontend está configurado para fazer proxy das requisições `/api` para `http://localhost:3001` (API Gateway/Traefik).

## Próximos Passos

- [ ] Integração com Auth Service
- [ ] Listagem e CRUD de Alunos
- [ ] Listagem e CRUD de Salas
- [ ] Dashboard com métricas reais
- [ ] Gráficos de analytics

