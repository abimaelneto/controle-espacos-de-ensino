# ☁️ Adaptadores AWS e Estratégia de Deploy

## 📋 Visão Geral

Este documento descreve a estratégia de adaptadores para AWS, permitindo que o sistema funcione localmente durante o desenvolvimento e seja facilmente adaptado para AWS em produção, **sem custos durante o desenvolvimento**.

---

## 🏗️ Arquitetura de Adaptadores

### Princípio: Ports and Adapters (Hexagonal Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                    DOMAIN (CORE)                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              PORTS (Interfaces)                      │   │
│  │  - IUserRepository                                    │   │
│  │  - IEventPublisher                                    │   │
│  │  - ICacheService                                      │   │
│  │  - ILogger                                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│              ADAPTERS (Implementações)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   LOCAL      │  │     AWS       │  │   OUTROS      │   │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤   │
│  │ MySQL        │  │ RDS (MySQL)  │  │ PostgreSQL    │   │
│  │ Kafka        │  │ MSK          │  │ RabbitMQ     │   │
│  │ Redis        │  │ ElastiCache  │  │ Memcached    │   │
│  │ Winston      │  │ CloudWatch   │  │ Datadog      │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 Adaptadores por Serviço

### 1. Persistência (Database)

#### Port (Interface)

```typescript
// domain/ports/repositories/user.repository.port.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
```

#### Adapter Local (MySQL)

```typescript
// infrastructure/adapters/persistence/mysql/mysql-user.repository.adapter.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../../domain/ports/repositories/user.repository.port';
import { User } from '../../../../domain/entities/user.entity';
import { UserEntity } from './user.entity';

@Injectable()
export class MySQLUserRepositoryAdapter implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const entity = await this.repository.findOne({ 
      where: { email: email.toString() } 
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(user: User): Promise<void> {
    const entity = this.toEntity(user);
    await this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(entity: UserEntity): User {
    // Mapeia TypeORM Entity para Domain Entity
  }

  private toEntity(user: User): UserEntity {
    // Mapeia Domain Entity para TypeORM Entity
  }
}
```

#### Adapter AWS (RDS)

```typescript
// infrastructure/adapters/persistence/rds/rds-user.repository.adapter.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../../domain/ports/repositories/user.repository.port';
import { User } from '../../../../domain/entities/user.entity';
import { UserEntity } from '../mysql/user.entity'; // Mesma entidade TypeORM

@Injectable()
export class RDSUserRepositoryAdapter implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  // Mesma implementação do MySQL, apenas configuração diferente
  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  // ... resto da implementação igual ao MySQL
}
```

**Configuração TypeORM:**

```typescript
// infrastructure/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  config: ConfigService,
): TypeOrmModuleOptions => {
  const dbType = config.get<string>('DATABASE_TYPE', 'mysql');

  const baseConfig: TypeOrmModuleOptions = {
    type: 'mysql',
    host: config.get<string>('DATABASE_HOST'),
    port: config.get<number>('DATABASE_PORT'),
    username: config.get<string>('DATABASE_USER'),
    password: config.get<string>('DATABASE_PASSWORD'),
    database: config.get<string>('DATABASE_NAME'),
    entities: [__dirname + '/../adapters/persistence/**/*.entity.ts'],
    synchronize: config.get<string>('NODE_ENV') !== 'production',
  };

  // Configurações específicas para RDS
  if (dbType === 'rds') {
    return {
      ...baseConfig,
      ssl: {
        rejectUnauthorized: false,
      },
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    };
  }

  return baseConfig;
};
```

---

### 2. Mensageria (Event Publishing)

#### Port (Interface)

```typescript
// domain/ports/messaging/event-publisher.port.ts
export interface IEventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishMany(events: DomainEvent[]): Promise<void>;
}
```

#### Adapter Local (Kafka)

