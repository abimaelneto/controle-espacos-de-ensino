# 🎯 Plano Detalhado - Controle de Espaços de Ensino (Plano 2 com DDD)

## 📊 Status do Projeto

**Plano Escolhido:** Plano 2 - Intermediário com DDD  
**Data de Criação:** 2025-01-XX  
**Status Atual:** 📝 Planejamento Detalhado  
**Última Atualização:** 2025-01-XX

---

## 🏗️ 1. Arquitetura: DDD + Ports and Adapters (Hexagonal)

### 1.0. Visão Geral da Arquitetura

A arquitetura combina **Domain-Driven Design (DDD)** com **Ports and Adapters (Hexagonal Architecture)** para garantir:
- **Isolamento do domínio** (DDD)
- **Adaptabilidade** (Ports and Adapters)
- **Testabilidade** (dependências invertidas)
- **Flexibilidade para mudanças** (banco, mensageria, cloud)

```
┌─────────────────────────────────────────────────────────────────┐
│                    HEXAGONAL ARCHITECTURE                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    APPLICATION LAYER                      │  │
│  │  (Use Cases, DTOs, Mappers)                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↕                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    DOMAIN LAYER (CORE)                    │  │
│  │  (Entities, Value Objects, Domain Services)              │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │              PORTS (Interfaces)                     │  │  │
│  │  │  - IUserRepository (Port)                          │  │  │
│  │  │  - IEventPublisher (Port)                          │  │  │
│  │  │  - ICacheService (Port)                            │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↕                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              ADAPTERS (Implementations)                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ MySQL       │  │ Kafka        │  │ Redis        │  │  │
│  │  │ Adapter     │  │ Adapter      │  │ Adapter      │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ RDS         │  │ MSK          │  │ ElastiCache  │  │  │
│  │  │ Adapter     │  │ Adapter      │  │ Adapter      │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              PRESENTATION LAYER                            │  │
│  │  (Controllers, Middleware, Routes)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.1. Ports (Interfaces - Contratos)

**Ports** definem os contratos que o domínio precisa, sem depender de implementações específicas:

```typescript
// Port: Repositório
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

// Port: Event Publisher
export interface IEventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishMany(events: DomainEvent[]): Promise<void>;
}

// Port: Cache Service
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

// Port: Logger
export interface ILogger {
  info(message: string, context?: any): void;
  error(message: string, error?: Error, context?: any): void;
  warn(message: string, context?: any): void;
  debug(message: string, context?: any): void;
}
```

### 1.2. Adapters (Implementações)

**Adapters** implementam os Ports, permitindo trocar implementações sem afetar o domínio:

```typescript
// Adapter: MySQL Repository
@Injectable()
export class MySQLUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    // Implementação MySQL
  }
}

// Adapter: RDS Repository (AWS)
@Injectable()
export class RDSUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    // Mesma implementação, mas conecta ao RDS
  }
}

// Adapter: Kafka Event Publisher
@Injectable()
export class KafkaEventPublisher implements IEventPublisher {
  constructor(private kafkaProducer: KafkaProducer) {}

  async publish(event: DomainEvent): Promise<void> {
    // Implementação Kafka
  }
}

// Adapter: MSK Event Publisher (AWS)
@Injectable()
export class MSKEventPublisher implements IEventPublisher {
  constructor(private mskProducer: MSKProducer) {}

  async publish(event: DomainEvent): Promise<void> {
    // Implementação MSK (mesma interface)
  }
}
```

### 1.3. Vantagens da Arquitetura Hexagonal

1. **Testabilidade:** Fácil criar mocks dos Ports
2. **Adaptabilidade:** Trocar MySQL por PostgreSQL, Kafka por RabbitMQ, etc.
3. **Cloud-Ready:** Adapters para AWS, Azure, GCP
4. **Manutenibilidade:** Domínio isolado de detalhes técnicos
5. **DDD Compatível:** Ports são os Repositories e Services do DDD

---

## 🏗️ 2. Arquitetura DDD (Domain-Driven Design)

### 1.1. Bounded Contexts

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTEXTO: IDENTITY                           │
│  Responsabilidade: Autenticação e Autorização                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Aggregate Root: User                                     │  │
│  │ Value Objects: Email, Password, Role                     │  │
│  │ Domain Services: AuthenticationService                  │  │
│  │ Repositories: IUserRepository                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CONTEXTO: ACADEMIC                           │
│  Responsabilidade: Gestão de Alunos                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Aggregate Root: Student                                   │  │
│  │ Value Objects: CPF, Matricula, Email                      │  │
│  │ Domain Services: StudentValidationService                 │  │
│  │ Repositories: IStudentRepository                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CONTEXTO: FACILITIES                          │
│  Responsabilidade: Gestão de Ambientes e Registros              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Aggregate Root: TeachingSpace, AttendanceRecord           │  │
│  │ Value Objects: SpaceType, Location, Capacity             │  │
│  │ Domain Services: AttendanceService, OccupancyService      │  │
│  │ Repositories: ISpaceRepository, IAttendanceRepository     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CONTEXTO: ANALYTICS                          │
│  Responsabilidade: Análise e Relatórios                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Aggregate Root: OccupancyReport                          │  │
│  │ Value Objects: TimeRange, Metrics                         │  │
│  │ Domain Services: AnalyticsService                         │  │
│  │ Repositories: IAnalyticsRepository                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2. Mapeamento de Bounded Contexts para Microsserviços

| Bounded Context | Microsserviço | Responsabilidade |
|----------------|---------------|------------------|
| **Identity** | `auth-service` | Autenticação, autorização, gestão de usuários |
| **Academic** | `students-service` | CRUD de alunos, validações acadêmicas |
| **Facilities** | `spaces-service` | Gestão de ambientes, registros de entrada/saída |
| **Analytics** | `analytics-service` | Análise de ocupação, relatórios, métricas |

### 1.3. Context Mapping

```
Identity Context ──────┐
                       │
