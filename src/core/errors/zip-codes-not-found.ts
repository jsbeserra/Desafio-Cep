export class ZipCodesNotFound {
  readonly message: string;
  constructor(state: string, city: string, municipality: string) {
    this.message = `No zip code found ford state: ${state}, city: ${city}, municipality: ${municipality}`;
  }
}
