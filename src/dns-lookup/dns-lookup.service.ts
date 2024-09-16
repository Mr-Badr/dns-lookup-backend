import * as path from 'path';
import * as fs from 'fs';
import * as uuid from 'uuid'; // UUID package for generating unique filenames
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as dns from 'dns';
import { promisify } from 'util';
import { Domain } from './domain.entity';
import { SpfRecord } from './spf-record.entity';
import { BehaviorSubject, Observable } from 'rxjs';

const dnsLookup = promisify(dns.resolveTxt); // Promisify dns.resolveTxt to use with async/await

@Injectable()
export class DnsLookupService {
  private progressSubject: BehaviorSubject<number> = new BehaviorSubject(0); // Observable for progress updates

  constructor(
    @InjectRepository(Domain)
    private readonly domainRepository: Repository<Domain>, // Repository for Domain entity

    @InjectRepository(SpfRecord)
    private readonly spfRecordRepository: Repository<SpfRecord>, // Repository for SPF Record entity
  ) {}

  // Get observable for processing progress
  getProcessingProgress(): Observable<number> {
    return this.progressSubject.asObservable();
  }

  // Process the uploaded file and return a URL for the result file
  async processFile(file: any): Promise<string> {
    if (!file || !file.buffer) {
      throw new Error('File is missing or does not have a buffer.');
    }

    const fileContent = file.buffer.toString('utf-8'); // Convert buffer to string
    console.log('File content:', fileContent); // Log or handle file content as needed

    const lines = fileContent.split('\n').filter((line) => line.trim() !== ''); // Split into lines and remove empty lines

    const totalLines = lines.length;
    for (let i = 0; i < lines.length; i++) {
      const domain = lines[i].trim();
      if (domain) {
        await this.processDomain(domain); // Process each domain
      }

      // Update progress
      const progress = Math.round(((i + 1) / totalLines) * 100);
      this.progressSubject.next(progress);
    }

    // Signal completion
    this.progressSubject.next(100);

    // Generate result file
    const resultFileName = `${uuid.v4()}.json`; // Generate a unique filename
    const resultFilePath = path.join(
      __dirname,
      '..',
      'uploads',
      'dns-lookup',
      'results',
      resultFileName,
    );

    // Create results directory if it does not exist
    if (!fs.existsSync(path.dirname(resultFilePath))) {
      fs.mkdirSync(path.dirname(resultFilePath), { recursive: true });
    }

    // Fetch all records or adapt this part as needed
    const resultData = await this.getAllRecords();
    fs.writeFileSync(resultFilePath, JSON.stringify(resultData, null, 2)); // Write results to file (pretty-printed JSON)

    // Return the relative path for download
    return `http://localhost:3000/dns-lookup/results/${resultFileName}`;
  }

  // Get the file path of the result file
  getResultFilePath(filename: string): string {
    return path.join(
      __dirname,
      '..',
      'uploads',
      'dns-lookup',
      'results',
      filename,
    );
  }

  // Process a domain to retrieve and save its SPF records
  private async processDomain(domain: string): Promise<void> {
    try {
      const records = await dnsLookup(domain); // Lookup DNS TXT records
      const spfRecords = records.filter((record) =>
        record.join(' ').toLowerCase().includes('spf'),
      ); // Filter SPF records

      if (spfRecords.length > 0) {
        let domainEntity = await this.domainRepository.findOne({
          where: { name: domain },
          relations: ['spfRecords'],
        });
        if (!domainEntity) {
          domainEntity = this.domainRepository.create({ name: domain });
          await this.domainRepository.save(domainEntity); // Save new domain entity
        }

        const spfRecordEntities = spfRecords.map((spfRecord) => {
          return this.spfRecordRepository.create({
            record: spfRecord.join(' '),
            domain: domainEntity,
          });
        });
        await this.spfRecordRepository.save(spfRecordEntities); // Save SPF records

        // Process included domains within SPF records
        for (const spfRecord of spfRecords) {
          await this.processIncludedDomains(spfRecord.join(' '));
        }
      }
    } catch (error) {
      console.error(`Error processing domain ${domain}: ${error.message}`);
    }
  }

  // Process any included domains found in SPF records
  private async processIncludedDomains(spfRecord: string): Promise<void> {
    const includeMatches = spfRecord.match(/include:([^\s]+)/g);
    if (includeMatches) {
      for (const include of includeMatches) {
        const includedDomain = include.replace('include:', '');
        await this.processDomain(includedDomain); // Recursively process included domains
      }
    }
  }

  // Get all SPF records with their associated domains
  async getAllRecords(): Promise<any> {
    return await this.spfRecordRepository.find({ relations: ['domain'] });
  }

  // Get SPF records by domain
  async getRecordByDomain(domain: string): Promise<any> {
    if (!domain) {
      return `No SPF records found for domain: ${domain}`;
    }

    const domainEntity = await this.domainRepository.findOne({
      where: { name: domain },
      relations: ['spfRecords'],
    });
    if (!domainEntity) {
      return `No SPF records found for domain: ${domain}`;
    }
    return domainEntity;
  }

  // Search SPF records by keyword
  async searchRecords(keyword: string): Promise<any> {
    const spfRecords = await this.spfRecordRepository.find({
      where: {
        record: ILike(`%${keyword}%`),
      },
      relations: ['domain'],
    });
    return spfRecords;
  }
}
