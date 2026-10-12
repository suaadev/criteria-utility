import { CursorSerializer } from '../cursor-serializers/cursor-serializer.js';
import { CursorCriterion, CursorPayload } from '../pagination.js';

export class CursorBase64Serializer implements CursorSerializer<
  CursorPayload,
  string
> {
  encode(cursorPayload: CursorPayload): string {
    const cursorPayloadSanitized: Map<string, CursorCriterion> = new Map<
      string,
      CursorCriterion
    >();

    for (const criterion of cursorPayload) {
      const [field, value, sort] = criterion;
      cursorPayloadSanitized.set(field.toString(), [
        field.toString(),
        value,
        sort,
      ]);
    }

    const cursorPayloadInJSONFormat: string = JSON.stringify(
      Array.from(cursorPayloadSanitized.values()),
    );

    const cursorInBase64: string = Buffer.from(
      cursorPayloadInJSONFormat,
    ).toString('base64');

    return cursorInBase64;
  }

  decode(cursor: string): CursorPayload {
    if (typeof cursor !== 'string') {
      throw new Error('The cursor format is invalid, must be a string base64');
    }

    const cursorInUtf8 = Buffer.from(cursor, 'base64').toString('utf-8');
    const cursorPayload = JSON.parse(cursorInUtf8) as unknown;
    return cursorPayload as CursorPayload;
  }
}