Academic Context ──────┼──→ Shared Kernel (User ID, Common Types)
                       │
Facilities Context ────┤
                       │
Analytics Context ─────┘
```

**Relações:**
- **Identity ↔ Academic:** Identity fornece User ID (Conformist)
- **Academic ↔ Facilities:** Academic fornece Student ID (Conformist)
- **Facilities ↔ Analytics:** Facilities publica eventos (Publisher-Subscriber via Kafka)

---

## 📐 2. Modelo de Domínio Detalhado (DDD)

### 2.1. Bounded Context: Identity

#### **Aggregate Root: User**

```typescript
class User {
  private id: UserId;
  private email: Email;
  private password: PasswordHash;
  private role: Role;
  private status: UserStatus;
  private createdAt: Date;
  private updatedAt: Date;

  // Domain Methods
  authenticate(password: string): boolean;
  changePassword(oldPassword: string, newPassword: string): void;
  activate(): void;
  deactivate(): void;
  hasPermission(permission: Permission): boolean;
}
```

#### **Value Objects**

```typescript
// Email Value Object
class Email {
  private value: string;
  
  constructor(email: string) {
    this.validate(email);
    this.value = email.toLowerCase().trim();
  }
  
  private validate(email: string): void {
    // Validação de formato
  }
  
  equals(other: Email): boolean;
  toString(): string;
}

// Role Value Object
class Role {
  private value: 'ADMIN' | 'STUDENT' | 'MONITOR';
  
  constructor(role: string) {
    this.validate(role);
    this.value = role;
  }
  
  isAdmin(): boolean;
  isStudent(): boolean;
  isMonitor(): boolean;
}

// PasswordHash Value Object
class PasswordHash {
  private value: string;
  
  static fromPlain(plainPassword: string): PasswordHash;
  verify(plainPassword: string): boolean;
}
```

#### **Domain Services**

```typescript
interface IAuthenticationService {
  authenticate(email: Email, password: string): Promise<AuthToken>;
  refreshToken(refreshToken: string): Promise<AuthToken>;
  validateToken(token: string): Promise<UserId>;
}

interface IAuthorizationService {
  checkPermission(userId: UserId, resource: string, action: string): Promise<boolean>;
}
```

---

### 2.2. Bounded Context: Academic

#### **Aggregate Root: Student**

```typescript
class Student {
  private id: StudentId;
  private userId: UserId; // Referência ao Identity Context
  private name: FullName;
  private cpf: CPF;
  private email: Email;
  private matricula: Matricula;
  private status: StudentStatus;
  private createdAt: Date;
  private updatedAt: Date;
  private deletedAt: Date | null;

  // Domain Methods
  activate(): void;
  deactivate(): void;
  updateEmail(newEmail: Email): void;
  softDelete(): void;
  isActive(): boolean;
  canRegisterAttendance(): boolean;
}
```

#### **Value Objects**

```typescript
// CPF Value Object
class CPF {
  private value: string;
  
  constructor(cpf: string) {
    this.validate(cpf);
    this.value = this.sanitize(cpf);
  }
  
  private validate(cpf: string): void {
    // Validação de CPF (formato e dígitos verificadores)
  }
  
  private sanitize(cpf: string): string;
  equals(other: CPF): boolean;
  toString(): string;
}

// Matricula Value Object
class Matricula {
  private value: string;
  
  constructor(matricula: string) {
    this.validate(matricula);
    this.value = matricula;
  }
  
  private validate(matricula: string): void;
  equals(other: Matricula): boolean;
}

// FullName Value Object
class FullName {
  private firstName: string;
  private lastName: string;
  
  constructor(firstName: string, lastName: string) {
    this.validate(firstName, lastName);
    this.firstName = firstName.trim();
    this.lastName = lastName.trim();
  }
  
  getFullName(): string;
  getFirstName(): string;
  getLastName(): string;
}
```

#### **Domain Services**

```typescript
interface IStudentValidationService {
  validateCPFUniqueness(cpf: CPF): Promise<boolean>;
  validateEmailUniqueness(email: Email): Promise<boolean>;
  validateMatriculaUniqueness(matricula: Matricula): Promise<boolean>;
}
```

---

### 2.3. Bounded Context: Facilities

#### **Aggregate Root: TeachingSpace**

```typescript
class TeachingSpace {
  private id: SpaceId;
  private name: SpaceName;
  private type: SpaceType;
  private capacity: Capacity;
  private location: Location;
  private status: SpaceStatus;
  private operatingHours: OperatingHours;
  private currentOccupancy: number;
  private createdAt: Date;
  private updatedAt: Date;

  // Domain Methods
  registerEntry(studentId: StudentId): AttendanceRecord;
  registerExit(recordId: AttendanceRecordId): void;
  isAvailable(): boolean;
  hasCapacity(): boolean;
  isWithinOperatingHours(): boolean;
  updateCapacity(newCapacity: Capacity): void;
  changeStatus(newStatus: SpaceStatus): void;
  getOccupancyRate(): number;
}
```

#### **Aggregate Root: AttendanceRecord**

```typescript
class AttendanceRecord {
  private id: AttendanceRecordId;
  private studentId: StudentId;
  private spaceId: SpaceId;
  private entryTime: DateTime;
  private exitTime: DateTime | null;
  private status: AttendanceStatus;
  private duration: Duration | null;

  // Domain Methods
  registerExit(): void;
  calculateDuration(): Duration;
  isActive(): boolean;
  isCompleted(): boolean;
}
```

#### **Value Objects**

```typescript
// SpaceType Value Object
class SpaceType {
  private value: 'CLASSROOM' | 'LABORATORY' | 'STUDY_ROOM';
  
  constructor(type: string) {
    this.validate(type);
    this.value = type;
  }
  
  isClassroom(): boolean;
  isLaboratory(): boolean;
  isStudyRoom(): boolean;
}

