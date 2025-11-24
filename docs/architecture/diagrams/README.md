# Diagramas do Projeto

Esta pasta contém os diagramas Mermaid do projeto separados em arquivos individuais para facilitar a visualização.

## 📊 Diagramas Disponíveis

1. **[Arquitetura Geral do Sistema](./01-arquitetura-geral.md)**
   - Visão completa do sistema com todos os componentes
   - Frontend, API Gateway, Microsserviços, Infraestrutura e Observabilidade

2. **[Fluxo de Comunicação entre Microsserviços](./02-fluxo-comunicacao.md)**
   - Diagrama de sequência mostrando interações entre serviços
   - Fluxo completo de autenticação e check-in

3. **[Arquitetura Hexagonal (Ports and Adapters)](./03-arquitetura-hexagonal.md)**
   - Estrutura interna de um microsserviço
   - Separação entre Domain, Application, Infrastructure e Presentation

4. **[Fluxo de Check-in Detalhado](./04-fluxo-checkin.md)**
   - Fluxograma completo do processo de check-in
   - Inclui validações, locks, transações e tratamento de erros

5. **[Infraestrutura e Deploy](./05-infraestrutura-deploy.md)**
   - Ambientes de desenvolvimento, Kubernetes local e AWS
   - Pipeline CI/CD

6. **[Observabilidade e Monitoramento](./06-observabilidade.md)**
   - Coleta, armazenamento e visualização de métricas
   - Dashboards e alertas

7. **[Proteções contra Race Conditions](./07-race-conditions.md)**
   - Camadas de proteção implementadas
   - Cenários protegidos

8. **[Estrutura de Domínios (DDD)](./08-ddd-bounded-contexts.md)**
   - Bounded contexts e suas integrações
   - Entidades, Value Objects e Events

9. **[Fluxo de Testes](./09-fluxo-testes.md)**
   - Pirâmide de testes
   - Cobertura por nível

## 🎨 Legenda de Cores

- **Azul claro**: Microsserviços e aplicações
- **Amarelo claro**: Gateways e orquestração
- **Vermelho claro**: Infraestrutura (DB, Cache, Message Broker)
- **Verde claro**: Observabilidade e monitoramento

## 📖 Como Visualizar

### GitHub/GitLab
Os diagramas são renderizados automaticamente quando visualizados no GitHub ou GitLab.

### VS Code
Instale a extensão **Markdown Preview Mermaid Support** ou **Mermaid Preview**.

### Online
1. Copie o código Mermaid (entre ```mermaid e ```)
2. Cole em [Mermaid Live Editor](https://mermaid.live/)
3. Visualize e exporte como PNG/SVG

### CLI
```bash
# Instalar Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Gerar imagem
mmdc -i 01-arquitetura-geral.md -o 01-arquitetura-geral.png
```

## 🔗 Links Úteis

- [Mermaid Documentation](https://mermaid.js.org/)
- [Mermaid Live Editor](https://mermaid.live/)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid)

