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

describe('', () => {
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
    await expect(
      sut.update('TESTE', 'Rua Do Teste', 'Bairro Do Teste'),
    ).rejects.toThrow(BadRequestException);
  });

  it('Should update the neighborhood and street of a zip code', async () => {
    const gateway = jest.spyOn(cepGateway, 'find');
    gateway.mockResolvedValueOnce(gatewayMock);
    await expect(
      sut.update(gatewayMock[1].code, 'Rua Do Teste', 'Bairro Do Teste'),
    ).resolves.toBeUndefined();
  });
});
