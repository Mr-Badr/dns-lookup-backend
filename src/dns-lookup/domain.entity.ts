import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { SpfRecord } from './spf-record.entity';

@Entity()
export class Domain {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // Stores domain name (e.g., google.com)

  @OneToMany(() => SpfRecord, (spfRecord) => spfRecord.domain)
  spfRecords: SpfRecord[]; // A domain can have many SPF records
}
