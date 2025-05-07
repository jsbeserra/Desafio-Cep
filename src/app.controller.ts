import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ZipCodeService } from './core/zip-code-service';
import { ZipCode } from './core/zip-code';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FavoriteDto, UpdateDto } from './controller-dtos';

@Controller()
export class AppController {
  constructor(private zipCodeService: ZipCodeService) {}

  @Get()
  @ApiOperation({ summary: 'List all zip code' })
  @ApiResponse({ status: 200, description: 'return a array of zip code' })
  async list(): Promise<ZipCode[]> {
    return await this.zipCodeService.list();
  }

  @ApiOperation({ summary: 'Search data of a zip code' })
  @ApiResponse({ status: 200, description: 'return data of a zip code' })
  @ApiResponse({ status: 400, description: 'Zip code not founded' })
  @Get('/:zipcode')
  async find(@Param('zipcode') zipCode: string): Promise<ZipCode> {
    return await this.zipCodeService.find(zipCode);
  }

  @ApiOperation({
    summary: 'Synchronize the database with ZIP code data from the ViaCEP API',
  })
  @ApiResponse({
    status: 201,
    description: 'Database was successfully updated',
  })
  @Post('/sync')
  async sync(): Promise<void> {
    await this.zipCodeService.sync();
  }

  @ApiOperation({ summary: 'Update zip code street and neightborhood' })
  @ApiResponse({ status: 200, description: 'success' })
  @ApiResponse({ status: 400, description: 'ZIP code was not updated' })
  @Put()
  async update(@Body() body: UpdateDto): Promise<void> {
    await this.zipCodeService.update(
      body.zipcode,
      body.street,
      body.neighborhood,
    );
  }

  @ApiOperation({ summary: 'Favorite or unfavorite a ZIP code' })
  @ApiResponse({ status: 200, description: 'success' })
  @ApiResponse({ status: 400, description: 'Failed to favorite zipcode' })
  @Patch()
  async favorite(@Body() body: FavoriteDto): Promise<void> {
    await this.zipCodeService.favorite(body.zipcode, body.isFavorite);
  }
}