// Capacity Value Object
class Capacity {
  private value: number;
  
  constructor(capacity: number) {
    this.validate(capacity);
    this.value = capacity;
  }
  
  canAccommodate(occupancy: number): boolean;
  getAvailableSlots(currentOccupancy: number): number;
}

// Location Value Object
class Location {
  private building: string;
  private floor: string;
  private number: string;
  
  constructor(building: string, floor: string, number: string) {
    this.building = building;
    this.floor = floor;
    this.number = number;
  }
  
  getFullLocation(): string;
}

// OperatingHours Value Object
class OperatingHours {
  private openingTime: Time;
  private closingTime: Time;
  private daysOfWeek: DayOfWeek[];
  
  isOpenAt(dateTime: DateTime): boolean;
  isWithinHours(time: Time): boolean;
}

// Duration Value Object
class Duration {
  private minutes: number;
  
  constructor(minutes: number) {
    this.minutes = minutes;
  }
  
  toHours(): number;
  toMinutes(): number;
  toString(): string;
}
```

#### **Domain Services**

```typescript
interface IAttendanceService {
  registerEntry(studentId: StudentId, spaceId: SpaceId): Promise<AttendanceRecord>;
  registerExit(studentId: StudentId, spaceId: SpaceId): Promise<void>;
  validateEntry(studentId: StudentId, spaceId: SpaceId): Promise<ValidationResult>;
  getActiveRecord(studentId: StudentId): Promise<AttendanceRecord | null>;
}

interface IOccupancyService {
  calculateOccupancyRate(spaceId: SpaceId): Promise<number>;
  getCurrentOccupancy(spaceId: SpaceId): Promise<number>;
  checkCapacity(spaceId: SpaceId): Promise<boolean>;
}
```

---

### 2.4. Bounded Context: Analytics

#### **Aggregate Root: OccupancyReport**

```typescript
class OccupancyReport {
  private id: ReportId;
  private spaceId: SpaceId;
  private timeRange: TimeRange;
  private metrics: OccupancyMetrics;
  private generatedAt: Date;

  // Domain Methods
  calculateAverageOccupancy(): number;
  calculatePeakHours(): Hour[];
  calculateAverageDuration(): Duration;
  getTotalEntries(): number;
}
```

#### **Value Objects**

```typescript
// TimeRange Value Object
class TimeRange {
  private startDate: Date;
  private endDate: Date;
  
  constructor(startDate: Date, endDate: Date) {
    this.validate(startDate, endDate);
    this.startDate = startDate;
    this.endDate = endDate;
  }
  
  getDays(): number;
  includes(date: Date): boolean;
}

// OccupancyMetrics Value Object
class OccupancyMetrics {
  private totalEntries: number;
  private averageOccupancy: number;
  private peakOccupancy: number;
  private averageDuration: Duration;
  private peakHours: Hour[];
}
```

#### **Domain Services**

```typescript
interface IAnalyticsService {
  generateDailyReport(spaceId: SpaceId, date: Date): Promise<OccupancyReport>;
  generateWeeklyReport(spaceId: SpaceId, week: Week): Promise<OccupancyReport>;
  generateMonthlyReport(spaceId: SpaceId, month: Month): Promise<OccupancyReport>;
  calculateTrends(spaceId: SpaceId, timeRange: TimeRange): Promise<Trends>;
}
```

---

## 🗄️ 3. Modelo de Dados (Database Schema)

### 3.1. Auth Service Database

```sql
-- Schema: identity

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'STUDENT', 'MONITOR') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status)
);

CREATE TABLE refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
);
```

### 3.2. Students Service Database

```sql
-- Schema: academic

CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL, -- Referência ao Identity Context
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    matricula VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_cpf (cpf),
    INDEX idx_email (email),
    INDEX idx_matricula (matricula),
    INDEX idx_status (status),
    INDEX idx_deleted_at (deleted_at)
);
```

### 3.3. Spaces Service Database

```sql
-- Schema: facilities

