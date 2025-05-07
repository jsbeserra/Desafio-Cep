export class ZipCodeNotUpdated {
  readonly message: string;
  constructor(zipCode: string, neighborhood: string, street: string) {
    this.message = `Failed to update zip code: ${zipCode}, neighborhood: ${neighborhood}, street: ${street}`;
  }
}
