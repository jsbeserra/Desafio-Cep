import { BadRequestException, Injectable } from '@nestjs/common';
import { Drive } from './drive';
import { ZipCode } from './zip-code';
import { CepGateway } from './zip-code-gateway';
import { ZipCodesNotFound } from './errors/zip-codes-not-found';
import { ZipCodeNotFound } from './errors/zip-code-not-found';
import { ZipCodeNotUpdated } from './errors/zip-codes-not-updated';
import { ZipCodeFavoritedError } from './errors/zip-codes-favorite';

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
        new ZipCodesNotFound(
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
    const updated = await this.drive.update(
      this.isValidZipCode(zipcode),
      street,
      neighborhood,
    );
    if (!updated)
      throw new BadRequestException(
        new ZipCodeNotUpdated(zipcode, street, neighborhood),
      );
  }

  async find(zipcode: string): Promise<ZipCode> {
    const zipCode = await this.drive.find(this.isValidZipCode(zipcode));
    if (!zipCode) throw new BadRequestException(new ZipCodeNotFound(zipcode));
    return zipCode;
  }

  async favorite(zipcode: string, isFavorite: boolean): Promise<void> {
    const zipCode = await this.drive.favorite(
      this.isValidZipCode(zipcode),
      isFavorite,
    );
    if (!zipCode) throw new BadRequestException(new ZipCodeFavoritedError());
  }

  private isValidZipCode(zipcode: string) {
    const cleaned = zipcode.replace(/\D/g, '');
    if (cleaned.length !== 8)
      throw new BadRequestException('Invalid zipcode length');
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
}
