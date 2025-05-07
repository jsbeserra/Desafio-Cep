import { Module } from '@nestjs/common';
import { InfraModule } from '../infra/infra.module';
import { ZipCodeService } from './zip-code-service';

@Module({
  imports: [InfraModule],
  controllers: [],
  providers: [ZipCodeService],
  exports: [ZipCodeService],
})
export class CoreModule {}
