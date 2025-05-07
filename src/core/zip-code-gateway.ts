import { ZipCode } from './zip-code';

export abstract class CepGateway {
  abstract find(
    state: string,
    city: string,
    municipality: string,
  ): Promise<ZipCode[]>;
}
