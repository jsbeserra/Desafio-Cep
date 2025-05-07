export class ZipCodeFavoritedError {
  readonly message: string;
  constructor() {
    this.message = `Failed to favorite zipcode`;
  }
}
