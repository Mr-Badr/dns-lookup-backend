import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Query,
  Sse,
  MessageEvent,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DnsLookupService } from './dns-lookup.service';
import { memoryStorage } from 'multer'; // Use memory storage for file uploads
import { Observable, map } from 'rxjs';
import { Response } from 'express'; // Import Response for sending files
import * as fs from 'fs';

@Controller('dns-lookup')
export class DnsLookupController {
  constructor(private readonly dnsLookupService: DnsLookupService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // Use memory storage to keep the file in memory
    }),
  )
  async uploadFile(
    @UploadedFile() file: any, // The uploaded file
  ): Promise<{ message: string; downloadLink?: string }> {
    console.log('Uploaded file:', file);

    // Ensure file and buffer exist
    if (!file || !file.buffer) {
      throw new Error('File is missing or does not have a buffer.');
    }

    // Process the file and get the download link
    const downloadLink = await this.dnsLookupService.processFile(file);

    return {
      message: 'File uploaded and processed successfully',
      downloadLink, // Return the download link for the result file
    };
  }

  @Get('records')
  async getAllRecords() {
    return await this.dnsLookupService.getAllRecords();
  }

  @Get('records/:domain')
  async getRecordByDomain(@Param('domain') domain: string) {
    return await this.dnsLookupService.getRecordByDomain(domain);
  }

  @Get('search')
  async searchRecords(@Query('keyword') keyword: string) {
    return await this.dnsLookupService.searchRecords(keyword);
  }

  @Sse('progress')
  progress(): Observable<MessageEvent> {
    return this.dnsLookupService
      .getProcessingProgress()
      .pipe(map((progress) => ({ data: { progress } }))); // Format progress updates as events
  }

  // Endpoint to download the result file
  @Get('results/:filename')
  async getResultFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      // Construct the path to the result file
      const filePath = this.dnsLookupService.getResultFilePath(filename);

      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        return res.status(HttpStatus.NOT_FOUND).send('File not found');
      }

      // Send the file to the client
      res.sendFile(filePath);
    } catch (error) {
      console.error('Error serving result file:', error.message);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error serving file');
    }
  }
}
