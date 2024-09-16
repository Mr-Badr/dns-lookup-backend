import { Test, TestingModule } from '@nestjs/testing';
import { DnsLookupService } from './dns-lookup.service';

describe('DnsLookupService', () => {
  let service: DnsLookupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DnsLookupService],
    }).compile();

    service = module.get<DnsLookupService>(DnsLookupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
