import { BadRequestException, Injectable } from '@nestjs/common';
import { Drive } from './drive';
import { ZipCode } from './zip-code';
import { CepGateway } from './zip-code-gateway';
import { ZipCodeNotFound } from './errors/zip-codes-not-found';
import { ZipCodeNotUpdated } from './errors/zip-codes-not-updated';

@Injectable()
export class ZipCodeService {
  constructor(
    private drive: Drive,
    private cepGateway: CepGateway,
  ) {}

  async list(): Promise<ZipCode[]> {
    return await this.drive.listAll();
  }

  async sync(): Promise<void> {
    const location = {
      state: 'RS',
      city: 'Porto Alegre',
      municipality: 'Domingos',
    };
    const addresses = await this.cepGateway.find(
      location.state,
      location.city,
      location.municipality,
    );
    if (addresses.length === 0)
      throw new BadRequestException(
        new ZipCodeNotFound(
          location.state,
          location.city,
          location.municipality,
        ),
      );
    await this.drive.save(addresses);
  }

  async update(
    zipcode: string,
    street: string,
    neighborhood: string,
  ): Promise<void> {
    const updated = await this.drive.update(zipcode, street, neighborhood);
    if (!updated)
      throw new BadRequestException(
        new ZipCodeNotUpdated(zipcode, street, neighborhood),
      );
  }
}
