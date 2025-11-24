# Política de Segurança

## 📋 Índice

- [Responsabilidades](#responsabilidades)
- [Autenticação](#autenticação)
- [Autorização](#autorização)
- [Proteção de Dados](#proteção-de-dados)
- [Segurança de APIs](#segurança-de-apis)
- [Segurança de Infraestrutura](#segurança-de-infraestrutura)
- [Gestão de Vulnerabilidades](#gestão-de-vulnerabilidades)
- [Boas Práticas](#boas-práticas)

## 🛡️ Responsabilidades

### Equipe de Desenvolvimento

- Implementar segurança desde o design
- Seguir práticas de segurança
- Reportar vulnerabilidades
- Revisar código com foco em segurança

### Equipe de Operações

- Manter infraestrutura atualizada
- Monitorar logs de segurança
- Responder a incidentes
- Gerenciar secrets

## 🔐 Autenticação

### JWT Tokens

- **Access Token**: Expira em 1 hora
- **Refresh Token**: Expira em 7 dias
- **Algoritmo**: HS256
- **Storage**: HttpOnly cookies (recomendado) ou localStorage

### Senhas

- **Mínimo**: 8 caracteres
- **Requisitos**: Letras maiúsculas, minúsculas, números e símbolos
- **Hash**: bcrypt com salt rounds 10
- **Nunca** armazenar senhas em texto plano

### Boas Práticas

```typescript
// ✅ Bom
const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hashedPassword);

// ❌ Evitar
const hashedPassword = md5(password); // Muito fraco
```

## 🔒 Autorização

### Role-Based Access Control (RBAC)

**Roles**:
- **ADMIN**: Acesso total
- **STUDENT**: Acesso limitado (próprios dados)
- **MONITOR**: Acesso para monitoramento

### Guards NestJS

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Post('/api/v1/students')
async create(@Body() dto: CreateStudentDto) {
  // Apenas ADMIN pode criar alunos
}
```

### Validação de Permissões

- Sempre validar no backend
- Nunca confiar apenas no frontend
- Validar ownership de recursos

## 🔒 Proteção de Dados

### Dados Sensíveis

- **CPF**: Armazenado com hash ou criptografado
- **Email**: Validado e único
- **Senhas**: Sempre hasheadas (bcrypt)
- **Tokens**: Armazenados de forma segura

### Criptografia

- **Em Trânsito**: TLS/SSL (HTTPS)
- **Em Repouso**: Criptografia de banco de dados
- **Secrets**: Gerenciados via variáveis de ambiente ou secret managers

### LGPD/GDPR

- Consentimento explícito
- Direito ao esquecimento
- Portabilidade de dados
- Notificação de vazamentos

## 🌐 Segurança de APIs

### CORS

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Rate Limiting

- Implementar rate limiting (futuro)
- Prevenir brute force
- Limitar requisições por IP

### Input Validation

```typescript
// ✅ Usar class-validator
export class CreateStudentDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(11)
  @MaxLength(11)
  cpf: string;
}
```

### SQL Injection Prevention

- **TypeORM**: Usa prepared statements
- **Nunca** concatenar queries SQL
- Validar todos os inputs

### XSS Prevention

- Sanitizar inputs
- Escapar outputs
- Content Security Policy (CSP)
- Helmet.js para headers

## 🏗️ Segurança de Infraestrutura

### Docker

- Imagens base atualizadas
- Não executar como root
- Secrets via environment variables
- Scan de vulnerabilidades

### Kubernetes

- Network policies
- RBAC configurado
- Secrets management
- Pod security policies

### AWS

- IAM roles com least privilege
- Security groups configurados
- VPC com subnets privadas
- Encryption at rest

### Banco de Dados

- Conexões SSL/TLS
- Credenciais seguras
- Backups criptografados
- Acesso restrito

## 🐛 Gestão de Vulnerabilidades

### Dependências

```bash
# Verificar vulnerabilidades
npm audit

# Atualizar dependências
npm audit fix

# Atualizar major versions
npm update
```

### Scanning

- **Dependabot**: Atualizações automáticas
- **Snyk**: Scan de vulnerabilidades
- **OWASP ZAP**: Testes de segurança

### Processo de Reporte

1. **Identificar** vulnerabilidade
2. **Reportar** via issue privada ou email
3. **Avaliar** criticidade
4. **Corrigir** em até 30 dias (crítico) ou 90 dias (médio)
5. **Comunicar** correção

### Severidade

- **Crítico**: Corrigir em 24-48h
- **Alto**: Corrigir em 7 dias
- **Médio**: Corrigir em 30 dias
- **Baixo**: Corrigir em 90 dias

## ✅ Boas Práticas

### Código

1. **Princípio do Menor Privilégio**: Apenas permissões necessárias
2. **Defense in Depth**: Múltiplas camadas de segurança
3. **Fail Secure**: Em caso de erro, negar acesso
4. **Input Validation**: Validar todos os inputs
5. **Output Encoding**: Escapar outputs
6. **Error Handling**: Não expor informações sensíveis em erros

### Secrets

```typescript
// ✅ Bom
const dbPassword = process.env.DATABASE_PASSWORD;

// ❌ Evitar
const dbPassword = 'hardcoded-password';
```

### Logs

- **Não** logar senhas ou tokens
- **Não** logar dados sensíveis completos
- Logar tentativas de acesso suspeitas
- Logar erros de autenticação

### Headers de Segurança

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

## 🔍 Checklist de Segurança

### Antes do Deploy

- [ ] Todas as dependências atualizadas
- [ ] Sem vulnerabilidades conhecidas
- [ ] Secrets não hardcoded
- [ ] Input validation implementada
- [ ] Autenticação e autorização testadas
- [ ] HTTPS configurado
- [ ] CORS configurado corretamente
- [ ] Rate limiting implementado (se aplicável)
- [ ] Logs não expõem dados sensíveis
- [ ] Backups configurados

### Revisão de Código

- [ ] Verificar uso de secrets
- [ ] Verificar validação de inputs
- [ ] Verificar autorização adequada
- [ ] Verificar tratamento de erros
- [ ] Verificar logs

## 📚 Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [LGPD](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)

## 📞 Reportar Vulnerabilidade

Se você encontrou uma vulnerabilidade de segurança:

1. **Não** abra uma issue pública
2. Envie email para: [security@example.com]
3. Inclua:
   - Descrição da vulnerabilidade
   - Passos para reproduzir
   - Impacto potencial
   - Sugestões de correção (se houver)

**Obrigado por ajudar a manter o projeto seguro!** 🛡️

---

**Última atualização**: 2025-01-20

