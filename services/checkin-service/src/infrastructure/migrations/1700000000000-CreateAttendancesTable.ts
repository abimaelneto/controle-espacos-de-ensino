import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAttendancesTable1700000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'attendances',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'studentId',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'roomId',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'checkInTime',
            type: 'datetime',
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'attendances',
      new TableIndex({
        name: 'IDX_ATTENDANCES_STUDENT_CHECKIN',
        columnNames: ['studentId', 'checkInTime'],
      }),
    );

    await queryRunner.createIndex(
      'attendances',
      new TableIndex({
        name: 'IDX_ATTENDANCES_ROOM_CHECKIN',
        columnNames: ['roomId', 'checkInTime'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('attendances');
  }
}

