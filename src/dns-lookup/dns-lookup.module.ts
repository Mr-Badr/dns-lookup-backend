import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DnsLookupService } from './dns-lookup.service';
import { DnsLookupController } from './dns-lookup.controller';
import { Domain } from './domain.entity';
import { SpfRecord } from './spf-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Domain, SpfRecord]), // Register entities here
  ],
  providers: [DnsLookupService],
  controllers: [DnsLookupController],
})
export class DnsLookupModule {}
