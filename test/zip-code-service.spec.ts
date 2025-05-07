import { BadRequestException, INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { CoreModule } from '../src/core/core.module';
import { InfraModule } from '../src/infra/infra.module';
import { App } from 'supertest/types';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CepGateway } from '../src/core/zip-code-gateway';
import { Drive } from '../src/core/drive';
import { gatewayMock } from './mocks/gateway-mock';
import { ZipCodeService } from '../src/core/zip-code-service';
import { ZipCodeFavoritedError } from '../src/core/errors/zip-codes-favorite';
import { ZipCodeNotFound } from '../src/core/errors/zip-code-not-found';
import { ZipCodeNotUpdated } from '../src/core/errors/zip-codes-not-updated';

describe('ZipCodeService', () => {
  let app: INestApplication<App>;
  let mongoDb: MongoMemoryServer;
  let mongoUri: string;
  let sut: ZipCodeService;
  let cepGateway: CepGateway;
  let drive: Drive;

  beforeAll(async () => {
    mongoDb = await MongoMemoryServer.create();
    mongoUri = mongoDb.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: () => ({
            uri: mongoUri,
          }),
          inject: [ConfigService],
        }),
        InfraModule,
        CoreModule,
      ],
      controllers: [],
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    sut = moduleFixture.get(ZipCodeService);
    cepGateway = moduleFixture.get(CepGateway);
    drive = moduleFixture.get(Drive);
    await app.init();
  });

  afterAll(async () => {
    await mongoDb.stop();
    await app.close();
  });

  it('should register ZIP codes from a region', async () => {
    const gateway = jest.spyOn(cepGateway, 'find');
    gateway.mockResolvedValueOnce(gatewayMock);
    const driveSpy = jest.spyOn(drive, 'save');
    await sut.sync();
    expect(gateway).toHaveBeenCalled();
    expect(driveSpy).toHaveBeenCalled();
  });

  it('Should fail if no ZIP Codes is found', async () => {
    const gateway = jest.spyOn(cepGateway, 'find');
    gateway.mockResolvedValueOnce([]);
    await expect(sut.sync()).rejects.toThrow(BadRequestException);
  });

  it('Should fail to update if no records are found', async () => {
    const gateway = jest.spyOn(cepGateway, 'find');
    gateway.mockResolvedValueOnce(gatewayMock);
    const input = {
      zipcode: 'TESTE',
      street: 'Rua Do Teste',
      neighborhood: 'Bairro Do Teste',
    };
    await expect(
      sut.update(input.zipcode, input.street, input.neighborhood),
    ).rejects.toThrow(
      new BadRequestException(
        new ZipCodeNotUpdated(input.zipcode, input.street, input.neighborhood),
      ),
    );
  });

  it('Should update the neighborhood and street of a zip code', async () => {
    const gateway = jest.spyOn(cepGateway, 'find');
    gateway.mockResolvedValueOnce(gatewayMock);
    await expect(
      sut.update(gatewayMock[1].code, 'Rua Do Teste', 'Bairro Do Teste'),
    ).resolves.toBeUndefined();
  });

  it('Should return zipcode if it exists in the database', async () => {
    const gateway = jest.spyOn(drive, 'find');
    const mockedZipCode = {
      code: gatewayMock[1].code,
      street: gatewayMock[1].street,
      complement: gatewayMock[1].complement,
      unit: gatewayMock[1].unit,
      neighborhood: gatewayMock[1].neighborhood,
      city: gatewayMock[1].city,
      stateCode: gatewayMock[1].stateCode,
      state: gatewayMock[1].state,
      region: gatewayMock[1].region,
      ibgeCode: gatewayMock[1].ibgeCode,
      giaCode: gatewayMock[1].giaCode,
      areaCode: gatewayMock[1].areaCode,
      siafiCode: gatewayMock[1].siafiCode,
      favorite: gatewayMock[1].favorite,
    };
    gateway.mockResolvedValueOnce(mockedZipCode);
    const result = await sut.find(gatewayMock[1].code);
    expect(result).toBe(mockedZipCode);
  });

  it('Should fail return zipcode if not exists in the database', async () => {
    const zipcode = '1234';
    await expect(sut.find(zipcode)).rejects.toThrow(
      new BadRequestException(new ZipCodeNotFound(zipcode)),
    );
  });

  it('Should favorite a zip code', async () => {
    const gateway = jest.spyOn(drive, 'favorite');
    gateway.mockResolvedValueOnce(true);
    const result = await sut.favorite(gatewayMock[1].code, true);
    expect(result).toBeUndefined();
  });

  it('Should fail to favorite a zip code if none is found in the database', async () => {
    const gateway = jest.spyOn(drive, 'favorite');
    gateway.mockResolvedValueOnce(false);
    await expect(sut.favorite(gatewayMock[1].code, true)).rejects.toThrow(
      new BadRequestException(new ZipCodeFavoritedError()),
    );
  });
});