```typescript
// infrastructure/adapters/messaging/kafka/kafka-event-publisher.adapter.ts
import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { IEventPublisher } from '../../../../domain/ports/messaging/event-publisher.port';
import { DomainEvent } from '../../../../domain/events/domain-event';

@Injectable()
export class KafkaEventPublisherAdapter implements IEventPublisher {
  private producer: any;

  constructor(private brokers: string) {
    const kafka = new Kafka({
      clientId: 'auth-service',
      brokers: brokers.split(','),
    });
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
  }

  async publish(event: DomainEvent): Promise<void> {
    await this.producer.send({
      topic: event.topic,
      messages: [{
        key: event.aggregateId,
        value: JSON.stringify(event.payload),
        headers: {
          eventType: event.eventType,
          occurredAt: event.occurredAt.toISOString(),
        },
      }],
    });
  }

  async publishMany(events: DomainEvent[]): Promise<void> {
    const messages = events.map(event => ({
      topic: event.topic,
      messages: [{
        key: event.aggregateId,
        value: JSON.stringify(event.payload),
        headers: {
          eventType: event.eventType,
          occurredAt: event.occurredAt.toISOString(),
        },
      }],
    }));

    await this.producer.sendBatch({ topicMessages: messages });
  }
}
```

#### Adapter AWS (MSK)

```typescript
// infrastructure/adapters/messaging/msk/msk-event-publisher.adapter.ts
import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { IEventPublisher } from '../../../../domain/ports/messaging/event-publisher.port';
import { DomainEvent } from '../../../../domain/events/domain-event';

@Injectable()
export class MSKEventPublisherAdapter implements IEventPublisher {
  private producer: any;

  constructor(
    private brokers: string,
    private region: string,
  ) {
    const kafka = new Kafka({
      clientId: 'auth-service',
      brokers: brokers.split(','),
      ssl: true,
      sasl: {
        mechanism: 'aws',
        authorizationIdentity: `arn:aws:iam::${process.env.AWS_ACCOUNT_ID}:user/kafka`,
      },
    });
    this.producer = kafka.producer();
  }

  // Mesma implementação do Kafka, apenas configuração SSL/SASL diferente
  async publish(event: DomainEvent): Promise<void> {
    await this.producer.send({
      topic: event.topic,
      messages: [{
        key: event.aggregateId,
        value: JSON.stringify(event.payload),
        headers: {
          eventType: event.eventType,
          occurredAt: event.occurredAt.toISOString(),
        },
      }],
    });
  }

  async publishMany(events: DomainEvent[]): Promise<void> {
    // Mesma implementação
  }
}
```

---

### 3. Cache

#### Port (Interface)

```typescript
// domain/ports/cache/cache-service.port.ts
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
```

#### Adapter Local (Redis)

```typescript
// infrastructure/adapters/cache/redis/redis-cache-service.adapter.ts
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ICacheService } from '../../../../domain/ports/cache/cache-service.port';

@Injectable()
export class RedisCacheServiceAdapter implements ICacheService {
  private client: Redis;

  constructor(
    private host: string,
    private port: number,
  ) {
    this.client = new Redis({
      host,
      port,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.setex(key, ttl, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }
}
```

#### Adapter AWS (ElastiCache)

```typescript
// infrastructure/adapters/cache/elasticache/elasticache-cache-service.adapter.ts
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ICacheService } from '../../../../domain/ports/cache/cache-service.port';

@Injectable()
export class ElastiCacheServiceAdapter implements ICacheService {
  private client: Redis;

  constructor(
    private host: string,
    private port: number,
  ) {
    // ElastiCache usa Redis, então a implementação é idêntica
    // Apenas a configuração de conexão pode ser diferente (SSL, etc.)
    this.client = new Redis({
      host,
      port,
      tls: {
        // Configurações TLS se necessário
      },
    });
  }

  // Mesma implementação do Redis
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  // ... resto igual ao Redis
}
```

---

### 4. Logging

#### Port (Interface)

```typescript
// domain/ports/logger/logger.port.ts
export interface ILogger {
  info(message: string, context?: any): void;
  error(message: string, error?: Error, context?: any): void;
  warn(message: string, context?: any): void;
  debug(message: string, context?: any): void;
}
```

#### Adapter Local (Winston)

```typescript
// infrastructure/adapters/logger/winston/winston-logger.adapter.ts
import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { ILogger } from '../../../../domain/ports/logger/logger.port';

@Injectable()
export class WinstonLoggerAdapter implements ILogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
      ],
    });
  }

  info(message: string, context?: any): void {
    this.logger.info(message, context);
  }

  error(message: string, error?: Error, context?: any): void {
    this.logger.error(message, { error, ...context });
  }

  warn(message: string, context?: any): void {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: any): void {
    this.logger.debug(message, context);
  }
}
```

#### Adapter AWS (CloudWatch)

