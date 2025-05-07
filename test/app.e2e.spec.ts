import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { InfraModule } from '../src/infra/infra.module';
import { CoreModule } from '../src/core/core.module';
import { AppController } from '../src/app.controller';
import { CepGateway } from '../src/core/zip-code-gateway';
import { gatewayMock } from './mocks/gateway-mock';
import { ErrorMessages } from '../src/infra/error-messages';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let mongoDb: MongoMemoryServer;
  let mongoUri: string;
  let cepGateway: CepGateway;

  beforeEach(async () => {
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
      controllers: [AppController],
      providers: [],
    }).compile();
    cepGateway = moduleFixture.get(CepGateway);
    app = moduleFixture.createNestApplication();
    app.enableShutdownHooks();
    await app.init();
  });

  afterAll(async () => {
    await mongoDb.stop();
    await app.close();
  });

  it('/ (GET) should return status code 200 and a list of zip codes', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/sync (POST) should synchronize the database with the viacep data', async () => {
    jest.spyOn(cepGateway, 'find').mockResolvedValueOnce(gatewayMock);
    const response = await request(app.getHttpServer()).post('/sync');
    expect(response.status).toBe(201);
  });

  it('/sync (POST) Should fail to sync data if ViaCep API fails', async () => {
    jest.spyOn(cepGateway, 'find').mockImplementationOnce(() => {
      throw new BadRequestException(ErrorMessages.viaCep);
    });
    const response = await request(app.getHttpServer()).post('/sync');
    expect(response.status).toBe(400);
  });
});
