# Student Frontend - Check-in

Interface para alunos realizarem check-in nas salas de forma segura.

## Funcionalidades de Segurança

### Métodos de Identificação

1. **Matrícula** (Recomendado)
   - Validação no banco de dados
   - Formato: 5-16 caracteres alfanuméricos
   - Rápido e simples

2. **CPF**
   - Validação de formato (11 dígitos)
   - Verificação no banco de dados
   - Criptografado em trânsito

3. **QR Code**
   - QR Code pessoal do aluno
   - Scanner de câmera
   - Leitura instantânea

4. **Biometria** (Futuro)
   - Integração com sensor biométrico
   - Máxima segurança
   - Identificação instantânea

## Fluxo de Check-in

1. Aluno acessa via QR Code da sala ou link direto
2. Sistema exibe informações da sala
3. Aluno escolhe método de identificação
4. Aluno informa dados de identificação
5. Sistema valida em tempo real:
   - Formato dos dados
   - Existência no banco
   - Status ativo do aluno
   - Permissão para usar a sala
6. Check-in confirmado ou erro exibido

## Validações de Segurança

- ✅ Validação de formato antes do envio
- ✅ Verificação de existência no banco de dados
- ✅ Verificação de status ativo do aluno
- ✅ Prevenção de check-in duplicado
- ✅ Registro de auditoria
- ✅ Criptografia em trânsito (HTTPS)
- ✅ Rate limiting no backend

## UI/UX

- Interface limpa e intuitiva
- Feedback visual imediato
- Suporte a múltiplos métodos
- Acessibilidade (WCAG 2.1)
- Responsivo (mobile-first)