```typescript
// infrastructure/adapters/logger/cloudwatch/cloudwatch-logger.adapter.ts
import { Injectable } from '@nestjs/common';
import { CloudWatchLogsClient, PutLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';
import { ILogger } from '../../../../domain/ports/logger/logger.port';

@Injectable()
export class CloudWatchLoggerAdapter implements ILogger {
  private client: CloudWatchLogsClient;
  private logGroupName: string;
  private logStreamName: string;

  constructor(
    private region: string,
    logGroupName: string,
  ) {
    this.client = new CloudWatchLogsClient({ region });
    this.logGroupName = logGroupName;
    this.logStreamName = `stream-${Date.now()}`;
  }

  info(message: string, context?: any): void {
    this.log('INFO', message, context);
  }

  error(message: string, error?: Error, context?: any): void {
    this.log('ERROR', message, { error: error?.message, stack: error?.stack, ...context });
  }

  warn(message: string, context?: any): void {
    this.log('WARN', message, context);
  }

  debug(message: string, context?: any): void {
    this.log('DEBUG', message, context);
  }

  private async log(level: string, message: string, context?: any): Promise<void> {
    const logEvent = {
      message: JSON.stringify({
        level,
        message,
        context,
        timestamp: new Date().toISOString(),
      }),
      timestamp: Date.now(),
    };

    try {
      await this.client.send(
        new PutLogEventsCommand({
          logGroupName: this.logGroupName,
          logStreamName: this.logStreamName,
          logEvents: [logEvent],
        }),
      );
    } catch (error) {
      // Fallback para console se CloudWatch falhar
      console.error('CloudWatch logging failed:', error);
      console.log(level, message, context);
    }
  }
}
```

---

## 🏭 Factory Pattern para Seleção de Adapters

```typescript
// infrastructure/providers/adapters.provider.ts
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '../../domain/ports/repositories/user.repository.port';
import { IEventPublisher } from '../../domain/ports/messaging/event-publisher.port';
import { ICacheService } from '../../domain/ports/cache/cache-service.port';
import { ILogger } from '../../domain/ports/logger/logger.port';

import { MySQLUserRepositoryAdapter } from '../adapters/persistence/mysql/mysql-user.repository.adapter';
import { RDSUserRepositoryAdapter } from '../adapters/persistence/rds/rds-user.repository.adapter';

import { KafkaEventPublisherAdapter } from '../adapters/messaging/kafka/kafka-event-publisher.adapter';
import { MSKEventPublisherAdapter } from '../adapters/messaging/msk/msk-event-publisher.adapter';

import { RedisCacheServiceAdapter } from '../adapters/cache/redis/redis-cache-service.adapter';
import { ElastiCacheServiceAdapter } from '../adapters/cache/elasticache/elasticache-cache-service.adapter';

import { WinstonLoggerAdapter } from '../adapters/logger/winston/winston-logger.adapter';
import { CloudWatchLoggerAdapter } from '../adapters/logger/cloudwatch/cloudwatch-logger.adapter';

@Module({
  providers: [
    {
      provide: 'USER_REPOSITORY',
      useFactory: (config: ConfigService) => {
        const dbType = config.get<string>('DATABASE_TYPE', 'mysql');
        
        if (dbType === 'rds') {
          return new RDSUserRepositoryAdapter(
            config.get('DATABASE_HOST'),
            config.get('DATABASE_PORT'),
          );
        }
        
        return new MySQLUserRepositoryAdapter(
          config.get('DATABASE_HOST'),
          config.get('DATABASE_PORT'),
        );
      },
      inject: [ConfigService],
    },
    {
      provide: 'EVENT_PUBLISHER',
      useFactory: (config: ConfigService) => {
        const messagingType = config.get<string>('MESSAGING_TYPE', 'kafka');
        
        if (messagingType === 'msk') {
          return new MSKEventPublisherAdapter(
            config.get('KAFKA_BROKERS'),
            config.get('AWS_REGION'),
          );
        }
        
        return new KafkaEventPublisherAdapter(
          config.get('KAFKA_BROKERS'),
        );
      },
      inject: [ConfigService],
    },
    {
      provide: 'CACHE_SERVICE',
      useFactory: (config: ConfigService) => {
        const cacheType = config.get<string>('CACHE_TYPE', 'redis');
        
        if (cacheType === 'elasticache') {
          return new ElastiCacheServiceAdapter(
            config.get('REDIS_HOST'),
            config.get('REDIS_PORT'),
          );
        }
        
        return new RedisCacheServiceAdapter(
          config.get('REDIS_HOST'),
          config.get('REDIS_PORT'),
        );
      },
      inject: [ConfigService],
    },
    {
      provide: 'LOGGER',
      useFactory: (config: ConfigService) => {
        const loggerType = config.get<string>('LOGGER_TYPE', 'winston');
        
        if (loggerType === 'cloudwatch') {
          return new CloudWatchLoggerAdapter(
            config.get('AWS_REGION'),
            config.get('LOG_GROUP_NAME'),
          );
        }
        
        return new WinstonLoggerAdapter();
      },
      inject: [ConfigService],
    },
  ],
  exports: ['USER_REPOSITORY', 'EVENT_PUBLISHER', 'CACHE_SERVICE', 'LOGGER'],
})
export class AdaptersModule {}
```