CREATE TABLE teaching_spaces (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('CLASSROOM', 'LABORATORY', 'STUDY_ROOM') NOT NULL,
    capacity INT NOT NULL,
    building VARCHAR(100) NOT NULL,
    floor VARCHAR(50) NOT NULL,
    number VARCHAR(50) NOT NULL,
    status ENUM('AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    days_of_week JSON NOT NULL, -- ['MONDAY', 'TUESDAY', ...]
    current_occupancy INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_location (building, floor, number)
);

CREATE TABLE attendance_records (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    space_id VARCHAR(36) NOT NULL,
    entry_time TIMESTAMP NOT NULL,
    exit_time TIMESTAMP NULL,
    status ENUM('ACTIVE', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    duration_minutes INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (space_id) REFERENCES teaching_spaces(id),
    INDEX idx_student_id (student_id),
    INDEX idx_space_id (space_id),
    INDEX idx_entry_time (entry_time),
    INDEX idx_status (status),
    INDEX idx_student_space_active (student_id, space_id, status)
);
```

### 3.4. Analytics Service Database

```sql
-- Schema: analytics

CREATE TABLE occupancy_reports (
    id VARCHAR(36) PRIMARY KEY,
    space_id VARCHAR(36) NOT NULL,
    report_type ENUM('DAILY', 'WEEKLY', 'MONTHLY') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_entries INT NOT NULL,
    average_occupancy DECIMAL(5,2) NOT NULL,
    peak_occupancy INT NOT NULL,
    average_duration_minutes INT NOT NULL,
    peak_hours JSON NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_space_id (space_id),
    INDEX idx_report_type (report_type),
    INDEX idx_dates (start_date, end_date)
);

CREATE TABLE occupancy_events (
    id VARCHAR(36) PRIMARY KEY,
    space_id VARCHAR(36) NOT NULL,
    event_type ENUM('ENTRY', 'EXIT') NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    occurred_at TIMESTAMP NOT NULL,
    occupancy_at_event INT NOT NULL,
    INDEX idx_space_id (space_id),
    INDEX idx_occurred_at (occurred_at),
    INDEX idx_event_type (event_type)
);
```

---

## 🏛️ 4. Estrutura de Pastas (DDD)

### 4.1. Estrutura Geral (Monorepo)

```
controle-espacos-de-ensino/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── infrastructure/
│   ├── terraform/
│   │   ├── modules/
│   │   │   ├── kubernetes/
│   │   │   ├── mysql/
│   │   │   ├── redis/
│   │   │   └── kafka/
│   │   ├── environments/
│   │   │   ├── local/
│   │   │   └── cloud/
│   │   └── main.tf
│   ├── kubernetes/
│   │   ├── namespaces/
│   │   ├── deployments/
│   │   ├── services/
│   │   └── configmaps/
│   └── docker/
│       └── docker-compose.yml
├── services/
│   ├── auth-service/
│   ├── students-service/
│   ├── spaces-service/
│   └── analytics-service/
├── frontend/
│   └── web-app/
├── shared/
│   ├── types/
│   ├── events/
│   └── utils/
├── docs/
│   ├── architecture/
│   ├── api/
│   └── setup/
└── README.md
```

### 4.2. Estrutura de um Microsserviço (NestJS + DDD + Hexagonal)

```
services/auth-service/
├── src/
│   ├── domain/                          # Camada de Domínio (CORE)
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── value-objects/
│   │   │   ├── email.vo.ts
│   │   │   ├── password-hash.vo.ts
│   │   │   └── role.vo.ts
│   │   ├── services/
│   │   │   ├── authentication.service.ts
│   │   │   └── authorization.service.ts
│   │   ├── ports/                       # PORTS (Interfaces)
│   │   │   ├── repositories/
│   │   │   │   └── user.repository.port.ts
│   │   │   ├── messaging/
│   │   │   │   └── event-publisher.port.ts
│   │   │   ├── cache/
│   │   │   │   └── cache-service.port.ts
│   │   │   └── logger/
│   │   │       └── logger.port.ts
│   │   └── events/
│   │       └── user-created.event.ts
│   ├── application/                     # Camada de Aplicação
│   │   ├── use-cases/
│   │   │   ├── authenticate-user.use-case.ts
│   │   │   ├── create-user.use-case.ts
│   │   │   └── refresh-token.use-case.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── create-user.dto.ts
│   │   └── mappers/
│   │       └── user.mapper.ts
│   ├── infrastructure/                  # ADAPTERS (Implementações)
│   │   ├── adapters/
│   │   │   ├── persistence/
│   │   │   │   ├── mysql/
│   │   │   │   │   ├── mysql-user.repository.adapter.ts
│   │   │   │   │   └── user.entity.ts (TypeORM)
│   │   │   │   └── rds/
│   │   │   │       └── rds-user.repository.adapter.ts (AWS)
│   │   │   ├── messaging/
│   │   │   │   ├── kafka/
│   │   │   │   │   └── kafka-event-publisher.adapter.ts
│   │   │   │   └── msk/
│   │   │   │       └── msk-event-publisher.adapter.ts (AWS)
│   │   │   ├── cache/
│   │   │   │   ├── redis/
│   │   │   │   │   └── redis-cache-service.adapter.ts
│   │   │   │   └── elasticache/
│   │   │   │       └── elasticache-cache-service.adapter.ts (AWS)
│   │   │   └── logger/
│   │   │       ├── winston/
│   │   │       │   └── winston-logger.adapter.ts
│   │   │       └── cloudwatch/
│   │   │           └── cloudwatch-logger.adapter.ts (AWS)
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   ├── kafka.config.ts
│   │   │   └── aws.config.ts
│   │   └── providers/
│   │       └── adapters.provider.ts      # Factory para escolher adapters
│   ├── presentation/                    # Camada de Apresentação
│   │   ├── http/
│   │   │   ├── controllers/
│   │   │   │   └── auth.controller.ts
│   │   │   ├── guards/
│   │   │   │   └── jwt-auth.guard.ts
│   │   │   ├── decorators/
│   │   │   │   └── roles.decorator.ts
│   │   │   └── pipes/
│   │   │       └── validation.pipe.ts
│   │   └── swagger/
│   │       └── swagger.config.ts
│   ├── auth.module.ts                   # NestJS Module
│   └── main.ts                          # Entry Point
├── tests/
│   ├── unit/
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── integration/
│   │   └── api/
│   └── e2e/
│       └── flows/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── nest-cli.json
├── jest.config.js
└── README.md
```

### 4.3. Estrutura de Adapters (Exemplo Detalhado)

```
infrastructure/adapters/persistence/
├── mysql/
│   ├── mysql-user.repository.adapter.ts
│   └── user.entity.ts
├── rds/
│   ├── rds-user.repository.adapter.ts
│   └── rds.config.ts
└── providers/
    └── persistence.provider.ts          # Factory: escolhe MySQL ou RDS
```

**Exemplo de Factory Pattern:**

```typescript
// infrastructure/providers/adapters.provider.ts
@Module({
  providers: [
    {
      provide: 'USER_REPOSITORY',
      useFactory: (config: ConfigService) => {
        const dbType = config.get('DATABASE_TYPE'); // 'mysql' | 'rds'
        
        if (dbType === 'rds') {
          return new RDSUserRepositoryAdapter(...);
        }
        return new MySQLUserRepositoryAdapter(...);
      },
      inject: [ConfigService],
    },
    {
      provide: 'EVENT_PUBLISHER',
      useFactory: (config: ConfigService) => {
        const messagingType = config.get('MESSAGING_TYPE'); // 'kafka' | 'msk'
        
        if (messagingType === 'msk') {
          return new MSKEventPublisherAdapter(...);
        }
        return new KafkaEventPublisherAdapter(...);
      },
      inject: [ConfigService],
    },
  ],
})
export class AdaptersModule {}
```

---

## 🔌 4.4. Adaptadores AWS e Configuração de Ambientes

### 4.4.1. Estratégia de Adaptadores

A arquitetura permite trocar facilmente entre serviços locais e AWS através de variáveis de ambiente:

```typescript
// .env.local (Desenvolvimento)
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306

MESSAGING_TYPE=kafka
KAFKA_BROKERS=localhost:9092

CACHE_TYPE=redis
REDIS_HOST=localhost
REDIS_PORT=6379

LOGGER_TYPE=winston
```

```typescript
// .env.production (AWS)
DATABASE_TYPE=rds
DATABASE_HOST=my-db.xxxxx.us-east-1.rds.amazonaws.com
DATABASE_PORT=3306

MESSAGING_TYPE=msk
KAFKA_BROKERS=b-1.xxxxx.c1.kafka.us-east-1.amazonaws.com:9092

CACHE_TYPE=elasticache
REDIS_HOST=my-cache.xxxxx.cache.amazonaws.com
REDIS_PORT=6379

LOGGER_TYPE=cloudwatch
AWS_REGION=us-east-1
```

### 4.4.2. Factory Pattern para Adapters

```typescript
// infrastructure/providers/adapters.provider.ts
import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: 'USER_REPOSITORY',
      useFactory: (config: ConfigService) => {
        const dbType = config.get<string>('DATABASE_TYPE');
        
        switch (dbType) {
          case 'rds':
            return new RDSUserRepositoryAdapter(
              config.get('DATABASE_HOST'),
              config.get('DATABASE_PORT'),
            );
          case 'mysql':
          default:
            return new MySQLUserRepositoryAdapter(
              config.get('DATABASE_HOST'),
              config.get('DATABASE_PORT'),
            );
        }
      },
      inject: [ConfigService],
    },
    {
      provide: 'EVENT_PUBLISHER',
      useFactory: (config: ConfigService) => {
        const messagingType = config.get<string>('MESSAGING_TYPE');
        
        switch (messagingType) {
          case 'msk':
            return new MSKEventPublisherAdapter(
              config.get('KAFKA_BROKERS'),
              config.get('AWS_REGION'),
            );
          case 'kafka':
          default:
            return new KafkaEventPublisherAdapter(
              config.get('KAFKA_BROKERS'),
            );
        }
      },
      inject: [ConfigService],
    },
    {
      provide: 'CACHE_SERVICE',
      useFactory: (config: ConfigService) => {
        const cacheType = config.get<string>('CACHE_TYPE');
        
        switch (cacheType) {
          case 'elasticache':
            return new ElastiCacheServiceAdapter(
              config.get('REDIS_HOST'),
              config.get('REDIS_PORT'),
              config.get('AWS_REGION'),
            );
          case 'redis':
          default:
            return new RedisCacheServiceAdapter(
              config.get('REDIS_HOST'),
              config.get('REDIS_PORT'),
            );
        }
      },
      inject: [ConfigService],
    },
    {
      provide: 'LOGGER',
      useFactory: (config: ConfigService) => {
        const loggerType = config.get<string>('LOGGER_TYPE');
        
        switch (loggerType) {
          case 'cloudwatch':
            return new CloudWatchLoggerAdapter(
              config.get('AWS_REGION'),
              config.get('LOG_GROUP_NAME'),
            );
          case 'winston':
          default:
            return new WinstonLoggerAdapter();
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: ['USER_REPOSITORY', 'EVENT_PUBLISHER', 'CACHE_SERVICE', 'LOGGER'],
})
export class AdaptersModule {}
```

### 4.4.3. Exemplo de Adapter RDS

```typescript
// infrastructure/adapters/persistence/rds/rds-user.repository.adapter.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../../domain/ports/repositories/user.repository.port';
import { User } from '../../../../domain/entities/user.entity';
import { UserEntity } from './user.entity';

@Injectable()
export class RDSUserRepositoryAdapter implements IUserRepository {
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

  private toDomain(entity: UserEntity): User {
    // Mapeia entidade TypeORM para entidade de domínio
  }

  private toEntity(user: User): UserEntity {
    // Mapeia entidade de domínio para entidade TypeORM
  }
}
```

### 4.4.4. Exemplo de Adapter MSK

```typescript
// infrastructure/adapters/messaging/msk/msk-event-publisher.adapter.ts
import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { IEventPublisher } from '../../../../domain/ports/messaging/event-publisher.port';
import { DomainEvent } from '../../../../domain/events/domain-event';

@Injectable()
export class MSKEventPublisherAdapter implements IEventPublisher {
  private producer: Kafka;

  constructor(
    private brokers: string,
    private region: string,
  ) {
    this.producer = new Kafka({
      clientId: 'auth-service',
      brokers: brokers.split(','),
      ssl: true,
      sasl: {
        mechanism: 'aws',
        authorizationIdentity: `arn:aws:iam::${process.env.AWS_ACCOUNT_ID}:user/kafka`,
      },
    }).producer();
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
}
```

### 4.4.5. Configuração NestJS Module

```typescript
// auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdaptersModule } from './infrastructure/providers/adapters.provider';
import { UserEntity } from './infrastructure/adapters/persistence/mysql/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DATABASE_HOST'),
        port: config.get('DATABASE_PORT'),
        username: config.get('DATABASE_USER'),
        password: config.get('DATABASE_PASSWORD'),
        database: config.get('DATABASE_NAME'),
        entities: [UserEntity],
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserEntity]),
    AdaptersModule,
  ],
  // ...
})
export class AuthModule {}
```

---

## 🚀 5. Stack Tecnológica Detalhada

### 5.1. Backend (NestJS + TypeScript)

**Core:**
- **Runtime:** Node.js 20 LTS
- **Language:** TypeScript 5.x
- **Framework:** **NestJS 10.x** (com Dependency Injection nativo)
- **Validation:** **class-validator + class-transformer** (NestJS padrão)
- **ORM:** **TypeORM** (alinhado com NestJS e DDD)
- **HTTP Client:** Axios

**DDD & Arquitetura:**
- **DDD Patterns:** Implementação com NestJS Modules
- **Ports and Adapters:** Interfaces e Adapters separados
- **Dependency Injection:** NestJS nativo (@Injectable, @Inject)
- **Event Sourcing:** EventStore ou implementação própria
- **CQRS:** Separação de Commands e Queries (NestJS CQRS module opcional)

**Autenticação:**
- **JWT:** @nestjs/jwt
- **Password Hashing:** bcrypt
- **Token Refresh:** Implementação própria
- **Guards:** @nestjs/passport (JWT Strategy)

**Mensageria:**
- **Kafka Client:** kafkajs
- **MSK Adapter:** AWS SDK v3 (@aws-sdk/client-kafka)
- **Event Bus:** Implementação própria sobre Kafka/MSK

**Persistence Adapters:**
- **MySQL:** TypeORM + mysql2
- **RDS (AWS):** TypeORM + mysql2 (mesma implementação, config diferente)
- **Redis:** ioredis (local)
- **ElastiCache (AWS):** ioredis (mesma implementação, config diferente)

**Observabilidade:**
- **Logging:** Winston ou Pino (com adaptador para CloudWatch)
- **Métricas:** prom-client (Prometheus)
- **CloudWatch (AWS):** @aws-sdk/client-cloudwatch
- **Tracing:** OpenTelemetry (opcional)

**Testes:**
- **Unit:** Jest (NestJS padrão)
- **Integration:** @nestjs/testing + Supertest
- **E2E:** @nestjs/testing
- **Coverage:** Istanbul/nyc

**Documentação:**
- **API Docs:** @nestjs/swagger (Swagger/OpenAPI integrado)

### 5.2. Frontend (React + TypeScript)

**Core:**
- **Framework:** React 18.x
- **Language:** TypeScript 5.x
- **Build Tool:** Vite
- **State Management:** **Zustand**
- **Routing:** React Router v6

**UI/UX:**
- **Component Library:** **shadcn/ui** (baseado em Radix UI + Tailwind CSS)
- **Styling:** **Tailwind CSS** (shadcn/ui padrão)
- **Icons:** **lucide-react** (shadcn/ui padrão)
- **Charts:** Recharts ou Chart.js
- **Design System:** Customizável para design da PUCPR

**HTTP Client:**
- **API Client:** Axios
- **React Query:** TanStack Query (para cache e sincronização)

**Forms:**
- **Form Management:** React Hook Form
- **Validation:** Zod (compatível com shadcn/ui)

**Testes:**
- **Unit:** Jest + React Testing Library
- **E2E:** Playwright
- **Coverage:** Istanbul/nyc

### 5.3. Infraestrutura

**Containerização:**
- **Docker:** Docker 24.x
- **Docker Compose:** Para desenvolvimento local

**Orquestração:**
- **Kubernetes:** Minikube ou Kind (local)
- **K8s Manifests:** YAML files
- **API Gateway:** **Traefik** (com Ingress)

**Infrastructure as Code:**
- **Terraform:** Terraform 1.5+
- **Providers:** 
  - Kubernetes Provider (para K8s local)
  - **AWS Provider** (para cloud - RDS, ElastiCache, MSK, EKS)
  - Módulos reutilizáveis para diferentes ambientes

**AWS Services (Adaptáveis):**
- **RDS:** MySQL (substitui MySQL local)
- **ElastiCache:** Redis (substitui Redis local)
- **MSK:** Kafka (substitui Kafka local)
- **EKS:** Kubernetes (substitui Minikube)
- **CloudWatch:** Logs e métricas
- **S3:** Storage (se necessário)

**Banco de Dados:**
- **MySQL:** 8.0+
- **Redis:** 7.x (cache e sessões)

**Mensageria:**
- **Kafka:** Apache Kafka 3.x (via Docker/K8s)

**Observabilidade:**
- **Prometheus:** Para métricas
- **Grafana:** Para visualização
- **Loki:** Para logs (opcional)

**CI/CD:**
- **GitHub Actions:** Para CI/CD
- **Workflows:** Build, test, deploy

---

## 📋 6. Sequência de Setup Detalhada

### 6.1. Pré-requisitos

```bash
# Verificar instalações necessárias
node --version    # >= 20.0.0
npm --version     # >= 10.0.0
docker --version  # >= 24.0.0
docker-compose --version
kubectl version --client
terraform --version  # >= 1.5.0
```

**Instalar se necessário:**
- Node.js 20 LTS
- Docker Desktop (ou Docker + Docker Compose)
- Minikube ou Kind (para Kubernetes local)
- kubectl
- Terraform
- Git

### 6.2. Passo 1: Setup do Repositório

```bash
# 1. Criar estrutura de pastas
mkdir -p controle-espacos-de-ensino
cd controle-espacos-de-ensino

