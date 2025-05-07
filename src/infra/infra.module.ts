import { Module } from '@nestjs/common';
import { DriveMongoRepository } from './data-base/drive-mongo-repository';
import { Drive } from '../core/drive';
import { CepGateway } from '../core/zip-code-gateway';
import { ViaCepGateway } from './via-cep-gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { ZipCode, ZipCodeSchema } from './data-base/zip-code.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ZipCode.name, schema: ZipCodeSchema }]),
  ],
  controllers: [],
  providers: [
    {
      provide: Drive,
      useClass: DriveMongoRepository,
    },
    {
      provide: CepGateway,
      useClass: ViaCepGateway,
    },
  ],
  exports: [Drive, CepGateway],
})
export class InfraModule {}
