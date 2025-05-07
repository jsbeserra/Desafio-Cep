import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ZipCodeService } from './core/zip-code-service';
import { ZipCode } from './core/zip-code';

@Controller()
export class AppController {
  constructor(private zipCodeService: ZipCodeService) {}

  @Get()
  async list(): Promise<any> {
    return await this.zipCodeService.list();
  }

  @Get('/:zipcode')
  async find(@Param('zipcode') zipCode: string): Promise<ZipCode> {
    return await this.zipCodeService.find(zipCode);
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

  @Patch()
  async favorite(
    @Body() body: { zipcode: string; isFavorite: boolean },
  ): Promise<any> {
    await this.zipCodeService.favorite(body.zipcode, body.isFavorite);
  }
}
