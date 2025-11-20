import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('attendances')
@Index(['studentId', 'checkInTime'])
@Index(['roomId', 'checkInTime'])
export class AttendanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  studentId: string;

  @Column({ type: 'varchar', length: 36 })
  roomId: string;

  @Column({ type: 'datetime' })
  checkInTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

