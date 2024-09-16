import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Domain } from './domain.entity';

@Injectable()
export class DomainService {
  constructor(
    @InjectRepository(Domain)
    private domainRepository: Repository<Domain>,
  ) {}

  // Fetch all domains
  findAll(): Promise<Domain[]> {
    return this.domainRepository.find();
  }

  // Create a new domain
  create(domainName: string): Promise<Domain> {
    const newDomain = this.domainRepository.create({ name: domainName });
    return this.domainRepository.save(newDomain);
  }
}
