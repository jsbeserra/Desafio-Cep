import { Body, Controller, Get, Post, Put } from '@nestjs/common';
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

  @Put()
  async update(
    @Body() body: { zipcode: string; street: string; neighborhood: string },
  ): Promise<any> {
    await this.zipCodeService.update(
      body.zipcode,
      body.street,
      body.neighborhood,
    );
  }
}