# 2. Inicializar Git
git init
git branch -M main

# 3. Criar estrutura de pastas
mkdir -p {services,frontend,infrastructure,shared,docs}
mkdir -p services/{auth-service,students-service,spaces-service,analytics-service}
mkdir -p infrastructure/{terraform,kubernetes,docker}
mkdir -p docs/{architecture,api,setup}

# 4. Criar .gitignore
cat > .gitignore << EOF
node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
coverage/
.terraform/
*.tfstate
*.tfstate.backup
EOF
```

### 6.3. Passo 2: Setup de Infraestrutura Local (Docker Compose)

```bash
# Criar docker-compose.yml para desenvolvimento local
cd infrastructure/docker
```

**Criar `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  mysql-auth:
    image: mysql:8.0
    container_name: mysql-auth
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: identity
    ports:
      - "3306:3306"
    volumes:
      - mysql-auth-data:/var/lib/mysql
    networks:
      - app-network

  mysql-students:
    image: mysql:8.0
    container_name: mysql-students
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: academic
    ports:
      - "3307:3306"
    volumes:
      - mysql-students-data:/var/lib/mysql
    networks:
      - app-network

  mysql-spaces:
    image: mysql:8.0
    container_name: mysql-spaces
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: facilities
    ports:
      - "3308:3306"
    volumes:
      - mysql-spaces-data:/var/lib/mysql
    networks:
      - app-network

  mysql-analytics:
    image: mysql:8.0
    container_name: mysql-analytics
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: analytics
    ports:
      - "3309:3306"
    volumes:
      - mysql-analytics-data:/var/lib/mysql
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    container_name: redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - app-network

  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    container_name: zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"
    networks:
      - app-network

  kafka:
    image: confluentinc/cp-kafka:latest
    container_name: kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    networks:
      - app-network

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - app-network

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana-data:/var/lib/grafana
    networks:
      - app-network

