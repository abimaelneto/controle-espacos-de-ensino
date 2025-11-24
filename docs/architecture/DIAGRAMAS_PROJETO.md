# Diagramas do Projeto - Controle de Espaços de Ensino

> **📁 Os diagramas foram separados em arquivos individuais para facilitar a visualização.**
> 
> Acesse a pasta [`diagrams/`](./diagrams/) para ver cada diagrama em um arquivo separado.

## 📊 Índice dos Diagramas

1. **[Arquitetura Geral do Sistema](./diagrams/01-arquitetura-geral.md)**
   - Visão completa do sistema com todos os componentes
   - Frontend, API Gateway, Microsserviços, Infraestrutura e Observabilidade

2. **[Fluxo de Comunicação entre Microsserviços](./diagrams/02-fluxo-comunicacao.md)**
   - Diagrama de sequência mostrando interações entre serviços
   - Fluxo completo de autenticação e check-in

3. **[Arquitetura Hexagonal (Ports and Adapters)](./diagrams/03-arquitetura-hexagonal.md)**
   - Estrutura interna de um microsserviço
   - Separação entre Domain, Application, Infrastructure e Presentation

4. **[Fluxo de Check-in Detalhado](./diagrams/04-fluxo-checkin.md)**
   - Fluxograma completo do processo de check-in
   - Inclui validações, locks, transações e tratamento de erros

5. **[Infraestrutura e Deploy](./diagrams/05-infraestrutura-deploy.md)**
   - Ambientes de desenvolvimento, Kubernetes local e AWS
   - Pipeline CI/CD

6. **[Observabilidade e Monitoramento](./diagrams/06-observabilidade.md)**
   - Coleta, armazenamento e visualização de métricas
   - Dashboards e alertas

7. **[Proteções contra Race Conditions](./diagrams/07-race-conditions.md)**
   - Camadas de proteção implementadas
   - Cenários protegidos

8. **[Estrutura de Domínios (DDD)](./diagrams/08-ddd-bounded-contexts.md)**
   - Bounded contexts e suas integrações
   - Entidades, Value Objects e Events

9. **[Fluxo de Testes](./diagrams/09-fluxo-testes.md)**
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
mmdc -i diagrams/01-arquitetura-geral.md -o diagrams/01-arquitetura-geral.png
```

## 🔗 Links Úteis

- [Mermaid Documentation](https://mermaid.js.org/)
- [Mermaid Live Editor](https://mermaid.live/)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid)
