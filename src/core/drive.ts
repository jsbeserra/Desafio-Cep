import { ZipCode } from './zip-code';

export abstract class Drive {
  abstract save(addresses: ZipCode[]): Promise<boolean>;
  abstract update(
    zipCode: string,
    street: string,
    neighborhood: string,
  ): Promise<boolean>;
  abstract favorite(zipCode: string, isFavority: boolean): Promise<boolean>;
  abstract listAll(): Promise<ZipCode[]>;
  abstract find(zipcode: string): Promise<ZipCode | undefined>;
}
