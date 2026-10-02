interface ValuePaginate<T> {
  page: number | null;
  cursor: T | null;
}

export default class Pagination<T = unknown> {
  private constructor(readonly value: ValuePaginate<T>) {}

  static byPage(page: number = 1) {
    this.validatePage(page);
    return new Pagination({
      page,
      cursor: null,
    });
  }

  static byCursor<T = string>(cursor: T) {
    return new Pagination<T>({
      page: null,
      cursor,
    });
  }

  static validatePage(page: number) {
    if (page < 1) {
      throw new Error("Page must be an integer greater than or equal to 1");
    }
  }

  toObjectPlain() {
    return this.value;
  }
}