volumes:
  mysql-auth-data:
  mysql-students-data:
  mysql-spaces-data:
  mysql-analytics-data:
  redis-data:
  grafana-data:

networks:
  app-network:
    driver: bridge
```

```bash
# Subir infraestrutura
docker-compose up -d

# Verificar serviços
docker-compose ps
```

### 6.4. Passo 3: Setup Terraform (Infrastructure as Code)

```bash
cd infrastructure/terraform
mkdir -p {modules,environments/local,environments/cloud}
```

**Estrutura Terraform:**
- `main.tf` - Configuração principal
- `modules/kubernetes/` - Módulo para K8s
- `modules/mysql/` - Módulo para MySQL
- `modules/redis/` - Módulo para Redis
- `modules/kafka/` - Módulo para Kafka
- `environments/local/` - Configuração para ambiente local
- `environments/cloud/` - Configuração para cloud (apenas descrição)

### 6.5. Passo 4: Setup Kubernetes Local (Minikube)

```bash
# Iniciar Minikube
minikube start

# Verificar status
kubectl cluster-info

# Criar namespaces
kubectl create namespace identity
kubectl create namespace academic
kubectl create namespace facilities
kubernel create namespace analytics
kubectl create namespace infrastructure
```

### 6.6. Passo 5: Setup Auth Service (NestJS)

```bash
cd services/auth-service

