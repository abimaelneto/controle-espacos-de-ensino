import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('usage_metrics')
@Index(['metricType', 'recordedAt'])
@Index(['roomId'])
@Index(['studentId'])
export class MetricEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['ROOM_USAGE', 'STUDENT_ACTIVITY', 'OCCUPANCY_RATE'] })
  metricType: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  roomId: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  studentId: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'datetime' })
  recordedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

