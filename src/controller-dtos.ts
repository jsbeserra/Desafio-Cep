import { ApiProperty } from '@nestjs/swagger';

export class UpdateDto {
  @ApiProperty({ example: '12345-678' })
  zipcode: string;
  @ApiProperty({ example: 'Rua A' })
  street: string;

  @ApiProperty({ example: 'Centro' })
  neighborhood: string;
}

export class FavoriteDto {
  @ApiProperty({ example: '12345-678' })
  zipcode: string;

  @ApiProperty({ example: true })
  isFavorite: boolean;
}