---

## 📝 Variáveis de Ambiente

### Desenvolvimento Local (.env.local)

```env
# Database
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=rootpassword
DATABASE_NAME=identity

# Messaging
MESSAGING_TYPE=kafka
KAFKA_BROKERS=localhost:9092

# Cache
CACHE_TYPE=redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Logger
LOGGER_TYPE=winston

# Node
NODE_ENV=development
```

### Produção AWS (.env.production)

```env
# Database
DATABASE_TYPE=rds
DATABASE_HOST=my-db.xxxxx.us-east-1.rds.amazonaws.com
DATABASE_PORT=3306
DATABASE_USER=admin
DATABASE_PASSWORD=${RDS_PASSWORD}
DATABASE_NAME=identity

# Messaging
MESSAGING_TYPE=msk
KAFKA_BROKERS=b-1.xxxxx.c1.kafka.us-east-1.amazonaws.com:9092,b-2.xxxxx.c1.kafka.us-east-1.amazonaws.com:9092
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012

# Cache
CACHE_TYPE=elasticache
REDIS_HOST=my-cache.xxxxx.cache.amazonaws.com
REDIS_PORT=6379

# Logger
LOGGER_TYPE=cloudwatch
LOG_GROUP_NAME=/aws/ecs/auth-service
AWS_REGION=us-east-1

# Node
NODE_ENV=production
```

---

## 🚀 Deploy na AWS

### 1. Terraform para Infraestrutura AWS

```hcl
# infrastructure/terraform/modules/rds/main.tf
resource "aws_db_instance" "main" {
  identifier = "controle-espacos-db"
  engine     = "mysql"
  engine_version = "8.0"
  instance_class = "db.t3.micro"
  allocated_storage = 20
  storage_type = "gp2"
  
  db_name  = "identity"
  username = "admin"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  skip_final_snapshot    = false
}

# infrastructure/terraform/modules/msk/main.tf
resource "aws_msk_cluster" "main" {
  cluster_name           = "controle-espacos-kafka"
  kafka_version          = "3.5.1"
  number_of_broker_nodes = 2
  
  broker_node_group_info {
    instance_type = "kafka.t3.small"
    client_subnets = var.subnet_ids
    security_groups = [aws_security_group.msk.id]
  }
}

# infrastructure/terraform/modules/elasticache/main.tf
resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "controle-espacos-redis"
  description                = "Redis for controle-espacos"
  node_type                  = "cache.t3.micro"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  num_cache_clusters         = 2
  automatic_failover_enabled = true
}
```

### 2. EKS Deployment

```yaml
# infrastructure/kubernetes/deployments/auth-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: identity
spec:
  replicas: 2
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: your-registry/auth-service:latest
        env:
        - name: DATABASE_TYPE
          value: "rds"
        - name: DATABASE_HOST
          valueFrom:
            secretKeyRef:
              name: rds-secret
              key: host
        - name: MESSAGING_TYPE
          value: "msk"
        - name: CACHE_TYPE
          value: "elasticache"
        - name: LOGGER_TYPE
          value: "cloudwatch"
        - name: AWS_REGION
          value: "us-east-1"
```

---

## ✅ Vantagens desta Abordagem

1. **Zero Custo em Desenvolvimento:** Tudo roda localmente
2. **Fácil Migração:** Apenas mudar variáveis de ambiente
3. **Testabilidade:** Fácil mockar adapters em testes
4. **Flexibilidade:** Pode adicionar novos adapters (PostgreSQL, RabbitMQ, etc.)
5. **Manutenibilidade:** Domínio isolado de detalhes técnicos
6. **Cloud-Ready:** Pronto para AWS, Azure, GCP

---

**Última atualização:** 2025-01-XX

