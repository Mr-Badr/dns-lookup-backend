import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DomainModule } from './domain/domain.module';
import { DnsLookupModule } from './dns-lookup/dns-lookup.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Domain } from './dns-lookup/domain.entity';
import { SpfRecord } from './dns-lookup/spf-record.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [Domain, SpfRecord], // Registering entities
      synchronize: true,
      autoLoadEntities: true,
    }),
    DomainModule,
    DnsLookupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
