export class ZipCodeNotFound {
  readonly message: string;
  constructor(zipCode: string) {
    this.message = `No records found for zip code: ${zipCode}`;
  }
}
