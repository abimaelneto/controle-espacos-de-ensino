import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  VersionColumn,
  Unique,
} from 'typeorm';

@Entity('attendances')
@Index(['studentId', 'checkInTime'])
@Index(['roomId', 'checkInTime'])
@Index(['idempotencyKey'], { unique: true, where: 'idempotencyKey IS NOT NULL' })
export class AttendanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  studentId: string;

  @Column({ type: 'varchar', length: 36 })
  roomId: string;

  @Column({ type: 'datetime' })
  checkInTime: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  idempotencyKey: string | null;

  @VersionColumn()
  version: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

