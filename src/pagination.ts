import { CursorBase64Serializer } from './cursor-serializers/cursor-base64-serializer.js';
import { CursorSerializer } from './cursor-serializers/cursor-serializer.js';

export type CursorSort = 'ASC' | 'DESC';

export type CursorCriterion = [string, unknown, CursorSort];

export type CursorPayload = CursorCriterion[];

export interface ValuePaginate {
  page: number | null;
  cursor: CursorPayload | null;
}

export default class Pagination {
  private constructor(readonly value: ValuePaginate) {}

  static byPage(page = 1) {
    this.validatePage(page);
    return new Pagination({
      page,
      cursor: null,
    });
  }

  static validatePage(page: number) {
    if (page < 1) {
      throw new Error('Page must be an integer greater than or equal to 1');
    }
  }

  static byCursor(
    cursor: unknown,
    cursorSerializer: CursorSerializer<CursorPayload> = new CursorBase64Serializer(),
  ) {
    const decodeCursor = cursorSerializer.decode(cursor);

    this.validateCursorPayload(decodeCursor);

    return new Pagination({
      page: null,
      cursor: decodeCursor,
    });
  }

  private static isUndefinedOrNull(value: unknown) {
    return value === undefined || value === null;
  }

  private static validateCursorCriterion(criterion: unknown) {
    if (!Array.isArray(criterion)) {
      throw new Error('Cursor payload is not valid');
    }

    const [field, value, sort] = criterion as unknown[];

    if (
      this.isUndefinedOrNull(field) ||
      this.isUndefinedOrNull(value) ||
      (sort !== 'DESC' && sort !== 'ASC')
    ) {
      throw new Error(
        `Cursor criterion is invalid, received: ${criterion.toString()}`,
      );
    }
  }

  private static validateCursorPayload(payload: unknown) {
    if (!Array.isArray(payload) || payload.length === 0) {
      throw new Error('Cursor payload must be a non-empty array');
    }
    for (const element of payload) {
      this.validateCursorCriterion(element);
    }
  }

  toObjectPlain() {
    return {
      page: this.value.page,
      cursor: this.value.cursor,
    };
  }
}
