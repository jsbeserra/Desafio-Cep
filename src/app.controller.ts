import { Controller, Get, Post } from '@nestjs/common';
import { ZipCodeService } from './core/zip-code-service';

@Controller()
export class AppController {
  constructor(private zipCodeService: ZipCodeService) {}

  @Get()
  async list(): Promise<any> {
    return await this.zipCodeService.list();
  }

  @Post('/sync')
  async sync(): Promise<any> {
    await this.zipCodeService.sync();
  }
}
