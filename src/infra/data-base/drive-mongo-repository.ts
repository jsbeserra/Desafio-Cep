import { InjectModel } from '@nestjs/mongoose';
import { ZipCode } from '../../core/zip-code';
import { Drive } from '../../core/drive';
import { ZipCodeDocument, ZipCode as zipCodeSchema } from './zip-code.schema';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DriveMongoRepository implements Drive {
  constructor(
    @InjectModel(zipCodeSchema.name)
    private ZipCodeModel: Model<ZipCodeDocument>,
  ) {}

  async find(zipcode: string): Promise<ZipCode | undefined> {
    const zipCode = await this.ZipCodeModel.findOne({ zipCode: zipcode });
    if (!zipCode) return;
    return {
      code: zipCode.zipCode,
      street: zipCode.street,
      complement: zipCode.complement,
      unit: zipCode.unit,
      neighborhood: zipCode.neighborhood,
      city: zipCode.city,
      stateCode: zipCode.stateCode,
      state: zipCode.state,
      region: zipCode.region,
      ibgeCode: zipCode.ibgeCode,
      giaCode: zipCode.giaCode,
      areaCode: zipCode.areaCode,
      siafiCode: zipCode.siafiCode,
      favorite: zipCode.favorite,
    };
  }

  async save(zipcodes: ZipCode[]): Promise<boolean> {
    const bulkOps = zipcodes.map((address) => ({
      updateOne: {
        filter: { zipCode: address.code },
        update: {
          $set: {
            street: address.street,
            complement: address.complement,
            unit: address.unit,
            neighborhood: address.neighborhood,
            city: address.city,
            stateCode: address.stateCode,
            state: address.state,
            region: address.region,
            ibgeCode: address.ibgeCode,
            giaCode: address.giaCode,
            areaCode: address.areaCode,
            siafiCode: address.siafiCode,
          },
        },
        upsert: true,
      },
    }));
    return await this.ZipCodeModel.bulkWrite(bulkOps)
      .then(() => true)
      .catch(() => false);
  }

  async update(
    zipCode: string,
    street: string,
    neighborhood: string,
  ): Promise<boolean> {
    const updated = await this.ZipCodeModel.updateOne(
      { zipCode },
      {
        street,
        neighborhood,
      },
    );
    if (updated.matchedCount === 0) return false;
    return true;
  }

  async favorite(zipCode: string, isFavority: boolean): Promise<boolean> {
    const updated = await this.ZipCodeModel.updateOne(
      { zipCode },
      {
        favorite: isFavority,
      },
    );
    if (updated.matchedCount === 0) return false;
    return true;
  }

  async listAll(): Promise<ZipCode[]> {
    return await this.ZipCodeModel.find()
      .then((res) => {
        return res.map((item) => {
          return {
            code: item.zipCode,
            street: item.street,
            complement: item.complement,
            unit: item.unit,
            neighborhood: item.neighborhood,
            city: item.city,
            stateCode: item.stateCode,
            state: item.state,
            region: item.region,
            ibgeCode: item.ibgeCode,
            giaCode: item.giaCode,
            areaCode: item.areaCode,
            siafiCode: item.siafiCode,
            favorite: item.favorite,
          } as ZipCode;
        });
      })
      .catch(() => {
        return [];
      });
  }
}
