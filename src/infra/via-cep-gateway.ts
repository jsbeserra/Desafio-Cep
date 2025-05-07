import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZipCode } from 'src/core/zip-code';
import { CepGateway } from 'src/core/zip-code-gateway';
import { ErrorMessages } from './error-messages';

@Injectable()
export class ViaCepGateway implements CepGateway {
  private readonly baseUrl: string;
  constructor(configService: ConfigService) {
    this.baseUrl = configService.getOrThrow('VIACEP_BASE_URL');
  }
  async find(
    state: string,
    city: string,
    municipality: string,
  ): Promise<ZipCode[]> {
    const response = await fetch(
      `${this.baseUrl}/${state}/${city}/${municipality}/json`,
    );
    if (!response.ok) {
      throw new BadRequestException(ErrorMessages.viaCep);
    }
    const data: ViaCepEndereco[] = (await response.json()) as ViaCepEndereco[];
    return data.map((address) => {
      return {
        code: address.cep,
        street: address.logradouro,
        complement: address.complemento,
        unit: address.unidade,
        neighborhood: address.bairro,
        city: address.localidade,
        stateCode: address.uf,
        state: address.estado,
        region: address.regiao,
        ibgeCode: address.ibge,
        giaCode: address.gia,
        areaCode: address.ddd,
        siafiCode: address.siafi,
        favorite: false,
      } as ZipCode;
    });
  }
}
type ViaCepEndereco = {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  regiao: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
};