# Instalar NestJS CLI globalmente (opcional)
npm i -g @nestjs/cli

# Criar projeto NestJS
nest new . --skip-git --package-manager npm

# Ou usar npm create
# npm create nest-app . --skip-git

# Instalar dependências principais
npm install @nestjs/typeorm typeorm mysql2
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcrypt @types/bcrypt
npm install class-validator class-transformer
npm install kafkajs
npm install ioredis @types/ioredis
npm install winston nest-winston
npm install prom-client
npm install @aws-sdk/client-kafka @aws-sdk/client-cloudwatch-logs

# Instalar dependências de desenvolvimento
npm install -D @types/jest @types/supertest
npm install -D @nestjs/testing
npm install -D eslint prettier

# Criar estrutura de pastas DDD + Hexagonal
mkdir -p src/domain/{entities,value-objects,services,ports/{repositories,messaging,cache,logger},events}
mkdir -p src/application/{use-cases,dto,mappers}
mkdir -p src/infrastructure/adapters/{persistence/{mysql,rds},messaging/{kafka,msk},cache/{redis,elasticache},logger/{winston,cloudwatch}}
mkdir -p src/infrastructure/{config,providers}
mkdir -p src/presentation/{http/{controllers,guards,decorators,pipes},swagger}
mkdir -p tests/{unit,integration,e2e}

# Configurar NestJS
# Criar nest-cli.json
# Criar tsconfig.json (já vem com NestJS)
# Criar Dockerfile
# Criar README.md
```

### 6.7. Passo 6: Setup Students Service

```bash
cd services/students-service
# Mesmo processo do Auth Service
```

### 6.8. Passo 7: Setup Spaces Service

```bash
cd services/spaces-service
# Mesmo processo do Auth Service
```

### 6.9. Passo 8: Setup Analytics Service

```bash
cd services/analytics-service
# Mesmo processo do Auth Service
```

### 6.10. Passo 9: Setup Frontend (React + shadcn/ui)

```bash
cd frontend/web-app

# Criar projeto React com Vite
npm create vite@latest . -- --template react-ts

# Instalar dependências
npm install
npm install react-router-dom zustand axios
npm install @tanstack/react-query

# Instalar Tailwind CSS (requisito do shadcn/ui)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Instalar shadcn/ui
npx shadcn-ui@latest init

# Instalar componentes shadcn/ui que vamos usar
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add toast

# Instalar dependências adicionais
npm install react-hook-form @hookform/resolvers zod
npm install recharts
npm install lucide-react  # Ícones do shadcn/ui
npm install date-fns  # Para manipulação de datas

# Instalar dependências de desenvolvimento
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
npm install -D eslint prettier

# Configurar Tailwind para design da PUCPR
# Editar tailwind.config.js com cores da PUCPR
```

### 6.11. Passo 10: Setup CI/CD (GitHub Actions)

```bash
mkdir -p .github/workflows
```

**Criar `.github/workflows/ci.yml`:**
- Build
- Testes
- Lint
- Docker build

**Criar `.github/workflows/cd.yml`:**
- Deploy (se necessário)

### 6.12. Passo 11: Criar Migrations

```bash
# Para cada serviço, criar migrations do banco
cd services/auth-service
# Criar migrations usando TypeORM ou Prisma
```

### 6.13. Passo 12: Documentação

```bash
# Criar documentação
cd docs

