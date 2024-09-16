import { Test, TestingModule } from '@nestjs/testing';
import { DnsLookupController } from './dns-lookup.controller';

describe('DnsLookupController', () => {
  let controller: DnsLookupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DnsLookupController],
    }).compile();

    controller = module.get<DnsLookupController>(DnsLookupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
