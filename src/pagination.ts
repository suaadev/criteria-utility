import { CursorBase64Serializer } from './cursor-serializers/cursor-base64-serializer.js';
import type { CursorSerializer } from './cursor-serializers/cursor-serializer.js';
import InvalidCursorPayload from './exceptions/invalid-cursor-payload.js';
import InvalidPage from './exceptions/invalid-page.js';

export type CursorSort = 'ASC' | 'DESC';

export type CursorCriterion = [string, unknown, CursorSort];

export type CursorPayload = CursorCriterion[];

export default class Pagination {
  private constructor(
    private readonly page_: number | null,
    private readonly cursor_: CursorPayload | null,
  ) {
    Object.freeze(this);
  }

  static byPage(page = 1) {
    this.validatePage(page);
    return new Pagination(page, null);
  }

  static byCursor(
    cursor: unknown,
    cursorSerializer: CursorSerializer<CursorPayload> = new CursorBase64Serializer(),
  ) {
    const decodeCursor = cursorSerializer.decode(cursor);

    this.validateCursorPayload(decodeCursor);

    return new Pagination(null, decodeCursor);
  }

  static validatePage(page: number) {
    if (!Number.isInteger(page) || page < 1) {
      throw new InvalidPage(page);
    }
  }

  private static isUndefinedOrNull(value: unknown) {
    return value === undefined || value === null;
  }

  private static validateCursorCriterion(criterion: unknown) {
    if (!Array.isArray(criterion)) {
      throw new InvalidCursorPayload(
        'criterion must be a non-empty array',
        criterion,
      );
    }

    const [field, value, sort] = criterion as unknown[];

    if (
      this.isUndefinedOrNull(field) ||
      this.isUndefinedOrNull(value) ||
      (sort !== 'DESC' && sort !== 'ASC')
    ) {
      throw new InvalidCursorPayload('criterion malformed', criterion);
    }
  }

  private static validateCursorPayload(payload: unknown) {
    if (!Array.isArray(payload) || payload.length === 0) {
      throw new InvalidCursorPayload(
        'payload must be a non-empty array',
        payload,
      );
    }
    Object.freeze(payload);
    for (const element of payload) {
      this.validateCursorCriterion(element);
      Object.freeze(element);
    }
  }
  get page(): Readonly<number | null> {
    return this.page_;
  }

  get cursor(): Readonly<CursorPayload | null> {
    return this.cursor_;
  }

  toObjectPlain() {
    return Object.freeze({
      page: this.page_,
      cursor: this.cursor_,
    });
  }
}