# API Documentation
# Architecture Documentation
# Setup Guide
```

---

## 🧪 7. Estratégia de Testes Detalhada

### 7.1. Backend - Testes Unitários

**Estrutura:**
```
tests/unit/
├── domain/
│   ├── entities/
│   │   └── User.test.ts
│   ├── value-objects/
│   │   └── Email.test.ts
│   └── services/
│       └── AuthenticationService.test.ts
├── application/
│   └── use-cases/
│       └── AuthenticateUserUseCase.test.ts
└── infrastructure/
    └── persistence/
        └── UserRepository.test.ts
```

**Exemplo:**
```typescript
// tests/unit/domain/value-objects/Email.test.ts
describe('Email Value Object', () => {
  it('should create valid email', () => {
    const email = new Email('test@example.com');
    expect(email.toString()).toBe('test@example.com');
  });

  it('should throw error for invalid email', () => {
    expect(() => new Email('invalid-email')).toThrow();
  });
});
```

### 7.2. Backend - Testes de Integração

**Estrutura:**
```
tests/integration/
├── api/
│   ├── auth.test.ts
│   └── students.test.ts
└── repositories/
    └── UserRepository.integration.test.ts
```

### 7.3. Frontend - Testes

**Unitários:**
- Componentes isolados
- Hooks customizados
- Utilitários

**E2E:**
- Fluxos completos (Playwright)
- Login → Cadastro → Registro de entrada/saída

### 7.4. Cobertura Mínima

- **Unitários:** 80%
- **Integração:** 70%
- **E2E:** Fluxos críticos

---

## 📚 8. Documentação Necessária

### 8.1. README Principal

- Visão geral do projeto
- Arquitetura
- Como rodar localmente
- Links para documentação específica

### 8.2. README por Serviço

- Responsabilidade do serviço
- Como rodar
- Endpoints da API
- Variáveis de ambiente

### 8.3. Swagger/OpenAPI

- Documentação completa de todas as APIs
- Exemplos de requisições/respostas
- Modelos de dados

### 8.4. Documentação de Arquitetura

- Diagramas C4
- Context Map
- Bounded Contexts
- Fluxos de dados

### 8.5. Guia de Setup

- Passo a passo completo
- Troubleshooting
- Pré-requisitos

---

## 🔄 9. Fluxos Principais

### 9.1. Fluxo de Autenticação

```
1. Cliente → POST /auth/login (email, password)
2. Auth Service → Valida credenciais
3. Auth Service → Gera JWT + Refresh Token
4. Auth Service → Retorna tokens
5. Cliente → Armazena tokens
6. Cliente → Usa JWT em requisições subsequentes
```

### 9.2. Fluxo de Registro de Entrada

```
1. Cliente → POST /spaces/{spaceId}/entry (com JWT)
2. API Gateway → Valida JWT
3. Spaces Service → Valida se aluno está ativo (chama Students Service)
4. Spaces Service → Valida capacidade do ambiente
5. Spaces Service → Cria AttendanceRecord
6. Spaces Service → Publica evento no Kafka (StudentEnteredEvent)
7. Analytics Service → Consome evento e atualiza métricas
8. Spaces Service → Retorna sucesso
```

### 9.3. Fluxo de Registro de Saída

```
1. Cliente → POST /spaces/{spaceId}/exit (com JWT)
2. API Gateway → Valida JWT
3. Spaces Service → Busca registro ativo do aluno
4. Spaces Service → Registra saída e calcula duração
5. Spaces Service → Publica evento no Kafka (StudentExitedEvent)
6. Analytics Service → Consome evento e atualiza métricas
7. Spaces Service → Retorna sucesso
```

---

## 📅 10. Timeline de Desenvolvimento

### Semana 1: Setup e Infraestrutura
- [ ] Setup do repositório
- [ ] Docker Compose com todos os serviços
- [ ] Terraform básico
- [ ] Kubernetes local (Minikube)
- [ ] CI/CD básico

### Semana 2: Auth Service
- [ ] Estrutura DDD
- [ ] Domain Layer (Entities, VOs, Services)
- [ ] Application Layer (Use Cases)
- [ ] Infrastructure Layer (Persistence, Messaging)
- [ ] Presentation Layer (Controllers, Routes)
- [ ] Testes unitários
- [ ] Swagger

### Semana 3: Students Service
- [ ] Estrutura DDD
- [ ] Domain Layer
- [ ] Application Layer
- [ ] Infrastructure Layer
- [ ] Presentation Layer
- [ ] Testes
- [ ] Integração com Auth Service

### Semana 4: Spaces Service
- [ ] Estrutura DDD
- [ ] Domain Layer
- [ ] Application Layer
- [ ] Infrastructure Layer
- [ ] Presentation Layer
- [ ] Integração com Kafka
- [ ] Testes

### Semana 5: Analytics Service e Frontend
- [ ] Analytics Service (consumo de eventos)
- [ ] Frontend básico
- [ ] Integração frontend-backend
- [ ] Dashboard
- [ ] Testes E2E

### Semana 6: Observabilidade, Testes e Documentação
- [ ] Prometheus + Grafana
- [ ] Logs estruturados
- [ ] Testes de carga
- [ ] Documentação completa
- [ ] Ajustes finais

---

## ✅ 11. Checklist de Entrega

### Código
- [ ] Todos os serviços implementados
- [ ] Testes com cobertura adequada
- [ ] Código limpo e organizado
- [ ] DDD implementado corretamente
- [ ] Documentação de código

### Infraestrutura
- [ ] Docker Compose funcionando
- [ ] Terraform configurado
- [ ] Kubernetes local funcionando
- [ ] CI/CD configurado

### Documentação
- [ ] README principal
- [ ] README por serviço
- [ ] Swagger/OpenAPI
- [ ] Documentação de arquitetura
- [ ] Guia de setup

### Funcionalidades
- [ ] CRUD de alunos
- [ ] CRUD de ambientes
- [ ] Registro de entrada/saída
- [ ] Autenticação/autorização
- [ ] Dashboard
- [ ] Relatórios básicos

---

**Última atualização:** 2025-01-XX  
**Próxima etapa:** Iniciar desenvolvimento

