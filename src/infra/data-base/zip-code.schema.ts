import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ZipCodeDocument = ZipCode & Document;

@Schema()
export class ZipCode {
  @Prop({ required: true })
  zipCode: string;

  @Prop()
  street: string;

  @Prop()
  complement: string;

  @Prop()
  unit: string;

  @Prop()
  neighborhood: string;

  @Prop()
  city: string;

  @Prop()
  stateCode: string;

  @Prop()
  state: string;

  @Prop()
  region: string;

  @Prop()
  ibgeCode: string;

  @Prop()
  giaCode: string;

  @Prop()
  areaCode: string;

  @Prop()
  siafiCode: string;

  @Prop({ default: false })
  favorite: boolean;
}

export const ZipCodeSchema = SchemaFactory.createForClass(ZipCode);
