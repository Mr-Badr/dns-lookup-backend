import { Controller, Get, Post, Body } from '@nestjs/common';
import { DomainService } from './domain.service';

@Controller('domains')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  // Get all domains
  @Get()
  findAll() {
    return this.domainService.findAll();
  }

  // Add a new domain
  @Post()
  create(@Body('name') domainName: string) {
    return this.domainService.create(domainName);
  }
}
