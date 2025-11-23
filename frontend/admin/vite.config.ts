import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      // Garantir que o React está configurado corretamente
      jsxRuntime: 'automatic',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Garantir que o Vite resolve extensões corretamente
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  server: {
    port: 5173,
    strictPort: true,
    // CRÍTICO: Permitir acesso de qualquer host (necessário para Playwright)
    // host: true permite acesso de qualquer IP, incluindo do Playwright
    host: true, // Equivale a '0.0.0.0' - permite acesso de qualquer IP
    // Proxy removido - cada serviço tem sua própria URL configurada nos services
    // Se necessário, pode ser adicionado proxy específico por rota
    // Aumentar o timeout para evitar problemas com arquivos grandes
    hmr: {
      port: 5173,
    },
    // Aumentar o tempo de espera para processar módulos
    warmup: {
      clientFiles: ['./src/main.tsx', './src/App.tsx'],
    },
  },
  // Garantir que o Vite está otimizando corretamente
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    // Forçar pré-bundle de dependências para evitar problemas de carregamento
    force: false,
  },
  // Configuração de build para garantir que os módulos sejam processados corretamente
  build: {
    // Não é necessário para dev, mas ajuda a garantir configuração correta
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
});

