import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Domain } from './domain.entity';

@Entity()
export class SpfRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  record: string; // The actual SPF record text

  @Column({ type: 'text', nullable: true })
  includedDomain: string; // Nested domain found in SPF record, if any

  @ManyToOne(() => Domain, (domain) => domain.spfRecords)
  domain: Domain; // SPF record belongs to one domain
}
