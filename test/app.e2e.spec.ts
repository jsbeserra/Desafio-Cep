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
import mongoose from 'mongoose';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let mongoDb: MongoMemoryServer;
  let mongoUri: string;
  let cepGateway: CepGateway;

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
      controllers: [AppController],
      providers: [],
    }).compile();
    cepGateway = moduleFixture.get(CepGateway);
    app = moduleFixture.createNestApplication();
    app.enableShutdownHooks();
    await app.init();
  });

  beforeEach(async () => {
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.collections();
      for (const collection of collections) {
        await collection.deleteMany({});
      }
    }
  });

  afterAll(async () => {
    await mongoDb.stop();
    await app.close();
  });

  it('/ (GET) should return status code 200 and a list of zip codes', async () => {
    return await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/:zipcode (GET) should fail return a zip code', async () => {
    return request(app.getHttpServer())
      .get(`/${gatewayMock[1].code}`)
      .expect(400);
  });

  it('/:zipcode (GET) should return a zip code', async () => {
    jest.spyOn(cepGateway, 'find').mockResolvedValueOnce(gatewayMock);
    await request(app.getHttpServer()).post('/sync');
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
    return request(app.getHttpServer())
      .get(`/${gatewayMock[1].code}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject(mockedZipCode);
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

  it('/ (PUT) Should update a zip code if it exists in the database', async () => {
    jest.spyOn(cepGateway, 'find').mockResolvedValueOnce(gatewayMock);
    await request(app.getHttpServer()).post('/sync');
    const response = await request(app.getHttpServer()).put('/').send({
      zipcode: gatewayMock[1].code,
      street: 'Rua Do Teste',
      neighborhood: 'Bairro Do Teste',
    });
    expect(response.status).toBe(200);
  });

  it('/ (PUT) Should fail update a zip code if it exists not in the database', async () => {
    jest.spyOn(cepGateway, 'find').mockResolvedValueOnce(gatewayMock);
    await request(app.getHttpServer()).post('/sync');
    const response = await request(app.getHttpServer()).put('/').send({
      zipcode: 'TESTE',
      street: 'Rua Do Teste',
      neighborhood: 'Bairro Do Teste',
    });
    expect(response.status).toBe(400);
  });
});
